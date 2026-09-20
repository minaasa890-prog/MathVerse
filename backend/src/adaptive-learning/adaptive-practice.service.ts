import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AdaptiveLearningService {


  constructor(
    private prisma: PrismaService
  ){}



  // تحلیل وضعیت یادگیری دانش آموز
  async getLearningPlan(studentId:number){


    const history =
      await this.prisma.practiceHistory.findMany({

        where:{
          studentId
        },

        include:{
          question:true
        },

        orderBy:{
          createdAt:'desc'
        }

      });



    if(history.length===0){

      return {

        success:true,

        message:"هنوز تمرینی انجام نشده",

        plan:{

          level:"beginner",

          recommendation:"شروع تمرین پایه"

        }

      }

    }



    const wrong =
      history.filter(
        x=>x.isCorrect===false
      );



    const correct =
      history.filter(
        x=>x.isCorrect===true
      );



    const accuracy =
      Math.round(
        (correct.length / history.length)*100
      );



    let difficulty = 1;


    if(accuracy >= 80){

      difficulty = 2;

    }


    if(accuracy >= 90){

      difficulty = 3;

    }



    return {


      success:true,


      studentId,


      statistics:{


        total:history.length,

        correct:correct.length,

        wrong:wrong.length,

        accuracy

      },


      plan:{


        nextDifficulty:difficulty,


        message:
        accuracy >= 80
        ?
        "دانش آموز آماده سوالات سخت تر است"
        :
        "نیاز به تمرین بیشتر دارد"


      }


    }


  }






  // پیشنهاد سوال بعدی
  async getNextLesson(studentId:number){



    const plan =
      await this.getLearningPlan(studentId);



    const difficulty =
      plan.plan.nextDifficulty || 1;



    const question =
      await this.prisma.question.findFirst({

        where:{

          difficulty

        },

        orderBy:{

          id:'asc'

        }

      });



    return {


      success:true,


      studentId,


      difficulty,


      recommendedQuestion:question


    }
    



  }

  // =====================================
  // ساخت سوال مشابه
  // =====================================

  async generateSimilarQuestion(
    questionId:number
  ){

    const question =
      await this.prisma.question.findUnique({

        where:{
          id:questionId
        }

      });



    if(!question){

      return {

        success:false,

        message:"Question not found"

      };

    }



    const similar =
      await this.prisma.question.findFirst({

        where:{

          chapter:
            question.chapter,


          difficulty:
            question.difficulty,


          id:{
            not:questionId
          }

        },


        orderBy:{
          id:'desc'
        }


      });



    if(!similar){

      return {

        success:false,

        message:"Similar question not found"

      };

    }



    return {

      success:true,


      question:{

        id:
          similar.id,


        title:
          similar.title,


        description:
          similar.description,


        optionA:
          similar.optionA,


        optionB:
          similar.optionB,


        optionC:
          similar.optionC,


        optionD:
          similar.optionD,


        difficulty:
          similar.difficulty,


        chapter:
          similar.chapter

      }

    };


  }

}
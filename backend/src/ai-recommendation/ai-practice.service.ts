import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AiPracticeService {


  constructor(
    private prisma: PrismaService
  ) {}



  async generatePractice(studentId:number){


    console.log(
      "GENERATE PRACTICE:",
      studentId
    );



    // ==========================
    // سوال های قبلی دانش آموز
    // ==========================

    const history =
      await this.prisma.practiceHistory.findMany({

        where:{
          studentId
        },

        select:{
          questionId:true
        }

      });



    const usedQuestionIds =
      history.map(
        item => item.questionId
      );



    // ==========================
    // پیدا کردن سوال جدید
    // ==========================


    let questions =
      await this.prisma.question.findMany({

        where:{

          id:{
            notIn:
              usedQuestionIds.length > 0
                ? usedQuestionIds
                : [-1]
          }

        },

        orderBy:{
          id:"desc"
        },

        take:50

      });





    // اگر همه سوال ها استفاده شدند
    // چرخه جدید شروع شود

    if(questions.length === 0){


      await this.prisma.practiceHistory.deleteMany({

        where:{
          studentId
        }

      });



      questions =
      await this.prisma.question.findMany({

        orderBy:{
          id:"desc"
        },

        take:50

      });


    }





    if(questions.length === 0){

      throw new Error(
        "No practice questions found"
      );

    }





    // انتخاب تصادفی

    const randomIndex =
      Math.floor(
        Math.random() * questions.length
      );



    const question =
      questions[randomIndex];





    console.log(
      "SELECTED:",
      question.title
    );





    // ==========================
    // ثبت تاریخچه
    // ==========================


    await this.prisma.practiceHistory.create({

      data:{


        studentId,


        questionId:
          question.id,


        isAnswered:false


      }

    });







    return {


      studentId,


      weakTopic:
        question.chapter || "General",


      question,


      message:
        "AI practice generated"


    };


  }


}
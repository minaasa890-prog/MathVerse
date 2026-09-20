import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class StudentsService {


  constructor(
    private prisma: PrismaService
  ) {}



  // =========================
  // Dashboard
  // =========================

  async dashboard(id:number){


    const user =
      await this.prisma.user.findUnique({

        where:{
          id
        }

      });



    return {

      success:true,

      student:user

    };


  }





  // =========================
  // AI Dashboard
  // =========================

  async getAiDashboard(id:number){


    const student =
      await this.prisma.user.findUnique({

        where:{
          id
        }

      });



    if(!student){

      return {

        success:false,

        message:"Student not found"

      };

    }





    const history =
      await this.prisma.practiceHistory.findMany({

        where:{

          studentId:id

        },

        include:{

          question:true

        },

        orderBy:{

          createdAt:"desc"

        }


      });





    let correct = 0;

    let wrong = 0;



    const skills:any = {};





    for(const item of history){


      const chapter =
        item.question.chapter || "عمومی";



      if(!skills[chapter]){


        skills[chapter]={

          correct:0,

          wrong:0

        };


      }



      if(item.isCorrect){


        correct++;

        skills[chapter].correct++;


      }
      else{


        wrong++;

        skills[chapter].wrong++;


      }


    }






    const mastery =
      history.length
      ?
      Math.round(
        (correct / history.length) * 100
      )
      :
      0;





    let difficulty=1;


    if(mastery >= 90){

      difficulty=3;

    }
    else if(mastery >= 70){

      difficulty=2;

    }





    const nextQuestion =
      await this.prisma.question.findFirst({

        where:{

          difficulty

        },

        orderBy:{

          id:"desc"

        }

      });





    return {


      success:true,


      student:{


        id:student.id,

        name:student.name,

        level:(student as any).level ?? 1,

        xp:(student as any).xp ?? 0


      },



      analysis:{


        total:history.length,

        correct,

        wrong,

        mastery,

        skills


      },



      aiDecision:{


        recommendedDifficulty:difficulty,


        action:
        difficulty===3
        ?
        "HARDER_PRACTICE"
        :
        "SMART_PRACTICE"


      },



      nextQuestion


    };


  }







  // =========================
  // AI Tutor
  // =========================

  async aiTutor(id:number){


    return {

      success:true,

      studentId:id,

      message:"AI Tutor Ready"

    };


  }





  // =========================
  // Generate Practice
  // =========================

  async generatePractice(id:number){


    return {

      success:true,

      studentId:id,

      message:"Practice Generator Ready"

    };


  }





  // =========================
  // Lessons
  // =========================

  async lessons(id:number){


    return {


      success:true,

      studentId:id,


      lessons:[]


    };


  }



}
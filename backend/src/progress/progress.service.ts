import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class ProgressService {


  constructor(
    private prisma: PrismaService
  ) {}



  // =====================================================
  // CREATE / UPDATE LESSON PROGRESS
  // =====================================================

  async createLessonProgress(body:any){


    const {
      studentId,
      lessonId,
      progress,
      completed
    } = body;



    const result =
    await this.prisma.lessonProgress.upsert({


      where:{

        studentId_lessonId:{

          studentId,
          lessonId

        }

      },


      update:{

        progress,

        completed

      },


      create:{

        studentId,

        lessonId,

        progress: progress ?? 0,

        completed: completed ?? false

      }


    });



    return {

      message:"Lesson progress saved",

      data:result

    };


  }







  // =====================================================
  // GET SINGLE LESSON PROGRESS
  // =====================================================

  async getLessonProgress(
    studentId:number,
    lessonId:number
  ){



    const progress =

    await this.prisma.lessonProgress.findUnique({


      where:{

        studentId_lessonId:{

          studentId,

          lessonId

        }

      },


      include:{

        lesson:true

      }


    });



    return progress || {


      studentId,

      lessonId,

      progress:0,

      completed:false


    };


  }








  // =====================================================
  // COMPLETE LESSON + XP REWARD
  // =====================================================


  async completeLesson(
    studentId:number,
    lessonId:number
  ){



    const oldProgress =

    await this.prisma.lessonProgress.findUnique({


      where:{

        studentId_lessonId:{

          studentId,

          lessonId

        }

      }


    });





    // اگر قبلا کامل شده بود XP نده

    if(oldProgress?.completed){


      return {


        message:"Lesson already completed",


        lessonProgress:oldProgress,


        reward:{

          xp:0,

          message:"XP already received"

        }


      };


    }






    const lessonProgress =

    await this.prisma.lessonProgress.upsert({


      where:{

        studentId_lessonId:{

          studentId,

          lessonId

        }

      },


      update:{


        completed:true,

        progress:100


      },


      create:{


        studentId,

        lessonId,

        completed:true,

        progress:100


      }


    });





    // اضافه کردن XP

    const student =

    await this.prisma.user.update({


      where:{

        id:studentId

      },


      data:{


        xp:{

          increment:100

        }


      }


    });






    const level =

    this.calculateLevel(student.xp);






    await this.prisma.user.update({


      where:{


        id:studentId

      },


      data:{


        level

      }


    });






    return {


      message:"Lesson completed successfully",


      lessonProgress,


      reward:{


        xp:100,

        totalXp:student.xp,

        level


      }


    };


  }








  // =====================================================
  // LEVEL SYSTEM
  // =====================================================


  calculateLevel(xp:number){



    if(xp >= 10000)
      return 10;


    if(xp >= 5000)
      return 5;


    if(xp >= 3000)
      return 4;


    if(xp >= 2000)
      return 3;


    if(xp >= 1000)
      return 2;



    return 1;


  }







  // =====================================================
  // GET STUDENT ALL PROGRESS
  // =====================================================


  async getStudentProgress(studentId:number){



    const lessons =

    await this.prisma.lessonProgress.findMany({


      where:{

        studentId

      },


      include:{


        lesson:{


          include:{


            chapter:true


          }


        }


      }


    });






    const totalLessons = lessons.length;



    const completedLessons =

    lessons.filter(

      (item:any)=>

      item.completed

    ).length;






    const averageProgress =

    totalLessons === 0

    ?

    0

    :

    Math.round(


      lessons.reduce(

        (sum:number,item:any)=>

        sum + item.progress,


        0


      )

      /

      totalLessons


    );





    return {


      studentId,


      totalLessons,


      completedLessons,


      averageProgress,


      lessons


    };


  }





  // =====================================================
  // GET COMPLETED LESSONS COUNT
  // =====================================================


  async getCompletedLessons(studentId:number){


    const count =

    await this.prisma.lessonProgress.count({


      where:{


        studentId,


        completed:true


      }


    });



    return {


      studentId,


      completedLessons:count


    };


  }







  // =====================================================
  // RESET LESSON PROGRESS
  // =====================================================


  async resetLessonProgress(
    studentId:number,
    lessonId:number
  ){



    const result =

    await this.prisma.lessonProgress.update({


      where:{


        studentId_lessonId:{


          studentId,

          lessonId


        }


      },


      data:{


        progress:0,


        completed:false


      }


    });



    return {


      message:"Lesson progress reset",


      data:result


    };


  }







  // =====================================================
  // GET LEARNING SUMMARY
  // =====================================================


  async getLearningSummary(studentId:number){



    const student =

    await this.prisma.user.findUnique({


      where:{


        id:studentId


      },


      include:{


        lessonProgress:{


          include:{


            lesson:true


          }


        }


      }


    });





    if(!student){


      return {


        message:"Student not found"


      };


    }






    const total =

    student.lessonProgress.length;





    const completed =

    student.lessonProgress.filter(

      (item:any)=>

      item.completed

    ).length;






    return {


      student:{


        id:student.id,


        name:student.name,


        xp:student.xp,


        level:student.level


      },



      learning:{


        totalLessons:total,


        completedLessons:completed,


        completionRate:

        total===0

        ?

        0

        :

        Math.round(

          (completed / total) * 100

        )

      }


    };



  }



}
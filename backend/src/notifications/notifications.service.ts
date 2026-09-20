import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class NotificationsService {


  constructor(
    private prisma: PrismaService
  ) {}



  async getStudentNotifications(
    studentId:number
  ){


    const student = await this.prisma.user.findUnique({

      where:{
        id:studentId
      },

      include:{

        attempts:true

      }

    });




    if(!student){

      throw new Error(
        "Student not found"
      );

    }





    const notifications:any[] = [];






    // بررسی آزمون کامل شده

    const exams = new Set(

      student.attempts.map(

        item=>item.examId

      )

    );




    if(exams.size > 0){

      notifications.push({

        title:"Exam Completed",

        message:
        "You completed an exam successfully ✅",

        type:"EXAM"

      });

    }








    // بررسی پاسخ کامل

    const correctAnswers =

    student.attempts.filter(

      item=>item.isCorrect

    ).length;






    if(correctAnswers > 0){

      notifications.push({

        title:"Great Job",

        message:
        "You answered questions correctly 🎯",

        type:"SUCCESS"

      });

    }







    // بررسی XP

    if(student.xp >= 10){

      notifications.push({

        title:"Level Progress",

        message:
        "You earned XP and improved your skills 🚀",

        type:"LEVEL"

      });

    }








    // Badge notification

    const accuracy =

    student.attempts.length > 0

    ?

    Math.round(

      (correctAnswers /

      student.attempts.length) * 100

    )

    :

    0;





    if(accuracy === 100){

      notifications.push({

        title:"Perfect Score Badge",

        message:
        "You earned Perfect Score achievement 🎯",

        type:"ACHIEVEMENT"

      });

    }








    return {


      studentId,


      notifications,


      unread:
      notifications.length,


      message:
      "Notifications generated successfully"


    };



  }



}
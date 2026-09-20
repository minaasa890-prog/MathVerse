import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AnalyticsService {


  constructor(
    private prisma: PrismaService
  ) {}



  async getClassAnalytics(
    classroomId:number
  ){


    const students = await this.prisma.user.findMany({

      where:{

        classroomId,

        role:"STUDENT"

      },


      include:{

        attempts:true

      }

    });





    if(students.length === 0){

      throw new Error(
        "No students found"
      );

    }






    let totalAccuracy = 0;

    let totalScore = 0;







    let topStudent:any = null;

    let lowestStudent:any = null;







    const needsPractice = [];








    for(const student of students){



      const attempts = student.attempts;



      const total = attempts.length;



      const correct = attempts.filter(

        item=>item.isCorrect

      ).length;





      const accuracy = total > 0

      ?

      Math.round(

        (correct / total) * 100

      )

      :

      0;





      const score = attempts.reduce(

        (sum,item)=>

        sum + item.score,

        0

      );







      totalAccuracy += accuracy;

      totalScore += score;







      const studentData = {


        studentId:student.id,


        name:student.name,


        accuracy,


        score,


        xp:student.xp


      };







      if(

        !topStudent ||

        score > topStudent.score

      ){

        topStudent = studentData;

      }






      if(

        !lowestStudent ||

        score < lowestStudent.score

      ){

        lowestStudent = studentData;

      }






      if(accuracy < 50){


        needsPractice.push(studentData);


      }



    }








    const averageAccuracy = Math.round(

      totalAccuracy / students.length

    );





    const averageScore = Math.round(

      totalScore / students.length

    );







    let aiSuggestion =

    "Class performance needs improvement";





    if(averageAccuracy >= 80){

      aiSuggestion =

      "Class performance is excellent";

    }

    else if(averageAccuracy >= 60){

      aiSuggestion =

      "Class performance is good";

    }







    return {


      classroomId,


      totalStudents:students.length,


      averageAccuracy,


      averageScore,


      topStudent,


      lowestStudent,


      needsPractice,


      aiSuggestion,


      message:

      "Class analytics generated successfully"


    };



  }



}
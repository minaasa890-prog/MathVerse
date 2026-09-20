import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class LeaderboardService {


  constructor(
    private prisma: PrismaService
  ) {}



  async getClassRanking(
    classroomId:number
  ){



    const students =

    await this.prisma.user.findMany({

      where:{

        classroomId,

        role:"STUDENT"

      },


      include:{

        attempts:true

      }

    });







    const ranking = students.map(student=>{


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






      let badge = "Bronze";



      if(student.xp >= 100){

        badge="Gold";

      }

      else if(student.xp >= 50){

        badge="Silver";

      }






      return {


        studentId:student.id,


        name:student.name,


        xp:student.xp,


        level:student.level,


        accuracy,


        exams:total,


        badge


      };



    });







    ranking.sort(

      (a,b)=>

      b.xp - a.xp

    );







    return ranking.map(

      (student,index)=>(


        {

          rank:index + 1,


          ...student


        }


      )

    );



  }



}
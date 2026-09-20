import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AdaptiveQuestionService {

  constructor(
    private prisma: PrismaService,
  ) {}


  async generateAdaptiveQuestions(
    studentId:number,
    subject:string,
    chapter:string,
    count:number
  ){

    // گرفتن آخرین تلاش‌های دانش آموز
    const attempts = await this.prisma.attempt.findMany({
      where:{
        studentId:studentId
      },
      orderBy:{
        createdAt:'desc'
      },
      take:20
    });


    let level = 1;


    if(attempts.length > 0){

      const correct =
        attempts.filter(a=>a.isCorrect).length;


      const accuracy =
        correct / attempts.length;


      if(accuracy >=0.8){
        level = 3;
      }
      else if(accuracy >=0.5){
        level = 2;
      }
      else{
        level = 1;
      }

    }



    const questions =
      await this.prisma.question.findMany({

        where:{
          subject,
          chapter,
          difficulty:{
            gte:level
          }
        },

        take:count,

        orderBy:{
          createdAt:'desc'
        }

      });



    return {

      studentId,

      level,

      totalQuestions:
      questions.length,

      questions

    };

  }

}
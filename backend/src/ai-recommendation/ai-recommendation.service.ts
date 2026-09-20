import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AiRecommendationService {


  constructor(
    private prisma: PrismaService
  ) {}



  async getRecommendation(studentId:number){


    const attempts = await this.prisma.attempt.findMany({

      where:{
        studentId
      },

      include:{
        question:true
      }

    });



    const total = attempts.length;


    const correct =
      attempts.filter(
        item => item.isCorrect
      ).length;



    let accuracy = 0;


    if(total > 0){

      accuracy = Math.round(
        (correct / total) * 100
      );

    }




    let level = "Beginner";


    if(accuracy >= 80){

      level = "Advanced";

    }
    else if(accuracy >= 50){

      level = "Intermediate";

    }





    // ============================
    // Topic Analysis
    // ============================


    const topicMap:any = {};



    for(const item of attempts){


      const topic =
        item.question.chapter || "General";



      if(!topicMap[topic]){


        topicMap[topic] = {

          total:0,

          correct:0

        };


      }



      topicMap[topic].total++;



      if(item.isCorrect){

        topicMap[topic].correct++;

      }


    }





    const strongTopics:any[] = [];

    const weakTopics:any[] = [];





    Object.keys(topicMap).forEach(topic=>{


      const data = topicMap[topic];



      const topicAccuracy = Math.round(

        (data.correct / data.total) * 100

      );



      if(topicAccuracy >= 80){


        strongTopics.push({

          topic,

          accuracy:topicAccuracy

        });


      }
      else if(topicAccuracy < 50){


        weakTopics.push({

          topic,

          accuracy:topicAccuracy

        });


      }


    });







    // ============================
    // AI Lesson Recommendation
    // ============================


    const recommendedLessons:any[] = [];




    for(const weak of weakTopics){



      let lessons = await this.prisma.lesson.findMany({

        where:{


          chapter:{


            title:{


              contains: weak.topic,

              mode:"insensitive"


            }


          }


        },


        include:{


          chapter:true,

          contents:true


        },


        take:3


      });






      // اگر درس مرتبط نبود
      // درس های پایه پیشنهاد بده


      if(lessons.length === 0){



        lessons = await this.prisma.lesson.findMany({


          include:{


            chapter:true,

            contents:true


          },


          orderBy:{


            id:"asc"


          },


          take:3


        });


      }





      recommendedLessons.push(...lessons);



    }







    // ============================
    // Next Topics
    // ============================


    let nextTopics:string[] = [];



    if(level === "Advanced"){


      nextTopics = [

        "Advanced Problems",

        "Challenge Exercises"

      ];


    }

    else if(level === "Intermediate"){


      nextTopics = [

        "Practice mistakes",

        "Mixed exercises"

      ];


    }

    else{


      nextTopics = [

        "Basic concepts",

        "Simple exercises"

      ];


    }







    // ============================
    // Daily AI Plan
    // ============================


    const dailyPlan = [


      {

        day:1,

        task:"Practice recommended topics",

        duration:"30 minutes"

      },


      {

        day:2,

        task:"AI generated exercises",

        duration:"45 minutes"

      },


      {

        day:3,

        task:"Adaptive exam",

        duration:"30 minutes"

      }


    ];








    return {


      studentId,


      accuracy,


      level,


      strongTopics,


      weakTopics,


      recommendedLessons,


      nextTopics,


      dailyPlan,


      message:
      "AI adaptive recommendation generated"


    };


  }



}
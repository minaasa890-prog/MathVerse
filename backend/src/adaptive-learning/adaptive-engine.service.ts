import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AdaptiveEngineService {


constructor(
    private prisma: PrismaService
){}




async getNextQuestion(studentId:number){



    // ==========================
    // پیدا کردن مهارت ضعیف
    // ==========================

    const skills =
    await this.prisma.studentSkill.findMany({

        where:{
            studentId
        },

        orderBy:{
            masteryScore:'asc'
        }

    });



    let weakestSkill = "بدون مهارت ثبت شده";

    let mastery = 50;

    let chapter:string | null = null;



    if(skills.length > 0){


        weakestSkill = skills[0].chapter;

        chapter = skills[0].chapter;

        mastery = skills[0].masteryScore;


    }




    // ==========================
    // تعیین سختی پیشنهادی
    // ==========================


    let difficulty = 2;



    if(mastery < 30){

        difficulty = 1;

    }
    else if(mastery < 60){

        difficulty = 2;

    }
    else if(mastery < 85){

        difficulty = 3;

    }
    else{

        difficulty = 4;

    }




    let question:any = null;



    // ==========================
    // مرحله اول:
    // فصل ضعیف + سطح مناسب
    // ==========================


    if(chapter){


        question =
        await this.prisma.question.findFirst({

            where:{


                chapter,


                difficulty


            },


            orderBy:{
                id:'asc'
            }


        });


    }





    // ==========================
    // مرحله دوم:
    // همان فصل بدون توجه به سطح
    // ==========================


    if(!question && chapter){


        question =
        await this.prisma.question.findFirst({

            where:{


                chapter


            },


            orderBy:{
                id:'asc'
            }


        });


    }






    // ==========================
    // مرحله سوم:
    // نزدیک ترین سطح در کل بانک
    // ==========================


    if(!question){


        question =
        await this.prisma.question.findFirst({

            where:{


                difficulty


            },


            orderBy:{
                id:'asc'
            }


        });


    }






    // ==========================
    // مرحله آخر
    // هر سوالی موجود بود
    // ==========================


    if(!question){


        question =
        await this.prisma.question.findFirst({

            orderBy:{
                id:'asc'
            }

        });


    }







    if(!question){


        return {

            success:false,

            message:"No question in database"

        };


    }







    return {


        success:true,


        studentId,



        analysis:{


            mastery,


            weakestSkill,


            recommendedDifficulty:difficulty,


            actualDifficulty:question.difficulty,


            source:"Adaptive Engine"


        },




        question:{


            id:question.id,


            title:question.title,


            description:question.description,


            subject:question.subject,


            chapter:question.chapter,


            difficulty:question.difficulty,


            optionA:question.optionA,


            optionB:question.optionB,


            optionC:question.optionC,


            optionD:question.optionD


        }



    };





}



}
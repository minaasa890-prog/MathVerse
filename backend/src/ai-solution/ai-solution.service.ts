import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AiSolutionService {


  constructor(
    private prisma: PrismaService
  ) {}



  async getSolution(questionId:number){


    console.log("🔥 AI SOLUTION SERVICE RUNNING");
    console.log("QUESTION ID:", questionId);



    const question =
      await this.prisma.question.findUnique({

        where:{
          id: questionId
        }

      });



    if(!question){

      throw new Error("Question not found");

    }



    console.log("QUESTION TITLE:", question.title);



    // همیشه دوباره تولید می‌کنیم
    const solution =
      this.generateMathSolution(question);



    // ذخیره نسخه جدید
    await this.prisma.question.update({

      where:{
        id: questionId
      },

      data:{

        solution: solution,

        explanation: solution

      }

    });



    return {

      questionId: question.id,

      question: question.title,

      options:{

        A: question.optionA,

        B: question.optionB,

        C: question.optionC,

        D: question.optionD

      },

      correctAnswer: question.correctAnswer,

      solution: solution

    };

  }







  private generateMathSolution(question:any){



    const title =
      question.title;



    let text = `

📚 راه حل آموزشی MathVerse


سوال:

${title}



`;



    if(
      title.includes("x") &&
      title.includes("=")
    ){

      return text +
        this.solveEquation(
          title,
          question.correctAnswer
        );

    }



    return text + `

روش حل:

1- اطلاعات مهم سوال را مشخص می‌کنیم.

2- عملیات مناسب را انتخاب می‌کنیم.

3- محاسبات را انجام می‌دهیم.

4- جواب را بررسی می‌کنیم.


گزینه صحیح:

${question.correctAnswer}

`;

  }









  private solveEquation(
    title:string,
    correctAnswer:string
  ){



    const match =
      title.match(
        /(\d+)x\s*([+-])\s*(\d+)\s*=\s*(\d+)x\s*([+-])\s*(\d+)/
      );



    if(match){


      const a =
        Number(match[1]);


      const op1 =
        match[2];


      const b =
        Number(match[3]);


      const c =
        Number(match[4]);


      const op2 =
        match[5];


      const d =
        Number(match[6]);



      const left =
        op1 === "-"
        ? -b
        : b;



      const right =
        op2 === "+"
        ? d
        : -d;




      const x =
        (right - left)
        /
        (a - c);




      return `

حل معادله:


${title}



مرحله 1:

جمله‌های دارای x را یک طرف می‌بریم:


${a}x - ${c}x = ${right-left}



مرحله 2:


${a-c}x = ${right-left}



مرحله 3:


x = ${right-left} ÷ ${a-c}



پاسخ نهایی:


x = ${x}



گزینه صحیح:

${correctAnswer}

`;

    }



    return `

حل معادله:


${title}


جمله‌های دارای x را جدا می‌کنیم.

عددها را منتقل می‌کنیم.


گزینه صحیح:

${correctAnswer}

`;

  }







  async generateSolution(id:number){

    return this.getSolution(id);

  }


}
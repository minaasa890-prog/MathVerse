import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';



@Injectable()
export class AdminService {



  constructor(
    private prisma: PrismaService
  ) {}





  async getDashboard(){



    const totalUsers =

    await this.prisma.user.count();





    const students =

    await this.prisma.user.count({

      where:{

        role:"STUDENT"

      }

    });






    const teachers =

    await this.prisma.user.count({

      where:{

        role:"TEACHER"

      }

    });








    const classrooms =

    await this.prisma.classroom.count();






    const exams =

    await this.prisma.exam.count();







    const questions =

    await this.prisma.question.count();







    const attempts =

    await this.prisma.attempt.count();








    return {


      users:{


        total:totalUsers,


        students,


        teachers


      },


      classrooms,


      exams,


      questions,


      attempts,



      message:

      "Admin dashboard generated successfully"



    };



  }





}
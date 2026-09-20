import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {

  constructor(
    private prisma: PrismaService,
  ) {}


  async upload(file: any) {

    return this.prisma.file.create({

      data: {

        name: file.originalname,

        url: `/uploads/${file.filename || file.path.split('\\').pop()}`,

        type: file.mimetype,

        size: file.size,

      },

    });

  }



  async findAll(){

    return this.prisma.file.findMany();

  }



  async findByUser(userId:number){

    return this.prisma.file.findMany({

      where:{
        userId
      }

    });

  }



  async findByClassroom(classroomId:number){

    return this.prisma.file.findMany({

      where:{
        classroomId
      }

    });

  }



  async remove(id:number){

    return this.prisma.file.delete({

      where:{
        id
      }

    });

  }

}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {

  constructor(
    private prisma: PrismaService,
  ) {}



  create(data: {
    name: string;
    description?: string;
  }) {

    return this.prisma.subject.create({
      data,
    });

  }



  findAll() {

    return this.prisma.subject.findMany({

      include: {
        chapters: true,
      },

      orderBy:{
        createdAt:'desc',
      },

    });

  }



  findOne(id:number){

    return this.prisma.subject.findUnique({

      where:{
        id,
      },

      include:{
        chapters:{
          include:{
            lessons:true,
          },
        },
      },

    });

  }



  remove(id:number){

    return this.prisma.subject.delete({

      where:{
        id,
      },

    });

  }

}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.lesson.create({
      data,
    });
  }

async findAll() {

 return this.prisma.lesson.findMany({

   include:{
     chapter:true,
     contents:true,
   },

 });

}

  async findByChapter(chapterId: number) {
    return this.prisma.lesson.findMany({
      where: {
        chapterId,
      },
      include: {
        contents: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.lesson.findUnique({
      where: {
        id,
      },
      include: {
        contents: true,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.lesson.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.lesson.delete({
      where: {
        id,
      },
    });
  }
}
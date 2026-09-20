import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChaptersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  create(data: {
    title: string;
    subjectId: number;
  }) {
    return this.prisma.chapter.create({
      data: {
        title: data.title,
        subjectId: data.subjectId,
      },
    });
  }

  findAll() {
    return this.prisma.chapter.findMany({
      include: {
        subject: true,
        lessons: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.chapter.findUnique({
      where: {
        id,
      },
      include: {
        lessons: true,
        subject: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.chapter.delete({
      where: {
        id,
      },
    });
  }
}
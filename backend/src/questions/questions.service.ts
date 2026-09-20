import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {

  constructor(
    private prisma: PrismaService,
  ) {}

  // =====================================
  // CREATE QUESTION
  // =====================================

  async create(data: any) {

    return this.prisma.question.create({

      data: {
        title: data.title,
        description: data.description,

        subject: data.subject ?? 'Math',
        chapter: data.chapter,

        difficulty: data.difficulty ?? 1,

        questionType: data.questionType ?? 'MULTIPLE_CHOICE',

        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,

        correctAnswer: data.correctAnswer,

        score: data.score ?? 1,

        creatorId: data.creatorId,
      },

    });

  }

  // =====================================
  // GET ALL QUESTIONS
  // =====================================

  async findAll() {

    return this.prisma.question.findMany({

      orderBy: {
        createdAt: 'desc',
      },

    });

  }

  // =====================================
  // GET ONE QUESTION
  // =====================================

  async findOne(id: number) {

    return this.prisma.question.findUnique({

      where: {
        id,
      },

    });

  }

  // =====================================
  // DELETE QUESTION
  // =====================================

  async remove(id: number) {

    return this.prisma.question.delete({

      where: {
        id,
      },

    });

  }

}
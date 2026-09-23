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

        // Convert difficulty to Int for Prisma
        difficulty: Number(data.difficulty ?? 1),

        // Existing question type support
        questionType:
          data.questionType ?? 'MULTIPLE_CHOICE',

        // Existing multiple-choice fields
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,

        // Existing answer
        correctAnswer: data.correctAnswer,

        // Existing scoring
        score: Number(data.score ?? 1),

        // Existing solution / explanation
        solution: data.solution ?? null,
        explanation: data.explanation ?? null,

        // Existing creator
        creatorId: Number(data.creatorId),
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

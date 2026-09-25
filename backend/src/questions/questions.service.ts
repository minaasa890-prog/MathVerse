import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(data: any) {
    let difficulty = Number(data.difficulty);

    if (!Number.isFinite(difficulty)) {
      const difficultyMap: Record<string, number> = {
        EASY: 1,
        MEDIUM: 2,
        HARD: 3,
      };

      difficulty =
        difficultyMap[String(data.difficulty ?? '').toUpperCase()] ?? 1;
    }

    return this.prisma.question.create({
      data: {
        title: data.title,
        description: data.description,
        subject: data.subject ?? 'Math',
        chapter: data.chapter,

        difficulty,

        questionType:
          data.questionType ?? 'MULTIPLE_CHOICE',

        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,

        correctAnswer: data.correctAnswer,

        score: Number(data.score ?? 1),

        solution: data.solution ?? null,
        explanation: data.explanation ?? null,

        creatorId: Number(data.creatorId),

        // سؤال دستی همیشه وارد بانک می‌شود
        isInQuestionBank: true,
      },
    });
  }

  async findAll() {
    return this.prisma.question.findMany({
      where: {
        isInQuestionBank: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.question.findUnique({
      where: {
        id,
      },
    });
  }

  // ===============================
  // SAVE QUESTION TO QUESTION BANK
  // ===============================

  async saveToQuestionBank(id: number) {
    return this.prisma.question.update({
      where: {
        id,
      },

      data: {
        isInQuestionBank: true,
      },
    });
  }

  // ===============================
  // REMOVE FROM QUESTION BANK
  // ===============================

  async removeFromQuestionBank(id: number) {
    return this.prisma.question.update({
      where: {
        id,
      },

      data: {
        isInQuestionBank: false,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.question.delete({
      where: {
        id,
      },
    });
  }
}
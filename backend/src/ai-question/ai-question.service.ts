import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiQuestionService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async generateQuestions(
    data: any,
    studentId: number,
  ) {
    const {
      subject = 'ریاضی',
      chapter = 'عمومی',
      count = 5,
    } = data;

    // =========================
    // Validate Student
    // =========================

    if (!studentId || Number.isNaN(studentId)) {
      throw new ForbiddenException(
        'Student authentication is required.',
      );
    }

    // =========================
    // AI Daily Limit
    // =========================

    const requestedCount = Math.max(
      1,
      Number(count) || 1,
    );

    const today = new Date();

    const dateKey =
      `${today.getFullYear()}-` +
      `${String(today.getMonth() + 1).padStart(2, '0')}-` +
      `${String(today.getDate()).padStart(2, '0')}`;

    const usage =
      await this.prisma.aIUsage.findUnique({
        where: {
          studentId_dateKey: {
            studentId,
            dateKey,
          },
        },
      });

    const currentCount =
      usage?.count ?? 0;

    const DAILY_LIMIT = 5;

    // =========================
    // Check Daily Limit
    // =========================

    if (
      currentCount + requestedCount >
      DAILY_LIMIT
    ) {
      throw new ForbiddenException(
        `سهمیه روزانه AI شما تمام شده است. حداکثر ${DAILY_LIMIT} سؤال در روز مجاز است.`,
      );
    }

    // =========================
    // Normalize Difficulty
    // =========================

    let difficulty: any =
      data.difficulty ?? 1;

    if (typeof difficulty === 'string') {
      const difficultyMap: any = {
        easy: 1,
        medium: 2,
        hard: 3,
        expert: 5,
      };

      const key =
        difficulty.toLowerCase();

      difficulty =
        difficultyMap[key] ?? 1;
    }

    difficulty =
      Number(difficulty);

    const questions: any[] = [];

    // =========================
    // Generate Questions
    // =========================

    for (
      let i = 0;
      i < requestedCount;
      i++
    ) {
      let title = '';
      let answer = 0;
      let options: number[] = [];

      // =========================
      // Difficulty 1
      // =========================

      if (difficulty === 1) {
        const a =
          Math.floor(Math.random() * 20) + 1;

        const b =
          Math.floor(Math.random() * 20) + 1;

        answer = a + b;

        title =
          `حاصل ${a} + ${b} چند است؟`;

        options = [
          answer,
          answer + 2,
          answer - 2,
          answer + 5,
        ];
      }

      // =========================
      // Difficulty 2
      // =========================

      else if (difficulty === 2) {
        const a =
          Math.floor(Math.random() * 12) + 2;

        const b =
          Math.floor(Math.random() * 10) + 2;

        answer = a * b;

        title =
          `حاصل ${a} × ${b} چند است؟`;

        options = [
          answer,
          answer + 3,
          answer - 3,
          answer + 7,
        ];
      }

      // =========================
      // Difficulty 3
      // =========================

      else if (difficulty === 3) {
        const a =
          Math.floor(Math.random() * 20) + 5;

        const b =
          Math.floor(Math.random() * 12) + 2;

        const c =
          Math.floor(Math.random() * 10) + 2;

        answer =
          a + (b * c);

        title =
          `حاصل ${a} + ${b} × ${c} چند است؟`;

        options = [
          answer,
          answer + 5,
          answer - 5,
          answer + 8,
        ];
      }

      // =========================
      // Difficulty 4+
      // =========================

      else {
        const a =
          Math.floor(Math.random() * 15) + 2;

        const b =
          Math.floor(Math.random() * 15) + 2;

        const c =
          Math.floor(Math.random() * 10) + 2;

        const d =
          Math.floor(Math.random() * 8) + 2;

        answer =
          (a + b) * c - d;

        title =
          `حاصل (${a} + ${b}) × ${c} - ${d} چند است؟`;

        options = [
          answer,
          answer + 5,
          answer - 5,
          answer + 10,
        ];
      }

      // =========================
      // Remove Duplicate Options
      // =========================

      let uniqueOptions =
        Array.from(
          new Set(options),
        );

      while (
        uniqueOptions.length < 4
      ) {
        const extra =
          answer +
          Math.floor(
            Math.random() * 20,
          ) -
          10;

        if (
          !uniqueOptions.includes(extra)
        ) {
          uniqueOptions.push(extra);
        }
      }

      // =========================
      // Shuffle
      // =========================

      uniqueOptions =
        uniqueOptions.sort(
          () =>
            Math.random() - 0.5,
        );

      // =========================
      // Save Question
      // =========================

      const question =
        await this.prisma.question.create({
          data: {
            title,

            description:
              'سوال تولید شده توسط AI Generator',

            subject,

            chapter,

            difficulty,

            correctAnswer:
              String(answer),

            optionA:
              String(uniqueOptions[0]),

            optionB:
              String(uniqueOptions[1]),

            optionC:
              String(uniqueOptions[2]),

            optionD:
              String(uniqueOptions[3]),

            score:
              difficulty * 10,

            creatorId:
              studentId,
          },
        });

      questions.push(question);
    }

    // =========================
    // Update AI Usage
    // =========================

    await this.prisma.aIUsage.upsert({
      where: {
        studentId_dateKey: {
          studentId,
          dateKey,
        },
      },

      update: {
        count: {
          increment: requestedCount,
        },
      },

      create: {
        studentId,
        dateKey,
        count: requestedCount,
      },
    });

    // =========================
    // Response
    // =========================

    const newCount =
      currentCount + requestedCount;

    return {
      message:
        'AI generated questions created',

      count:
        questions.length,

      dailyLimit:
        DAILY_LIMIT,

      usedToday:
        newCount,

      remainingToday:
        DAILY_LIMIT - newCount,

      questions,
    };
  }
}
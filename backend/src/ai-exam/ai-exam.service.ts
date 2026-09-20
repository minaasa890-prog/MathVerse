import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiExamService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async generate(data: any) {
    const subject =
      data.subject || 'Math';

    const chapter =
      data.chapter || 'General';

    let difficulty = 2;

    if (data.difficulty === 'EASY') {
      difficulty = 1;
    }

    if (data.difficulty === 'HARD') {
      difficulty = 3;
    }

    if (typeof data.difficulty === 'number') {
      difficulty = data.difficulty;
    }

    const count =
      Number(
        data.count ||
        data.questionCount ||
        5,
      );

    const questions = [];

    for (
      let i = 1;
      i <= count;
      i++
    ) {
      const number1 =
        Math.floor(
          Math.random() * 20,
        ) + 1;

      const number2 =
        Math.floor(
          Math.random() * 20,
        ) + 1;

      const answer =
        number1 + number2;

      const question =
        await this.prisma.question.create({
          data: {
            title:
              `حاصل ${number1} + ${number2} چند است؟`,

            description:
              'سؤال تولید شده توسط AI Exam Generator',

            subject,

            chapter,

            difficulty,

            creatorId:
              Number(data.teacherId) || 1,

            questionType:
              'MULTIPLE_CHOICE',

            correctAnswer:
              String(answer),

            optionA:
              String(answer - 2),

            optionB:
              String(answer),

            optionC:
              String(answer + 2),

            optionD:
              String(answer + 5),

            score: 10,
          },
        });

      questions.push(question);
    }

    return {
      questions,
    };
  }

  async generateExam(
    data: any,
  ) {
    const generated =
      await this.generate(data);

    const exam =
      await this.prisma.exam.create({
        data: {
          title:
            data.title ||
            'AI Generated Exam',

          description:
            'Generated automatically by AI',

          duration:
            Number(data.duration) || 30,

          classroom: {
            connect: {
              id:
                Number(data.classroomId) || 1,
            },
          },

          questions: {
            create:
              generated.questions.map(
                (q, index) => ({
                  question: {
                    connect: {
                      id: q.id,
                    },
                  },
                  order: index,
                }),
              ),
          },
        },

        include: {
          questions: {
            include: {
              question: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

    return {
      message:
        'AI Exam Created Successfully',

      examId:
        exam.id,

      title:
        exam.title,

      classroomId:
        data.classroomId || 1,

      totalQuestions:
        exam.questions.length,

      questions:
        exam.questions.map(
          (item) =>
            item.question,
        ),
    };
  }

  async addAiQuestionsToExam(
    examId: number,
    data: any,
  ) {
    const exam =
      await this.prisma.exam.findUnique({
        where: {
          id: examId,
        },

        include: {
          questions: true,
        },
      });

    if (!exam) {
      throw new NotFoundException(
        `آزمون ${examId} پیدا نشد`,
      );
    }

    if (exam.status !== 'DRAFT') {
      throw new Error(
        'فقط به آزمون DRAFT می‌توان سؤال اضافه کرد.',
      );
    }

    const generated =
      await this.generate({
        ...data,
        count:
          Number(data.count) || 3,
      });

    let nextOrder = 0;

    if (exam.questions.length > 0) {
      nextOrder =
        Math.max(
          ...exam.questions.map(
            (item) =>
              Number(item.order) || 0,
          ),
        ) + 1;
    }

    const createdQuestions = [];

    for (
      let index = 0;
      index <
      generated.questions.length;
      index++
    ) {
      const question =
        generated.questions[index];

      const examQuestion =
        await this.prisma.examQuestion.create({
          data: {
            examId,

            questionId:
              question.id,

            order:
              nextOrder + index,
          },

          include: {
            question: true,
          },
        });

      createdQuestions.push(
        examQuestion,
      );
    }

    return {
      success: true,

      examId,

      addedQuestions:
        createdQuestions.length,

      questions:
        createdQuestions.map(
          (item) =>
            item.question,
        ),
    };
  }

  async adaptiveExam(
    studentId: number,
    data: any,
  ) {
    const attempts =
      await this.prisma.attempt.findMany({
        where: {
          studentId,
        },
      });

    const total =
      attempts.length;

    const correct =
      attempts.filter(
        (item) =>
          item.isCorrect,
      ).length;

    let accuracy = 0;

    if (total > 0) {
      accuracy =
        Math.round(
          (correct / total) * 100,
        );
    }

    let difficulty = 2;
    let level = 'Beginner';

    if (accuracy >= 80) {
      difficulty = 3;
      level = 'Advanced';
    } else if (
      accuracy >= 50
    ) {
      difficulty = 2;
      level = 'Intermediate';
    }

    const exam =
      await this.generateExam({
        teacherId:
          data.teacherId || 1,

        classroomId:
          data.classroomId || 1,

        title:
          `Adaptive AI Exam - ${level}`,

        subject:
          data.subject || 'Math',

        chapter:
          data.chapter || 'General',

        difficulty,

        count:
          data.count || 5,

        duration:
          data.duration || 30,
      });

    return {
      studentId,

      previousAccuracy:
        accuracy,

      detectedLevel:
        level,

      generatedDifficulty:
        difficulty,

      examId:
        exam.examId,

      totalQuestions:
        exam.totalQuestions,

      questions:
        exam.questions,
    };
  }
}

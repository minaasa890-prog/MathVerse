import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { DeepSeekService } from '../ai-question/deepseek.service';

@Injectable()
export class AiExamService {
  constructor(
    private prisma: PrismaService,
    private deepSeekService: DeepSeekService,
  ) {}

  /**
   * Generate AI questions using the existing DeepSeek service
   * and save them into the Question table.
   *
   * Supports:
   * - single mode: existing chapter-based generation
   * - mixed mode: generation based on multiple topics
   */
  async generate(data: any) {
    const subject =
      data.subject || 'Math';

    const requestedMode =
      data.mode === 'mixed'
        ? 'mixed'
        : 'single';

    const rawTopics = Array.isArray(data.topics)
      ? data.topics
      : [];

    const topics = rawTopics
      .map((topic: any) =>
        String(topic).trim(),
      )
      .filter(
        (topic: string) =>
          topic.length > 0,
      );

    /*
     * Mixed mode is valid only when at least
     * two real topics are provided.
     */
    const effectiveMode =
      requestedMode === 'mixed' &&
      topics.length >= 2
        ? 'mixed'
        : 'single';

    const chapter =
      effectiveMode === 'mixed'
        ? topics.join(' + ')
        : data.chapter || 'General';

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

    if (difficulty < 1 || difficulty > 3) {
      difficulty = 2;
    }

    const count = Math.max(
      1,
      Math.min(
        Number(
          data.count ||
          data.questionCount ||
          5,
        ),
        30,
      ),
    );

    const creatorId =
      Number(data.teacherId) || 1;

    const questions = [];

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const aiQuestion =
        await this.deepSeekService.generateQuestion(
          subject,
          chapter,
          difficulty,
          effectiveMode,
          topics,
        );

      if (
        !aiQuestion ||
        !aiQuestion.title ||
        !aiQuestion.correctAnswer
      ) {
        throw new Error(
          `DeepSeek سؤال معتبر برای سؤال شماره ${i + 1} تولید نکرد.`,
        );
      }

      const question =
        await this.prisma.question.create({
          data: {
            title:
              String(aiQuestion.title),

            description:
              String(
                aiQuestion.explanation ||
                aiQuestion.solution ||
                'سؤال تولیدشده توسط هوش مصنوعی DeepSeek',
              ),

            subject,

            chapter,

            difficulty,

            creatorId,

            questionType:
              'MULTIPLE_CHOICE',

              isInQuestionBank: false,

            correctAnswer:
              String(
                aiQuestion.correctAnswer,
              ),

            optionA:
              String(
                aiQuestion.optionA || '',
              ),

            optionB:
              String(
                aiQuestion.optionB || '',
              ),

            optionC:
              String(
                aiQuestion.optionC || '',
              ),

            optionD:
              String(
                aiQuestion.optionD || '',
              ),

            score: 10,

            explanation:
              aiQuestion.explanation
                ? String(
                    aiQuestion.explanation,
                  )
                : undefined,

            solution:
              aiQuestion.solution
                ? String(
                    aiQuestion.solution,
                  )
                : undefined,
          },
        });

      questions.push(question);
    }

    return {
      questions,

      mode:
        effectiveMode,

      topics:
        effectiveMode === 'mixed'
          ? topics
          : [],
    };
  }

  /**
   * Generate AI questions and create a complete exam.
   */
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
            'آزمون تولیدشده با هوش مصنوعی',

          description:
            data.description ||
            'آزمون تولیدشده با استفاده از هوش مصنوعی DeepSeek',

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
        'آزمون با موفقیت توسط هوش مصنوعی ساخته شد',

      examId:
        exam.id,

      title:
        exam.title,

      classroomId:
        data.classroomId || 1,

      totalQuestions:
        exam.questions.length,

      mode:
        generated.mode,

      topics:
        generated.topics,

      questions:
        exam.questions.map(
          (item) =>
            item.question,
        ),
    };
  }

  /**
   * Generate AI questions and add them
   * to an existing DRAFT exam.
   */
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

      mode:
        generated.mode,

      topics:
        generated.topics,

      questions:
        createdQuestions.map(
          (item) =>
            item.question,
        ),
    };
  }

  /**
   * Generate an adaptive AI exam
   * according to the student's previous accuracy.
   */
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
        correct / total;
    }

    let difficulty = 2;

    if (accuracy >= 0.8) {
      difficulty = 3;
    } else if (accuracy < 0.5) {
      difficulty = 1;
    }

    return this.generateExam({
      ...data,

      difficulty,
      count:
        Number(data.count) || 5,
      studentId,
    });
  }
}
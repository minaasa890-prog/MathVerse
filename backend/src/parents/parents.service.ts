import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  // =========================================================
  // داشبورد والد
  // =========================================================

  async dashboard(parentId: number) {
    const parent = await this.prisma.user.findUnique({
      where: {
        id: parentId,
      },

      include: {
        children: {
          include: {
            classroom: true,

            attempts: {
              orderBy: {
                createdAt: 'asc',
              },

              include: {
                question: true,
              },
            },

            studentSkills: true,
          },
        },
      },
    });

    if (!parent) {
      return {
        message: 'Parent not found',
      };
    }

    if (parent.role !== 'PARENT') {
      throw new ForbiddenException(
        'User is not a parent',
      );
    }

    return {
      parent: {
        id: parent.id,
        name: parent.name,
      },

      children: parent.children.map((child) => {
        // =====================================================
        // آمار کلی
        // =====================================================

        const totalAttempts = child.attempts.length;

        const correctAttempts = child.attempts.filter(
          (attempt) => attempt.isCorrect === true,
        ).length;

        const wrongAttempts =
          totalAttempts - correctAttempts;

        const average =
          totalAttempts > 0
            ? Math.round(
                (correctAttempts / totalAttempts) * 100,
              )
            : 0;

        const totalExams = totalAttempts;

        // =====================================================
        // تحلیل عملکرد بر اساس فصل
        // =====================================================

        const chapterMap: Record<
          string,
          {
            total: number;
            correct: number;
            wrong: number;
          }
        > = {};

        for (const attempt of child.attempts) {
          const chapter =
            attempt.question?.chapter?.trim() || 'سایر';

          if (!chapterMap[chapter]) {
            chapterMap[chapter] = {
              total: 0,
              correct: 0,
              wrong: 0,
            };
          }

          chapterMap[chapter].total++;

          if (attempt.isCorrect === true) {
            chapterMap[chapter].correct++;
          } else {
            chapterMap[chapter].wrong++;
          }
        }

        const chapterPerformance = Object.entries(
          chapterMap,
        )
          .map(([chapter, data]) => {
            const percentage =
              data.total > 0
                ? Math.round(
                    (data.correct / data.total) * 100,
                  )
                : 0;

            return {
              chapter,
              totalQuestions: data.total,
              correctAnswers: data.correct,
              wrongAnswers: data.wrong,
              percentage,
            };
          })
          .sort(
            (a, b) =>
              a.percentage - b.percentage,
          );

        // =====================================================
        // نقاط قوت
        // =====================================================

        const strengths = chapterPerformance
          .filter(
            (chapter) =>
              chapter.totalQuestions >= 1 &&
              chapter.percentage >= 80,
          )
          .sort(
            (a, b) =>
              b.percentage - a.percentage,
          )
          .map(
            (chapter) =>
              chapter.chapter,
          );

        // =====================================================
        // نقاط ضعف
        // =====================================================

        const weaknesses = chapterPerformance
          .filter(
            (chapter) =>
              chapter.totalQuestions >= 1 &&
              chapter.percentage < 60,
          )
          .sort(
            (a, b) =>
              a.percentage - b.percentage,
          )
          .map(
            (chapter) =>
              chapter.chapter,
          );

        // =====================================================
        // پیشنهاد آموزشی
        // =====================================================

        let recommendation =
          'ادامه تمرین پیشرفته';

        if (weaknesses.length > 0) {
          recommendation =
            `تمرکز بیشتر روی فصل‌های ${weaknesses
              .slice(0, 3)
              .join('، ')} و انجام تمرین‌های هدفمند`;
        } else if (
          average >= 80 &&
          strengths.length > 0
        ) {
          recommendation =
            'عملکرد بسیار خوب است؛ ادامه تمرین‌های پیشرفته و حل سؤالات چالشی پیشنهاد می‌شود';
        } else if (average >= 60) {
          recommendation =
            'ادامه تمرین منظم و تقویت فصل‌هایی که درصد پایین‌تری دارند';
        } else {
          recommendation =
            'مرور درس‌ها و تمرین بیشتر در فصل‌های ضعیف پیشنهاد می‌شود';
        }

        // =====================================================
        // تاریخچه پیشرفت
        // =====================================================

        let historyCorrect = 0;

        const progressHistory =
          child.attempts.map(
            (attempt, index) => {
              if (
                attempt.isCorrect === true
              ) {
                historyCorrect++;
              }

              const answered = index + 1;

              const progress =
                answered > 0
                  ? Math.round(
                      (historyCorrect /
                        answered) *
                        100,
                    )
                  : 0;

              return {
                attemptId: attempt.id,
                date: attempt.createdAt,
                questionNumber: answered,
                isCorrect:
                  attempt.isCorrect,
                progress,
              };
            },
          );

        // =====================================================
        // اولین فعالیت
        // =====================================================

        const firstAttempt =
          child.attempts[0];

        // =====================================================
        // آخرین فعالیت
        // =====================================================

        const lastAttempt =
          child.attempts.length > 0
            ? child.attempts[
                child.attempts.length - 1
              ]
            : null;

        // =====================================================
        // خروجی دانش‌آموز
        // =====================================================

        return {
          studentId: child.id,

          name: child.name,

          class:
            child.classroom?.name ||
            'بدون کلاس',

          totalExams,

          average,

          correctAnswers:
            correctAttempts,

          wrongAnswers:
            wrongAttempts,

          totalAnswers:
            totalAttempts,

          strengths,

          weaknesses,

          recommendation,

          chapterPerformance,

          progressHistory,

          firstActivityDate:
            firstAttempt?.createdAt ??
            null,

          lastActivityDate:
            lastAttempt?.createdAt ??
            null,
        };
      }),
    };
  }

  // =========================================================
  // بررسی مالکیت فرزند
  // =========================================================

  private async verifyChildOwnership(
    studentId: number,
    parentId: number,
  ) {
    const student =
      await this.prisma.user.findUnique({
        where: {
          id: studentId,
        },

        select: {
          id: true,
          parentId: true,
        },
      });

    if (!student) {
      throw new ForbiddenException(
        'Student not found',
      );
    }

    if (student.parentId !== parentId) {
      throw new ForbiddenException(
        'You can only access your own child',
      );
    }

    return student;
  }

  // =========================================================
  // روند پیشرفت در سؤالات چالشی
  // =========================================================

  async challengingProgress(
    studentId: number,
    parentId: number,
  ) {
    await this.verifyChildOwnership(
      studentId,
      parentId,
    );

    const attempts =
      await this.prisma.attempt.findMany({
        where: {
          studentId,

          question: {
            difficulty: {
              gte: 2,
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },

        include: {
          question: true,
        },
      });

    let correctCount = 0;

    return attempts.map(
      (attempt, index) => {
        if (
          attempt.isCorrect === true
        ) {
          correctCount++;
        }

        const totalAnswered =
          index + 1;

        const percentage =
          totalAnswered > 0
            ? Math.round(
                (correctCount /
                  totalAnswered) *
                  100,
              )
            : 0;

        return {
          attemptId: attempt.id,

          questionId:
            attempt.questionId,

          date: attempt.createdAt,

          difficulty:
            attempt.question.difficulty,

          chapter:
            attempt.question.chapter ||
            'سایر',

          isCorrect:
            attempt.isCorrect,

          percentage,
        };
      },
    );
  }

  // =========================================================
  // API تشخیصی پاسخ‌های دانش‌آموز
  // =========================================================

  async debugStudentAttempts(
    studentId: number,
    parentId: number,
  ) {
    await this.verifyChildOwnership(
      studentId,
      parentId,
    );

    const attempts =
      await this.prisma.attempt.findMany({
        where: {
          studentId,
        },

        orderBy: {
          createdAt: 'asc',
        },

        include: {
          question: true,
        },
      });

    return attempts.map(
      (attempt) => ({
        attemptId: attempt.id,

        questionId:
          attempt.questionId,

        difficulty:
          attempt.question.difficulty,

        chapter:
          attempt.question.chapter ||
          'سایر',

        isCorrect:
          attempt.isCorrect,

        date:
          attempt.createdAt,
      }),
    );
  }
}


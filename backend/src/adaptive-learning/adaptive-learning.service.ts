import { Injectable } from '@nestjs/common';

import { AiSolutionService } from '../ai-question/ai-solution.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdaptiveLearningService {
  constructor(
    private prisma: PrismaService,
    private aiSolutionService: AiSolutionService,
  ) {}

  // =====================================
  // بروزرسانی Mastery از پاسخ تشریحی
  // =====================================

  async updateMasteryFromWrittenAnswer(
    studentId: number,
    questionId: number,
    isCorrect: boolean,
  ) {
    const question =
      await this.prisma.question.findUnique({
        where: {
          id: questionId,
        },
        select: {
          id: true,
          chapter: true,
        },
      });

    if (!question) {
      return {
        success: false,
        message: 'Question not found',
      };
    }

    const chapter =
      question.chapter?.trim() ||
      'بدون فصل';

    let skill =
      await this.prisma.studentSkill.findUnique({
        where: {
          studentId_chapter: {
            studentId,
            chapter,
          },
        },
      });

    if (!skill) {
      skill =
        await this.prisma.studentSkill.create({
          data: {
            studentId,
            chapter,
            correctCount:
              isCorrect ? 1 : 0,
            wrongCount:
              isCorrect ? 0 : 1,
            masteryScore:
              isCorrect ? 100 : 30,
          },
        });

      return {
        success: true,
        created: true,
        source: 'WRITTEN_ANSWER',
        skill,
      };
    }

    const correctCount =
      skill.correctCount +
      (isCorrect ? 1 : 0);

    const wrongCount =
      skill.wrongCount +
      (isCorrect ? 0 : 1);

    const total =
      correctCount + wrongCount;

    const masteryScore =
      total === 0
        ? 0
        : Math.round(
            (correctCount / total) * 100,
          );

    const updatedSkill =
      await this.prisma.studentSkill.update({
        where: {
          id: skill.id,
        },
        data: {
          correctCount,
          wrongCount,
          masteryScore,
        },
      });

    return {
      success: true,
      created: false,
      source: 'WRITTEN_ANSWER',
      skill: updatedSkill,
    };
  }

  // =====================================
  // تحلیل مهارت دانش آموز
  // =====================================

  async analyzeStudent(studentId: number) {
    const skills =
      await this.prisma.studentSkill.findMany({
        where: {
          studentId,
        },
      });

    if (skills.length === 0) {
      return {
        mastery: 50,
        weakestSkill: 'بدون مهارت ثبت شده',
      };
    }

    let total = 0;

    let weakestSkill =
      skills[0].chapter;

    let min =
      skills[0].masteryScore;

    for (const skill of skills) {
      total += skill.masteryScore;

      if (
        skill.masteryScore < min
      ) {
        min =
          skill.masteryScore;

        weakestSkill =
          skill.chapter;
      }
    }

    return {
      mastery:
        Math.round(
          total / skills.length,
        ),
      weakestSkill,
    };
  }

  // =====================================
  // دریافت سوال هوشمند
  // =====================================

  async getSmartPractice(
    studentId: number,
  ) {
    const analysis =
      await this.analyzeStudent(
        studentId,
      );

    let difficulty = 1;

    if (analysis.mastery >= 80) {
      difficulty = 3;
    } else if (
      analysis.mastery >= 50
    ) {
      difficulty = 2;
    }

    let question =
      await this.prisma.question.findFirst({
        where: {
          difficulty: {
            lte: difficulty,
          },
        },
        orderBy: {
          difficulty: 'desc',
        },
      });

    if (!question) {
      question =
        await this.prisma.question.findFirst({
          where: {
            difficulty,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
    }

    return {
      success: true,
      studentId,
      analysis: {
        mastery:
          analysis.mastery,
        weakestSkill:
          analysis.weakestSkill,
        recommendedDifficulty:
          difficulty,
        source:
          'Adaptive Engine',
      },
      question,
    };
  }

  // =====================================
  // ثبت جواب تمرین عادی
  // =====================================

  async submitPractice(
    studentId: number,
    questionId: number,
    answer: string,
  ) {
    const question =
      await this.prisma.question.findUnique({
        where: {
          id: questionId,
        },
      });

    if (!question) {
      return {
        success: false,
        message: 'Question not found',
      };
    }

    const normalizedAnswer =
      String(answer)
        .trim()
        .toUpperCase();

    const normalizedCorrectAnswer =
      String(
        question.correctAnswer ?? '',
      )
        .trim()
        .toUpperCase();

    const optionValueMap: Record<
      string,
      string
    > = {
      A: String(
        question.optionA ?? '',
      )
        .trim()
        .toUpperCase(),

      B: String(
        question.optionB ?? '',
      )
        .trim()
        .toUpperCase(),

      C: String(
        question.optionC ?? '',
      )
        .trim()
        .toUpperCase(),

      D: String(
        question.optionD ?? '',
      )
        .trim()
        .toUpperCase(),
    };

    const selectedOptionValue =
      optionValueMap[
        normalizedAnswer
      ] ?? '';

    const isCorrect =
      normalizedCorrectAnswer ===
        normalizedAnswer ||
      (
        selectedOptionValue !== '' &&
        normalizedCorrectAnswer ===
          selectedOptionValue
      );

    await this.prisma.practiceHistory.create({
      data: {
        studentId,
        questionId,
        isAnswered: true,
        isCorrect,
      },
    });

    const chapter =
      question.chapter ??
      'بدون فصل';

    let skill =
      await this.prisma.studentSkill.findUnique({
        where: {
          studentId_chapter: {
            studentId,
            chapter,
          },
        },
      });

    if (!skill) {
      skill =
        await this.prisma.studentSkill.create({
          data: {
            studentId,
            chapter,
            correctCount:
              isCorrect ? 1 : 0,
            wrongCount:
              isCorrect ? 0 : 1,
            masteryScore:
              isCorrect ? 100 : 30,
          },
        });
    } else {
      const correctCount =
        skill.correctCount +
        (isCorrect ? 1 : 0);

      const wrongCount =
        skill.wrongCount +
        (isCorrect ? 0 : 1);

      const total =
        correctCount + wrongCount;

      const masteryScore =
        total === 0
          ? 0
          : Math.round(
              (correctCount / total) * 100,
            );

      skill =
        await this.prisma.studentSkill.update({
          where: {
            id: skill.id,
          },
          data: {
            correctCount,
            wrongCount,
            masteryScore,
          },
        });
    }

    // =====================================
    // XP و Level
    // =====================================

    let xpReward = 0;

    if (isCorrect) {
      xpReward = 10;

      const user =
        await this.prisma.user.findUnique({
          where: {
            id: studentId,
          },
        });

      if (user) {
        const xp =
          user.xp + xpReward;

        const level =
          Math.floor(xp / 100) + 1;

        await this.prisma.user.update({
          where: {
            id: studentId,
          },
          data: {
            xp,
            level,
          },
        });
      }
    }

    return {
      success: true,
      correct: isCorrect,
      answer: normalizedAnswer,
      correctAnswer:
        normalizedCorrectAnswer,
      xpReward,
      skill,
    };
  }

  // =====================================
  // ساخت برنامه یادگیری
  // =====================================

  async createPlan(
    studentId: number,
  ) {
    const analysis =
      await this.analyzeStudent(
        studentId,
      );

    let difficulty = 1;

    if (analysis.mastery >= 80) {
      difficulty = 3;
    } else if (
      analysis.mastery >= 50
    ) {
      difficulty = 2;
    }

    return {
      studentId,
      mastery:
        analysis.mastery,
      weakestSkill:
        analysis.weakestSkill,
      plan: [
        {
          type: 'SMART_PRACTICE',
          difficulty,
          questions: 10,
        },
        {
          type: 'REVIEW',
          skill:
            analysis.weakestSkill,
        },
      ],
    };
  }

  // =====================================
  // درس بعدی پیشنهادی AI
  // =====================================

  async nextLesson(
    studentId: number,
  ) {
    const weakSkill =
      await this.prisma.studentSkill.findFirst({
        where: {
          studentId,
        },
        orderBy: {
          masteryScore: 'asc',
        },
      });

    const completedProgress =
      await this.prisma.lessonProgress.findMany({
        where: {
          studentId,
          completed: true,
        },
        select: {
          lessonId: true,
        },
      });

    const completedLessonIds =
      completedProgress.map(
        (item) => item.lessonId,
      );

    const lessons =
      await this.prisma.lesson.findMany({
        where: {
          ...(completedLessonIds.length > 0
            ? {
                id: {
                  notIn:
                    completedLessonIds,
                },
              }
            : {}),
        },
        include: {
          chapter: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

    if (lessons.length === 0) {
      if (weakSkill) {
        if (
          weakSkill.masteryScore < 70
        ) {
          return {
            studentId,
            lessonId: null,
            nextLesson:
              'تمرین تقویتی',
            reason:
              `تمام درس‌های فعلی تکمیل شده‌اند، اما مهارت «${weakSkill.chapter}» هنوز نیاز به تمرین بیشتری دارد.`,
            type: 'PRACTICE',
            chapter:
              weakSkill.chapter,
          };
        }

        if (
          weakSkill.masteryScore < 90
        ) {
          return {
            studentId,
            lessonId: null,
            nextLesson:
              'تمرین تکمیلی',
            reason:
              `درس‌های فعلی تکمیل شده‌اند. برای تثبیت مهارت «${weakSkill.chapter}»، تمرین تکمیلی پیشنهاد می‌شود.`,
            type: 'PRACTICE',
            chapter:
              weakSkill.chapter,
          };
        }

        return {
          studentId,
          lessonId: null,
          nextLesson:
            'تمرین پیشرفته',
          reason:
            `تمام درس‌های فعلی تکمیل شده‌اند و مهارت «${weakSkill.chapter}» در سطح خوبی قرار دارد. تمرین‌های پیشرفته پیشنهاد می‌شود.`,
          type:
            'ADVANCED_PRACTICE',
          chapter:
            weakSkill.chapter,
        };
      }

      return {
        studentId,
        lessonId: null,
        nextLesson:
          'تمرین هوشمند',
        reason:
          'تمام درس‌های فعلی تکمیل شده‌اند. برای ادامه مسیر، تمرین هوشمند پیشنهاد می‌شود.',
        type: 'PRACTICE',
      };
    }

    if (weakSkill) {
      const normalize = (
        value: string,
      ) => {
        return value
          .trim()
          .toLowerCase()
          .replace(/ي/g, 'ی')
          .replace(/ى/g, 'ی')
          .replace(/ك/g, 'ک')
          .replace(/\s+/g, ' ')
          .replace(
            /فصل\s*۱/g,
            'فصل اول',
          )
          .replace(
            /فصل\s*1/g,
            'فصل اول',
          )
          .replace(
            /فصل\s*۲/g,
            'فصل دوم',
          )
          .replace(
            /فصل\s*2/g,
            'فصل دوم',
          )
          .replace(
            /فصل\s*۳/g,
            'فصل سوم',
          )
          .replace(
            /فصل\s*3/g,
            'فصل سوم',
          )
          .replace(
            /فصل\s*۴/g,
            'فصل چهارم',
          )
          .replace(
            /فصل\s*4/g,
            'فصل چهارم',
          )
          .replace(
            /فصل\s*۵/g,
            'فصل پنجم',
          )
          .replace(
            /فصل\s*5/g,
            'فصل پنجم',
          )
          .replace(
            /فصل\s*۶/g,
            'فصل ششم',
          )
          .replace(
            /فصل\s*6/g,
            'فصل ششم',
          )
          .replace(
            /فصل\s*۷/g,
            'فصل هفتم',
          )
          .replace(
            /فصل\s*7/g,
            'فصل هفتم',
          )
          .replace(
            /فصل\s*۸/g,
            'فصل هشتم',
          )
          .replace(
            /فصل\s*8/g,
            'فصل هشتم',
          )
          .replace(
            /فصل\s*۹/g,
            'فصل نهم',
          )
          .replace(
            /فصل\s*9/g,
            'فصل نهم',
          )
          .replace(
            /فصل\s*۱۰/g,
            'فصل دهم',
          )
          .replace(
            /فصل\s*10/g,
            'فصل دهم',
          );
      };

      const weakChapter =
        normalize(
          weakSkill.chapter,
        );

      let recommendedLesson =
        lessons.find(
          (lesson) =>
            lesson.chapter &&
            normalize(
              lesson.chapter.title,
            ) === weakChapter,
        );

      if (!recommendedLesson) {
        recommendedLesson =
          lessons.find(
            (lesson) =>
              lesson.chapter &&
              (
                normalize(
                  lesson.chapter.title,
                ).includes(
                  weakChapter,
                ) ||
                weakChapter.includes(
                  normalize(
                    lesson.chapter.title,
                  ),
                )
              ),
          );
      }

      if (recommendedLesson) {
        return {
          studentId,
          lessonId:
            recommendedLesson.id,
          nextLesson:
            recommendedLesson.title,
          reason:
            `بر اساس مهارت ضعیف «${weakSkill.chapter}» انتخاب شد`,
        };
      }
    }

    const fallbackLesson =
      lessons[0];

    return {
      studentId,
      lessonId:
        fallbackLesson.id,
      nextLesson:
        fallbackLesson.title,
      reason:
        'این درس به عنوان ادامه مسیر یادگیری شما پیشنهاد شده است.',
    };
  }

  // =====================================
  // شروع تمرین هوشمند
  // =====================================

  async startPracticeSession(
    studentId: number,
    requestedChapter?: string,
  ): Promise<any> {
    const analysis =
      await this.analyzeStudent(
        studentId,
      );

    let difficulty = 1;

    if (analysis.mastery >= 80) {
      difficulty = 3;
    } else if (
      analysis.mastery >= 50
    ) {
      difficulty = 2;
    }

    const chapter =
      requestedChapter?.trim()
        ? requestedChapter.trim()
        : analysis.weakestSkill !==
            'بدون مهارت ثبت شده'
          ? analysis.weakestSkill
          : 'فصل اول';

    const session =
      await this.prisma.practiceSession.create({
        data: {
          studentId,
          totalQuestions: 10,
          difficulty,
          chapter,
          subject: 'Math7',
        },
      });

    return {
      success: true,
      session,
    };
  }

  // =====================================
  // سوال بعدی Adaptive Session
  // =====================================

  async getNextQuestion(
    sessionId: number,
    studentId: number,
  ) {
    const session =
      await this.prisma.practiceSession.findUnique({
        where: {
          id: sessionId,
        },
      });

    if (!session) {
      throw new Error(
        'Practice session not found',
      );
    }

    // =====================================
    // بررسی مالکیت Session
    // =====================================

    if (
      session.studentId !==
      studentId
    ) {
      return {
        success: false,
        message:
          'This session does not belong to this student',
      };
    }

    const answeredCount =
      await this.prisma.practiceAnswer.count({
        where: {
          sessionId,
        },
      });

    if (
      answeredCount >=
      session.totalQuestions
    ) {
      return {
        success: true,
        finished: true,
        message:
          'Practice session completed',
      };
    }

    const currentSessionAnswers =
      await this.prisma.practiceAnswer.findMany({
        where: {
          sessionId,
        },
        select: {
          questionId: true,
        },
      });

    const answeredQuestionIds =
      currentSessionAnswers.map(
        (item) => item.questionId,
      );

    const history =
      await this.prisma.practiceHistory.findMany({
        where: {
          studentId:
            session.studentId,
          isAnswered: true,
        },
        select: {
          questionId: true,
          isCorrect: true,
        },
        orderBy: {
          id: 'desc',
        },
      });

    const allUsedQuestionIds = [
      ...new Set(
        history.map(
          (item) => item.questionId,
        ),
      ),
    ];

    const allQuestions =
      await this.prisma.question.findMany({
        orderBy: {
          id: 'asc',
        },
      });

    const freshQuestions =
      allQuestions.filter(
        (question) =>
          !allUsedQuestionIds.includes(
            question.id,
          ) &&
          !answeredQuestionIds.includes(
            question.id,
          ),
      );

    const normalizeChapter = (
      value:
        | string
        | null
        | undefined,
    ) => {
      if (!value) return '';

      return value
        .toString()
        .trim()
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/۱/g, '1')
        .replace(/۲/g, '2')
        .replace(/۳/g, '3')
        .replace(/۴/g, '4')
        .replace(/۵/g, '5')
        .replace(/۶/g, '6')
        .replace(/۷/g, '7')
        .replace(/۸/g, '8')
        .replace(/۹/g, '9')
        .replace(/۰/g, '0')
        .toLowerCase();
    };

    const targetChapter =
      normalizeChapter(
        session.chapter,
      );

    const isSameChapter = (
      questionChapter:
        | string
        | null
        | undefined,
    ) => {
      const chapter =
        normalizeChapter(
          questionChapter,
        );

      if (
        !chapter ||
        !targetChapter
      ) {
        return false;
      }

      if (
        chapter ===
        targetChapter
      ) {
        return true;
      }

      if (
        targetChapter.includes(
          'فصل 1',
        ) ||
        targetChapter.includes(
          'فصل اول',
        )
      ) {
        return (
          chapter.includes(
            'راهبرد حل مسئله',
          ) ||
          chapter.includes(
            'حل مسئله',
          ) ||
          chapter.includes(
            'مسئله',
          ) ||
          chapter.includes(
            'الگو',
          ) ||
          chapter.includes(
            'الگوهای عددی',
          ) ||
          chapter.includes(
            'مسئله معکوس',
          ) ||
          chapter.includes(
            'مسئله جمع',
          ) ||
          chapter.includes(
            'اولویت عملیات',
          )
        );
      }

      if (
        targetChapter.includes(
          'فصل 2',
        ) ||
        targetChapter.includes(
          'فصل دوم',
        )
      ) {
        return (
          chapter.includes(
            'عدد صحیح',
          ) ||
          chapter.includes(
            'اعداد صحیح',
          ) ||
          chapter.includes(
            'جمع اعداد صحیح',
          ) ||
          chapter.includes(
            'تفریق اعداد صحیح',
          ) ||
          chapter.includes(
            'ضرب اعداد صحیح',
          ) ||
          chapter.includes(
            'تقسیم اعداد صحیح',
          )
        );
      }

      if (
        targetChapter.includes(
          'فصل 3',
        ) ||
        targetChapter.includes(
          'فصل سوم',
        )
      ) {
        return (
          chapter.includes(
            'جبر',
          ) ||
          chapter.includes(
            'معادله',
          ) ||
          chapter.includes(
            'معادلات',
          ) ||
          chapter.includes(
            'عبارت جبری',
          ) ||
          chapter.includes(
            'مجهول',
          ) ||
          chapter.includes(
            'x',
          )
        );
      }

      return false;
    };

    const freshTargetChapterQuestions =
      freshQuestions.filter(
        (question) =>
          isSameChapter(
            question.chapter,
          ),
      );

    let selectedQuestion: any =
      null;

    let selectionType:
      | 'TARGET_CHAPTER'
      | 'GLOBAL_FALLBACK'
      | 'REPEAT_WRONG' =
      'GLOBAL_FALLBACK';

    if (
      freshTargetChapterQuestions.length >
      0
    ) {
      const sameDifficulty =
        freshTargetChapterQuestions.filter(
          (question) =>
            question.difficulty ===
            session.difficulty,
        );

      if (
        sameDifficulty.length >
        0
      ) {
        selectedQuestion =
          sameDifficulty[
            Math.floor(
              Math.random() *
                sameDifficulty.length,
            )
          ];
      } else {
        selectedQuestion =
          [
            ...freshTargetChapterQuestions,
          ].sort(
            (a, b) =>
              Math.abs(
                a.difficulty -
                  session.difficulty,
              ) -
              Math.abs(
                b.difficulty -
                  session.difficulty,
              ),
          )[0];
      }

      selectionType =
        'TARGET_CHAPTER';
    }

    if (
      !selectedQuestion &&
      freshQuestions.length > 0
    ) {
      const sameDifficulty =
        freshQuestions.filter(
          (question) =>
            question.difficulty ===
            session.difficulty,
        );

      if (
        sameDifficulty.length >
        0
      ) {
        selectedQuestion =
          sameDifficulty[
            Math.floor(
              Math.random() *
                sameDifficulty.length,
            )
          ];
      } else {
        selectedQuestion =
          [...freshQuestions].sort(
            (a, b) =>
              Math.abs(
                a.difficulty -
                  session.difficulty,
              ) -
              Math.abs(
                b.difficulty -
                  session.difficulty,
              ),
          )[0];
      }

      selectionType =
        'GLOBAL_FALLBACK';
    }

    if (!selectedQuestion) {
      const wrongQuestionIds = [
        ...new Set(
          history
            .filter(
              (item) =>
                item.isCorrect ===
                false,
            )
            .map(
              (item) =>
                item.questionId,
            ),
        ),
      ];

      const wrongQuestions =
        allQuestions.filter(
          (question) =>
            wrongQuestionIds.includes(
              question.id,
            ) &&
            !answeredQuestionIds.includes(
              question.id,
            ),
        );

      const wrongTargetChapterQuestions =
        wrongQuestions.filter(
          (question) =>
            isSameChapter(
              question.chapter,
            ),
        );

      if (
        wrongTargetChapterQuestions.length >
        0
      ) {
        const sameDifficulty =
          wrongTargetChapterQuestions.filter(
            (question) =>
              question.difficulty ===
              session.difficulty,
          );

        if (
          sameDifficulty.length >
          0
        ) {
          selectedQuestion =
            sameDifficulty[
              Math.floor(
                Math.random() *
                  sameDifficulty.length,
              )
            ];
        } else {
          selectedQuestion =
            [
              ...wrongTargetChapterQuestions,
            ].sort(
              (a, b) =>
                Math.abs(
                  a.difficulty -
                    session.difficulty,
                ) -
                Math.abs(
                  b.difficulty -
                    session.difficulty,
                ),
            )[0];
        }

        selectionType =
          'REPEAT_WRONG';
      }

      if (
        !selectedQuestion &&
        wrongQuestions.length > 0
      ) {
        const sameDifficulty =
          wrongQuestions.filter(
            (question) =>
              question.difficulty ===
              session.difficulty,
          );

        if (
          sameDifficulty.length >
          0
        ) {
          selectedQuestion =
            sameDifficulty[
              Math.floor(
                Math.random() *
                  sameDifficulty.length,
              )
            ];
        } else {
          selectedQuestion =
            [...wrongQuestions].sort(
              (a, b) =>
                Math.abs(
                  a.difficulty -
                    session.difficulty,
                ) -
                Math.abs(
                  b.difficulty -
                    session.difficulty,
                ),
            )[0];
        }

        selectionType =
          'REPEAT_WRONG';
      }
    }

    if (!selectedQuestion) {
      return {
        success: true,
        finished: true,
        message:
          'No questions available',
      };
    }

    const {
      correctAnswer,
      explanation,
      solution,
      ...safeQuestion
    } = selectedQuestion;

    return {
      success: true,
      finished: false,
      question: safeQuestion,
      selection:
        selectionType,
      progress: {
        answered:
          answeredCount,
        total:
          session.totalQuestions,
        remaining:
          session.totalQuestions -
          answeredCount,
      },
      adaptive: {
        chapter:
          session.chapter,
        difficulty:
          session.difficulty,
      },
    };
  }

  // =====================================
  // ثبت جواب Adaptive Session
  // =====================================

  async submitSessionAnswer(
    sessionId: number,
    studentId: number,
    questionId: number,
    answer: string,
  ) {
    const session =
      await this.prisma.practiceSession.findUnique({
        where: {
          id: sessionId,
        },
        include: {
          answers: true,
        },
      });

    if (!session) {
      return {
        success: false,
        message:
          'Session not found',
      };
    }

    if (
      session.studentId !==
      studentId
    ) {
      return {
        success: false,
        message:
          'This session does not belong to this student',
      };
    }

    const alreadyAnswered =
      session.answers.some(
        (item) =>
          item.questionId ===
          questionId,
      );

    if (alreadyAnswered) {
      return {
        success: false,
        message:
          'Question already answered in this session',
      };
    }

    const question =
      await this.prisma.question.findUnique({
        where: {
          id: questionId,
        },
      });

    if (!question) {
      return {
        success: false,
        message:
          'Question not found',
      };
    }

    const normalizedAnswer =
      String(answer)
        .trim()
        .toUpperCase();

    const normalizedCorrectAnswer =
      String(
        question.correctAnswer ??
          '',
      )
        .trim()
        .toUpperCase();

    const optionValueMap: Record<
      string,
      string
    > = {
      A: String(
        question.optionA ?? '',
      )
        .trim()
        .toUpperCase(),

      B: String(
        question.optionB ?? '',
      )
        .trim()
        .toUpperCase(),

      C: String(
        question.optionC ?? '',
      )
        .trim()
        .toUpperCase(),

      D: String(
        question.optionD ?? '',
      )
        .trim()
        .toUpperCase(),
    };

    const selectedOptionValue =
      optionValueMap[
        normalizedAnswer
      ] ?? '';

    const correctAnswerIsOptionCode =
      [
        'A',
        'B',
        'C',
        'D',
      ].includes(
        normalizedCorrectAnswer,
      );

    let isCorrect = false;

    if (
      correctAnswerIsOptionCode
    ) {
      isCorrect =
        normalizedAnswer ===
        normalizedCorrectAnswer;
    } else {
      isCorrect =
        selectedOptionValue !==
          '' &&
        selectedOptionValue ===
          normalizedCorrectAnswer;
    }

    await this.prisma.practiceAnswer.create({
      data: {
        sessionId,
        questionId,
        answer:
          normalizedAnswer,
        correct:
          isCorrect,
      },
    });

    await this.prisma.practiceHistory.create({
      data: {
        studentId,
        questionId,
        isAnswered: true,
        isCorrect,
      },
    });

    const answeredQuestions =
      session.answeredQuestions +
      1;

    const correctAnswers =
      session.correctAnswers +
      (isCorrect ? 1 : 0);

    const wrongAnswers =
      session.wrongAnswers +
      (isCorrect ? 0 : 1);

    const totalScore =
      session.totalScore +
      (isCorrect
        ? question.score
        : 0);

    const finished =
      answeredQuestions >=
      session.totalQuestions;

    // =====================================
    // Adaptive Difficulty
    // =====================================

    let newDifficulty =
      session.difficulty;

    const previousAnswers =
      [...session.answers].sort(
        (a, b) =>
          a.id - b.id,
      );

    let consecutiveCorrect = 0;

    for (
      let i =
        previousAnswers.length - 1;
      i >= 0;
      i--
    ) {
      if (
        previousAnswers[i].correct
      ) {
        consecutiveCorrect++;
      } else {
        break;
      }
    }

    if (isCorrect) {
      consecutiveCorrect++;
    } else {
      consecutiveCorrect = 0;
    }

    if (
      consecutiveCorrect >= 2 &&
      isCorrect
    ) {
      newDifficulty =
        Math.min(
          3,
          session.difficulty + 1,
        );
    }

    if (!isCorrect) {
      newDifficulty =
        Math.max(
          1,
          session.difficulty - 1,
        );
    }

    const updatedSession =
      await this.prisma.practiceSession.update({
        where: {
          id: sessionId,
        },
        data: {
          answeredQuestions,
          correctAnswers,
          wrongAnswers,
          totalScore,
          difficulty:
            newDifficulty,
        },
      });

    return {
      success: true,
      correct:
        isCorrect,
      answer:
        normalizedAnswer,
      correctAnswer:
        normalizedCorrectAnswer,
      score:
        isCorrect
          ? question.score
          : 0,
      adaptive: {
        previousDifficulty:
          session.difficulty,
        newDifficulty:
          updatedSession.difficulty,
        consecutiveCorrect,
        changed:
          session.difficulty !==
          updatedSession.difficulty,
      },
      session: {
        id:
          updatedSession.id,
        answeredQuestions:
          updatedSession.answeredQuestions,
        totalQuestions:
          updatedSession.totalQuestions,
        correctAnswers:
          updatedSession.correctAnswers,
        wrongAnswers:
          updatedSession.wrongAnswers,
        totalScore:
          updatedSession.totalScore,
        difficulty:
          updatedSession.difficulty,
      },
      finished,
    };
  }

  // =====================================
  // پایان Session
  // =====================================

  async finishSession(
    sessionId: number,
  ) {
    const session =
      await this.prisma.practiceSession.findUnique({
        where: {
          id: sessionId,
        },
      });

    if (!session) {
      return {
        success: false,
        message:
          'Session not found',
      };
    }

    const percentage =
      session.totalQuestions === 0
        ? 0
        : Math.round(
            (
              session.correctAnswers /
              session.totalQuestions
            ) * 100,
          );

    return {
      success: true,
      result: {
        studentId:
          session.studentId,
        sessionId,
        totalQuestions:
          session.totalQuestions,
        answered:
          session.answeredQuestions,
        correct:
          session.correctAnswers,
        wrong:
          session.wrongAnswers,
        score:
          session.totalScore,
        percentage,
      },
    };
  }

  // =====================================
  // گزارش کامل Session
  // =====================================

  async getSessionReport(
    sessionId: number,
    studentId: number,
  ) {
    const session =
      await this.prisma.practiceSession.findUnique({
        where: {
          id: sessionId,
        },
        include: {
          answers: true,
        },
      });

    if (!session) {
      return {
        success: false,
        message:
          'Session not found',
      };
    }

    if (
      session.studentId !==
      studentId
    ) {
      return {
        success: false,
        message:
          'This session does not belong to this student',
      };
    }

    const answers =
      await this.prisma.practiceAnswer.findMany({
        where: {
          sessionId,
        },
        include: {
          question: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

    const validAnswers =
      answers.filter(
        (item) =>
          item.question !== null,
      );

    const correct =
      validAnswers.filter(
        (item) =>
          item.correct,
      ).length;

    const wrong =
      validAnswers.filter(
        (item) =>
          !item.correct,
      ).length;

    const progressPercentage =
      session.totalQuestions === 0
        ? 0
        : Math.round(
            (
              answers.length /
              session.totalQuestions
            ) * 100,
          );

    const accuracyPercentage =
      validAnswers.length === 0
        ? 0
        : Math.round(
            (
              correct /
              validAnswers.length
            ) * 100,
          );

    let level =
      'نیاز به تمرین';

    if (
      accuracyPercentage >= 80
    ) {
      level = 'عالی';
    } else if (
      accuracyPercentage >= 50
    ) {
      level = 'خوب';
    }

    // =====================================
    // تولید راه حل برای سوالات غلط
    // =====================================

    for (
      const item of validAnswers
    ) {
      if (!item.question) {
        continue;
      }

      if (item.correct) {
        continue;
      }

      try {
        await this.aiSolutionService.generateSolution(
          item.questionId,
        );
      } catch (error) {
        console.error(
          'SOLUTION GENERATION ERROR:',
          item.questionId,
          error,
        );
      }
    }

    const updatedAnswers =
      await this.prisma.practiceAnswer.findMany({
        where: {
          sessionId,
        },
        include: {
          question: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

    // =====================================
    // تحلیل فصل ها
    // =====================================

    const chapterStats: Record<
      string,
      {
        total: number;
        correct: number;
        wrong: number;
      }
    > = {};

    for (
      const answer of validAnswers
    ) {
      const chapter =
        answer.question?.chapter ??
        'بدون فصل';

      if (
        !chapterStats[chapter]
      ) {
        chapterStats[chapter] = {
          total: 0,
          correct: 0,
          wrong: 0,
        };
      }

      chapterStats[chapter].total++;

      if (
        answer.correct
      ) {
        chapterStats[chapter].correct++;
      } else {
        chapterStats[chapter].wrong++;
      }
    }

    const strengths: string[] = [];

    const weaknesses: string[] = [];

    for (
      const chapter of Object.keys(
        chapterStats,
      )
    ) {
      const stats =
        chapterStats[chapter];

      const chapterAccuracy =
        stats.total === 0
          ? 0
          : Math.round(
              (
                stats.correct /
                stats.total
              ) * 100,
            );

      if (
        chapterAccuracy >= 80
      ) {
        strengths.push(
          chapter,
        );
      }

      if (
        chapterAccuracy < 60
      ) {
        weaknesses.push(
          chapter,
        );
      }
    }

    const questions =
      updatedAnswers
        .filter(
          (item) =>
            item.question !== null,
        )
        .map(
          (item) => {
            const question =
              item.question;

            return {
              id: question.id,
              questionId:
                question.id,
              title:
                question.title,
              description:
                question.description,
              answer:
                item.answer,
              correctAnswer:
                question.correctAnswer,
              correct:
                item.correct,
              explanation:
                question.explanation ??
                'توضیح آموزشی برای این سوال ثبت نشده است.',
              solution:
                question.solution ??
                'راه حل این سوال هنوز ثبت نشده است.',
              chapter:
                question.chapter,
              difficulty:
                question.difficulty,
              needReview:
                !item.correct,
            };
          },
        );

    return {
      success: true,
      report: {
        studentId:
          session.studentId,
        sessionId,
        totalQuestions:
          session.totalQuestions,
        answered:
          answers.length,
        correct,
        wrong,
        score:
          session.totalScore,
        progressPercentage,
        accuracyPercentage,
        level,
        strengths,
        weaknesses,
        aiMessage:
          accuracyPercentage >= 80
            ? 'دانش آموز آماده سطح بالاتر است.'
            : 'تمرین بیشتر برای تثبیت یادگیری پیشنهاد می‌شود.',
      },
      questions,
    };
  }
}
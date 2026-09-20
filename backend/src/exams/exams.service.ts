import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RewardsService } from '../rewards/rewards.service';

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rewardsService: RewardsService,
  ) {}

  // =====================================================
  // CREATE EXAM
  // =====================================================

  async createExam(data: any) {
    if (!data) {
      throw new BadRequestException(
        'اطلاعات آزمون ارسال نشده است',
      );
    }

    const title =
      data.title ||
      data.name ||
      'آزمون جدید';

    const duration = Number(
      data.duration || 20,
    );

    const classroomId = Number(
      data.classroomId,
    );

    if (!classroomId) {
      throw new BadRequestException(
        'classroomId برای ساخت آزمون الزامی است',
      );
    }

    const classroom =
      await this.prisma.classroom.findUnique({
        where: {
          id: classroomId,
        },
      });

    if (!classroom) {
      throw new NotFoundException(
        `کلاس ${classroomId} پیدا نشد`,
      );
    }

    const exam =
      await this.prisma.exam.create({
        data: {
          title,
          duration,
          classroom: {
            connect: {
              id: classroomId,
            },
          },
        },
      });

    return exam;
  }

  // =====================================================
  // GET CLASSROOM EXAMS
  // =====================================================

  async getClassroomExams(classroomId: number) {
  return this.prisma.exam.findMany({
    where: {
      classroomId,
    },

    include: {
  questions: {
    include: {
      question: true,
    },
    orderBy: {
      order: "asc",
    },
  },
},

    orderBy: {
      id: "desc",
    },
  });
}

  // =====================================================
  // GET CLASS EXAMS
  // =====================================================

  async getClassExams(
    classroomId: number,
  ) {
    return this.getClassroomExams(
      classroomId,
    );
  }

  // =====================================================
  // PUBLISH EXAM
  // =====================================================

  async publishExam(
    examId: number,
  ) {
    const exam =
      await this.prisma.exam.findUnique({
        where: {
          id: examId,
        },
      });

    if (!exam) {
      throw new NotFoundException(
        `آزمون ${examId} پیدا نشد`,
      );
    }

    return this.prisma.exam.update({
      where: {
        id: examId,
      },

      data: {
        status: 'PUBLISHED',
      },
    });
  }

  // =====================================================
  // ADD QUESTION TO EXAM
  // =====================================================

  async addQuestionToExam(
  examId: number,
  questionId: number,
) {
  const exam = await this.prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) {
    throw new NotFoundException(
      `آزمون ${examId} پیدا نشد`,
    );
  }

  const question = await this.prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new NotFoundException(
      `سؤال ${questionId} پیدا نشد`,
    );
  }

  const existing =
    await this.prisma.examQuestion.findFirst({
      where: {
        examId,
        questionId,
      },
    });

  if (existing) {
    return existing;
  }

  const lastQuestion =
    await this.prisma.examQuestion.findFirst({
      where: {
        examId,
      },
      orderBy: {
        order: 'desc',
      },
    });

  const nextOrder =
    lastQuestion
      ? lastQuestion.order + 1
      : 0;

  return this.prisma.examQuestion.create({
    data: {
      examId,
      questionId,
      order: nextOrder,
    },
  });
}
  async removeQuestionFromExam(
  examId: number,
  questionId: number,
) {
  const exam = await this.prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  if (!exam) {
    throw new NotFoundException(
      `آزمون ${examId} پیدا نشد`,
    );
  }

  const question = await this.prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!question) {
    throw new NotFoundException(
      `سؤال ${questionId} پیدا نشد`,
    );
  }

  const relation =
    await this.prisma.examQuestion.findFirst({
      where: {
        examId,
        questionId,
      },
    });

  if (!relation) {
    throw new NotFoundException(
      "این سؤال در این آزمون وجود ندارد",
    );
  }

  await this.prisma.examQuestion.delete({
    where: {
      id: relation.id,
    },
  });

  return {
    success: true,
    message: "سؤال از آزمون حذف شد",
    examId,
    questionId,
  };
}async moveQuestionUp(
  examId: number,
  questionId: number,
) {
  const current =
    await this.prisma.examQuestion.findFirst({
      where: {
        examId,
        questionId,
      },
    });

  if (!current) {
    throw new NotFoundException(
      "سؤال در این آزمون پیدا نشد",
    );
  }

  const previous =
    await this.prisma.examQuestion.findFirst({
      where: {
        examId,
        order: {
          lt: current.order,
        },
      },
      orderBy: {
        order: "desc",
      },
    });

  if (!previous) {
    return {
      success: true,
      message: "سؤال در ابتدای آزمون قرار دارد",
    };
  }

  await this.prisma.$transaction([
    this.prisma.examQuestion.update({
      where: {
        id: current.id,
      },
      data: {
        order: previous.order,
      },
    }),

    this.prisma.examQuestion.update({
      where: {
        id: previous.id,
      },
      data: {
        order: current.order,
      },
    }),
  ]);

  return {
    success: true,
    message: "سؤال یک مرحله به بالا منتقل شد",
  };
}


async moveQuestionDown(
  examId: number,
  questionId: number,
) {
  const current =
    await this.prisma.examQuestion.findFirst({
      where: {
        examId,
        questionId,
      },
    });

  if (!current) {
    throw new NotFoundException(
      "سؤال در این آزمون پیدا نشد",
    );
  }

  const next =
    await this.prisma.examQuestion.findFirst({
      where: {
        examId,
        order: {
          gt: current.order,
        },
      },
      orderBy: {
        order: "asc",
      },
    });

  if (!next) {
    return {
      success: true,
      message: "سؤال در انتهای آزمون قرار دارد",
    };
  }

  await this.prisma.$transaction([
    this.prisma.examQuestion.update({
      where: {
        id: current.id,
      },
      data: {
        order: next.order,
      },
    }),

    this.prisma.examQuestion.update({
      where: {
        id: next.id,
      },
      data: {
        order: current.order,
      },
    }),
  ]);

  return {
    success: true,
    message: "سؤال یک مرحله به پایین منتقل شد",
  };
}

  // =====================================================
  // STUDENT EXAMS
  // =====================================================

  async getStudentExams(
  studentId?: number,
) {
  // =====================================================
  // حالت قدیمی
  // اگر studentId ارسال نشده باشد،
  // همان رفتار قبلی حفظ می‌شود.
  // =====================================================

  if (!studentId) {
    const exams =
      await this.prisma.exam.findMany({
        where: {
          status: 'PUBLISHED',
        },

        include: {
          questions: true,
        },

        orderBy: {
          id: 'desc',
        },
      });

    return exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      duration: exam.duration,
      status: exam.status,
      questionCount:
        exam.questions.length,
    }));
  }

  // =====================================================
  // بررسی دانش‌آموز
  // =====================================================

  const student =
    await this.prisma.user.findUnique({
      where: {
        id: studentId,
      },

      select: {
        id: true,
        role: true,
        classroomId: true,
      },
    });

  if (!student) {
    throw new NotFoundException(
      `دانش‌آموز ${studentId} پیدا نشد`,
    );
  }

  // =====================================================
  // کلاس‌های جدید دانش‌آموز
  // ClassroomMembership
  // =====================================================

  const memberships =
    await this.prisma.classroomMembership.findMany({
      where: {
        studentId,
      },

      select: {
        classroomId: true,
      },
    });

  const classroomIds =
    memberships.map(
      (membership) =>
        membership.classroomId,
    );

  // =====================================================
  // پشتیبانی از سیستم قدیمی
  //
  // اگر classroomId قدیمی وجود داشته باشد،
  // آن کلاس هم در لیست کلاس‌های دانش‌آموز قرار می‌گیرد.
  // =====================================================

  if (
    student.classroomId !== null &&
    !classroomIds.includes(
      student.classroomId,
    )
  ) {
    classroomIds.push(
      student.classroomId,
    );
  }

  // =====================================================
  // اگر دانش‌آموز هیچ کلاسی ندارد
  // =====================================================

  if (classroomIds.length === 0) {
    return [];
  }

  // =====================================================
  // دریافت فقط آزمون‌های کلاس‌های دانش‌آموز
  // =====================================================

  const exams =
    await this.prisma.exam.findMany({
      where: {
        status: 'PUBLISHED',

        classroomId: {
          in: classroomIds,
        },
      },

      include: {
        questions: true,
      },

      orderBy: {
        id: 'desc',
      },
    });

  // =====================================================
  // خروجی
  // =====================================================

  return exams.map((exam) => ({
    id: exam.id,
    title: exam.title,
    duration: exam.duration,
    status: exam.status,
    questionCount:
      exam.questions.length,
  }));
}

  // =====================================================
// START EXAM
// =====================================================

async startExam(
  examId: number,
  studentId: number,
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

  if (exam.status !== 'PUBLISHED') {
    throw new BadRequestException(
      'این آزمون هنوز منتشر نشده است',
    );
  }

  // =====================================================
  // بررسی وجود دانش‌آموز
  // =====================================================

  const student =
    await this.prisma.user.findUnique({
      where: {
        id: studentId,
      },
      select: {
        id: true,
        role: true,
        classroomId: true,
      },
    });

  if (!student) {
    throw new NotFoundException(
      `دانش‌آموز ${studentId} پیدا نشد`,
    );
  }

  // =====================================================
  // بررسی عضویت دانش‌آموز در کلاس آزمون
  //
  // روش جدید:
  // ClassroomMembership
  //
  // روش قدیمی:
  // User.classroomId
  // =====================================================

  const membership =
    await this.prisma.classroomMembership.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: exam.classroomId,
          studentId,
        },
      },
    });

  const isLegacyMember =
    student.classroomId === exam.classroomId;

  if (!membership && !isLegacyMember) {
    throw new BadRequestException(
      'دانش‌آموز عضو کلاس این آزمون نیست',
    );
  }

  // =====================================================
  // ساخت لیست سؤال‌ها
  // پاسخ صحیح هرگز به Frontend ارسال نمی‌شود
  // =====================================================

  const questions: any[] = [];

  for (
    const examQuestion of exam.questions
  ) {
    const question =
      await this.prisma.question.findUnique({
        where: {
          id: examQuestion.questionId,
        },
      });

    if (!question) {
      continue;
    }

    questions.push({
      id: question.id,

      title:
        question.title,

      description:
        question.description ?? null,

      optionA:
        question.optionA ?? null,

      optionB:
        question.optionB ?? null,

      optionC:
        question.optionC ?? null,

      optionD:
        question.optionD ?? null,

      difficulty:
        question.difficulty ?? null,

      score:
        question.score ?? 0,
    });
  }

  return {
    id: exam.id,

    title:
      exam.title,

    duration:
      exam.duration,

    status:
      exam.status,

    questions,
  };
}

  // =====================================================
  // SUBMIT EXAM
  // =====================================================

  async submitExam(
    examId: number,
    studentId: number,
    answers: any,
  ) {
    console.log(
      '========================================',
    );

    console.log(
      'SUBMIT EXAM',
    );

    console.log(
      'examId:',
      examId,
    );

    console.log(
      'studentId:',
      studentId,
    );

    console.log(
      'answers:',
      answers,
    );

    console.log(
      '========================================',
    );

    // ---------------------------------------------------
    // پیدا کردن آزمون
    // ---------------------------------------------------

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
        `آزمون با شناسه ${examId} پیدا نشد`,
      );
    }

    // ---------------------------------------------------
    // نرمال‌سازی پاسخ‌ها
    // ---------------------------------------------------

    const normalizedAnswers:
      Record<number, string> = {};

    if (Array.isArray(answers)) {
      for (
        const item of answers
      ) {
        if (
          item &&
          item.questionId !== undefined &&
          item.answer !== undefined
        ) {
          normalizedAnswers[
            Number(item.questionId)
          ] =
            String(item.answer)
              .trim()
              .toUpperCase();
        }
      }
    } else if (
      answers &&
      typeof answers === 'object'
    ) {
      for (
        const [
          questionId,
          answer,
        ] of Object.entries(answers)
      ) {
        if (
          answer !== undefined &&
          answer !== null
        ) {
          normalizedAnswers[
            Number(questionId)
          ] =
            String(answer)
              .trim()
              .toUpperCase();
        }
      }
    }

    console.log(
      'NORMALIZED ANSWERS:',
      normalizedAnswers,
    );

    // ---------------------------------------------------
    // نتیجه
    // ---------------------------------------------------

    let correct = 0;

    let earnedScore = 0;

    let totalScore = 0;

    let earnedXP = 0;

    const details: any[] = [];

    // ---------------------------------------------------
    // بررسی تک‌تک سؤالات
    // ---------------------------------------------------

    for (
      const examQuestion of exam.questions
    ) {
      const questionId =
        examQuestion.questionId;

      const question =
        await this.prisma.question.findUnique({
          where: {
            id: questionId,
          },
        });

      if (!question) {
        console.warn(
          `Question ${questionId} not found`,
        );

        continue;
      }

      const questionScore =
        Number(
          question.score ?? 0,
        );

      totalScore += questionScore;

      const submittedAnswer =
        normalizedAnswers[
          questionId
        ] ?? null;

      // -------------------------------------------------
      // پاسخ صحیح ذخیره‌شده در دیتابیس
      // -------------------------------------------------

      const normalizedCorrectAnswer =
        String(
          question.correctAnswer ?? '',
        )
          .trim()
          .toUpperCase();

      // -------------------------------------------------
      // تبدیل پاسخ صحیح به گزینه A/B/C/D
      //
      // حالت اول:
      // correctAnswer = "C"
      //
      // حالت دوم:
      // correctAnswer = "17"
      // و مثلاً optionB = "17"
      //
      // در هر دو حالت باید گزینه صحیح پیدا شود.
      // -------------------------------------------------

      let correctOption:
        | 'A'
        | 'B'
        | 'C'
        | 'D'
        | null = null;

      // -----------------------------------------------
      // حالت استاندارد:
      // correctAnswer خودش A/B/C/D است
      // -----------------------------------------------

      if (
        normalizedCorrectAnswer === 'A' ||
        normalizedCorrectAnswer === 'B' ||
        normalizedCorrectAnswer === 'C' ||
        normalizedCorrectAnswer === 'D'
      ) {
        correctOption =
          normalizedCorrectAnswer;
      }

      // -----------------------------------------------
      // حالت دوم:
      // correctAnswer مقدار واقعی گزینه است
      // -----------------------------------------------

      else {
        const correctValue =
          normalizedCorrectAnswer;

        if (
          String(
            question.optionA ?? '',
          )
            .trim()
            .toUpperCase() ===
          correctValue
        ) {
          correctOption = 'A';
        } else if (
          String(
            question.optionB ?? '',
          )
            .trim()
            .toUpperCase() ===
          correctValue
        ) {
          correctOption = 'B';
        } else if (
          String(
            question.optionC ?? '',
          )
            .trim()
            .toUpperCase() ===
          correctValue
        ) {
          correctOption = 'C';
        } else if (
          String(
            question.optionD ?? '',
          )
            .trim()
            .toUpperCase() ===
          correctValue
        ) {
          correctOption = 'D';
        }
      }

      // -------------------------------------------------
      // بررسی نهایی پاسخ
      // -------------------------------------------------

      const isCorrect =
        submittedAnswer !== null &&
        correctOption !== null &&
        submittedAnswer ===
          correctOption;

      console.log(
        'QUESTION CHECK:',
        {
          questionId,
          title:
            question.title,

          submittedAnswer,

          correctAnswer:
            question.correctAnswer,

          optionA:
            question.optionA,

          optionB:
            question.optionB,

          optionC:
            question.optionC,

          optionD:
            question.optionD,

          normalizedSubmittedAnswer:
            submittedAnswer,

          normalizedCorrectAnswer,

          detectedCorrectOption:
            correctOption,

          isCorrect,
        },
      );

      // -------------------------------------------------
      // امتیاز آزمون
      // -------------------------------------------------

      if (isCorrect) {
        correct += 1;

        earnedScore +=
          questionScore;
      }

      // -------------------------------------------------
      // پیدا کردن Attempt قبلی
      // -------------------------------------------------

      const existingAttempt =
        await this.prisma.attempt.findUnique({
          where: {
            studentId_questionId_examId: {
              studentId,
              questionId,
              examId,
            },
          },
        });

      // -------------------------------------------------
      // XP ضد تکرار
      //
      // هر سؤال یک referenceKey اختصاصی دارد.
      // -------------------------------------------------

      if (isCorrect) {
        const referenceKey =
          `EXAM:${examId}:QUESTION:${questionId}`;

        const xpResult =
          await this.rewardsService.addXPOnce(
            studentId,
            10,
            'EXAM_QUESTION_CORRECT',
            referenceKey,
          );

        if (xpResult.awarded) {
          earnedXP += 10;

          console.log(
            `XP EARNED: student=${studentId}, exam=${examId}, question=${questionId}, amount=10`,
          );
        } else {
          console.log(
            `XP NOT EARNED: already awarded. student=${studentId}, exam=${examId}, question=${questionId}`,
          );
        }
      }

      // -------------------------------------------------
      // ذخیره / آپدیت Attempt
      // -------------------------------------------------

      if (existingAttempt) {
        await this.prisma.attempt.update({
          where: {
            id:
              existingAttempt.id,
          },

          data: {
            answer:
              submittedAnswer ?? '',

            isCorrect,

            score:
              isCorrect
                ? questionScore
                : 0,
          },
        });
      } else {
        await this.prisma.attempt.create({
          data: {
            studentId,

            questionId,

            examId,

            answer:
              submittedAnswer ?? '',

            isCorrect,

            score:
              isCorrect
                ? questionScore
                : 0,
          },
        });
      }

      // -------------------------------------------------
      // جزئیات نتیجه
      // -------------------------------------------------

      details.push({
        questionId,

        title:
          question.title,

        selectedAnswer:
          submittedAnswer,

        isCorrect,

        correctAnswer:
          isCorrect
            ? undefined
            : question.correctAnswer,

        score:
          isCorrect
            ? questionScore
            : 0,

        maxScore:
          questionScore,
      });
    }

    // ---------------------------------------------------
    // درصد
    // ---------------------------------------------------

    const total =
      exam.questions.length;

    const percentage =
      total > 0
        ? Math.round(
            (correct / total) * 100,
          )
        : 0;

    // ---------------------------------------------------
    // نتیجه نهایی
    // ---------------------------------------------------

    const result = {
      examId,

      studentId,

      total,

      correct,

      score:
        earnedScore,

      percentage,

      earnedScore,

      totalScore,

      earnedXP,

      details,
    };

    console.log(
      'EXAM FINAL RESULT:',
      result,
    );

    console.log(
      '========================================',
    );

    return result;
  }
}
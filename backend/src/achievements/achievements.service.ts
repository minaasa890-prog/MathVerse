import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RewardsService } from '../rewards/rewards.service';

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rewardsService: RewardsService,
  ) {}

  /**
   * بررسی و اعطای Achievementهای دانش‌آموز
   *
   * این متد:
   * 1. شرایط Achievementها را بررسی می‌کند.
   * 2. Achievement را فقط یک بار ثبت می‌کند.
   * 3. XP جایزه را فقط یک بار پرداخت می‌کند.
   * 4. برای جلوگیری از پرداخت تکراری از RewardsService.addXPOnce استفاده می‌کند.
   */
  async checkAndGrantAchievements(
    studentId: number,
  ) {
    const student =
      await this.prisma.user.findUnique({
        where: {
          id: studentId,
        },

        include: {
          attempts: true,

          achievements: {
            include: {
              achievement: true,
            },
          },
        },
      });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    // ==================================================
    // آزمون‌ها
    // ==================================================

    const attempts =
      student.attempts;

    // تعداد آزمون‌های یکتا
    const totalExams =
      new Set(
        attempts
          .map(
            (item) => item.examId,
          )
          .filter(
            (id) =>
              id !== null &&
              id !== undefined,
          ),
      ).size;

    // تعداد پاسخ‌های صحیح
    const correctAnswers =
      attempts.filter(
        (item) =>
          item.isCorrect === true,
      ).length;

    // ==================================================
    // بررسی آزمون 100 درصد
    // ==================================================

    const examGroups =
      new Map<
        number,
        typeof attempts
      >();

    for (const attempt of attempts) {
      if (
        attempt.examId === null ||
        attempt.examId === undefined
      ) {
        continue;
      }

      if (
        !examGroups.has(
          attempt.examId,
        )
      ) {
        examGroups.set(
          attempt.examId,
          [],
        );
      }

      examGroups
        .get(attempt.examId)!
        .push(attempt);
    }

    let hasPerfectExam =
      false;

    for (const [
      ,
      examAttempts,
    ] of examGroups) {
      if (
        examAttempts.length === 0
      ) {
        continue;
      }

      const correct =
        examAttempts.filter(
          (item) =>
            item.isCorrect === true,
        ).length;

      if (
        correct ===
        examAttempts.length
      ) {
        hasPerfectExam = true;
        break;
      }
    }

    // ==================================================
    // Adaptive Learning
    // ==================================================

    const practiceAttempts =
      await this.prisma.practiceAttempt.count(
        {
          where: {
            studentId,
          },
        },
      );

    const completedPracticeSessions =
      await this.prisma.practiceSession.count(
        {
          where: {
            studentId,
            status: 'COMPLETED',
          },
        },
      );

    // ==================================================
    // Achievementهای موجود
    // ==================================================

    const achievements =
      await this.prisma.achievement.findMany(
        {
          orderBy: {
            id: 'asc',
          },
        },
      );

    const achievementByTitle =
      new Map(
        achievements.map(
          (item) => [
            item.title,
            item,
          ],
        ),
      );

    // ==================================================
    // Achievementهای قبلی دانش‌آموز
    // ==================================================

    const existingAchievementIds =
      new Set(
        student.achievements.map(
          (item) =>
            item.achievementId,
        ),
      );

    const newlyGranted: any[] = [];

    const xpRewards: any[] = [];

    // ==================================================
    // اعطای Achievement + XP
    // ==================================================

    const grant = async (
      title: string,
      condition: boolean,
    ) => {
      if (!condition) {
        return;
      }

      const achievement =
        achievementByTitle.get(
          title,
        );

      if (!achievement) {
        return;
      }

      const referenceKey =
        `ACHIEVEMENT:${studentId}:${achievement.id}`;

      // ------------------------------------------------
      // اول XP را با addXPOnce ثبت می‌کنیم
      // ------------------------------------------------

      let rewardResult:
        | any
        | null = null;

      if (
        achievement.xpReward > 0
      ) {
        rewardResult =
          await this.rewardsService.addXPOnce(
            studentId,
            achievement.xpReward,
            'ACHIEVEMENT',
            referenceKey,
          );

        xpRewards.push({
          achievementId:
            achievement.id,

          title:
            achievement.title,

          amount:
            achievement.xpReward,

          awarded:
            rewardResult.awarded,

          alreadyExists:
            rewardResult.alreadyExists,
        });
      }

      // ------------------------------------------------
      // اگر Achievement قبلاً ثبت شده،
      // دوباره ثبتش نمی‌کنیم.
      // ------------------------------------------------

      if (
        existingAchievementIds.has(
          achievement.id,
        )
      ) {
        return;
      }

      // ------------------------------------------------
      // ثبت Achievement برای دانش‌آموز
      // ------------------------------------------------

      const studentAchievement =
        await this.prisma.studentAchievement.create(
          {
            data: {
              studentId,

              achievementId:
                achievement.id,
            },

            include: {
              achievement: true,
            },
          },
        );

      existingAchievementIds.add(
        achievement.id,
      );

      newlyGranted.push(
        studentAchievement,
      );
    };

    // ==================================================
    // Achievement 1
    // اولین آزمون
    // ==================================================

    await grant(
      'اولین آزمون',
      totalExams >= 1,
    );

    // ==================================================
    // Achievement 2
    // آزمون کامل
    // ==================================================

    await grant(
      'آزمون کامل',
      hasPerfectExam,
    );

    // ==================================================
    // Achievement 3
    // استاد آزمون
    // ==================================================

    await grant(
      'استاد آزمون',
      totalExams >= 10,
    );

    // ==================================================
    // Achievement 4
    // اولین تمرین
    // ==================================================

    await grant(
      'اولین تمرین',
      practiceAttempts >= 1 ||
        completedPracticeSessions >= 1,
    );

    // ==================================================
    // Achievement 5
    // 10 پاسخ صحیح
    // ==================================================

    await grant(
      '10 پاسخ صحیح',
      correctAnswers >= 10,
    );

    // ==================================================
    // Achievement 6
    // 100 XP
    // ==================================================

    await grant(
      '100 XP',
      student.xp >= 100,
    );

    // ==================================================
    // Achievement 7
    // 500 XP
    // ==================================================

    await grant(
      '500 XP',
      student.xp >= 500,
    );

    // ==================================================
    // Achievement 8
    // Level 10
    // ==================================================

    await grant(
      'سطح 10',
      student.level >= 10,
    );

    // ==================================================
    // گرفتن وضعیت نهایی دانش‌آموز
    // ==================================================

    const finalStudent =
      await this.prisma.user.findUnique(
        {
          where: {
            id: studentId,
          },

          select: {
            id: true,
            name: true,
            xp: true,
            level: true,
          },
        },
      );

    return {
      success: true,

      studentId,

      studentName:
        finalStudent?.name ??
        student.name,

      totalExams,

      correctAnswers,

      practiceAttempts,

      completedPracticeSessions,

      xp:
        finalStudent?.xp ??
        student.xp,

      level:
        finalStudent?.level ??
        student.level,

      totalAchievements:
        existingAchievementIds.size,

      newlyGranted,

      xpRewards,
    };
  }

  /**
   * دریافت Achievementهای دانش‌آموز
   */
  async getStudentAchievements(
    studentId: number,
  ) {
    const student =
      await this.prisma.user.findUnique(
        {
          where: {
            id: studentId,
          },

          include: {
            achievements: {
              include: {
                achievement: true,
              },

              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      );

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    return {
      success: true,

      studentId,

      studentName:
        student.name,

      totalAchievements:
        student.achievements.length,

      achievements:
        student.achievements.map(
          (item) => ({
            id:
              item.achievement.id,

            title:
              item.achievement.title,

            description:
              item.achievement
                .description,

            icon:
              item.achievement.icon,

            xpReward:
              item.achievement
                .xpReward,

            earnedAt:
              item.createdAt,
          }),
        ),
    };
  }
}
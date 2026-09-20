import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private calculateLevel(xp: number): number {
    return Math.floor(xp / 100) + 1;
  }

  private calculateLevelProgress(
    xp: number,
    level: number,
  ) {
    const currentLevelStart =
      (level - 1) * 100;

    const nextLevelXP =
      level * 100;

    const xpInsideLevel =
      xp - currentLevelStart;

    const levelXPRange =
      nextLevelXP - currentLevelStart;

    let progress =
      Math.round(
        (xpInsideLevel / levelXPRange) * 100,
      );

    if (progress < 0) {
      progress = 0;
    }

    if (progress > 100) {
      progress = 100;
    }

    return {
      currentLevelStart,
      nextLevelXP,
      xpInsideLevel,
      levelXPRange,
      progress,
    };
  }

  /**
   * افزودن XP معمولی
   *
   * این متد برای جاهایی است که XP باید
   * بدون referenceKey و بدون محدودیت یکتا اضافه شود.
   */
  async addXP(
    studentId: number,
    amount: number,
  ) {
    const student =
      await this.prisma.user.findUnique({
        where: {
          id: studentId,
        },
      });

    if (!student) {
      throw new Error(
        'Student not found',
      );
    }

    const safeAmount =
      Math.max(0, amount);

    const newXP =
      student.xp + safeAmount;

    const newLevel =
      this.calculateLevel(newXP);

    const progress =
      this.calculateLevelProgress(
        newXP,
        newLevel,
      );

    const updated =
      await this.prisma.user.update({
        where: {
          id: studentId,
        },

        data: {
          xp: newXP,
          level: newLevel,
        },
      });

    return {
      studentId:
        updated.id,
      name:
        updated.name,
      xp:
        updated.xp,
      level:
        updated.level,
      currentLevelStart:
        progress.currentLevelStart,
      nextLevelXP:
        progress.nextLevelXP,
      xpInsideLevel:
        progress.xpInsideLevel,
      xpProgress:
        progress.progress,
      levelUp:
        newLevel > student.level,
      message:
        newLevel > student.level
          ? '🎉 Level Up!'
          : 'XP Added',
    };
  }

  /**
   * افزودن XP فقط یک بار برای یک reference مشخص.
   *
   * مثال:
   * EXAM:16:QUESTION:291
   *
   * اگر همین reference قبلاً ثبت شده باشد،
   * XP دوباره اضافه نمی‌شود.
   */
  async addXPOnce(
    studentId: number,
    amount: number,
    source: string,
    referenceKey: string,
  ) {
    const student =
      await this.prisma.user.findUnique({
        where: {
          id: studentId,
        },
      });

    if (!student) {
      throw new Error(
        'Student not found',
      );
    }

    const safeAmount =
      Math.max(0, amount);

    if (safeAmount <= 0) {
      return {
        awarded: false,
        alreadyExists: false,
        studentId,
        xp: student.xp,
        level: student.level,
        amount: 0,
      };
    }

    /**
     * ابتدا تلاش می‌کنیم Transaction را ثبت کنیم.
     *
     * referenceKey یکتا است، بنابراین حتی اگر
     * دو درخواست همزمان برسند، فقط یکی موفق می‌شود.
     */
    try {
      const transaction =
        await this.prisma.xPTransaction.create({
          data: {
            studentId,
            amount: safeAmount,
            source,
            referenceKey,
          },
        });

      const newXP =
        student.xp + safeAmount;

      const newLevel =
        this.calculateLevel(newXP);

      const progress =
        this.calculateLevelProgress(
          newXP,
          newLevel,
        );

      const updated =
        await this.prisma.user.update({
          where: {
            id: studentId,
          },

          data: {
            xp: newXP,
            level: newLevel,
          },
        });

      return {
        awarded: true,
        alreadyExists: false,
        transactionId:
          transaction.id,
        studentId:
          updated.id,
        name:
          updated.name,
        xp:
          updated.xp,
        level:
          updated.level,
        currentLevelStart:
          progress.currentLevelStart,
        nextLevelXP:
          progress.nextLevelXP,
        xpInsideLevel:
          progress.xpInsideLevel,
        xpProgress:
          progress.progress,
        amount: safeAmount,
        levelUp:
          newLevel > student.level,
        message:
          newLevel > student.level
            ? '🎉 Level Up!'
            : 'XP Added',
      };
    } catch (error: any) {
      /**
       * Prisma P2002 = Unique constraint violation
       *
       * یعنی referenceKey قبلاً ثبت شده است.
       */
      if (error?.code === 'P2002') {
        const current =
          await this.prisma.user.findUnique({
            where: {
              id: studentId,
            },
          });

        return {
          awarded: false,
          alreadyExists: true,
          studentId,
          xp:
            current?.xp ??
            student.xp,
          level:
            current?.level ??
            student.level,
          amount: 0,
          message:
            'XP already awarded',
        };
      }

      throw error;
    }
  }

  async getReward(
    studentId: number,
  ) {
    const student =
      await this.prisma.user.findUnique({
        where: {
          id: studentId,
        },

        select: {
          id: true,
          name: true,
          xp: true,
          level: true,
        },
      });

    if (!student) {
      throw new Error(
        'Student not found',
      );
    }

    const calculatedLevel =
      this.calculateLevel(
        student.xp,
      );

    const progress =
      this.calculateLevelProgress(
        student.xp,
        calculatedLevel,
      );

    if (
      student.level !==
      calculatedLevel
    ) {
      await this.prisma.user.update({
        where: {
          id: studentId,
        },

        data: {
          level: calculatedLevel,
        },
      });
    }

    return {
      id:
        student.id,
      name:
        student.name,
      xp:
        student.xp,
      level:
        calculatedLevel,
      currentLevelStart:
        progress.currentLevelStart,
      nextLevelXP:
        progress.nextLevelXP,
      xpInsideLevel:
        progress.xpInsideLevel,
      xpProgress:
        progress.progress,
    };
  }
}
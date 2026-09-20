import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiTutorService {
  private readonly DAILY_AI_LIMIT = 5;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =========================================================
  // تاریخ روزانه
  // =========================================================
  private getDateKey(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  // =========================================================
  // AI Practice
  // =========================================================
  async practice(studentId: number) {
    const attempts = await this.prisma.attempt.findMany({
      where: {
        studentId,
      },
      include: {
        question: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    const focusTopic =
      attempts.length > 0
        ? attempts[0].question?.chapter ||
          attempts[0].question?.subject ||
          'Math'
        : 'Math';

    const questions = attempts
      .filter((item) => item.question)
      .slice(0, 5)
      .map((item) => ({
        id: item.question.id,
        title: item.question.title,
        chapter: item.question.chapter,
        difficulty: item.question.difficulty,
      }));

    return {
      studentId,
      focusTopic,
      questions,
      recommendations: [
        'تمرین سؤال‌های اشتباه',
        'مرور مباحث ضعیف',
        'حل سؤال‌های مشابه',
      ],
    };
  }

  // =========================================================
  // AI Report
  // =========================================================
  async report(studentId: number) {
    const attempts = await this.prisma.attempt.findMany({
      where: {
        studentId,
      },
      include: {
        question: true,
      },
    });

    const total = attempts.length;

    const correct = attempts.filter(
      (item) => item.isCorrect,
    ).length;

    const wrong = total - correct;

    const accuracy =
      total > 0
        ? Math.round((correct / total) * 100)
        : 0;

    let level = 'مبتدی';

    if (accuracy >= 80) {
      level = 'پیشرفته';
    } else if (accuracy >= 60) {
      level = 'متوسط';
    }

    return {
      studentId,
      total,
      correct,
      wrong,
      accuracy,
      level,
    };
  }

  // =========================================================
  // AI Chat
  // =========================================================
  async chat(data: any) {
    const studentId = Number(data?.studentId);
    const question = String(data?.question || '').trim();

    // ---------------------------------------------------------
    // اعتبارسنجی
    // ---------------------------------------------------------
    if (!studentId || !question) {
      return {
        success: false,
        answer: 'اطلاعات درخواست کامل نیست.',
        explanation:
          'لطفاً سؤال خود را وارد کنید.',
        finalAnswer: '',
        topic: 'Math',
        difficulty: 'medium',
        suggestions: [],
      };
    }

    // ---------------------------------------------------------
    // بررسی وجود دانش‌آموز
    // ---------------------------------------------------------
    const student = await this.prisma.user.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      return {
        success: false,
        studentId,
        question,
        answer: 'دانش‌آموز پیدا نشد.',
        explanation:
          'شناسه دانش‌آموز معتبر نیست.',
        finalAnswer: '',
        topic: 'Math',
        difficulty: 'medium',
        suggestions: [],
      };
    }

    // ---------------------------------------------------------
    // بررسی API Key
    // ---------------------------------------------------------
    const apiKey =
      process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        studentId,
        question,
        answer:
          'کلید دسترسی هوش مصنوعی تنظیم نشده است.',
        explanation:
          'لطفاً تنظیمات DeepSeek را بررسی کنید.',
        finalAnswer: '',
        topic: 'Math',
        difficulty: 'medium',
        suggestions: [],
      };
    }

    const dateKey = this.getDateKey();

    // =========================================================
    // رزرو سهمیه
    // =========================================================
    const quotaReserved =
      await this.prisma.$executeRaw`
        INSERT INTO "AIUsage"
          ("studentId", "dateKey", "count", "createdAt", "updatedAt")
        VALUES
          (${studentId}, ${dateKey}, 1, NOW(), NOW())
        ON CONFLICT ("studentId", "dateKey")
        DO UPDATE SET
          "count" = "AIUsage"."count" + 1,
          "updatedAt" = NOW()
        WHERE "AIUsage"."count" < ${this.DAILY_AI_LIMIT}
      `;

    // ---------------------------------------------------------
    // سهمیه تمام شده
    // ---------------------------------------------------------
    if (quotaReserved === 0) {
      const usage =
        await this.prisma.aIUsage.findUnique({
          where: {
            studentId_dateKey: {
              studentId,
              dateKey,
            },
          },
        });

      const quotaUsed = usage?.count ?? 0;

      return {
        success: false,
        studentId,
        question,
        answer:
          'سهمیه روزانه هوش مصنوعی شما تمام شده است.',
        explanation:
          'حداکثر ۵ سؤال هوش مصنوعی در روز مجاز است. لطفاً فردا دوباره تلاش کنید.',
        finalAnswer: '',
        topic: 'Math',
        difficulty: 'medium',
        suggestions: [],
        quotaLimit: this.DAILY_AI_LIMIT,
        quotaUsed,
        quotaRemaining: Math.max(
          0,
          this.DAILY_AI_LIMIT - quotaUsed,
        ),
        message: 'Daily AI quota exceeded',
      };
    }

    // ---------------------------------------------------------
    // خواندن سهمیه فعلی
    // ---------------------------------------------------------
    let usage =
      await this.prisma.aIUsage.findUnique({
        where: {
          studentId_dateKey: {
            studentId,
            dateKey,
          },
        },
      });

    let quotaUsed = usage?.count ?? 0;

    let quotaRemaining = Math.max(
      0,
      this.DAILY_AI_LIMIT - quotaUsed,
    );

    // =========================================================
    // ارسال درخواست به DeepSeek
    // =========================================================
    try {
      const response = await fetch(
        'https://api.deepseek.com/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            temperature: 0.2,
            response_format: {
              type: 'json_object',
            },
            messages: [
              {
                role: 'system',
                content: `
تو معلم ریاضی هوشمند پلتفرم MathVerse هستی.

وظیفه تو پاسخ دادن دقیق و آموزشی به سؤال‌های ریاضی دانش‌آموزان است.

پاسخ باید:
1. به زبان فارسی باشد.
2. مرحله‌به‌مرحله توضیح داده شود.
3. اگر سؤال محاسباتی است، محاسبات دقیق انجام شود.
4. اگر سؤال معادله است، مراحل حل نمایش داده شود.
5. اگر سؤال مربوط به اعداد صحیح است، علامت‌ها با دقت توضیح داده شوند.
6. پاسخ نهایی واضح باشد.
7. از توضیحات غیرضروری خودداری شود.

خروجی فقط JSON معتبر باشد و دقیقاً شامل این فیلدها باشد:

{
  "answer": "پاسخ آموزشی مرحله‌به‌مرحله",
  "explanation": "توضیح کامل",
  "finalAnswer": "پاسخ نهایی",
  "topic": "موضوع ریاضی",
  "difficulty": "easy | medium | hard",
  "suggestions": [
    "پیشنهاد اول",
    "پیشنهاد دوم"
  ]
}
                `,
              },
              {
                role: 'user',
                content: question,
              },
            ],
          }),
        },
      );

      // =======================================================
      // DeepSeek خطا داد
      // =======================================================
      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          'DeepSeek API ERROR:',
          response.status,
          errorText,
        );

        // -----------------------------------------------------
        // برگرداندن سهمیه رزروشده
        // -----------------------------------------------------
        await this.prisma.$executeRaw`
          UPDATE "AIUsage"
          SET
            "count" = GREATEST("count" - 1, 0),
            "updatedAt" = NOW()
          WHERE
            "studentId" = ${studentId}
            AND "dateKey" = ${dateKey}
            AND "count" > 0
        `;

        usage =
          await this.prisma.aIUsage.findUnique({
            where: {
              studentId_dateKey: {
                studentId,
                dateKey,
              },
            },
          });

        quotaUsed = usage?.count ?? 0;

        quotaRemaining = Math.max(
          0,
          this.DAILY_AI_LIMIT - quotaUsed,
        );

        return {
          success: false,
          studentId,
          question,
          answer:
            'در ارتباط با هوش مصنوعی مشکلی به وجود آمد.',
          explanation:
            'لطفاً چند لحظه بعد دوباره تلاش کنید.',
          finalAnswer: '',
          topic: 'Math',
          difficulty: 'medium',
          suggestions: [],
          quotaLimit: this.DAILY_AI_LIMIT,
          quotaUsed,
          quotaRemaining,
          message:
            'DeepSeek API request failed',
        };
      }

      // =======================================================
      // دریافت پاسخ DeepSeek
      // =======================================================
      const result = await response.json();

      const content =
        result?.choices?.[0]?.message?.content;

      if (!content) {
        console.error(
          'DeepSeek returned empty content:',
          result,
        );

        // -----------------------------------------------------
        // برگرداندن سهمیه در صورت پاسخ خالی
        // -----------------------------------------------------
        await this.prisma.$executeRaw`
          UPDATE "AIUsage"
          SET
            "count" = GREATEST("count" - 1, 0),
            "updatedAt" = NOW()
          WHERE
            "studentId" = ${studentId}
            AND "dateKey" = ${dateKey}
            AND "count" > 0
        `;

        usage =
          await this.prisma.aIUsage.findUnique({
            where: {
              studentId_dateKey: {
                studentId,
                dateKey,
              },
            },
          });

        quotaUsed = usage?.count ?? 0;

        quotaRemaining = Math.max(
          0,
          this.DAILY_AI_LIMIT - quotaUsed,
        );

        return {
          success: false,
          studentId,
          question,
          answer:
            'هوش مصنوعی پاسخ معتبری برنگرداند.',
          explanation:
            'لطفاً چند لحظه بعد دوباره تلاش کنید.',
          finalAnswer: '',
          topic: 'Math',
          difficulty: 'medium',
          suggestions: [],
          quotaLimit: this.DAILY_AI_LIMIT,
          quotaUsed,
          quotaRemaining,
          message:
            'DeepSeek returned empty response',
        };
      }

      // =======================================================
      // تبدیل پاسخ JSON
      // =======================================================
      let parsed: any;

      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        console.error(
          'DeepSeek JSON PARSE ERROR:',
          parseError,
        );

        console.error(
          'DeepSeek CONTENT:',
          content,
        );

        // -----------------------------------------------------
        // برگرداندن سهمیه در صورت JSON نامعتبر
        // -----------------------------------------------------
        await this.prisma.$executeRaw`
          UPDATE "AIUsage"
          SET
            "count" = GREATEST("count" - 1, 0),
            "updatedAt" = NOW()
          WHERE
            "studentId" = ${studentId}
            AND "dateKey" = ${dateKey}
            AND "count" > 0
        `;

        usage =
          await this.prisma.aIUsage.findUnique({
            where: {
              studentId_dateKey: {
                studentId,
                dateKey,
              },
            },
          });

        quotaUsed = usage?.count ?? 0;

        quotaRemaining = Math.max(
          0,
          this.DAILY_AI_LIMIT - quotaUsed,
        );

        return {
          success: false,
          studentId,
          question,
          answer:
            'پاسخ هوش مصنوعی قابل پردازش نبود.',
          explanation:
            'لطفاً دوباره تلاش کنید.',
          finalAnswer: '',
          topic: 'Math',
          difficulty: 'medium',
          suggestions: [],
          quotaLimit: this.DAILY_AI_LIMIT,
          quotaUsed,
          quotaRemaining,
          message:
            'Invalid DeepSeek JSON response',
        };
      }

      // =======================================================
      // پاسخ موفق
      // =======================================================
      return {
        success: true,

        studentId,

        question,

        answer:
          parsed.answer || '',

        explanation:
          parsed.explanation || '',

        finalAnswer:
          parsed.finalAnswer || '',

        topic:
          parsed.topic || 'Math',

        difficulty:
          parsed.difficulty || 'medium',

        suggestions:
          Array.isArray(parsed.suggestions)
            ? parsed.suggestions
            : [],

        quotaLimit:
          this.DAILY_AI_LIMIT,

        quotaUsed,

        quotaRemaining,
      };
    } catch (error) {
      // =======================================================
      // خطای اتصال یا خطای غیرمنتظره
      // =======================================================
      console.error(
        'DeepSeek CONNECTION ERROR:',
        error,
      );

      // -------------------------------------------------------
      // برگرداندن سهمیه رزروشده
      // -------------------------------------------------------
      try {
        await this.prisma.$executeRaw`
          UPDATE "AIUsage"
          SET
            "count" = GREATEST("count" - 1, 0),
            "updatedAt" = NOW()
          WHERE
            "studentId" = ${studentId}
            AND "dateKey" = ${dateKey}
            AND "count" > 0
        `;

        usage =
          await this.prisma.aIUsage.findUnique({
            where: {
              studentId_dateKey: {
                studentId,
                dateKey,
              },
            },
          });

        quotaUsed = usage?.count ?? 0;

        quotaRemaining = Math.max(
          0,
          this.DAILY_AI_LIMIT - quotaUsed,
        );
      } catch (refundError) {
        console.error(
          'AI QUOTA REFUND ERROR:',
          refundError,
        );
      }

      return {
        success: false,
        studentId,
        question,
        answer:
          'ارتباط با هوش مصنوعی برقرار نشد.',
        explanation:
          'لطفاً چند لحظه بعد دوباره تلاش کنید.',
        finalAnswer: '',
        topic: 'Math',
        difficulty: 'medium',
        suggestions: [],
        quotaLimit: this.DAILY_AI_LIMIT,
        quotaUsed,
        quotaRemaining,
        message:
          'DeepSeek connection error',
      };
    }
  }
}
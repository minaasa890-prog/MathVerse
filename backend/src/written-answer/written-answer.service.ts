import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AdaptiveLearningService } from '../adaptive-learning/adaptive-learning.service';

import { readFile } from 'fs/promises';
import { extname } from 'path';

@Injectable()
export class WrittenAnswerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adaptiveLearningService: AdaptiveLearningService,
  ) {}

  async analyzeWrittenAnswer(
    studentId: number,
    questionId: number,
    imagePath: string,
  ) {
    const question =
      await this.prisma.question.findUnique({
        where: {
          id: questionId,
        },
      });

    if (!question) {
      throw new NotFoundException(
        `Question ${questionId} not found.`,
      );
    }

    const writtenAnswer =
      await this.prisma.writtenAnswer.create({
        data: {
          studentId,
          questionId,
          imagePath,
          status: 'PENDING',
          aiProvider: 'DeepSeek',
        },
      });

    const apiKey =
      process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      await this.prisma.writtenAnswer.update({
        where: {
          id: writtenAnswer.id,
        },
        data: {
          status: 'AI_UNAVAILABLE',
        },
      });

      return {
        success: false,
        studentId,
        questionId,
        writtenAnswerId:
          writtenAnswer.id,
        message:
          'DeepSeek API key is not configured.',
      };
    }

    const imageBuffer =
      await readFile(imagePath);

    const base64Image =
      imageBuffer.toString('base64');

    const extension =
      extname(imagePath)
        .toLowerCase();

    let mimeType =
      'image/jpeg';

    if (extension === '.png') {
      mimeType = 'image/png';
    } else if (extension === '.webp') {
      mimeType = 'image/webp';
    } else if (extension === '.gif') {
      mimeType = 'image/gif';
    }

    const imageDataUrl =
      `data:${mimeType};base64,${base64Image}`;

    try {
      const response =
        await fetch(
          'https://api.deepseek.com/chat/completions',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${apiKey}`,
            },

            body: JSON.stringify({
              model: 'deepseek-flash',

              temperature: 0.1,

              response_format: {
                type: 'json_object',
              },

              messages: [
                {
                  role: 'system',

                  content: `
تو یک معلم ریاضی هوشمند برای پلتفرم MathVerse هستی.

وظیفه تو بررسی پاسخ دست‌نویس یک دانش‌آموز از روی تصویر است.

باید:

1. نوشته‌های ریاضی داخل تصویر را با دقت بخوانی.
2. مراحل حل دانش‌آموز را به ترتیب بررسی کنی.
3. پاسخ دانش‌آموز را با راه‌حل و پاسخ صحیح سؤال مقایسه کنی.
4. مشخص کنی پاسخ درست است یا غلط.
5. اگر غلط است، نوع خطا را مشخص کنی.
6. دقیقاً مشخص کنی خطا در کدام مرحله رخ داده است.
7. اگر خطا مربوط به علامت، محاسبه، جبر یا مفهوم باشد، آن را مشخص کن.
8. یک توضیح آموزشی ساده و فارسی ارائه کن.
9. اگر پاسخ درست است، آن را تأیید کن.
10. اگر تصویر خوانا نیست، حدس نزن و ILLEGIBLE را برگردان.
11. فقط بر اساس اطلاعات سؤال، راه‌حل سؤال و تصویر پاسخ دانش‌آموز قضاوت کن.

انواع خطا:

SIGN_ERROR
CALCULATION_ERROR
ALGEBRA_ERROR
CONCEPT_ERROR
WRONG_OPERATION
INCOMPLETE_SOLUTION
ILLEGIBLE
NO_ANSWER
OTHER

نکته مهم:

اگر پاسخ نهایی دانش‌آموز درست باشد ولی یکی از مراحل حل اشتباه باشد، آن اشتباه را در explanation و steps توضیح بده.

اگر پاسخ نهایی غلط باشد، فقط نتیجه را اعلام نکن؛ محل و دلیل خطا را نیز مشخص کن.

پاسخ باید فقط JSON معتبر باشد.

ساختار دقیق خروجی:

{
  "isCorrect": true,
  "errorType": null,
  "confidence": 0.95,
  "recognizedAnswer": "پاسخ تشخیص داده شده",
  "expectedAnswer": "پاسخ صحیح",
  "steps": [
    "مرحله اول",
    "مرحله دوم"
  ],
  "explanation": "توضیح آموزشی خطا یا تأیید پاسخ",
  "suggestion": "پیشنهاد برای بهبود"
}

confidence باید عددی بین 0 و 1 باشد.

اگر تصویر قابل خواندن نیست:

{
  "isCorrect": null,
  "errorType": "ILLEGIBLE",
  "confidence": 0,
  "recognizedAnswer": null,
  "expectedAnswer": "...",
  "steps": [],
  "explanation": "تصویر برای تشخیص دقیق خوانا نیست.",
  "suggestion": "لطفاً تصویر واضح‌تری ارسال کنید."
}
                  `,
                },

                {
                  role: 'user',

                  content: [
                    {
                      type: 'text',

                      text: `
اطلاعات سؤال:

عنوان سؤال:
${question.title}

توضیح سؤال:
${question.description ?? 'وجود ندارد'}

گزینه A:
${question.optionA ?? 'وجود ندارد'}

گزینه B:
${question.optionB ?? 'وجود ندارد'}

گزینه C:
${question.optionC ?? 'وجود ندارد'}

گزینه D:
${question.optionD ?? 'وجود ندارد'}

پاسخ صحیح ثبت‌شده:
${question.correctAnswer ?? 'ثبت نشده'}

راه‌حل صحیح سؤال:
${question.solution ?? 'راه‌حل ثبت نشده'}

توضیح آموزشی سؤال:
${question.explanation ?? 'توضیح ثبت نشده'}

اکنون تصویر پاسخ دست‌نویس دانش‌آموز را بررسی کن.

راه‌حل دانش‌آموز را مرحله‌به‌مرحله با راه‌حل صحیح مقایسه کن.

اگر سؤال چندگزینه‌ای است، پاسخ انتخاب‌شده را نیز بررسی کن.

اگر سؤال تشریحی است، منطق و مراحل حل را بررسی کن.

فقط JSON معتبر برگردان.
                      `,
                    },

                    {
                      type: 'image_url',

                      image_url: {
                        url: imageDataUrl,
                        detail: 'original',
                      },
                    },
                  ],
                },
              ],
            }),
          },
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          'Written Answer DeepSeek ERROR:',
          response.status,
          errorText,
        );

        await this.prisma.writtenAnswer.update({
          where: {
            id: writtenAnswer.id,
          },

          data: {
            status: 'AI_FAILED',
          },
        });

        return {
          success: false,
          studentId,
          questionId,
          writtenAnswerId:
            writtenAnswer.id,
          message:
            'DeepSeek API request failed.',
        };
      }

      const result =
        await response.json();

      const content =
        result?.choices?.[0]
          ?.message?.content;

      if (!content) {
        await this.prisma.writtenAnswer.update({
          where: {
            id: writtenAnswer.id,
          },

          data: {
            status: 'AI_EMPTY_RESPONSE',
          },
        });

        return {
          success: false,
          studentId,
          questionId,
          writtenAnswerId:
            writtenAnswer.id,
          message:
            'DeepSeek returned an empty response.',
        };
      }

      let analysis: any;

      try {
        analysis =
          JSON.parse(content);
      } catch (error) {
        console.error(
          'Written Answer JSON PARSE ERROR:',
          error,
        );

        console.error(
          'DeepSeek CONTENT:',
          content,
        );

        await this.prisma.writtenAnswer.update({
          where: {
            id: writtenAnswer.id,
          },

          data: {
            status: 'AI_PARSE_FAILED',
          },
        });

        return {
          success: false,
          studentId,
          questionId,
          writtenAnswerId:
            writtenAnswer.id,
          message:
            'AI response could not be parsed.',
        };
      }

      const isCorrect =
        analysis.isCorrect ??
        null;

      const errorType =
        analysis.errorType ??
        null;

      const confidence =
        analysis.confidence ??
        null;

      const recognizedAnswer =
        analysis.recognizedAnswer ??
        null;

      const expectedAnswer =
        analysis.expectedAnswer ??
        null;

      const steps =
        Array.isArray(
          analysis.steps,
        )
          ? analysis.steps
          : [];

      const explanation =
        analysis.explanation ??
        null;

      const suggestion =
        analysis.suggestion ??
        null;

      const updatedWrittenAnswer =
        await this.prisma.writtenAnswer.update({
          where: {
            id: writtenAnswer.id,
          },

          data: {
            isCorrect,
            errorType,
            confidence,
            recognizedAnswer,
            expectedAnswer,
            steps,
            explanation,
            suggestion,
            status: 'COMPLETED',
            aiProvider: 'DeepSeek',
          },
        });

      // ============================================
      // اتصال پاسخ تشریحی به سیستم Mastery
      // ============================================

      let mastery: any = null;

      if (
        isCorrect === true ||
        isCorrect === false
      ) {
        mastery =
          await this.adaptiveLearningService
            .updateMasteryFromWrittenAnswer(
              studentId,
              questionId,
              isCorrect,
            );
      }

      return {
        success: true,

        studentId,
        questionId,

        writtenAnswerId:
          updatedWrittenAnswer.id,

        imagePath,

        question: {
          id: question.id,
          title: question.title,
        },

        analysis: {
          isCorrect,
          errorType,
          confidence,
          recognizedAnswer,
          expectedAnswer,
          steps,
          explanation,
          suggestion,
        },

        mastery,
      };
    } catch (error) {
      console.error(
        'Written Answer DeepSeek CONNECTION ERROR:',
        error,
      );

      await this.prisma.writtenAnswer.update({
        where: {
          id: writtenAnswer.id,
        },

        data: {
          status: 'AI_CONNECTION_FAILED',
        },
      });

      return {
        success: false,
        studentId,
        questionId,
        writtenAnswerId:
          writtenAnswer.id,
        message:
          'Could not connect to DeepSeek.',
      };
    }
  }

  async getMyWrittenAnswers(
    studentId: number,
  ) {
    const writtenAnswers =
      await this.prisma.writtenAnswer.findMany({
        where: {
          studentId,
        },

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          question: {
            select: {
              id: true,
              title: true,
              chapter: true,
            },
          },
        },
      });

    return {
      success: true,
      studentId,
      count: writtenAnswers.length,
      writtenAnswers,
    };
  }
}
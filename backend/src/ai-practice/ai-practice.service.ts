import { Injectable } from '@nestjs/common';

import { PrismaService }
from '../prisma/prisma.service';

import { AdaptiveEngineService }
from '../adaptive-learning/adaptive-engine.service';

import { SolutionGeneratorService }
from './solution-generator.service';


@Injectable()
export class AiPracticeService {


  constructor(

    private prisma: PrismaService,

    private adaptiveEngine: AdaptiveEngineService,

    private solutionGenerator: SolutionGeneratorService

  ) {}


  // ==========================================
  // تست ساده
  // ==========================================

  async getTest() {

    const question =
      await this.prisma.question.findFirst({

        orderBy: {

          id: 'desc'

        }

      });


    return {

      success: true,

      question

    };

  }


  // ==========================================
  // گرفتن تمرین هوشمند دانش آموز
  // ==========================================

  async getStudentPractice(
    studentId: number
  ) {

    return await this.adaptiveEngine
      .getNextQuestion(studentId);

  }


  // ==========================================
  // ثبت جواب تمرین
  // ==========================================

  async submitPractice(
    body: any
  ) {


    const {

      studentId,

      questionId,

      answer

    } = body;


    // ==========================================
    // دریافت سؤال
    // ==========================================

    const question =
      await this.prisma.question.findUnique({

        where: {

          id: questionId

        }

      });


    if (!question) {

      return {

        success: false,

        message: 'Question not found'

      };

    }


    // ==========================================
    // بررسی پاسخ
    // ==========================================

    const correct =
      question.correctAnswer
        ?.toString()
        .trim()
        .toUpperCase() ===
      answer
        ?.toString()
        .trim()
        .toUpperCase();


    // ==========================================
    // ساخت راه‌حل اختصاصی
    // ==========================================

    const solution =
      this.solutionGenerator
        .generate(question);


    // ==========================================
    // ذخیره تاریخچه
    // ==========================================

    await this.prisma.practiceHistory.create({

      data: {

        studentId,

        questionId,

        isAnswered: true,

        isCorrect: correct

      }

    });


    // ==========================================
    // آپدیت مهارت فصل
    // ==========================================

    if (question.chapter) {


      let skill =
        await this.prisma.studentSkill.findUnique({

          where: {

            studentId_chapter: {

              studentId,

              chapter:
                question.chapter

            }

          }

        });


      // ========================================
      // ایجاد Skill جدید
      // ========================================

      if (!skill) {


        skill =
          await this.prisma.studentSkill.create({

            data: {

              studentId,

              chapter:
                question.chapter,

              correctCount:
                correct ? 1 : 0,

              wrongCount:
                correct ? 0 : 1,

              masteryScore:
                correct ? 10 : 0

            }

          });

      }


      // ========================================
      // آپدیت Skill
      // ========================================

      else {


        const correctCount =
          correct
            ? skill.correctCount + 1
            : skill.correctCount;


        const wrongCount =
          correct
            ? skill.wrongCount
            : skill.wrongCount + 1;


        const total =
          correctCount +
          wrongCount;


        const mastery =
          total === 0
            ? 0
            : Math.round(
                (correctCount / total) * 100
              );


        skill =
          await this.prisma.studentSkill.update({

            where: {

              id:
                skill.id

            },

            data: {

              correctCount,

              wrongCount,

              masteryScore:
                mastery

            }

          });

      }

    }


    // ==========================================
    // XP بر اساس سختی
    // ==========================================

    let xp = 0;


    if (correct) {

      xp =
        question.difficulty === 1
          ? 5
          : question.difficulty === 2
          ? 10
          : question.difficulty === 3
          ? 20
          : question.difficulty === 4
          ? 30
          : 50;

    }


    // ==========================================
    // آپدیت XP دانش آموز
    // ==========================================

    await this.prisma.user.update({

      where: {

        id:
          studentId

      },

      data: {

        xp: {

          increment:
            xp

        }

      }

    });


    // ==========================================
    // دریافت Skill جدید
    // ==========================================

    const updatedSkill =
      question.chapter

        ? await this.prisma.studentSkill.findUnique({

            where: {

              studentId_chapter: {

                studentId,

                chapter:
                  question.chapter

              }

            }

          })

        : null;


    // ==========================================
    // سؤال بعدی
    // ==========================================

    const next =
      await this.getStudentPractice(
        studentId
      );


    // ==========================================
    // نتیجه
    // ==========================================

    return {

      success: true,

      correct,

      xp,

      solution,

      skill:
        updatedSkill,

      next

    };

  }

}
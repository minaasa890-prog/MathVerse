import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RewardsService } from '../rewards/rewards.service';
import { AiSolutionService } from '../ai-solution/ai-solution.service';

@Injectable()
export class AttemptsService {

  constructor(
    private prisma: PrismaService,
    private rewardsService: RewardsService,
    private aiSolutionService: AiSolutionService,
  ) {}

  // ثبت پاسخ سوال
  async submitAnswer(data: {
    studentId: number;
    questionId: number;
    examId: number;
    answer: string;
    timeSpent: number;
  }) {

    const question =
      await this.prisma.question.findUnique({
        where: {
          id: data.questionId,
        },
      });

    if (!question) {
      throw new Error('Question not found');
    }

    const correct =
      String(question.correctAnswer)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');

    const userAnswer =
      String(data.answer)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');

    const isCorrect =
      correct === userAnswer;

    const existingAttempt =
      await this.prisma.attempt.findUnique({
        where: {
          studentId_questionId_examId: {
            studentId: data.studentId,
            questionId: data.questionId,
            examId: data.examId,
          },
        },
      });

    // =========================================================
    // XP LEDGER
    // =========================================================
    // فقط پاسخ صحیح می‌تواند XP بدهد.
    //
    // referenceKey باعث می‌شود برای هر سوال از هر آزمون،
    // حداکثر یک بار XP ثبت شود.
    //
    // بنابراین:
    // wrong -> correct  = +10
    // correct -> correct = +0
    // correct -> wrong   = +0
    // wrong -> correct -> wrong -> correct = فقط +10
    // =========================================================

    let earnedXP = 0;

    if (isCorrect) {

      const referenceKey =
        `EXAM:${data.examId}:QUESTION:${data.questionId}`;

      const xpResult =
        await this.rewardsService.addXPOnce(
          data.studentId,
          10,
          'EXAM_QUESTION_CORRECT',
          referenceKey,
        );

      if (xpResult.awarded) {
        earnedXP = 10;
      }
    }

    let attempt;

    if (existingAttempt) {

      attempt =
        await this.prisma.attempt.update({
          where: {
            id: existingAttempt.id,
          },

          data: {
            answer: data.answer,

            isCorrect,

            score:
              isCorrect
                ? question.score
                : 0,

            timeSpent: data.timeSpent,
          },
        });

    } else {

      attempt =
        await this.prisma.attempt.create({
          data: {

            studentId: data.studentId,

            questionId: data.questionId,

            examId: data.examId,

            answer: data.answer,

            isCorrect,

            score:
              isCorrect
                ? question.score
                : 0,

            timeSpent: data.timeSpent,
          },
        });
    }

    return {

      message:
        isCorrect
          ? 'پاسخ درست است'
          : 'پاسخ اشتباه است',

      isCorrect,

      score:
        isCorrect
          ? question.score
          : 0,

      earnedXP,

      attempt,
    };
  }

  // جواب های دانش آموز در آزمون
  async getStudentExamAttempts(
    studentId: number,
    examId: number,
  ) {

    return this.prisma.attempt.findMany({

      where: {
        studentId,
        examId,
      },

      include: {
        question: true,
      },

    });
  }

  // نتیجه ساده آزمون
  async getExamResult(
    studentId: number,
    examId: number,
  ) {

    const attempts =
      await this.prisma.attempt.findMany({

        where: {
          studentId,
          examId,
        },

      });

    const score =
      attempts.reduce(
        (sum, a) => sum + a.score,
        0,
      );

    const correct =
      attempts.filter(
        a => a.isCorrect,
      ).length;

    return {

      studentId,

      examId,

      totalQuestions:
        attempts.length,

      correctAnswers:
        correct,

      score,
    };
  }

  // نتیجه هوشمند + AI Report
  async getStudentExamResult(
    studentId: number,
    examId: number,
  ) {

    const attempts =
      await this.prisma.attempt.findMany({

        where: {
          studentId,
          examId,
        },

        include: {
          question: true,
          exam: true,
        },

      });

    if (!attempts.length) {

      throw new Error(
        'No attempts found',
      );

    }

    let correct = 0;
    let wrong = 0;
    let score = 0;

    const weakTopics = [];
    const strongTopics = [];

    for (const item of attempts) {

      score += item.score;

      const topic =
        item.question.subject ||
        'Math';

      if (item.isCorrect) {

        correct++;

        strongTopics.push({
          topic,

          question:
            item.question.title,
        });

      } else {

        wrong++;

        weakTopics.push({
          topic,

          question:
            item.question.title,
        });
      }
    }

    const percentage =
      Math.round(
        (correct / attempts.length) * 100,
      );

    let level = 'Beginner';

    if (percentage >= 80) {

      level = 'Advanced';

    } else if (percentage >= 50) {

      level = 'Intermediate';
    }

    const questions =
      await Promise.all(

        attempts.map(async (item) => {

          return {

            questionId:
              item.question.id,

            question:
              item.question.title,

            yourAnswer:
              item.answer,

            correctAnswer:
              item.question.correctAnswer,

            isCorrect:
              item.isCorrect,

            solution:
              item.isCorrect
                ? null
                : await this.aiSolutionService.getSolution(
                    item.question.id,
                  ),
          };

        }),
      );

    return {

      studentId,

      examId,

      examTitle:
        attempts[0].exam.title,

      totalQuestions:
        attempts.length,

      correctAnswers:
        correct,

      wrongAnswers:
        wrong,

      score,

      percentage,

      level,

      weakTopics,

      strongTopics,

      questions,

      AI_Report: {

        summary:
          percentage >= 80
            ? 'Excellent performance'
            : percentage >= 50
              ? 'Good performance'
              : 'Needs improvement',

        recommendations:
          percentage < 50
            ? [
                'Review basic concepts',
                'Practice weak topics',
                'Solve similar questions',
              ]
            : [
                'Continue practice',
                'Try harder questions',
              ],
      },
    };
  }

  async getClassExamResults(
    classroomId: number,
    examId: number,
  ) {

    return {

      classroomId,

      examId,

      message:
        'Class results ready',
    };
  }

  async getExamStatistics(
    examId: number,
  ) {

    const attempts =
      await this.prisma.attempt.findMany({

        where: {
          examId,
        },

      });

    return {

      examId,

      totalAttempts:
        attempts.length,

      correct:
        attempts.filter(
          a => a.isCorrect,
        ).length,

      wrong:
        attempts.filter(
          a => !a.isCorrect,
        ).length,
    };
  }

  async getQuestionsAnalysis(
    examId: number,
  ) {

    return {

      examId,

      message:
        'Question analysis ready',
    };
  }

  async getStudentAnalysis(
    studentId: number,
  ) {

    const attempts =
      await this.prisma.attempt.findMany({

        where: {
          studentId,
        },

        include: {
          question: true,
          student: true,
        },

      });

    if (!attempts.length) {

      return {

        studentId,

        message:
          'No learning data found',
      };
    }

    let correct = 0;
    let wrong = 0;

    const skills: any = {};

    for (const item of attempts) {

      const topic =
        item.question.chapter ||
        item.question.subject ||
        'General';

      if (!skills[topic]) {

        skills[topic] = {
          correct: 0,
          wrong: 0,
        };
      }

      if (item.isCorrect) {

        correct++;

        skills[topic].correct++;

      } else {

        wrong++;

        skills[topic].wrong++;
      }
    }

    const total =
      correct + wrong;

    const accuracy =
      Math.round(
        (correct / total) * 100,
      );

    let level =
      'Beginner';

    if (accuracy >= 80) {

      level = 'Advanced';

    } else if (accuracy >= 50) {

      level = 'Intermediate';
    }

    const skillAnalysis =
      Object.keys(skills)
        .map(key => {

          const data =
            skills[key];

          const total =
            data.correct +
            data.wrong;

          return {

            topic: key,

            correct:
              data.correct,

            wrong:
              data.wrong,

            accuracy:
              Math.round(
                (data.correct / total) * 100,
              ),
          };
        });

    const weakSkills =
      skillAnalysis.filter(
        s => s.accuracy < 60,
      );

    const strongSkills =
      skillAnalysis.filter(
        s => s.accuracy >= 80,
      );

    let difficulty = 1;

    if (accuracy >= 80) {

      difficulty = 3;

    } else if (accuracy >= 50) {

      difficulty = 2;
    }

    return {

      studentId,

      student:
        attempts[0].student.name,

      performance: {

        totalAttempts:
          total,

        correct,

        wrong,

        accuracy,

        level,
      },

      skills:
        skillAnalysis,

      weakSkills,

      strongSkills,

      aiDecision: {

        recommendedDifficulty:
          difficulty,

        nextAction:
          accuracy >= 80
            ? 'HARDER_PRACTICE'
            : 'REVIEW_AND_PRACTICE',

        message:
          accuracy >= 80
            ? 'Student is ready for advanced questions'
            : 'Student needs more practice',
      },

      recommendedQuestions:
        10,

      message:
        'AI analysis ready',
    };
  }

  async getStudentRecommendations(
    studentId: number,
  ) {

    const analysis =
      await this.getStudentAnalysis(
        studentId,
      );

    return {

      studentId,

      level:
        analysis.performance?.level ||
        'Beginner',

      accuracy:
        analysis.performance?.accuracy ||
        0,

      recommendedDifficulty:
        analysis.aiDecision
          ?.recommendedDifficulty ||
        1,

      nextAction:
        analysis.aiDecision?.nextAction ||
        'PRACTICE',

      weakSkills:
        analysis.weakSkills ||
        [],

      strongSkills:
        analysis.strongSkills ||
        [],

      recommendations:

        analysis.weakSkills &&
        analysis.weakSkills.length > 0

          ? [

              `Review ${analysis.weakSkills[0].topic}`,

              'Practice similar questions',

              'Repeat weak topics',

            ]

          : [

              'Continue learning',

              'Try harder questions',

            ],

      message:
        'AI adaptive recommendation generated',
    };
  }
}


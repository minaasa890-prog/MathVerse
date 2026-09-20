import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // STUDENT DASHBOARD
  // =====================================================

  async getStudentDashboard(
    studentId: number,
  ) {

    // ===================================================
    // Student
    // ===================================================

    const student =
      await this.prisma.user.findUnique({
        where: {
          id: studentId,
        },
      });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    // ===================================================
    // Exam Attempts
    // ===================================================

    const attempts =
      await this.prisma.attempt.findMany({
        where: {
          studentId,
        },
        include: {
          question: true,
          exam: true,
        },
      });

    // ===================================================
    // Adaptive Practice Sessions
    // ===================================================

    const sessions =
      await this.prisma.practiceSession.findMany({
        where: {
          studentId,
        },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
      });

    // ===================================================
    // Student Skills
    // ===================================================

    const skills =
      await this.prisma.studentSkill.findMany({
        where: {
          studentId,
        },
        orderBy: {
          masteryScore: 'desc',
        },
      });

    // ===================================================
    // TOTAL STATISTICS
    // ===================================================

    const examQuestionCount =
      attempts.length;

    const practiceQuestionCount =
      sessions.reduce(
        (sum, session) =>
          sum + session.answers.length,
        0,
      );

    const totalQuestions =
      examQuestionCount +
      practiceQuestionCount;

    const examCorrectAnswers =
      attempts.filter(
        attempt =>
          attempt.isCorrect,
      ).length;

    const practiceCorrectAnswers =
      sessions.reduce(
        (sum, session) =>
          sum +
          session.answers.filter(
            answer =>
              answer.correct,
          ).length,
        0,
      );

    const correctAnswers =
      examCorrectAnswers +
      practiceCorrectAnswers;

    const totalScore =
      attempts.reduce(
        (sum, attempt) =>
          sum + (attempt.score || 0),
        0,
      )
      +
      sessions.reduce(
        (sum, session) =>
          sum + (session.totalScore || 0),
        0,
      );

    const percentage =
      totalQuestions === 0
        ? 0
        : Math.round(
            (
              correctAnswers /
              totalQuestions
            ) * 100,
          );

    // ===================================================
    // CHAPTER ANALYSIS
    // ===================================================

    const chapterMap: Record<
      string,
      {
        total: number;
        correct: number;
      }
    > = {};

    // ===================================================
    // Exam Attempts
    // ===================================================

    for (const attempt of attempts) {

      const chapter =
        attempt.question?.chapter ||
        'بدون فصل';

      if (!chapterMap[chapter]) {

        chapterMap[chapter] = {
          total: 0,
          correct: 0,
        };

      }

      chapterMap[chapter].total++;

      if (attempt.isCorrect) {
        chapterMap[chapter].correct++;
      }

    }

    // ===================================================
    // Adaptive Practice
    // ===================================================

    for (const session of sessions) {

      for (const answer of session.answers) {

        const chapter =
          answer.question?.chapter ||
          'بدون فصل';

        if (!chapterMap[chapter]) {

          chapterMap[chapter] = {
            total: 0,
            correct: 0,
          };

        }

        chapterMap[chapter].total++;

        if (answer.correct) {
          chapterMap[chapter].correct++;
        }

      }

    }

    // ===================================================
    // Topic Analysis
    // ===================================================

    const topicAnalysis =
      Object.keys(chapterMap)
        .map(chapter => {

          const chapterData =
            chapterMap[chapter];

          return {

            topic:
              chapter,

            totalQuestions:
              chapterData.total,

            correctAnswers:
              chapterData.correct,

            wrongAnswers:
              chapterData.total -
              chapterData.correct,

            accuracy:
              chapterData.total === 0
                ? 0
                : Math.round(
                    (
                      chapterData.correct /
                      chapterData.total
                    ) * 100,
                  ),

          };

        })
        .sort(
          (a, b) =>
            a.accuracy -
            b.accuracy,
        );

    // ===================================================
    // STRONG / WEAK TOPICS
    // ===================================================

    const strongTopics =
      topicAnalysis.filter(
        item =>
          item.accuracy >= 80,
      );

    const weakTopics =
      topicAnalysis.filter(
        item =>
          item.accuracy < 60,
      );

    // ===================================================
    // DASHBOARD SKILLS
    // ===================================================

    const skillByChapter =
      new Map<
        string,
        (typeof skills)[number]
      >(
        skills.map(skill => [
          skill.chapter,
          skill,
        ]),
      );

    const dashboardSkills =
      topicAnalysis.map(
        (topic, index) => {

          const existingSkill =
            skillByChapter.get(
              topic.topic,
            );

          return {

            id:
              existingSkill?.id ??
              100000 + index,

            studentId,

            chapter:
              topic.topic,

            correctCount:
              topic.correctAnswers,

            wrongCount:
              topic.wrongAnswers,

            masteryScore:
              topic.accuracy,

            level:
              existingSkill?.level ??
              student.level,

            lastUpdated:
              existingSkill?.lastUpdated ??
              new Date(),

          };

        },
      );

    // ===================================================
    // STRONG SKILLS
    // ===================================================

    const strongSkills =
      dashboardSkills.filter(
        skill =>
          skill.masteryScore >= 80,
      );

    // ===================================================
    // WEAK SKILLS
    // ===================================================

    const weakSkills =
      dashboardSkills.filter(
        skill =>
          skill.masteryScore < 60,
      );

    // ===================================================
    // SORT STRONG SKILLS
    // ===================================================

    strongSkills.sort(
      (a, b) =>
        b.masteryScore -
        a.masteryScore,
    );

    // ===================================================
    // SORT WEAK SKILLS
    // ===================================================

    weakSkills.sort(
      (a, b) =>
        a.masteryScore -
        b.masteryScore,
    );

    // ===================================================
    // AI RECOMMENDATION
    // ===================================================

    let recommendation =
      'تمرین منظم ادامه داده شود';

    let aiMessage =
      'روند یادگیری مناسب است';

    // ===================================================
    // Weak Topic
    // ===================================================

    if (weakTopics.length > 0) {

      const weakestTopic =
        weakTopics[0];

      recommendation =
        `تمرکز روی ${weakestTopic.topic}`;

      aiMessage =
        `هوش مصنوعی پیشنهاد می‌کند مهارت «${weakestTopic.topic}» بیشتر تمرین شود. عملکرد فعلی در این بخش ${weakestTopic.accuracy}% است.`;

    }

    // ===================================================
    // Overall Performance < 60
    // ===================================================

    else if (percentage < 60) {

      recommendation =
        'تمرین تقویتی پیشنهاد می‌شود';

      aiMessage =
        `عملکرد کلی دانش‌آموز ${percentage}% است. برای بهبود یادگیری، تمرین‌های هدفمند و Adaptive پیشنهاد می‌شود.`;

    }

    // ===================================================
    // Overall Performance 60 - 84
    // ===================================================

    else if (percentage < 85) {

      recommendation =
        'تمرین تکمیلی پیشنهاد می‌شود';

      aiMessage =
        `عملکرد کلی ${percentage}% است. با ادامه تمرین می‌توان مهارت‌ها را تثبیت کرد.`;

    }

    // ===================================================
    // Overall Performance >= 85
    // ===================================================

    else {

      recommendation =
        'حل سوالات سطح بالاتر';

      aiMessage =
        `عملکرد کلی ${percentage}% است. دانش‌آموز می‌تواند وارد سوالات سطح بالاتر شود.`;

    }

    // ===================================================
    // XP / LEVEL PROGRESS
    // ===================================================

    const calculatedLevel =
      Math.floor(student.xp / 100) + 1;

    const currentLevelStart =
      (calculatedLevel - 1) * 100;

    const nextLevelXP =
      calculatedLevel * 100;

    const xpInsideLevel =
      student.xp -
      currentLevelStart;

    const xpProgress =
      Math.max(
        0,
        Math.min(
          100,
          xpInsideLevel,
        ),
      );

    // ===================================================
    // RETURN STUDENT DASHBOARD
    // ===================================================

    return {

      student: {

        id:
          student.id,

        name:
          student.name,

        email:
          student.email,

        level:
          calculatedLevel,

        xp:
          student.xp,

        currentLevelStart,

        nextLevelXP,

        xpInsideLevel,

        xpProgress,

      },

      stats: {

        totalQuestions,

        correctAnswers,

        totalScore,

        percentage,

      },

      ai: {

        topicAnalysis,

        strongTopics,

        weakTopics,

        // داده اصلی StudentSkill
        skills,

        // داده محاسبه‌شده برای Dashboard
        strongSkills,

        weakSkills,

        recommendation,

        aiMessage,

      },

    };

  }

  // =====================================================
  // TEACHER DASHBOARD
  // =====================================================

  async getTeacherDashboard(
    teacherId: number,
  ) {

    // ===================================================
    // Teacher
    // ===================================================

    const teacher =
      await this.prisma.user.findUnique({
        where: {
          id: teacherId,
        },
      });

    if (!teacher) {

      throw new NotFoundException(
        'Teacher not found',
      );

    }

    // ===================================================
    // Classrooms
    // ===================================================

    const classrooms =
      await this.prisma.classroom.findMany({

        where: {
          teacherId,
        },

        include: {

          students: true,

          exams: {
            include: {
              questions: true,
            },
          },

        },

      });

    // ===================================================
    // Teacher Statistics
    // ===================================================

    let totalStudents = 0;
    let totalExams = 0;
    let totalQuestions = 0;

    for (const classroom of classrooms) {

      totalStudents +=
        classroom.students.length;

      totalExams +=
        classroom.exams.length;

      for (const exam of classroom.exams) {

        totalQuestions +=
          exam.questions.length;

      }

    }

    // ===================================================
    // RETURN TEACHER DASHBOARD
    // ===================================================

    return {

      teacher: {

        id:
          teacher.id,

        name:
          teacher.name,

        email:
          teacher.email,

      },

      stats: {

        totalClassrooms:
          classrooms.length,

        totalStudents,

        totalExams,

        totalQuestions,

      },

      classrooms,

    };

  }

}

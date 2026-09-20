import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachersService {

  constructor(
    private prisma: PrismaService,
  ) {}

  // =========================================================
  // داشبورد معلم
  // =========================================================

  async dashboard(teacherId: number) {

    const classrooms =
      await this.prisma.classroom.findMany({

        where: {
          teacherId: teacherId,
        },

        include: {

          students: true,

          memberships: {
            include: {
              student: true,
            },
          },

          exams: true,

        },

      });


    const teacher =
      await this.prisma.user.findUnique({

        where: {
          id: teacherId,
        },

      });


    if (!teacher) {

      return {
        message: 'Teacher not found',
      };

    }


    // =========================================================
    // محاسبه تعداد دانش‌آموزان هر کلاس
    // =========================================================

    const classes =
      classrooms.map((classroom: any) => {

        const studentsMap =
          new Map<number, any>();


        classroom.memberships.forEach(
          (membership: any) => {

            if (
              membership.student &&
              membership.student.role === 'STUDENT'
            ) {

              studentsMap.set(
                membership.student.id,
                membership.student,
              );

            }

          },
        );


        classroom.students.forEach(
          (student: any) => {

            if (
              student.role === 'STUDENT' &&
              !studentsMap.has(student.id)
            ) {

              studentsMap.set(
                student.id,
                student,
              );

            }

          },
        );


        return {

          id: classroom.id,

          name: classroom.name,

          students: studentsMap.size,

          exams: classroom.exams.length,

        };

      });


    // =========================================================
    // مجموع دانش‌آموزان یکتا
    // =========================================================

    const allStudents =
      new Map<number, any>();


    classrooms.forEach(
      (classroom: any) => {

        classroom.memberships.forEach(
          (membership: any) => {

            if (
              membership.student &&
              membership.student.role === 'STUDENT'
            ) {

              allStudents.set(
                membership.student.id,
                membership.student,
              );

            }

          },
        );


        classroom.students.forEach(
          (student: any) => {

            if (
              student.role === 'STUDENT'
            ) {

              allStudents.set(
                student.id,
                student,
              );

            }

          },
        );

      },
    );


    return {

      teacherId: teacher.id,

      name: teacher.name,

      totalClasses:
        classrooms.length,

      totalStudents:
        allStudents.size,

      totalExams:
        classrooms.reduce(
          (
            sum: number,
            classroom: any,
          ) =>
            sum + classroom.exams.length,
          0,
        ),

      classes,

    };

  }


  // =========================================================
  // لیست دانش‌آموزان کلاس
  // Multi-Class + Legacy
  // =========================================================

  async getClassStudents(
    classroomId: number,
  ) {

    const memberships =
      await this.prisma.classroomMembership.findMany({

        where: {

          classroomId,

          student: {
            role: 'STUDENT',
          },

        },

        include: {

          student: {
            include: {
              attempts: true,
            },
          },

        },

      });


    const legacyStudents =
      await this.prisma.user.findMany({

        where: {

          classroomId,

          role: 'STUDENT',

        },

        include: {

          attempts: true,

        },

      });


    const studentsMap =
      new Map<number, any>();


    memberships.forEach(
      (membership: any) => {

        if (membership.student) {

          studentsMap.set(
            membership.student.id,
            membership.student,
          );

        }

      },
    );


    legacyStudents.forEach(
      (student: any) => {

        if (!studentsMap.has(student.id)) {

          studentsMap.set(
            student.id,
            student,
          );

        }

      },
    );


    const students =
      Array.from(
        studentsMap.values(),
      );


    return students.map(
      (student: any) => {

        const totalExams =
          student.attempts.length;

        let totalScore = 0;


        student.attempts.forEach(
          (attempt: any) => {

            totalScore += Number(
              attempt.score ?? 0,
            );

          },
        );


        return {

          id: student.id,

          name: student.name,

          email: student.email,

          totalExams,

          average:
            totalExams > 0
              ? Math.round(
                  totalScore /
                  totalExams,
                )
              : 0,

        };

      },
    );

  }


  // =========================================================
  // نتایج آزمون‌های کلاس
  // Multi-Class + Legacy
  // =========================================================

  async getClassResults(
    classroomId: number,
  ) {

    const exams =
      await this.prisma.exam.findMany({

        where: {
          classroomId,
        },

        orderBy: {
          id: 'asc',
        },

      });


    const memberships =
      await this.prisma.classroomMembership.findMany({

        where: {

          classroomId,

          student: {
            role: 'STUDENT',
          },

        },

        select: {
          studentId: true,
        },

      });


    const legacyStudents =
      await this.prisma.user.findMany({

        where: {

          classroomId,

          role: 'STUDENT',

        },

        select: {
          id: true,
        },

      });


    const studentIds =
      Array.from(
        new Set<number>([
          ...memberships.map(
            (item) =>
              item.studentId,
          ),

          ...legacyStudents.map(
            (student) =>
              student.id,
          ),

        ]),
      );


    if (studentIds.length === 0) {

      return exams.map(
        (exam: any) => ({

          examId:
            exam.id,

          examTitle:
            exam.title,

          students:
            0,

          averageScore:
            0,

          highestScore:
            0,

          lowestScore:
            0,

        }),
      );

    }


    const results: any[] = [];


    for (
      const exam of exams
    ) {

      const attempts =
        await this.prisma.attempt.findMany({

          where: {

            examId:
              exam.id,

            studentId: {
              in: studentIds,
            },

          },

          select: {

            id: true,

            studentId: true,

            score: true,

          },

          orderBy: {

            id: 'asc',

          },

        });


      const latestAttempts =
        new Map<number, any>();


      attempts.forEach(
        (attempt: any) => {

          latestAttempts.set(
            attempt.studentId,
            attempt,
          );

        },
      );


      const scores =
        Array.from(
          latestAttempts.values(),
        )
          .map(
            (attempt: any) =>
              Number(
                attempt.score ?? 0,
              ),
          )
          .filter(
            (score: number) =>
              Number.isFinite(score),
          );


      const students =
        scores.length;


      const averageScore =
        students > 0
          ? Number(
              (
                scores.reduce(
                  (
                    sum: number,
                    score: number,
                  ) =>
                    sum + score,
                  0,
                ) /
                students
              ).toFixed(1),
            )
          : 0;


      const highestScore =
        students > 0
          ? Math.max(...scores)
          : 0;


      const lowestScore =
        students > 0
          ? Math.min(...scores)
          : 0;


      results.push({

        examId:
          exam.id,

        examTitle:
          exam.title,

        students,

        averageScore,

        highestScore,

        lowestScore,

      });

    }


    return results;

  }


  // =========================================================
  // جزئیات یک آزمون
  // شرکت‌کنندگان + غایبین + نمره
  // =========================================================

  async getExamDetails(
    classroomId: number,
    examId: number,
  ) {

    const exam =
      await this.prisma.exam.findFirst({

        where: {

          id: examId,

          classroomId,

        },

      });


    if (!exam) {

      return {

        success: false,

        message:
          'Exam not found in this classroom',

      };

    }


    const memberships =
      await this.prisma.classroomMembership.findMany({

        where: {

          classroomId,

          student: {
            role: 'STUDENT',
          },

        },

        include: {

          student: true,

        },

      });


    const legacyStudents =
      await this.prisma.user.findMany({

        where: {

          classroomId,

          role: 'STUDENT',

        },

      });


    const studentsMap =
      new Map<number, any>();


    memberships.forEach(
      (membership: any) => {

        if (membership.student) {

          studentsMap.set(
            membership.student.id,
            membership.student,
          );

        }

      },
    );


    legacyStudents.forEach(
      (student: any) => {

        if (!studentsMap.has(student.id)) {

          studentsMap.set(
            student.id,
            student,
          );

        }

      },
    );


    const students =
      Array.from(
        studentsMap.values(),
      );


    const attempts =
      await this.prisma.attempt.findMany({

        where: {

          examId,

          studentId: {
            in: students.map(
              (student: any) =>
                student.id,
            ),
          },

        },

        select: {

          studentId: true,

          score: true,

        },

      });


    const studentResults =
      students.map(
        (student: any) => {

          const studentAttempts =
            attempts.filter(
              (attempt: any) =>
                attempt.studentId ===
                student.id,
            );


          if (
            studentAttempts.length === 0
          ) {

            return {

              studentId:
                student.id,

              name:
                student.name,

              status:
                'ABSENT',

              statusText:
                'غایب',

              score:
                null,

              answeredQuestions:
                0,

            };

          }


          const score =
            studentAttempts.reduce(
              (
                sum: number,
                attempt: any,
              ) =>
                sum +
                Number(
                  attempt.score ?? 0,
                ),
              0,
            );


          return {

            studentId:
              student.id,

            name:
              student.name,

            status:
              'PARTICIPATED',

            statusText:
              'شرکت کرده',

            score,

            answeredQuestions:
              studentAttempts.length,

          };

        },
      );


    const participants =
      studentResults.filter(
        (student: any) =>
          student.status ===
          'PARTICIPATED',
      ).length;


    const absent =
      studentResults.filter(
        (student: any) =>
          student.status ===
          'ABSENT',
      ).length;


    return {

      success: true,

      examId:
        exam.id,

      examTitle:
        exam.title,

      totalStudents:
        students.length,

      participants,

      absent,

      students:
        studentResults,

    };

  }


  // =========================================================
  // رتبه‌بندی دانش‌آموزان کلاس
  // =========================================================

  async getClassRanking(
    classroomId: number,
  ) {

    const memberships =
      await this.prisma.classroomMembership.findMany({

        where: {

          classroomId,

          student: {
            role: 'STUDENT',
          },

        },

        include: {

          student: {
            include: {
              attempts: true,
            },
          },

        },

      });


    const legacyStudents =
      await this.prisma.user.findMany({

        where: {

          classroomId,

          role: 'STUDENT',

        },

        include: {

          attempts: true,

        },

      });


    const studentsMap =
      new Map<number, any>();


    memberships.forEach(
      (membership: any) => {

        if (membership.student) {

          studentsMap.set(
            membership.student.id,
            membership.student,
          );

        }

      },
    );


    legacyStudents.forEach(
      (student: any) => {

        if (!studentsMap.has(student.id)) {

          studentsMap.set(
            student.id,
            student,
          );

        }

      },
    );


    const students =
      Array.from(
        studentsMap.values(),
      );


    const ranking =
      students.map(
        (student: any) => {

          let total = 0;

          let count = 0;


          student.attempts.forEach(
            (attempt: any) => {

              total += Number(
                attempt.score ?? 0,
              );

              count++;

            },
          );


          return {

            studentId:
              student.id,

            name:
              student.name,

            exams:
              count,

            averageScore:
              count > 0
                ? Math.round(
                    total /
                    count,
                  )
                : 0,

          };

        },
      );


    return ranking
      .sort(
        (
          a: any,
          b: any,
        ) =>
          b.averageScore -
          a.averageScore,
      )
      .map(
        (
          student: any,
          index: number,
        ) => ({

          rank:
            index + 1,

          ...student,

        }),
      );

  }


  // =========================================================
  // گزارش کامل دانش‌آموز
  // =========================================================

  async getStudentReport(
    studentId: number,
  ) {

    const student =
      await this.prisma.user.findUnique({

        where: {

          id: studentId,

        },

        include: {

          attempts: true,

        },

      });


    if (!student) {

      return {
        message: 'Student not found',
      };

    }


    const totalExams =
      student.attempts.length;


    let totalScore = 0;


    student.attempts.forEach(
      (attempt: any) => {

        totalScore += Number(
          attempt.score ?? 0,
        );

      },
    );


    const averageScore =
      totalExams > 0
        ? Math.round(
            totalScore /
            totalExams,
          )
        : 0;


    return {

      studentId:
        student.id,

      name:
        student.name,

      totalExams,

      averageScore,

      correctAnswers:
        averageScore >= 50
          ? 1
          : 0,

      wrongAnswers:
        averageScore < 50
          ? 1
          : 0,

      strengths:
        averageScore >= 70
          ? ['Math']
          : [],

      weaknesses:
        averageScore < 50
          ? ['Need more practice']
          : [],

      recommendation:
        averageScore >= 70
          ? 'Continue advanced exercises'
          : 'Practice basic exercises',

    };

  }


  // =========================================================
  // تحلیل دانش‌آموز
  // =========================================================

  async studentAnalysis(
    studentId: number,
  ) {

    const student =
      await this.prisma.user.findUnique({

        where: {
          id: studentId,
        },

        include: {

          attempts: {

            include: {
              exam: true,
            },

          },

        },

      });


    if (!student) {

      return {
        message: 'Student not found',
      };

    }


    let totalScore = 0;

    let count = 0;

    const subjects: any = {};


    student.attempts.forEach(
      (attempt: any) => {

        const score =
          Number(
            attempt.score ?? 0,
          );


        totalScore += score;

        count++;


        const subject =
          attempt.exam.title;


        if (!subjects[subject]) {

          subjects[subject] = [];

        }


        subjects[subject].push(
          score,
        );

      },
    );


    const average =
      count === 0
        ? 0
        : Math.round(
            totalScore /
            count,
          );


    const weakSubjects =
      Object.keys(subjects)
        .filter((subject) => {

          const avg =
            subjects[subject]
              .reduce(
                (
                  a: number,
                  b: number,
                ) =>
                  a + b,
                0,
              )
            /
            subjects[subject].length;


          return avg < 50;

        });


    const strongSubjects =
      Object.keys(subjects)
        .filter((subject) => {

          const avg =
            subjects[subject]
              .reduce(
                (
                  a: number,
                  b: number,
                ) =>
                  a + b,
                0,
              )
            /
            subjects[subject].length;


          return avg >= 80;

        });


    let level =
      'Beginner';


    if (average >= 80) {

      level =
        'Advanced';

    } else if (average >= 50) {

      level =
        'Intermediate';

    }


    return {

      studentId:
        student.id,

      name:
        student.name,

      average,

      level,

      weakSubjects,

      strongSubjects,

      recommendations:
        weakSubjects.length > 0
          ? [
              'Practice weak subjects',
              'Complete 20 extra exercises',
              'Review previous mistakes',
            ]
          : [
              'Continue advanced practice',
            ],

    };

  }


  // =========================================================
  // تمرین دانش‌آموز
  // =========================================================

  async studentPractice(
    studentId: number,
  ) {

    const student =
      await this.prisma.user.findUnique({

        where: {
          id: studentId,
        },

        include: {

          attempts: {

            include: {
              exam: true,
            },

          },

        },

      });


    if (!student) {

      return {
        message: 'Student not found',
      };

    }


    let weakSubject =
      'General';

    let lowestScore =
      999;


    student.attempts.forEach(
      (attempt: any) => {

        const score =
          Number(
            attempt.score ?? 0,
          );


        if (
          score < lowestScore
        ) {

          lowestScore =
            score;

          weakSubject =
            attempt.exam.title;

        }

      },
    );


    const practice = [

      {
        question:
          'Solve equation: 2x + 5 = 15',

        difficulty:
          'Easy',

        subject:
          weakSubject,
      },

      {
        question:
          'Calculate area of rectangle with length 8 and width 5',

        difficulty:
          'Easy',

        subject:
          weakSubject,
      },

      {
        question:
          'Find the value of x: 3x - 7 = 20',

        difficulty:
          'Medium',

        subject:
          weakSubject,
      },

      {
        question:
          'Solve: x² + 5x + 6 = 0',

        difficulty:
          'Hard',

        subject:
          weakSubject,
      },

    ];


    return {

      studentId:
        student.id,

      name:
        student.name,

      subject:
        weakSubject,

      level:
        lowestScore < 10
          ? 'Beginner'
          : lowestScore < 15
            ? 'Intermediate'
            : 'Advanced',

      practice,

    };

  }


  // =========================================================
  // تحلیل AI دانش‌آموز
  // =========================================================

  async aiAnalysis(
    studentId: number,
  ) {

    const student =
      await this.prisma.user.findUnique({

        where: {
          id: studentId,
        },

        include: {

          attempts: {

            include: {
              exam: true,
            },

          },

        },

      });


    if (!student) {

      return {
        message: 'Student not found',
      };

    }


    let totalScore = 0;

    let totalExam = 0;

    const subjects: any = {};


    student.attempts.forEach(
      (attempt: any) => {

        totalExam++;

        totalScore += Number(
          attempt.score ?? 0,
        );


        const subject =
          attempt.exam.title;


        if (!subjects[subject]) {

          subjects[subject] = {

            total: 0,

            count: 0,

          };

        }


        subjects[subject].total +=
          Number(
            attempt.score ?? 0,
          );

        subjects[subject].count++;

      },
    );


    const average =
      totalExam === 0
        ? 0
        : Math.round(
            totalScore /
            totalExam,
          );


    const weakTopics: any[] = [];

    const strongTopics: any[] = [];


    Object.keys(subjects)
      .forEach((subject) => {

        const score =
          Math.round(
            subjects[subject].total /
            subjects[subject].count,
          );


        if (score < 10) {

          weakTopics.push({

            topic:
              subject,

            score,

          });

        } else {

          strongTopics.push({

            topic:
              subject,

            score,

          });

        }

      });


    let level =
      'Beginner';


    if (average >= 15) {

      level =
        'Advanced';

    } else if (average >= 10) {

      level =
        'Intermediate';

    }


    const learningPlan = [

      'Review previous mistakes',

      'Practice weak subjects',

      'Complete daily exercises',

    ];


    if (
      weakTopics.length > 0
    ) {

      learningPlan.unshift(
        `Focus on ${weakTopics[0].topic}`,
      );

    }


    return {

      studentId:
        student.id,

      name:
        student.name,

      average,

      level,

      weakTopics,

      strongTopics,

      learningPlan,

    };

  }


  // =========================================================
  // تحلیل هوشمند کل کلاس
  // =========================================================

  async classAiAnalysis(
    classroomId: number,
  ) {

    const memberships =
      await this.prisma.classroomMembership.findMany({

        where: {

          classroomId,

          student: {
            role: 'STUDENT',
          },

        },

        include: {

          student: {

            include: {

              attempts: {

                include: {
                  exam: true,
                },

              },

            },

          },

        },

      });


    const legacyStudents =
      await this.prisma.user.findMany({

        where: {

          classroomId,

          role: 'STUDENT',

        },

        include: {

          attempts: {

            include: {
              exam: true,
            },

          },

        },

      });


    const studentsMap =
      new Map<number, any>();


    memberships.forEach(
      (membership: any) => {

        if (membership.student) {

          studentsMap.set(
            membership.student.id,
            membership.student,
          );

        }

      },
    );


    legacyStudents.forEach(
      (student: any) => {

        if (!studentsMap.has(student.id)) {

          studentsMap.set(
            student.id,
            student,
          );

        }

      },
    );


    const students =
      Array.from(
        studentsMap.values(),
      );


    if (students.length === 0) {

      return {

        classroomId,

        totalStudents: 0,

        classAverage: 0,

        weakStudents: [],

        strongStudents: [],

        commonWeakTopics: [],

        recommendations: [
          'هنوز دانش‌آموزی در این کلاس ثبت نشده است.',
        ],

      };

    }


    const studentAnalyses =
      students.map(
        (student: any) => {

          const attempts =
            student.attempts || [];


          const scores =
            attempts.map(
              (attempt: any) =>
                Number(
                  attempt.score ?? 0,
                ),
            );


          const total =
            scores.reduce(
              (
                sum: number,
                score: number,
              ) =>
                sum + score,
              0,
            );


          const average =
            scores.length > 0
              ? Math.round(
                  total /
                  scores.length,
                )
              : 0;


          const weakTopics =
            attempts
              .filter(
                (attempt: any) =>
                  Number(
                    attempt.score ?? 0,
                  ) < 10,
              )
              .map(
                (attempt: any) =>
                  attempt.exam?.title,
              )
              .filter(Boolean);


          const strongTopics =
            attempts
              .filter(
                (attempt: any) =>
                  Number(
                    attempt.score ?? 0,
                  ) >= 15,
              )
              .map(
                (attempt: any) =>
                  attempt.exam?.title,
              )
              .filter(Boolean);


          return {

            studentId:
              student.id,

            name:
              student.name,

            exams:
              attempts.length,

            average,

            weakTopics,

            strongTopics,

          };

        },
      );


    const classAverage =
      Math.round(
        studentAnalyses.reduce(
          (
            sum: number,
            student: any,
          ) =>
            sum + student.average,
          0,
        )
        /
        studentAnalyses.length,
      );


    const weakStudents =
      studentAnalyses
        .filter(
          (student: any) =>
            student.average < 10,
        )
        .sort(
          (
            a: any,
            b: any,
          ) =>
            a.average -
            b.average,
        );


    const strongStudents =
      studentAnalyses
        .filter(
          (student: any) =>
            student.average >= 15,
        )
        .sort(
          (
            a: any,
            b: any,
          ) =>
            b.average -
            a.average,
        );


    const topicScores: any = {};


    students.forEach(
      (student: any) => {

        (student.attempts || []).forEach(
          (attempt: any) => {

            const topic =
              attempt.exam?.title;


            if (!topic) {
              return;
            }


            if (!topicScores[topic]) {

              topicScores[topic] = {

                total: 0,

                count: 0,

              };

            }


            topicScores[topic].total +=
              Number(
                attempt.score ?? 0,
              );


            topicScores[topic].count++;

          },
        );

      },
    );


    const commonWeakTopics =
      Object.keys(topicScores)
        .map(
          (topic) => {

            const average =
              Math.round(
                topicScores[topic].total /
                topicScores[topic].count,
              );


            return {

              topic,

              average,

              attempts:
                topicScores[topic].count,

            };

          },
        )
        .filter(
          (item) =>
            item.average < 10,
        )
        .sort(
          (
            a,
            b,
          ) =>
            a.average -
            b.average,
        );


    const recommendations: string[] = [];


    if (classAverage < 10) {

      recommendations.push(
        'سطح کلی کلاس نیاز به تقویت مباحث پایه دارد.',
      );

    } else if (classAverage < 15) {

      recommendations.push(
        'برای کلاس تمرین‌های هدفمند و مرور اشتباهات پیشنهاد می‌شود.',
      );

    } else {

      recommendations.push(
        'کلاس عملکرد مناسبی دارد و می‌توان تمرین‌های چالشی‌تر ارائه کرد.',
      );

    }


    if (
      commonWeakTopics.length > 0
    ) {

      recommendations.push(
        `مرور مبحث «${commonWeakTopics[0].topic}» برای کل کلاس پیشنهاد می‌شود.`,
      );

    }


    if (
      weakStudents.length > 0
    ) {

      recommendations.push(
        `${weakStudents.length} دانش‌آموز نیازمند توجه و تمرین بیشتر هستند.`,
      );

    }


    return {

      classroomId,

      totalStudents:
        students.length,

      classAverage,

      weakStudents,

      strongStudents,

      commonWeakTopics,

      recommendations,

    };

  }


  // =========================================================
  // رتبه‌بندی نسخه قدیمی
  // =========================================================

  async ranking(
    classroomId: number,
  ) {

    const memberships =
      await this.prisma.classroomMembership.findMany({

        where: {

          classroomId,

          student: {
            role: 'STUDENT',
          },

        },

        include: {

          student: {
            include: {
              attempts: true,
            },
          },

        },

      });


    const legacyStudents =
      await this.prisma.user.findMany({

        where: {

          classroomId,

          role: 'STUDENT',

        },

        include: {

          attempts: true,

        },

      });


    const studentsMap =
      new Map<number, any>();


    memberships.forEach(
      (membership: any) => {

        if (membership.student) {

          studentsMap.set(
            membership.student.id,
            membership.student,
          );

        }

      },
    );


    legacyStudents.forEach(
      (student: any) => {

        if (!studentsMap.has(student.id)) {

          studentsMap.set(
            student.id,
            student,
          );

        }

      },
    );


    const students =
      Array.from(
        studentsMap.values(),
      );


    const ranking =
      students.map(
        (student: any) => {

          let total = 0;

          let count = 0;


          student.attempts.forEach(
            (attempt: any) => {

              total += Number(
                attempt.score ?? 0,
              );

              count++;

            },
          );


          return {

            studentId:
              student.id,

            name:
              student.name,

            exams:
              count,

            averageScore:
              count
                ? Math.round(
                    total /
                    count,
                  )
                : 0,

          };

        },
      );


    return ranking
      .sort(
        (
          a: any,
          b: any,
        ) =>
          b.averageScore -
          a.averageScore,
      )
      .map(
        (
          student: any,
          index: number,
        ) => ({

          rank:
            index + 1,

          ...student,

        }),
      );

  }


  // =========================================================
  // تولید تمرین پیشنهادی
  // =========================================================

  async practice(
    studentId: number,
  ) {

    const student =
      await this.prisma.user.findUnique({

        where: {

          id: studentId,

        },

        include: {

          attempts: {

            include: {
              exam: true,
            },

          },

        },

      });


    if (!student) {

      return {
        message: 'Student not found',
      };

    }


    let weakSubject =
      'General';


    if (
      student.attempts.length > 0
    ) {

      const weak =
        [...student.attempts]
          .sort(
            (
              a: any,
              b: any,
            ) =>
              Number(a.score) -
              Number(b.score),
          )[0];


      weakSubject =
        weak.exam.title;

    }


    return {

      studentId:
        student.id,

      name:
        student.name,

      subject:
        weakSubject,

      level:
        'Beginner',

      practice: [

        {
          question:
            'Solve equation: 2x + 5 = 15',

          difficulty:
            'Easy',

          subject:
            weakSubject,
        },

        {
          question:
            'Calculate area of rectangle',

          difficulty:
            'Easy',

          subject:
            weakSubject,
        },

        {
          question:
            'Find value of x: 3x - 7 = 20',

          difficulty:
            'Medium',

          subject:
            weakSubject,
        },

        {
          question:
            'Solve quadratic equation',

          difficulty:
            'Hard',

          subject:
            weakSubject,
        },

      ],

    };

  }


  // =========================================================
  // ساخت آزمون توسط معلم
  // Multi-Class + Legacy
  // =========================================================

  async createExam(
    data: {
      teacherId: number;

      // حالت قدیمی
      classroomId?: number;

      // حالت جدید Multi-Class
      classroomIds?: number[];

      title: string;

      description?: string;

      duration?: number;

      questionCount?: number;

      chapter?: string;

      difficulty?: number;
    },
  ) {

    // =======================================================
    // 1. بررسی معلم
    // =======================================================

    const teacher =
      await this.prisma.user.findUnique({

        where: {
          id: Number(
            data.teacherId,
          ),
        },

      });


    if (
      !teacher ||
      teacher.role !== 'TEACHER'
    ) {

      return {

        success: false,

        message:
          'Teacher not found',

      };

    }


    // =======================================================
    // 2. تعیین کلاس‌ها
    // =======================================================

    let classroomIds: number[] = [];


    // حالت جدید
    if (
      Array.isArray(
        data.classroomIds,
      )
    ) {

      classroomIds =
        data.classroomIds
          .map(
            (id) =>
              Number(id),
          )
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0,
          );

    }


    // حالت قدیمی
    if (
      classroomIds.length === 0 &&
      data.classroomId !==
        undefined &&
      data.classroomId !== null
    ) {

      const legacyClassroomId =
        Number(
          data.classroomId,
        );


      if (
        Number.isInteger(
          legacyClassroomId,
        ) &&
        legacyClassroomId > 0
      ) {

        classroomIds = [
          legacyClassroomId,
        ];

      }

    }


    // =======================================================
    // 3. حداقل یک کلاس لازم است
    // =======================================================

    if (
      classroomIds.length === 0
    ) {

      return {

        success: false,

        message:
          'At least one classroom must be selected',

      };

    }


    // =======================================================
    // 4. حذف کلاس‌های تکراری
    // =======================================================

    classroomIds =
      Array.from(
        new Set(
          classroomIds,
        ),
      );


    // =======================================================
    // 5. دریافت کلاس‌ها
    // =======================================================

    const classrooms =
      await this.prisma.classroom.findMany({

        where: {

          id: {
            in: classroomIds,
          },

        },

      });


    // =======================================================
    // 6. بررسی مالکیت کلاس‌ها
    // =======================================================

    const teacherClassrooms =
      classrooms.filter(
        (classroom: any) =>
          classroom.teacherId ===
          teacher.id,
      );


    if (
      teacherClassrooms.length !==
      classroomIds.length
    ) {

      const invalidClassroomIds =
        classroomIds.filter(
          (classroomId) =>
            !teacherClassrooms.some(
              (classroom: any) =>
                classroom.id ===
                classroomId,
            ),
        );


      return {

        success: false,

        message:
          'One or more classrooms do not belong to this teacher',

        invalidClassroomIds,

      };

    }


    // =======================================================
    // 7. تعداد سوالات
    // =======================================================

    const questionCount =
      Math.max(
        1,
        Math.min(
          Number(
            data.questionCount ??
            10,
          ),
          100,
        ),
      );


    // =======================================================
    // 8. مدت آزمون
    // =======================================================

    const duration =
      Math.max(
        1,
        Number(
          data.duration ??
          20,
        ),
      );


    // =======================================================
    // 9. فیلتر سوالات
    // =======================================================

    const where: any = {};


    if (
      data.chapter?.trim()
    ) {

      where.chapter =
        data.chapter.trim();

    }


    if (
      data.difficulty !==
        undefined &&
      data.difficulty !== null
    ) {

      where.difficulty =
        Number(
          data.difficulty,
        );

    }


    // =======================================================
    // 10. دریافت سوالات
    // =======================================================

    const availableQuestions =
      await this.prisma.question.findMany({

        where,

        orderBy: {
          id: 'desc',
        },

      });


    // =======================================================
    // 11. بررسی تعداد سوالات
    // =======================================================

    if (
      availableQuestions.length <
      questionCount
    ) {

      return {

        success: false,

        message:
          `Not enough questions. Requested ${questionCount}, but only ${availableQuestions.length} are available.`,

        availableQuestions:
          availableQuestions.length,

      };

    }


    // =======================================================
    // 12. انتخاب سوالات تصادفی
    // =======================================================

    const shuffledQuestions =
      [...availableQuestions]
        .sort(
          () =>
            Math.random() -
            0.5,
        );


    const selectedQuestions =
      shuffledQuestions.slice(
        0,
        questionCount,
      );


    const selectedQuestionIds =
      selectedQuestions.map(
        (question) =>
          question.id,
      );


    // =======================================================
    // 13. ساخت آزمون برای تمام کلاس‌ها
    //
    // مثال:
    //
    // classroomIds = [1, 2]
    //
    // نتیجه:
    //
    // Exam A → Classroom 1
    // Exam B → Classroom 2
    //
    // هر دو با همان سوالات
    // =======================================================

    const createdExams =
      await this.prisma.$transaction(
        async (tx) => {

          const exams: any[] = [];


          for (
            const classroom of teacherClassrooms
          ) {

            // -------------------------------------------------
            // ساخت آزمون
            // -------------------------------------------------

            const createdExam =
              await tx.exam.create({

                data: {

                  title:
                    String(
                      data.title ??
                      '',
                    ).trim() ||
                    'آزمون جدید',

                  description:
                    data.description?.trim() ||
                    null,

                  classroomId:
                    classroom.id,

                  duration,

                  status:
                    'PUBLISHED',

                },

              });


            // -------------------------------------------------
            // اتصال سوالات
            // -------------------------------------------------

            await tx.examQuestion.createMany({

              data:
                selectedQuestionIds.map(
                  (
                    questionId,
                  ) => ({

                    examId:
                      createdExam.id,

                    questionId,

                  }),
                ),

            });


            // -------------------------------------------------
            // دریافت آزمون کامل
            // -------------------------------------------------

            const completeExam =
              await tx.exam.findUnique({

                where: {

                  id:
                    createdExam.id,

                },

                include: {

                  questions: {

                    include: {
                      question: true,
                    },

                  },

                  classroom: true,

                },

              });


            exams.push(
              completeExam,
            );

          }


          return exams;

        },
      );


    // =======================================================
    // 14. نتیجه نهایی
    // =======================================================

    return {

      success: true,

      message:
        createdExams.length === 1
          ? 'Exam created successfully'
          : 'Multi-class exams created successfully',

      multiClass:
        createdExams.length > 1,

      classroomCount:
        createdExams.length,

      classroomIds:
        createdExams.map(
          (exam: any) =>
            exam.classroomId,
        ),

      examIds:
        createdExams.map(
          (exam: any) =>
            exam.id,
        ),

      exams:
        createdExams,

    };

  }

}
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable } from '@nestjs/common';
let TeachersService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TeachersService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TeachersService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        // داشبورد معلم
        async dashboard(teacherId) {
            const classrooms = await this.prisma.classroom.findMany({
                where: {
                    teacherId: teacherId
                },
                include: {
                    students: true,
                    exams: true
                }
            });
            const teacher = await this.prisma.user.findUnique({
                where: {
                    id: teacherId
                }
            });
            if (!teacher) {
                return {
                    message: "Teacher not found"
                };
            }
            return {
                teacherId: teacher.id,
                name: teacher.name,
                totalClasses: classrooms.length,
                totalStudents: classrooms.reduce((sum, c) => sum + c.students.length, 0),
                totalExams: classrooms.reduce((sum, c) => sum + c.exams.length, 0),
                classes: classrooms.map((c) => ({
                    id: c.id,
                    name: c.name,
                    students: c.students.length,
                    exams: c.exams.length
                }))
            };
        }
        // لیست دانش آموزان کلاس
        async getClassStudents(classroomId) {
            const students = await this.prisma.user.findMany({
                where: {
                    classroomId: classroomId,
                    role: "STUDENT"
                },
                include: {
                    attempts: true
                }
            });
            return students.map((student) => {
                let totalExams = student.attempts.length;
                let totalScore = 0;
                student.attempts.forEach((a) => {
                    totalScore += Number(a.score ?? 0);
                });
                return {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    totalExams,
                    average: totalExams > 0
                        ?
                            Math.round(totalScore / totalExams)
                        :
                            0
                };
            });
        }
        // نتایج آزمون های کلاس
        async getClassResults(classroomId) {
            const exams = await this.prisma.exam.findMany({
                where: {
                    classroomId: classroomId
                },
                include: {
                    attempts: true
                }
            });
            return exams.map((exam) => {
                const scores = exam.attempts.map((a) => Number(a.score ?? 0));
                const total = scores.reduce((a, b) => a + b, 0);
                return {
                    examId: exam.id,
                    examTitle: exam.title,
                    students: scores.length,
                    averageScore: scores.length
                        ?
                            Math.round(total / scores.length)
                        :
                            0,
                    highestScore: scores.length
                        ?
                            Math.max(...scores)
                        :
                            0,
                    lowestScore: scores.length
                        ?
                            Math.min(...scores)
                        :
                            0
                };
            });
        }
        // رتبه بندی دانش آموزان
        async getClassRanking(classroomId) {
            const students = await this.prisma.user.findMany({
                where: {
                    classroomId: classroomId,
                    role: "STUDENT"
                },
                include: {
                    attempts: true
                }
            });
            const ranking = students.map((student) => {
                let totalScore = 0;
                const exams = student.attempts.length;
                student.attempts.forEach((a) => {
                    totalScore += Number(a.score ?? 0);
                });
                return {
                    studentId: student.id,
                    name: student.name,
                    exams,
                    averageScore: exams > 0
                        ?
                            Math.round(totalScore / exams)
                        :
                            0
                };
            });
            ranking.sort((a, b) => b.averageScore - a.averageScore);
            return ranking.map((student, index) => ({
                rank: index + 1,
                ...student
            }));
        }
        // گزارش کامل دانش آموز
        async getStudentReport(studentId) {
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    attempts: true
                }
            });
            if (!student) {
                return {
                    message: "Student not found"
                };
            }
            const totalExams = student.attempts.length;
            let totalScore = 0;
            student.attempts.forEach((a) => {
                totalScore += Number(a.score ?? 0);
            });
            const averageScore = totalExams > 0
                ?
                    Math.round(totalScore / totalExams)
                :
                    0;
            return {
                studentId: student.id,
                name: student.name,
                totalExams,
                averageScore,
                correctAnswers: averageScore >= 50
                    ?
                        1
                    :
                        0,
                wrongAnswers: averageScore < 50
                    ?
                        1
                    :
                        0,
                strengths: averageScore >= 70
                    ?
                        ["Math"]
                    :
                        [],
                weaknesses: averageScore < 50
                    ?
                        ["Need more practice"]
                    :
                        [],
                recommendation: averageScore >= 70
                    ?
                        "Continue advanced exercises"
                    :
                        "Practice basic exercises"
            };
        }
        async studentAnalysis(studentId) {
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    attempts: {
                        include: {
                            exam: true
                        }
                    }
                }
            });
            if (!student) {
                return {
                    message: "Student not found"
                };
            }
            let totalScore = 0;
            let count = 0;
            const subjects = {};
            student.attempts.forEach((a) => {
                const score = a.score ?? 0;
                totalScore += score;
                count++;
                const subject = a.exam.title;
                if (!subjects[subject]) {
                    subjects[subject] = [];
                }
                subjects[subject].push(score);
            });
            const average = count === 0
                ?
                    0
                :
                    Math.round(totalScore / count);
            const weakSubjects = Object.keys(subjects)
                .filter(s => {
                const avg = subjects[s]
                    .reduce((a, b) => a + b, 0)
                    / subjects[s].length;
                return avg < 50;
            });
            const strongSubjects = Object.keys(subjects)
                .filter(s => {
                const avg = subjects[s]
                    .reduce((a, b) => a + b, 0)
                    / subjects[s].length;
                return avg >= 80;
            });
            let level = "Beginner";
            if (average >= 80)
                level = "Advanced";
            else if (average >= 50)
                level = "Intermediate";
            return {
                studentId: student.id,
                name: student.name,
                average,
                level,
                weakSubjects,
                strongSubjects,
                recommendations: weakSubjects.length > 0
                    ?
                        [
                            "Practice weak subjects",
                            "Complete 20 extra exercises",
                            "Review previous mistakes"
                        ]
                    :
                        [
                            "Continue advanced practice"
                        ]
            };
        }
        async studentPractice(studentId) {
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    attempts: {
                        include: {
                            exam: true
                        }
                    }
                }
            });
            if (!student) {
                return {
                    message: "Student not found"
                };
            }
            let weakSubject = "General";
            let lowestScore = 999;
            student.attempts.forEach((attempt) => {
                if (attempt.score < lowestScore) {
                    lowestScore = attempt.score;
                    weakSubject =
                        attempt.exam.title;
                }
            });
            const practice = [
                {
                    question: `Solve equation: 2x + 5 = 15`,
                    difficulty: "Easy",
                    subject: weakSubject
                },
                {
                    question: `Calculate area of rectangle with length 8 and width 5`,
                    difficulty: "Easy",
                    subject: weakSubject
                },
                {
                    question: `Find the value of x: 3x - 7 = 20`,
                    difficulty: "Medium",
                    subject: weakSubject
                },
                {
                    question: `Solve: x² + 5x + 6 = 0`,
                    difficulty: "Hard",
                    subject: weakSubject
                }
            ];
            return {
                studentId: student.id,
                name: student.name,
                subject: weakSubject,
                level: lowestScore < 10
                    ?
                        "Beginner"
                    :
                        lowestScore < 15
                            ?
                                "Intermediate"
                            :
                                "Advanced",
                practice
            };
        }
        async aiAnalysis(studentId) {
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    attempts: {
                        include: {
                            exam: true
                        }
                    }
                }
            });
            if (!student) {
                return {
                    message: "Student not found"
                };
            }
            let totalScore = 0;
            let totalExam = 0;
            const subjects = {};
            student.attempts.forEach((attempt) => {
                totalExam++;
                totalScore += Number(attempt.score);
                const subject = attempt.exam.title;
                if (!subjects[subject]) {
                    subjects[subject] = {
                        total: 0,
                        count: 0
                    };
                }
                subjects[subject].total +=
                    Number(attempt.score);
                subjects[subject].count++;
            });
            const average = totalExam === 0
                ?
                    0
                :
                    Math.round(totalScore / totalExam);
            const weakTopics = [];
            const strongTopics = [];
            Object.keys(subjects)
                .forEach((subject) => {
                const score = Math.round(subjects[subject].total /
                    subjects[subject].count);
                if (score < 10) {
                    weakTopics.push({
                        topic: subject,
                        score
                    });
                }
                else {
                    strongTopics.push({
                        topic: subject,
                        score
                    });
                }
            });
            let level = "Beginner";
            if (average >= 15) {
                level = "Advanced";
            }
            else if (average >= 10) {
                level = "Intermediate";
            }
            let learningPlan = [
                "Review previous mistakes",
                "Practice weak subjects",
                "Complete daily exercises"
            ];
            if (weakTopics.length > 0) {
                learningPlan.unshift(`Focus on ${weakTopics[0].topic}`);
            }
            return {
                studentId: student.id,
                name: student.name,
                average,
                level,
                weakTopics,
                strongTopics,
                learningPlan
            };
        }
        // رتبه بندی دانش آموزان کلاس
        async ranking(classroomId) {
            const students = await this.prisma.user.findMany({
                where: {
                    classroomId: classroomId,
                    role: "STUDENT"
                },
                include: {
                    attempts: true
                }
            });
            const ranking = students.map((student) => {
                let total = 0;
                let count = 0;
                student.attempts.forEach((a) => {
                    total += Number(a.score ?? 0);
                    count++;
                });
                return {
                    studentId: student.id,
                    name: student.name,
                    exams: count,
                    averageScore: count
                        ?
                            Math.round(total / count)
                        :
                            0
                };
            });
            return ranking
                .sort((a, b) => b.averageScore - a.averageScore)
                .map((student, index) => ({
                rank: index + 1,
                ...student
            }));
        }
        // تولید تمرین پیشنهادی
        async practice(studentId) {
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    attempts: {
                        include: {
                            exam: true
                        }
                    }
                }
            });
            if (!student) {
                return {
                    message: "Student not found"
                };
            }
            let weakSubject = "General";
            if (student.attempts.length > 0) {
                const weak = student.attempts
                    .sort((a, b) => Number(a.score) - Number(b.score))[0];
                weakSubject =
                    weak.exam.title;
            }
            return {
                studentId: student.id,
                name: student.name,
                subject: weakSubject,
                level: "Beginner",
                practice: [
                    {
                        question: "Solve equation: 2x + 5 = 15",
                        difficulty: "Easy",
                        subject: weakSubject
                    },
                    {
                        question: "Calculate area of rectangle",
                        difficulty: "Easy",
                        subject: weakSubject
                    },
                    {
                        question: "Find value of x: 3x - 7 = 20",
                        difficulty: "Medium",
                        subject: weakSubject
                    },
                    {
                        question: "Solve quadratic equation",
                        difficulty: "Hard",
                        subject: weakSubject
                    }
                ]
            };
        }
    };
    return TeachersService = _classThis;
})();
export { TeachersService };

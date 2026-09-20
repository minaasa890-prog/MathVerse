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
let StudentsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var StudentsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            StudentsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        generator;
        constructor(prisma, generator) {
            this.prisma = prisma;
            this.generator = generator;
        }
        // ================= STUDENT DASHBOARD =================
        async dashboard(studentId) {
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    classroom: true,
                    attempts: {
                        include: {
                            exam: true,
                            question: true
                        }
                    },
                    lessonProgress: {
                        include: {
                            lesson: true
                        }
                    }
                }
            });
            if (!student) {
                return {
                    message: "Student not found"
                };
            }
            // ================= XP SYSTEM =================
            const xp = student.xp || 0;
            const level = student.level || 1;
            const nextLevelXp = level * 1000;
            const progressPercent = Math.min(Math.round((xp / nextLevelXp) * 100), 100);
            // ================= EXAM STATS =================
            const totalExams = student.attempts.length;
            const averageScore = totalExams > 0
                ?
                    Math.round(student.attempts.reduce((sum, a) => sum + a.score, 0)
                        / totalExams)
                :
                    0;
            // ================= LESSON PROGRESS =================
            const totalLessons = student.lessonProgress.length;
            const completedLessons = student.lessonProgress.filter((item) => item.completed).length;
            const averageLessonProgress = totalLessons === 0
                ?
                    0
                :
                    Math.round(student.lessonProgress.reduce((sum, item) => sum + item.progress, 0)
                        / totalLessons);
            // ================= SUBJECT PERFORMANCE =================
            const subjects = {};
            student.attempts.forEach((a) => {
                const subject = a.question?.subject || "Math";
                if (!subjects[subject]) {
                    subjects[subject] = {
                        total: 0,
                        score: 0
                    };
                }
                subjects[subject].total++;
                subjects[subject].score += a.score;
            });
            const performance = Object.keys(subjects).map((key) => ({
                subject: key,
                score: Math.round(subjects[key].score /
                    subjects[key].total)
            }));
            // ================= WEAK AREAS =================
            const weak = [];
            student.attempts.forEach((a) => {
                if (a.score < 50) {
                    weak.push(a.question?.chapter ||
                        a.question?.subject ||
                        "General");
                }
            });
            const weakAreas = [...new Set(weak)];
            // ================= RECENT ACTIVITY =================
            const recentActivity = student.attempts
                .slice(-5)
                .reverse()
                .map((a) => ({
                type: "EXAM",
                title: a.exam?.title || "Exam",
                score: a.score,
                date: a.createdAt
            }));
            // ================= AI MESSAGE =================
            let aiMessage = "";
            if (averageScore < 50) {
                aiMessage =
                    "نیاز به مرور مباحث پایه دارید";
            }
            else if (averageScore < 80) {
                aiMessage =
                    "عملکرد متوسط است. تمرین بیشتر باعث رشد سریع می‌شود";
            }
            else {
                aiMessage =
                    "عملکرد عالی است. آماده مباحث پیشرفته هستید";
            }
            // ================= FINAL RESPONSE =================
            return {
                profile: {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    xp,
                    level,
                    nextLevelXp,
                    progressPercent
                },
                classroom: student.classroom
                    ?
                        {
                            id: student.classroom.id,
                            name: student.classroom.name
                        }
                    :
                        null,
                progress: {
                    totalExams,
                    averageScore,
                    completedLessons,
                    totalLessons,
                    lessonProgress: averageLessonProgress,
                    rank: null
                },
                performance,
                weakAreas,
                lessonProgress: student.lessonProgress.map((item) => ({
                    id: item.id,
                    lessonId: item.lessonId,
                    completed: item.completed,
                    progress: item.progress,
                    lesson: item.lesson
                })),
                recommendations: [
                    aiMessage,
                    "تمرین روزانه حداقل 30 دقیقه"
                ],
                recentActivity
            };
        }
        // ================= AI TUTOR =================
        async aiTutor(studentId) {
            const dashboard = await this.dashboard(studentId);
            if (dashboard.message) {
                return dashboard;
            }
            return {
                studentId,
                name: dashboard.profile.name,
                level: dashboard.profile.level,
                averageScore: dashboard.progress.averageScore,
                weakAreas: dashboard.weakAreas,
                AI_Tutor: {
                    status: "ACTIVE",
                    recommendations: dashboard.recommendations
                }
            };
        }
        // ================= GENERATE PRACTICE =================
        async generatePractice(studentId) {
            const analysis = await this.aiTutor(studentId);
            if (!analysis.AI_Tutor) {
                return {
                    message: "No AI analysis"
                };
            }
            const subject = analysis.weakAreas.length
                ?
                    analysis.weakAreas[0]
                :
                    "Math";
            return this.generator.generate(subject, analysis.level);
        }
        // ================= STUDENT LESSONS =================
        async lessons(studentId) {
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    classroom: true
                }
            });
            if (!student) {
                return {
                    message: "Student not found"
                };
            }
            if (!student.classroomId) {
                return {
                    message: "Student has no classroom"
                };
            }
            const lessons = await this.prisma.lesson.findMany({
                include: {
                    chapter: true,
                    contents: true
                }
            });
            return {
                student: {
                    id: student.id,
                    name: student.name
                },
                classroom: {
                    id: student.classroom?.id,
                    name: student.classroom?.name
                },
                lessons
            };
        }
        // ================= LEARNING DASHBOARD =================
        async getDashboard(studentId) {
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    lessonProgress: {
                        include: {
                            lesson: true
                        }
                    }
                }
            });
            if (!student) {
                throw new Error("Student not found");
            }
            const totalLessons = student.lessonProgress.length;
            const completedLessons = student.lessonProgress.filter((item) => item.completed).length;
            const averageProgress = totalLessons === 0
                ?
                    0
                :
                    Math.round(student.lessonProgress.reduce((sum, item) => sum + item.progress, 0)
                        / totalLessons);
            const lastLesson = totalLessons > 0
                ?
                    student.lessonProgress[totalLessons - 1].lesson.title
                :
                    null;
            return {
                student: {
                    id: student.id,
                    name: student.name
                },
                progress: {
                    overall: averageProgress,
                    lessonsCompleted: completedLessons,
                    totalLessons,
                    averageProgress
                },
                learning: {
                    lastLesson
                },
                message: "Dashboard generated successfully"
            };
        }
    };
    return StudentsService = _classThis;
})();
export { StudentsService };

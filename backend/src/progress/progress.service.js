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
let ProgressService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProgressService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProgressService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        // =====================================================
        // CREATE / UPDATE LESSON PROGRESS
        // =====================================================
        async createLessonProgress(body) {
            const { studentId, lessonId, progress, completed } = body;
            const result = await this.prisma.lessonProgress.upsert({
                where: {
                    studentId_lessonId: {
                        studentId,
                        lessonId
                    }
                },
                update: {
                    progress,
                    completed
                },
                create: {
                    studentId,
                    lessonId,
                    progress: progress ?? 0,
                    completed: completed ?? false
                }
            });
            return {
                message: "Lesson progress saved",
                data: result
            };
        }
        // =====================================================
        // GET SINGLE LESSON PROGRESS
        // =====================================================
        async getLessonProgress(studentId, lessonId) {
            const progress = await this.prisma.lessonProgress.findUnique({
                where: {
                    studentId_lessonId: {
                        studentId,
                        lessonId
                    }
                },
                include: {
                    lesson: true
                }
            });
            return progress || {
                studentId,
                lessonId,
                progress: 0,
                completed: false
            };
        }
        // =====================================================
        // COMPLETE LESSON + XP REWARD
        // =====================================================
        async completeLesson(studentId, lessonId) {
            const oldProgress = await this.prisma.lessonProgress.findUnique({
                where: {
                    studentId_lessonId: {
                        studentId,
                        lessonId
                    }
                }
            });
            // اگر قبلا کامل شده بود XP نده
            if (oldProgress?.completed) {
                return {
                    message: "Lesson already completed",
                    lessonProgress: oldProgress,
                    reward: {
                        xp: 0,
                        message: "XP already received"
                    }
                };
            }
            const lessonProgress = await this.prisma.lessonProgress.upsert({
                where: {
                    studentId_lessonId: {
                        studentId,
                        lessonId
                    }
                },
                update: {
                    completed: true,
                    progress: 100
                },
                create: {
                    studentId,
                    lessonId,
                    completed: true,
                    progress: 100
                }
            });
            // اضافه کردن XP
            const student = await this.prisma.user.update({
                where: {
                    id: studentId
                },
                data: {
                    xp: {
                        increment: 100
                    }
                }
            });
            const level = this.calculateLevel(student.xp);
            await this.prisma.user.update({
                where: {
                    id: studentId
                },
                data: {
                    level
                }
            });
            return {
                message: "Lesson completed successfully",
                lessonProgress,
                reward: {
                    xp: 100,
                    totalXp: student.xp,
                    level
                }
            };
        }
        // =====================================================
        // LEVEL SYSTEM
        // =====================================================
        calculateLevel(xp) {
            if (xp >= 10000)
                return 10;
            if (xp >= 5000)
                return 5;
            if (xp >= 3000)
                return 4;
            if (xp >= 2000)
                return 3;
            if (xp >= 1000)
                return 2;
            return 1;
        }
        // =====================================================
        // GET STUDENT ALL PROGRESS
        // =====================================================
        async getStudentProgress(studentId) {
            const lessons = await this.prisma.lessonProgress.findMany({
                where: {
                    studentId
                },
                include: {
                    lesson: {
                        include: {
                            chapter: true
                        }
                    }
                }
            });
            const totalLessons = lessons.length;
            const completedLessons = lessons.filter((item) => item.completed).length;
            const averageProgress = totalLessons === 0
                ?
                    0
                :
                    Math.round(lessons.reduce((sum, item) => sum + item.progress, 0)
                        /
                            totalLessons);
            return {
                studentId,
                totalLessons,
                completedLessons,
                averageProgress,
                lessons
            };
        }
        // =====================================================
        // GET COMPLETED LESSONS COUNT
        // =====================================================
        async getCompletedLessons(studentId) {
            const count = await this.prisma.lessonProgress.count({
                where: {
                    studentId,
                    completed: true
                }
            });
            return {
                studentId,
                completedLessons: count
            };
        }
        // =====================================================
        // RESET LESSON PROGRESS
        // =====================================================
        async resetLessonProgress(studentId, lessonId) {
            const result = await this.prisma.lessonProgress.update({
                where: {
                    studentId_lessonId: {
                        studentId,
                        lessonId
                    }
                },
                data: {
                    progress: 0,
                    completed: false
                }
            });
            return {
                message: "Lesson progress reset",
                data: result
            };
        }
        // =====================================================
        // GET LEARNING SUMMARY
        // =====================================================
        async getLearningSummary(studentId) {
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
                return {
                    message: "Student not found"
                };
            }
            const total = student.lessonProgress.length;
            const completed = student.lessonProgress.filter((item) => item.completed).length;
            return {
                student: {
                    id: student.id,
                    name: student.name,
                    xp: student.xp,
                    level: student.level
                },
                learning: {
                    totalLessons: total,
                    completedLessons: completed,
                    completionRate: total === 0
                        ?
                            0
                        :
                            Math.round((completed / total) * 100)
                }
            };
        }
    };
    return ProgressService = _classThis;
})();
export { ProgressService };

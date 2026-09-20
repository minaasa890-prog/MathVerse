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
let AdaptiveLearningService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdaptiveLearningService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdaptiveLearningService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        // =====================================
        // GENERATE AI LEARNING PLAN V3
        // =====================================
        async generatePlan(studentId) {
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    lessonProgress: {
                        include: {
                            lesson: {
                                include: {
                                    chapter: true
                                }
                            }
                        }
                    },
                    attempts: {
                        include: {
                            question: true
                        }
                    },
                    studentSkills: true
                }
            });
            if (!student) {
                return {
                    message: "Student not found"
                };
            }
            // ===============================
            // WEAK LESSON ANALYSIS
            // ===============================
            const weakLessons = [];
            student.lessonProgress.forEach((item) => {
                if (item.progress < 70) {
                    weakLessons.push({
                        lesson: item.lesson.title,
                        chapter: item.lesson.chapter?.title,
                        progress: item.progress
                    });
                }
            });
            // ===============================
            // SKILL ANALYSIS
            // ===============================
            const skills = {};
            student.studentSkills.forEach((skill) => {
                let level = "BEGINNER";
                if (skill.masteryScore >= 80) {
                    level = "EXCELLENT";
                }
                else if (skill.masteryScore >= 50) {
                    level = "GOOD";
                }
                skills[skill.chapter] = {
                    mastery: skill.masteryScore,
                    correct: skill.correctCount,
                    wrong: skill.wrongCount,
                    level
                };
            });
            // ===============================
            // SUBJECT ANALYSIS
            // ===============================
            const subjects = {};
            student.attempts.forEach((attempt) => {
                const subject = attempt.question?.subject || "Math";
                if (!subjects[subject]) {
                    subjects[subject] = {
                        total: 0,
                        score: 0
                    };
                }
                subjects[subject].total++;
                subjects[subject].score += attempt.score;
            });
            // ===============================
            // AI DECISION ENGINE
            // ===============================
            const aiDecision = {
                currentLevel: "BEGINNER",
                nextAction: "PRACTICE",
                recommendedDifficulty: 1,
                message: "Start basic practice"
            };
            const skillNames = Object.keys(skills);
            if (skillNames.length > 0) {
                const firstSkill = skills[skillNames[0]];
                if (firstSkill.mastery >= 80) {
                    aiDecision.currentLevel = "ADVANCED";
                    aiDecision.nextAction = "HARDER_PRACTICE";
                    aiDecision.recommendedDifficulty = 3;
                    aiDecision.message =
                        "Student is ready for advanced questions";
                }
                else if (firstSkill.mastery >= 50) {
                    aiDecision.currentLevel = "INTERMEDIATE";
                    aiDecision.nextAction = "MORE_PRACTICE";
                    aiDecision.recommendedDifficulty = 2;
                    aiDecision.message =
                        "Student needs more practice";
                }
                else {
                    aiDecision.currentLevel = "BEGINNER";
                    aiDecision.nextAction = "REVIEW_WEAK_TOPIC";
                    aiDecision.recommendedDifficulty = 1;
                    aiDecision.message =
                        "Review weak concepts";
                }
            }
            // ===============================
            // FINAL LEARNING PLAN
            // ===============================
            const recommendations = [];
            if (weakLessons.length > 0) {
                recommendations.push({
                    type: "LESSON_REVIEW",
                    message: "مرور درس‌های ضعیف",
                    lessons: weakLessons
                });
            }
            recommendations.push({
                type: "SMART_PRACTICE",
                message: "تمرین هوشمند بر اساس سطح دانش‌آموز",
                difficulty: aiDecision.recommendedDifficulty,
                questions: 10
            });
            return {
                student: {
                    id: student.id,
                    name: student.name,
                    level: student.level,
                    xp: student.xp
                },
                analysis: {
                    weakLessons,
                    skills,
                    subjects,
                    aiDecision
                },
                learningPlan: {
                    recommendations
                }
            };
        }
        // =====================================
        // NEXT LESSON
        // =====================================
        async nextLesson(studentId) {
            const progress = await this.prisma.lessonProgress.findMany({
                where: {
                    studentId
                },
                include: {
                    lesson: true
                }
            });
            const unfinished = progress.find((item) => !item.completed);
            if (!unfinished) {
                return {
                    message: "All lessons completed"
                };
            }
            return {
                nextLesson: {
                    id: unfinished.lesson.id,
                    title: unfinished.lesson.title,
                    progress: unfinished.progress
                }
            };
        }
        // Controller compatibility
        async createPlan(studentId) {
            return this.generatePlan(studentId);
        }
    };
    return AdaptiveLearningService = _classThis;
})();
export { AdaptiveLearningService };

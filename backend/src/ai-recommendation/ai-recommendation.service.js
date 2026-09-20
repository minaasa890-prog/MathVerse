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
let AiRecommendationService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AiRecommendationService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AiRecommendationService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async getRecommendation(studentId) {
            const attempts = await this.prisma.attempt.findMany({
                where: {
                    studentId
                },
                include: {
                    question: true
                }
            });
            const total = attempts.length;
            const correct = attempts.filter(item => item.isCorrect).length;
            let accuracy = 0;
            if (total > 0) {
                accuracy = Math.round((correct / total) * 100);
            }
            let level = "Beginner";
            if (accuracy >= 80) {
                level = "Advanced";
            }
            else if (accuracy >= 50) {
                level = "Intermediate";
            }
            // ============================
            // Topic Analysis
            // ============================
            const topicMap = {};
            for (const item of attempts) {
                const topic = item.question.chapter || "General";
                if (!topicMap[topic]) {
                    topicMap[topic] = {
                        total: 0,
                        correct: 0
                    };
                }
                topicMap[topic].total++;
                if (item.isCorrect) {
                    topicMap[topic].correct++;
                }
            }
            const strongTopics = [];
            const weakTopics = [];
            Object.keys(topicMap).forEach(topic => {
                const data = topicMap[topic];
                const topicAccuracy = Math.round((data.correct / data.total) * 100);
                if (topicAccuracy >= 80) {
                    strongTopics.push({
                        topic,
                        accuracy: topicAccuracy
                    });
                }
                else if (topicAccuracy < 50) {
                    weakTopics.push({
                        topic,
                        accuracy: topicAccuracy
                    });
                }
            });
            // ============================
            // AI Lesson Recommendation
            // ============================
            const recommendedLessons = [];
            for (const weak of weakTopics) {
                let lessons = await this.prisma.lesson.findMany({
                    where: {
                        chapter: {
                            title: {
                                contains: weak.topic,
                                mode: "insensitive"
                            }
                        }
                    },
                    include: {
                        chapter: true,
                        contents: true
                    },
                    take: 3
                });
                // اگر درس مرتبط نبود
                // درس های پایه پیشنهاد بده
                if (lessons.length === 0) {
                    lessons = await this.prisma.lesson.findMany({
                        include: {
                            chapter: true,
                            contents: true
                        },
                        orderBy: {
                            id: "asc"
                        },
                        take: 3
                    });
                }
                recommendedLessons.push(...lessons);
            }
            // ============================
            // Next Topics
            // ============================
            let nextTopics = [];
            if (level === "Advanced") {
                nextTopics = [
                    "Advanced Problems",
                    "Challenge Exercises"
                ];
            }
            else if (level === "Intermediate") {
                nextTopics = [
                    "Practice mistakes",
                    "Mixed exercises"
                ];
            }
            else {
                nextTopics = [
                    "Basic concepts",
                    "Simple exercises"
                ];
            }
            // ============================
            // Daily AI Plan
            // ============================
            const dailyPlan = [
                {
                    day: 1,
                    task: "Practice recommended topics",
                    duration: "30 minutes"
                },
                {
                    day: 2,
                    task: "AI generated exercises",
                    duration: "45 minutes"
                },
                {
                    day: 3,
                    task: "Adaptive exam",
                    duration: "30 minutes"
                }
            ];
            return {
                studentId,
                accuracy,
                level,
                strongTopics,
                weakTopics,
                recommendedLessons,
                nextTopics,
                dailyPlan,
                message: "AI adaptive recommendation generated"
            };
        }
    };
    return AiRecommendationService = _classThis;
})();
export { AiRecommendationService };

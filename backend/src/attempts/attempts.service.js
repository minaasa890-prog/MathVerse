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
let AttemptsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AttemptsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AttemptsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        rewardsService;
        constructor(prisma, rewardsService) {
            this.prisma = prisma;
            this.rewardsService = rewardsService;
        }
        // ثبت پاسخ سوال
        async submitAnswer(data) {
            const question = await this.prisma.question.findUnique({
                where: {
                    id: data.questionId,
                },
            });
            if (!question) {
                throw new Error("Question not found");
            }
            const correct = String(question.correctAnswer)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '');
            const userAnswer = String(data.answer)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '');
            const isCorrect = correct === userAnswer;
            if (isCorrect) {
                await this.rewardsService.addXP(data.studentId, 10);
            }
            const existingAttempt = await this.prisma.attempt.findUnique({
                where: {
                    studentId_questionId_examId: {
                        studentId: data.studentId,
                        questionId: data.questionId,
                        examId: data.examId,
                    },
                },
            });
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
                            score: isCorrect
                                ? question.score
                                : 0,
                            timeSpent: data.timeSpent,
                        },
                    });
            }
            else {
                attempt =
                    await this.prisma.attempt.create({
                        data: {
                            studentId: data.studentId,
                            questionId: data.questionId,
                            examId: data.examId,
                            answer: data.answer,
                            isCorrect,
                            score: isCorrect
                                ? question.score
                                : 0,
                            timeSpent: data.timeSpent,
                        },
                    });
            }
            return {
                message: isCorrect
                    ? "پاسخ درست است"
                    : "پاسخ اشتباه است",
                isCorrect,
                score: isCorrect
                    ? question.score
                    : 0,
                attempt,
            };
        }
        // جواب های دانش آموز در آزمون
        async getStudentExamAttempts(studentId, examId) {
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
        async getExamResult(studentId, examId) {
            const attempts = await this.prisma.attempt.findMany({
                where: {
                    studentId,
                    examId,
                },
            });
            const score = attempts.reduce((sum, a) => sum + a.score, 0);
            const correct = attempts.filter(a => a.isCorrect).length;
            return {
                studentId,
                examId,
                totalQuestions: attempts.length,
                correctAnswers: correct,
                score,
            };
        }
        // نتیجه هوشمند + AI Report
        async getStudentExamResult(studentId, examId) {
            const attempts = await this.prisma.attempt.findMany({
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
                throw new Error("No attempts found");
            }
            let correct = 0;
            let wrong = 0;
            let score = 0;
            const weakTopics = [];
            const strongTopics = [];
            for (const item of attempts) {
                score += item.score;
                const topic = item.question.subject ||
                    "Math";
                if (item.isCorrect) {
                    correct++;
                    strongTopics.push({
                        topic,
                        question: item.question.title,
                    });
                }
                else {
                    wrong++;
                    weakTopics.push({
                        topic,
                        question: item.question.title,
                    });
                }
            }
            const percentage = Math.round((correct / attempts.length) * 100);
            let level = "Beginner";
            if (percentage >= 80) {
                level = "Advanced";
            }
            else if (percentage >= 50) {
                level = "Intermediate";
            }
            return {
                studentId,
                examId,
                examTitle: attempts[0].exam.title,
                totalQuestions: attempts.length,
                correctAnswers: correct,
                wrongAnswers: wrong,
                score,
                percentage,
                level,
                weakTopics,
                strongTopics,
                AI_Report: {
                    summary: percentage >= 80
                        ?
                            "Excellent performance"
                        :
                            percentage >= 50
                                ?
                                    "Good performance"
                                :
                                    "Needs improvement",
                    recommendations: percentage < 50
                        ?
                            [
                                "Review basic concepts",
                                "Practice weak topics",
                                "Solve similar questions"
                            ]
                        :
                            [
                                "Continue practice",
                                "Try harder questions"
                            ]
                }
            };
        }
        async getClassExamResults(classroomId, examId) {
            return {
                classroomId,
                examId,
                message: "Class results ready"
            };
        }
        async getExamStatistics(examId) {
            const attempts = await this.prisma.attempt.findMany({
                where: {
                    examId
                }
            });
            return {
                examId,
                totalAttempts: attempts.length,
                correct: attempts.filter(a => a.isCorrect).length,
                wrong: attempts.filter(a => !a.isCorrect).length,
            };
        }
        async getQuestionsAnalysis(examId) {
            return {
                examId,
                message: "Question analysis ready"
            };
        }
        async getStudentAnalysis(studentId) {
            return {
                studentId,
                message: "AI analysis ready"
            };
        }
        async getStudentRecommendations(studentId) {
            return {
                studentId,
                recommendations: [
                    "Practice more questions",
                    "Review weak subjects"
                ]
            };
        }
    };
    return AttemptsService = _classThis;
})();
export { AttemptsService };

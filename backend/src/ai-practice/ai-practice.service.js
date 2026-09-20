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
let AiPracticeService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AiPracticeService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AiPracticeService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        rewardsService;
        aiQuestionService;
        constructor(prisma, rewardsService, aiQuestionService) {
            this.prisma = prisma;
            this.rewardsService = rewardsService;
            this.aiQuestionService = aiQuestionService;
        }
        async generateSmartPractice(studentId) {
            const result = await this.aiQuestionService.generateQuestions({
                subject: "Math",
                chapter: "Fractions",
                count: 5,
                difficulty: 1,
            });
            return {
                studentId,
                message: "Smart AI Practice generated",
                questions: result.questions
            };
        }
        async submitAnswer(data) {
            return {
                message: "Answer submitted",
                data
            };
        }
        async startAiSession(studentId, subject, chapter, count = 5, difficulty = 1) {
            const result = await this.aiQuestionService.generateQuestions({
                subject,
                chapter,
                count,
                difficulty
            });
            const session = await this.prisma.practiceSession.create({
                data: {
                    studentId,
                    subject,
                    chapter,
                    difficulty,
                    totalQuestions: result.questions.length
                }
            });
            return {
                message: "AI Practice session started",
                sessionId: session.id,
                studentId,
                subject,
                chapter,
                difficulty,
                count: result.questions.length,
                questions: result.questions
            };
        }
        async submitSessionAnswer(data) {
            const { sessionId, questionId, answer } = data;
            const question = await this.prisma.question.findUnique({
                where: {
                    id: questionId
                }
            });
            if (!question) {
                throw new Error("Question not found");
            }
            const correct = question.correctAnswer === answer;
            const existingAnswer = await this.prisma.practiceAnswer.findFirst({
                where: {
                    sessionId,
                    questionId
                }
            });
            if (existingAnswer) {
                await this.prisma.practiceAnswer.update({
                    where: {
                        id: existingAnswer.id
                    },
                    data: {
                        answer,
                        correct
                    }
                });
            }
            else {
                await this.prisma.practiceAnswer.create({
                    data: {
                        sessionId,
                        questionId,
                        answer,
                        correct
                    }
                });
            }
            await this.prisma.practiceSession.update({
                where: {
                    id: sessionId
                },
                data: {
                    answeredQuestions: {
                        increment: 1
                    },
                    correctAnswers: {
                        increment: correct ? 1 : 0
                    },
                    wrongAnswers: {
                        increment: correct ? 0 : 1
                    },
                    totalScore: {
                        increment: correct ? question.score : 0
                    }
                }
            });
            return {
                message: "Session answer submitted",
                correct,
                questionId,
                answer
            };
        }
        async getSessionResult(id) {
            const session = await this.prisma.practiceSession.findUnique({
                where: {
                    id
                },
                include: {
                    answers: {
                        include: {
                            question: true
                        }
                    }
                }
            });
            if (!session) {
                throw new Error("Session not found");
            }
            const percent = session.totalQuestions === 0
                ?
                    0
                :
                    Math.round(session.correctAnswers /
                        session.totalQuestions *
                        100);
            return {
                sessionId: id,
                totalQuestions: session.totalQuestions,
                answered: session.answeredQuestions,
                correct: session.correctAnswers,
                wrong: session.wrongAnswers,
                score: session.totalScore,
                percentage: percent,
                answers: session.answers
            };
        }
    };
    return AiPracticeService = _classThis;
})();
export { AiPracticeService };

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
let ExamsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ExamsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ExamsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async create(data) {
            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error('Questions list is required');
            }
            const exam = await this.prisma.exam.create({
                data: {
                    title: data.title,
                    description: data.description,
                    duration: data.duration,
                    classroom: {
                        connect: {
                            id: data.classroomId
                        }
                    },
                    questions: {
                        create: data.questions.map((item) => ({
                            question: {
                                connect: {
                                    id: item.questionId
                                }
                            }
                        }))
                    }
                },
                include: {
                    questions: {
                        include: {
                            question: true
                        }
                    }
                }
            });
            return {
                message: "Exam created successfully",
                exam
            };
        }
        async findByClassroom(classroomId) {
            return this.prisma.exam.findMany({
                where: {
                    classroomId
                },
                include: {
                    questions: {
                        include: {
                            question: {
                                select: {
                                    id: true,
                                    title: true,
                                    description: true,
                                    subject: true,
                                    chapter: true,
                                    difficulty: true,
                                    optionA: true,
                                    optionB: true,
                                    optionC: true,
                                    optionD: true
                                }
                            }
                        }
                    }
                }
            });
        }
        async startExam(examId, studentId) {
            const exam = await this.prisma.exam.findUnique({
                where: {
                    id: examId
                },
                include: {
                    questions: {
                        include: {
                            question: true
                        }
                    }
                }
            });
            if (!exam) {
                throw new Error("Exam not found");
            }
            const oldSession = await this.prisma.examSession.findFirst({
                where: {
                    studentId,
                    examId,
                    status: "STARTED"
                }
            });
            let session;
            if (oldSession) {
                session = oldSession;
            }
            else {
                const endTime = new Date(Date.now() + exam.duration * 60000);
                session =
                    await this.prisma.examSession.create({
                        data: {
                            studentId,
                            examId,
                            endTime,
                            status: "STARTED"
                        }
                    });
            }
            const questions = exam.questions.map(item => ({
                id: item.question.id,
                title: item.question.title,
                description: item.question.description,
                subject: item.question.subject,
                chapter: item.question.chapter,
                difficulty: item.question.difficulty,
                optionA: item.question.optionA,
                optionB: item.question.optionB,
                optionC: item.question.optionC,
                optionD: item.question.optionD
            }));
            return {
                studentId,
                examId,
                title: exam.title,
                duration: exam.duration,
                startTime: session.startTime,
                endTime: session.endTime,
                totalQuestions: questions.length,
                questions,
                message: "Exam started successfully"
            };
        }
        async submitExam(examId, data) {
            const studentId = data.studentId;
            let totalScore = 0;
            let correctCount = 0;
            for (const item of data.answers) {
                const question = await this.prisma.question.findUnique({
                    where: {
                        id: item.questionId
                    }
                });
                if (!question) {
                    continue;
                }
                const isCorrect = String(question.correctAnswer)
                    .trim()
                    .toLowerCase()
                    ===
                        String(item.answer)
                            .trim()
                            .toLowerCase();
                const score = isCorrect
                    ? question.score
                    : 0;
                if (isCorrect) {
                    totalScore += score;
                    correctCount++;
                }
                await this.prisma.attempt.upsert({
                    where: {
                        studentId_questionId_examId: {
                            studentId,
                            questionId: item.questionId,
                            examId
                        }
                    },
                    update: {
                        answer: item.answer,
                        isCorrect,
                        score
                    },
                    create: {
                        studentId,
                        questionId: item.questionId,
                        examId,
                        answer: item.answer,
                        isCorrect,
                        score
                    }
                });
            }
            const xpEarned = correctCount * 10;
            const student = await this.prisma.user.update({
                where: {
                    id: studentId
                },
                data: {
                    xp: {
                        increment: xpEarned
                    }
                }
            });
            const newLevel = Math.floor(student.xp / 100) + 1;
            await this.prisma.user.update({
                where: {
                    id: studentId
                },
                data: {
                    level: newLevel
                }
            });
            return {
                message: "Exam submitted successfully",
                examId,
                studentId,
                totalScore,
                correctAnswers: correctCount,
                xpEarned,
                newLevel
            };
        }
    };
    return ExamsService = _classThis;
})();
export { ExamsService };

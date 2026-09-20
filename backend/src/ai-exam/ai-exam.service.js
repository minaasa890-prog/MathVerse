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
let AiExamService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AiExamService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AiExamService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async generate(data) {
            const subject = data.subject || "Math";
            const chapter = data.chapter || "General";
            const difficulty = data.difficulty || 1;
            const count = data.count || 5;
            const questions = [];
            for (let i = 1; i <= count; i++) {
                const number1 = Math.floor(Math.random() * 20) + 1;
                const number2 = Math.floor(Math.random() * 20) + 1;
                const answer = number1 + number2;
                const question = await this.prisma.question.create({
                    data: {
                        title: `حاصل ${number1} + ${number2} چند است؟`,
                        description: "سوال تولید شده توسط AI Exam Generator",
                        subject,
                        chapter,
                        difficulty,
                        creatorId: data.teacherId || 1,
                        correctAnswer: String(answer),
                        optionA: String(answer - 2),
                        optionB: String(answer),
                        optionC: String(answer + 2),
                        optionD: String(answer + 5),
                        score: 10
                    }
                });
                questions.push(question);
            }
            return {
                questions
            };
        }
        async generateExam(data) {
            const generated = await this.generate(data);
            const exam = await this.prisma.exam.create({
                data: {
                    title: data.title || "AI Generated Exam",
                    description: "Generated automatically by AI",
                    duration: data.duration || 30,
                    classroom: {
                        connect: {
                            id: data.classroomId
                        }
                    },
                    questions: {
                        create: generated.questions.map((q) => ({
                            question: {
                                connect: {
                                    id: q.id
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
                message: "AI Exam Created Successfully",
                examId: exam.id,
                title: exam.title,
                classroomId: data.classroomId,
                totalQuestions: exam.questions.length,
                questions: exam.questions.map(item => item.question)
            };
        }
        async adaptiveExam(studentId, data) {
            const attempts = await this.prisma.attempt.findMany({
                where: {
                    studentId
                }
            });
            const total = attempts.length;
            const correct = attempts.filter(item => item.isCorrect).length;
            let accuracy = 0;
            if (total > 0) {
                accuracy =
                    Math.round((correct / total) * 100);
            }
            let difficulty = 2;
            let level = "Beginner";
            if (accuracy >= 80) {
                difficulty = 4;
                level = "Advanced";
            }
            else if (accuracy >= 50) {
                difficulty = 3;
                level = "Intermediate";
            }
            const exam = await this.generateExam({
                teacherId: data.teacherId || 1,
                classroomId: data.classroomId,
                title: `Adaptive AI Exam - ${level}`,
                subject: data.subject || "Math",
                chapter: data.chapter || "General",
                difficulty,
                count: data.count || 5,
                duration: data.duration || 30
            });
            return {
                studentId,
                previousAccuracy: accuracy,
                detectedLevel: level,
                generatedDifficulty: difficulty,
                examId: exam.examId,
                totalQuestions: exam.totalQuestions,
                questions: exam.questions
            };
        }
    };
    return AiExamService = _classThis;
})();
export { AiExamService };

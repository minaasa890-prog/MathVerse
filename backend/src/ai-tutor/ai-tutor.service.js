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
let AiTutorService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AiTutorService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AiTutorService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async practice(studentId) {
            const attempts = await this.prisma.attempt.findMany({
                where: {
                    studentId
                },
                include: {
                    question: true
                }
            });
            let focusTopic = "Math";
            if (attempts.length > 0) {
                focusTopic =
                    attempts[0].question.subject;
            }
            const questions = await this.prisma.question.findMany({
                where: {
                    subject: focusTopic
                },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    subject: true
                }
            });
            return {
                studentId,
                type: "AI Generated Practice",
                focusTopic,
                questions,
                recommendations: [
                    "Practice weak topics",
                    "Solve similar questions",
                    "Review mistakes"
                ]
            };
        }
        async report(studentId) {
            const attempts = await this.prisma.attempt.findMany({
                where: {
                    studentId
                },
                include: {
                    question: true
                }
            });
            let total = attempts.length;
            let correct = attempts.filter(a => a.isCorrect).length;
            let accuracy = 0;
            if (total > 0) {
                accuracy =
                    Math.round((correct / total) * 100);
            }
            return {
                studentId,
                totalAttempts: total,
                correctAnswers: correct,
                accuracy,
                level: accuracy >= 80
                    ?
                        "Advanced"
                    :
                        accuracy >= 50
                            ?
                                "Intermediate"
                            :
                                "Beginner",
                recommendations: [
                    "Practice weak topics",
                    "Review previous mistakes",
                    "Solve daily exercises"
                ]
            };
        }
        async chat(data) {
            const studentId = data.studentId;
            const question = data.question;
            const student = await this.prisma.user.findUnique({
                where: {
                    id: studentId
                },
                include: {
                    attempts: true
                }
            });
            if (!student) {
                throw new Error("Student not found");
            }
            let answer = "سوال شما بررسی شد. ";
            if (question.includes("2")
                &&
                    question.includes("3")) {
                answer =
                    "برای حل این سوال، عددها را با هم جمع می‌کنیم. ۲ + ۳ برابر ۵ است.";
            }
            else {
                answer =
                    "برای حل بهتر، مرحله به مرحله فکر کنید و قوانین پایه این مبحث را مرور کنید.";
            }
            return {
                studentId,
                question,
                answer,
                suggestions: [
                    "Review concept",
                    "Solve similar problems",
                    "Try harder exercises"
                ],
                message: "AI Tutor response generated"
            };
        }
    };
    return AiTutorService = _classThis;
})();
export { AiTutorService };

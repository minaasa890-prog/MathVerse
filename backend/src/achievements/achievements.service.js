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
let AchievementsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AchievementsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AchievementsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async getStudentAchievements(studentId) {
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
            const attempts = student.attempts;
            const totalExams = new Set(attempts.map(item => item.examId)).size;
            const totalQuestions = attempts.length;
            const correctAnswers = attempts.filter(item => item.isCorrect).length;
            const accuracy = totalQuestions > 0
                ?
                    Math.round((correctAnswers / totalQuestions) * 100)
                :
                    0;
            const badges = [];
            // اولین آزمون
            if (totalExams >= 1) {
                badges.push({
                    name: "First Exam",
                    description: "Completed first exam",
                    icon: "🥇"
                });
            }
            // امتیاز کامل
            if (accuracy === 100 && totalQuestions > 0) {
                badges.push({
                    name: "Perfect Score",
                    description: "100% accuracy achieved",
                    icon: "🎯"
                });
            }
            // آزمون‌های زیاد
            if (totalExams >= 10) {
                badges.push({
                    name: "Exam Master",
                    description: "Completed 10 exams",
                    icon: "🔥"
                });
            }
            let streak = 0;
            if (totalExams > 0) {
                streak = 1;
            }
            return {
                studentId,
                studentName: student.name,
                totalExams,
                accuracy,
                badges,
                streak,
                totalBadges: badges.length,
                message: "Student achievements generated successfully"
            };
        }
    };
    return AchievementsService = _classThis;
})();
export { AchievementsService };

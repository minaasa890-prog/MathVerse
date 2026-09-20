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
let AnalyticsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AnalyticsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AnalyticsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async getClassAnalytics(classroomId) {
            const students = await this.prisma.user.findMany({
                where: {
                    classroomId,
                    role: "STUDENT"
                },
                include: {
                    attempts: true
                }
            });
            if (students.length === 0) {
                throw new Error("No students found");
            }
            let totalAccuracy = 0;
            let totalScore = 0;
            let topStudent = null;
            let lowestStudent = null;
            const needsPractice = [];
            for (const student of students) {
                const attempts = student.attempts;
                const total = attempts.length;
                const correct = attempts.filter(item => item.isCorrect).length;
                const accuracy = total > 0
                    ?
                        Math.round((correct / total) * 100)
                    :
                        0;
                const score = attempts.reduce((sum, item) => sum + item.score, 0);
                totalAccuracy += accuracy;
                totalScore += score;
                const studentData = {
                    studentId: student.id,
                    name: student.name,
                    accuracy,
                    score,
                    xp: student.xp
                };
                if (!topStudent ||
                    score > topStudent.score) {
                    topStudent = studentData;
                }
                if (!lowestStudent ||
                    score < lowestStudent.score) {
                    lowestStudent = studentData;
                }
                if (accuracy < 50) {
                    needsPractice.push(studentData);
                }
            }
            const averageAccuracy = Math.round(totalAccuracy / students.length);
            const averageScore = Math.round(totalScore / students.length);
            let aiSuggestion = "Class performance needs improvement";
            if (averageAccuracy >= 80) {
                aiSuggestion =
                    "Class performance is excellent";
            }
            else if (averageAccuracy >= 60) {
                aiSuggestion =
                    "Class performance is good";
            }
            return {
                classroomId,
                totalStudents: students.length,
                averageAccuracy,
                averageScore,
                topStudent,
                lowestStudent,
                needsPractice,
                aiSuggestion,
                message: "Class analytics generated successfully"
            };
        }
    };
    return AnalyticsService = _classThis;
})();
export { AnalyticsService };

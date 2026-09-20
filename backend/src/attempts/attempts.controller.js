var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
import { Controller, Post, Get } from '@nestjs/common';
let AttemptsController = (() => {
    let _classDecorators = [Controller('attempts')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _submitAnswer_decorators;
    let _getStudentAttempts_decorators;
    let _getExamResult_decorators;
    let _getClassExamResults_decorators;
    let _getExamStatistics_decorators;
    let _getQuestionsAnalysis_decorators;
    let _getStudentAnalysis_decorators;
    let _getStudentRecommendations_decorators;
    let _studentExamResult_decorators;
    var AttemptsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _submitAnswer_decorators = [Post()];
            _getStudentAttempts_decorators = [Get('student/:studentId/exam/:examId')];
            _getExamResult_decorators = [Get('result/student/:studentId/exam/:examId')];
            _getClassExamResults_decorators = [Get('classroom/:classroomId/exam/:examId/results')];
            _getExamStatistics_decorators = [Get('exam/:examId/statistics')];
            _getQuestionsAnalysis_decorators = [Get('exam/:examId/questions-analysis')];
            _getStudentAnalysis_decorators = [Get('student/:studentId/analysis')];
            _getStudentRecommendations_decorators = [Get('student/:studentId/recommendations')];
            _studentExamResult_decorators = [Get('student/:studentId/exam/:examId/result')];
            __esDecorate(this, null, _submitAnswer_decorators, { kind: "method", name: "submitAnswer", static: false, private: false, access: { has: obj => "submitAnswer" in obj, get: obj => obj.submitAnswer }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStudentAttempts_decorators, { kind: "method", name: "getStudentAttempts", static: false, private: false, access: { has: obj => "getStudentAttempts" in obj, get: obj => obj.getStudentAttempts }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getExamResult_decorators, { kind: "method", name: "getExamResult", static: false, private: false, access: { has: obj => "getExamResult" in obj, get: obj => obj.getExamResult }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getClassExamResults_decorators, { kind: "method", name: "getClassExamResults", static: false, private: false, access: { has: obj => "getClassExamResults" in obj, get: obj => obj.getClassExamResults }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getExamStatistics_decorators, { kind: "method", name: "getExamStatistics", static: false, private: false, access: { has: obj => "getExamStatistics" in obj, get: obj => obj.getExamStatistics }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getQuestionsAnalysis_decorators, { kind: "method", name: "getQuestionsAnalysis", static: false, private: false, access: { has: obj => "getQuestionsAnalysis" in obj, get: obj => obj.getQuestionsAnalysis }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStudentAnalysis_decorators, { kind: "method", name: "getStudentAnalysis", static: false, private: false, access: { has: obj => "getStudentAnalysis" in obj, get: obj => obj.getStudentAnalysis }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStudentRecommendations_decorators, { kind: "method", name: "getStudentRecommendations", static: false, private: false, access: { has: obj => "getStudentRecommendations" in obj, get: obj => obj.getStudentRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _studentExamResult_decorators, { kind: "method", name: "studentExamResult", static: false, private: false, access: { has: obj => "studentExamResult" in obj, get: obj => obj.studentExamResult }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AttemptsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        attemptsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(attemptsService) {
            this.attemptsService = attemptsService;
        }
        submitAnswer(body) {
            return this.attemptsService.submitAnswer(body);
        }
        getStudentAttempts(studentId, examId) {
            return this.attemptsService.getStudentExamAttempts(Number(studentId), Number(examId));
        }
        getExamResult(studentId, examId) {
            return this.attemptsService.getExamResult(Number(studentId), Number(examId));
        }
        // نتیجه کل کلاس در یک آزمون
        getClassExamResults(classroomId, examId) {
            return this.attemptsService.getClassExamResults(Number(classroomId), Number(examId));
        }
        getExamStatistics(examId) {
            return this.attemptsService.getExamStatistics(Number(examId));
        }
        getQuestionsAnalysis(examId) {
            return this.attemptsService.getQuestionsAnalysis(Number(examId));
        }
        getStudentAnalysis(studentId) {
            return this.attemptsService.getStudentAnalysis(Number(studentId));
        }
        getStudentRecommendations(studentId) {
            return this.attemptsService.getStudentRecommendations(Number(studentId));
        }
        async studentExamResult(studentId, examId) {
            return this.attemptsService.getStudentExamResult(Number(studentId), Number(examId));
        }
    };
    return AttemptsController = _classThis;
})();
export { AttemptsController };

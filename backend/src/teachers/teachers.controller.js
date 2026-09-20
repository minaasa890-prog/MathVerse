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
import { Controller, Get } from '@nestjs/common';
let TeachersController = (() => {
    let _classDecorators = [Controller('teacher')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _dashboard_decorators;
    let _students_decorators;
    let _results_decorators;
    let _ranking_decorators;
    let _aiAnalysis_decorators;
    let _practice_decorators;
    var TeachersController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _dashboard_decorators = [Get('dashboard/:teacherId')];
            _students_decorators = [Get('class/:classroomId/students')];
            _results_decorators = [Get('class/:classroomId/results')];
            _ranking_decorators = [Get('class/:classroomId/ranking')];
            _aiAnalysis_decorators = [Get('student/:studentId/ai-analysis')];
            _practice_decorators = [Get('student/:studentId/practice')];
            __esDecorate(this, null, _dashboard_decorators, { kind: "method", name: "dashboard", static: false, private: false, access: { has: obj => "dashboard" in obj, get: obj => obj.dashboard }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _students_decorators, { kind: "method", name: "students", static: false, private: false, access: { has: obj => "students" in obj, get: obj => obj.students }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _results_decorators, { kind: "method", name: "results", static: false, private: false, access: { has: obj => "results" in obj, get: obj => obj.results }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _ranking_decorators, { kind: "method", name: "ranking", static: false, private: false, access: { has: obj => "ranking" in obj, get: obj => obj.ranking }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _aiAnalysis_decorators, { kind: "method", name: "aiAnalysis", static: false, private: false, access: { has: obj => "aiAnalysis" in obj, get: obj => obj.aiAnalysis }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _practice_decorators, { kind: "method", name: "practice", static: false, private: false, access: { has: obj => "practice" in obj, get: obj => obj.practice }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TeachersController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        teachersService = __runInitializers(this, _instanceExtraInitializers);
        constructor(teachersService) {
            this.teachersService = teachersService;
        }
        // داشبورد معلم
        async dashboard(teacherId) {
            return this.teachersService.dashboard(Number(teacherId));
        }
        // دانش آموزان کلاس
        async students(classroomId) {
            return this.teachersService.getClassStudents(Number(classroomId));
        }
        // نتایج کلاس
        async results(classroomId) {
            return this.teachersService.getClassResults(Number(classroomId));
        }
        // رتبه بندی
        async ranking(classroomId) {
            return this.teachersService.ranking(Number(classroomId));
        }
        // تحلیل هوشمند دانش آموز
        async aiAnalysis(studentId) {
            return this.teachersService.aiAnalysis(Number(studentId));
        }
        // تمرین پیشنهادی
        async practice(studentId) {
            return this.teachersService.practice(Number(studentId));
        }
    };
    return TeachersController = _classThis;
})();
export { TeachersController };

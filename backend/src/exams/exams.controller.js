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
let ExamsController = (() => {
    let _classDecorators = [Controller('exams')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findByClassroom_decorators;
    let _startExam_decorators;
    let _submitExam_decorators;
    var ExamsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [Post()];
            _findByClassroom_decorators = [Get('classroom/:id')];
            _startExam_decorators = [Get(':examId/start/:studentId')];
            _submitExam_decorators = [Post(':examId/submit')];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByClassroom_decorators, { kind: "method", name: "findByClassroom", static: false, private: false, access: { has: obj => "findByClassroom" in obj, get: obj => obj.findByClassroom }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _startExam_decorators, { kind: "method", name: "startExam", static: false, private: false, access: { has: obj => "startExam" in obj, get: obj => obj.startExam }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _submitExam_decorators, { kind: "method", name: "submitExam", static: false, private: false, access: { has: obj => "submitExam" in obj, get: obj => obj.submitExam }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ExamsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        examsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(examsService) {
            this.examsService = examsService;
        }
        // ساخت آزمون
        create(body) {
            return this.examsService.create(body);
        }
        // آزمون های یک کلاس
        findByClassroom(id) {
            return this.examsService.findByClassroom(Number(id));
        }
        // شروع آزمون توسط دانش آموز
        startExam(examId, studentId) {
            return this.examsService.startExam(Number(examId), Number(studentId));
        }
        // ارسال آزمون
        submitExam(examId, body) {
            return this.examsService.submitExam(Number(examId), body);
        }
    };
    return ExamsController = _classThis;
})();
export { ExamsController };

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
import { Controller, Get, Post } from '@nestjs/common';
let ProgressController = (() => {
    let _classDecorators = [Controller('progress')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getStudentProgress_decorators;
    let _createLessonProgress_decorators;
    let _getLessonProgress_decorators;
    let _completeLesson_decorators;
    let _summary_decorators;
    var ProgressController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getStudentProgress_decorators = [Get('student/:id')];
            _createLessonProgress_decorators = [Post('lesson')];
            _getLessonProgress_decorators = [Get('student/:studentId/lesson/:lessonId')];
            _completeLesson_decorators = [Post('complete/:studentId/:lessonId')];
            _summary_decorators = [Get('student/:id/summary')];
            __esDecorate(this, null, _getStudentProgress_decorators, { kind: "method", name: "getStudentProgress", static: false, private: false, access: { has: obj => "getStudentProgress" in obj, get: obj => obj.getStudentProgress }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createLessonProgress_decorators, { kind: "method", name: "createLessonProgress", static: false, private: false, access: { has: obj => "createLessonProgress" in obj, get: obj => obj.createLessonProgress }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getLessonProgress_decorators, { kind: "method", name: "getLessonProgress", static: false, private: false, access: { has: obj => "getLessonProgress" in obj, get: obj => obj.getLessonProgress }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _completeLesson_decorators, { kind: "method", name: "completeLesson", static: false, private: false, access: { has: obj => "completeLesson" in obj, get: obj => obj.completeLesson }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _summary_decorators, { kind: "method", name: "summary", static: false, private: false, access: { has: obj => "summary" in obj, get: obj => obj.summary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProgressController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        service = __runInitializers(this, _instanceExtraInitializers);
        constructor(service) {
            this.service = service;
        }
        // =========================================
        // GET STUDENT PROGRESS
        // =========================================
        getStudentProgress(id) {
            return this.service.getStudentProgress(Number(id));
        }
        // =========================================
        // CREATE / UPDATE LESSON PROGRESS
        // =========================================
        createLessonProgress(body) {
            return this.service.createLessonProgress(body);
        }
        // =========================================
        // GET SINGLE LESSON PROGRESS
        // =========================================
        getLessonProgress(studentId, lessonId) {
            return this.service.getLessonProgress(Number(studentId), Number(lessonId));
        }
        // =========================================
        // COMPLETE LESSON
        // =========================================
        completeLesson(studentId, lessonId) {
            return this.service.completeLesson(Number(studentId), Number(lessonId));
        }
        // =========================================
        // LEARNING SUMMARY
        // =========================================
        summary(id) {
            return this.service.getLearningSummary(Number(id));
        }
    };
    return ProgressController = _classThis;
})();
export { ProgressController };

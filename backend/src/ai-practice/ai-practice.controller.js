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
let AiPracticeController = (() => {
    let _classDecorators = [Controller('ai-practice')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _test_decorators;
    let _getStudentPractice_decorators;
    let _submitAnswer_decorators;
    let _startSession_decorators;
    let _submitSessionAnswer_decorators;
    let _getSessionResult_decorators;
    var AiPracticeController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _test_decorators = [Get('test')];
            _getStudentPractice_decorators = [Get('student/:id')];
            _submitAnswer_decorators = [Post('submit')];
            _startSession_decorators = [Post('session/start')];
            _submitSessionAnswer_decorators = [Post('session/submit')];
            _getSessionResult_decorators = [Get('session/:id/result')];
            __esDecorate(this, null, _test_decorators, { kind: "method", name: "test", static: false, private: false, access: { has: obj => "test" in obj, get: obj => obj.test }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStudentPractice_decorators, { kind: "method", name: "getStudentPractice", static: false, private: false, access: { has: obj => "getStudentPractice" in obj, get: obj => obj.getStudentPractice }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _submitAnswer_decorators, { kind: "method", name: "submitAnswer", static: false, private: false, access: { has: obj => "submitAnswer" in obj, get: obj => obj.submitAnswer }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _startSession_decorators, { kind: "method", name: "startSession", static: false, private: false, access: { has: obj => "startSession" in obj, get: obj => obj.startSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _submitSessionAnswer_decorators, { kind: "method", name: "submitSessionAnswer", static: false, private: false, access: { has: obj => "submitSessionAnswer" in obj, get: obj => obj.submitSessionAnswer }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSessionResult_decorators, { kind: "method", name: "getSessionResult", static: false, private: false, access: { has: obj => "getSessionResult" in obj, get: obj => obj.getSessionResult }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AiPracticeController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        aiPracticeService = __runInitializers(this, _instanceExtraInitializers);
        constructor(aiPracticeService) {
            this.aiPracticeService = aiPracticeService;
        }
        test() {
            return {
                message: 'AI Practice API is working'
            };
        }
        getStudentPractice(id) {
            return this.aiPracticeService.generateSmartPractice(Number(id));
        }
        submitAnswer(data) {
            return this.aiPracticeService.submitAnswer(data);
        }
        startSession(data) {
            return this.aiPracticeService.startAiSession(data.studentId, data.subject, data.chapter, data.count || 5, data.difficulty || 1);
        }
        submitSessionAnswer(data) {
            return this.aiPracticeService.submitSessionAnswer(data);
        }
        getSessionResult(id) {
            return this.aiPracticeService.getSessionResult(Number(id));
        }
    };
    return AiPracticeController = _classThis;
})();
export { AiPracticeController };

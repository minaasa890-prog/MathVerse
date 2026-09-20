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
import { Controller, Post } from '@nestjs/common';
let AiExamController = (() => {
    let _classDecorators = [Controller('ai-exam')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _generate_decorators;
    let _createExam_decorators;
    let _adaptiveExam_decorators;
    var AiExamController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _generate_decorators = [Post('generate')];
            _createExam_decorators = [Post('create')];
            _adaptiveExam_decorators = [Post('adaptive/:studentId')];
            __esDecorate(this, null, _generate_decorators, { kind: "method", name: "generate", static: false, private: false, access: { has: obj => "generate" in obj, get: obj => obj.generate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createExam_decorators, { kind: "method", name: "createExam", static: false, private: false, access: { has: obj => "createExam" in obj, get: obj => obj.createExam }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _adaptiveExam_decorators, { kind: "method", name: "adaptiveExam", static: false, private: false, access: { has: obj => "adaptiveExam" in obj, get: obj => obj.adaptiveExam }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AiExamController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        aiExamService = __runInitializers(this, _instanceExtraInitializers);
        constructor(aiExamService) {
            this.aiExamService = aiExamService;
        }
        async generate(data) {
            return this.aiExamService.generate(data);
        }
        async createExam(data) {
            return this.aiExamService.generateExam(data);
        }
        async adaptiveExam(studentId, data) {
            return this.aiExamService.adaptiveExam(Number(studentId), data);
        }
    };
    return AiExamController = _classThis;
})();
export { AiExamController };

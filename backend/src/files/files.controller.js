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
import { Controller, Post, Get, Delete, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
let FilesController = (() => {
    let _classDecorators = [Controller('files')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _uploadFile_decorators;
    let _findAll_decorators;
    let _findUserFiles_decorators;
    let _findClassroomFiles_decorators;
    let _remove_decorators;
    var FilesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _uploadFile_decorators = [Post('upload'), UseInterceptors(FileInterceptor('file'))];
            _findAll_decorators = [Get()];
            _findUserFiles_decorators = [Get('user/:id')];
            _findClassroomFiles_decorators = [Get('classroom/:id')];
            _remove_decorators = [Delete(':id')];
            __esDecorate(this, null, _uploadFile_decorators, { kind: "method", name: "uploadFile", static: false, private: false, access: { has: obj => "uploadFile" in obj, get: obj => obj.uploadFile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findUserFiles_decorators, { kind: "method", name: "findUserFiles", static: false, private: false, access: { has: obj => "findUserFiles" in obj, get: obj => obj.findUserFiles }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findClassroomFiles_decorators, { kind: "method", name: "findClassroomFiles", static: false, private: false, access: { has: obj => "findClassroomFiles" in obj, get: obj => obj.findClassroomFiles }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            FilesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        filesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(filesService) {
            this.filesService = filesService;
        }
        uploadFile(file, body) {
            console.log("FILE:", file);
            console.log("BODY:", body);
            return this.filesService.create(file, body.userId, body.classroomId);
        }
        findAll() {
            return this.filesService.findAll();
        }
        findUserFiles(id) {
            return this.filesService.findByUser(Number(id));
        }
        findClassroomFiles(id) {
            return this.filesService.findByClassroom(Number(id));
        }
        remove(id) {
            return this.filesService.remove(Number(id));
        }
    };
    return FilesController = _classThis;
})();
export { FilesController };

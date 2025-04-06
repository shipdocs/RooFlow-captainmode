"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilder = void 0;
var fs = require("fs/promises");
var path = require("path");
var FileSystemScanner_1 = require("./FileSystemScanner");
var TaskScanner_1 = require("./TaskScanner");
var glob = require("glob");
var ContextBuilder = /** @class */ (function () {
    function ContextBuilder(rootPath, options) {
        if (options === void 0) { options = {}; }
        this.rootPath = rootPath;
        this.options = options;
    }
    ContextBuilder.prototype.buildContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, fileSystem, tasks, documentation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.extractMetadata()];
                    case 1:
                        metadata = _a.sent();
                        return [4 /*yield*/, this.scanFileSystem()];
                    case 2:
                        fileSystem = _a.sent();
                        return [4 /*yield*/, this.scanTasks()];
                    case 3:
                        tasks = _a.sent();
                        return [4 /*yield*/, this.extractDocumentation()];
                    case 4:
                        documentation = _a.sent();
                        return [2 /*return*/, {
                                metadata: metadata,
                                fileSystem: fileSystem,
                                tasks: tasks,
                                documentation: documentation
                            }];
                }
            });
        });
    };
    ContextBuilder.prototype.extractMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            var packageJsonPath, packageJsonContent, packageJson, metadata, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        packageJsonPath = path.join(this.rootPath, 'package.json');
                        return [4 /*yield*/, fs.readFile(packageJsonPath, 'utf-8')];
                    case 1:
                        packageJsonContent = _a.sent();
                        packageJson = JSON.parse(packageJsonContent);
                        metadata = {
                            name: packageJson.name,
                            description: packageJson.description,
                            version: packageJson.version,
                            license: packageJson.license,
                            authors: packageJson.authors,
                            dependencies: Object.keys(packageJson.dependencies || {}),
                            devDependencies: Object.keys(packageJson.devDependencies || {})
                        };
                        return [2 /*return*/, metadata];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error extracting metadata:', error_1);
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ContextBuilder.prototype.scanFileSystem = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fileScanner;
            return __generator(this, function (_a) {
                fileScanner = new FileSystemScanner_1.FileSystemScanner(this.rootPath);
                return [2 /*return*/, fileScanner.scanProject()];
            });
        });
    };
    ContextBuilder.prototype.scanTasks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var taskScanner;
            return __generator(this, function (_a) {
                taskScanner = new TaskScanner_1.TaskScanner();
                return [2 /*return*/, taskScanner.scanDirectory(this.rootPath)];
            });
        });
    };
    ContextBuilder.prototype.extractDocumentation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var includePatterns, excludePatterns, docFiles_2, _i, includePatterns_1, pattern, matches, documentationContents, _a, docFiles_1, file, content, relativePath, error_2, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        includePatterns = this.options.includeDocumentation || ContextBuilder.DEFAULT_DOC_PATTERNS;
                        excludePatterns = this.options.excludeDocumentation || ContextBuilder.DEFAULT_DOC_EXCLUDES;
                        docFiles_2 = new Set();
                        for (_i = 0, includePatterns_1 = includePatterns; _i < includePatterns_1.length; _i++) {
                            pattern = includePatterns_1[_i];
                            matches = glob.sync(pattern, {
                                cwd: this.rootPath,
                                ignore: excludePatterns,
                                nodir: true,
                                absolute: true
                            });
                            matches.forEach(function (file) { return docFiles_2.add(file); });
                        }
                        documentationContents = [];
                        _a = 0, docFiles_1 = docFiles_2;
                        _b.label = 1;
                    case 1:
                        if (!(_a < docFiles_1.length)) return [3 /*break*/, 6];
                        file = docFiles_1[_a];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, fs.readFile(file, 'utf-8')];
                    case 3:
                        content = _b.sent();
                        relativePath = path.relative(this.rootPath, file);
                        documentationContents.push("# ".concat(relativePath, "\n\n").concat(content));
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        console.error("Error reading documentation file ".concat(file, ":"), error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        _a++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, documentationContents];
                    case 7:
                        error_3 = _b.sent();
                        console.error('Error extracting documentation:', error_3);
                        return [2 /*return*/, []];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ContextBuilder.DEFAULT_DOC_PATTERNS = [
        '**/*.md',
        '**/doc/**/*',
        '**/docs/**/*',
        '**/documentation/**/*',
        'README*'
    ];
    ContextBuilder.DEFAULT_DOC_EXCLUDES = [
        'node_modules/**',
        'dist/**',
        'build/**',
        'coverage/**'
    ];
    return ContextBuilder;
}());
exports.ContextBuilder = ContextBuilder;

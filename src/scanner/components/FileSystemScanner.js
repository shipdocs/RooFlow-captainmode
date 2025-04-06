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
exports.FileSystemScanner = void 0;
var fs = require("fs/promises");
var path = require("path");
var glob = require("glob");
var ignore_1 = require("ignore");
var FileSystemScanner = /** @class */ (function () {
    function FileSystemScanner(rootPath) {
        this.lastScanResult = null;
        this.rootPath = rootPath;
        this.ig = (0, ignore_1.default)();
        // Default ignore patterns
        this.ig.add([
            'node_modules',
            '.git',
            'dist',
            'build',
            '*.log'
        ]);
    }
    FileSystemScanner.prototype.scanProject = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var _a, depth, _b, excludePatterns, _c, includeHidden, summary, root, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = options.depth, depth = _a === void 0 ? Infinity : _a, _b = options.excludePatterns, excludePatterns = _b === void 0 ? [] : _b, _c = options.includeHidden, includeHidden = _c === void 0 ? false : _c;
                        this.ig.add(excludePatterns);
                        summary = {
                            totalFiles: 0,
                            totalDirs: 0,
                            fileTypes: new Map(),
                            totalSize: 0
                        };
                        return [4 /*yield*/, this.scanDirectory(this.rootPath, depth, summary)];
                    case 1:
                        root = _d.sent();
                        this.lastScanResult = { root: root, summary: summary };
                        return [2 /*return*/, this.lastScanResult];
                    case 2:
                        error_1 = _d.sent();
                        throw new Error("Failed to scan project: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FileSystemScanner.prototype.scanDirectory = function (dirPath_1, depth_1, summary_1) {
        return __awaiter(this, arguments, void 0, function (dirPath, depth, summary, currentDepth) {
            var stats, name_1, node, children, entries, _i, entries_1, entry, entryPath, relativePath, _a, _b, fileStats, fileType, error_2;
            if (currentDepth === void 0) { currentDepth = 0; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, fs.stat(dirPath)];
                    case 1:
                        stats = _c.sent();
                        name_1 = path.basename(dirPath);
                        node = {
                            path: dirPath,
                            name: name_1,
                            type: 'directory',
                            stats: {
                                size: stats.size,
                                lastModified: stats.mtime,
                                type: 'directory'
                            }
                        };
                        if (currentDepth >= depth) {
                            return [2 /*return*/, node];
                        }
                        children = [];
                        return [4 /*yield*/, fs.readdir(dirPath, { withFileTypes: true })];
                    case 2:
                        entries = _c.sent();
                        _i = 0, entries_1 = entries;
                        _c.label = 3;
                    case 3:
                        if (!(_i < entries_1.length)) return [3 /*break*/, 8];
                        entry = entries_1[_i];
                        entryPath = path.join(dirPath, entry.name);
                        relativePath = path.relative(this.rootPath, entryPath);
                        if (this.ig.ignores(relativePath)) {
                            return [3 /*break*/, 7];
                        }
                        if (!entry.isDirectory()) return [3 /*break*/, 5];
                        summary.totalDirs++;
                        _b = (_a = children).push;
                        return [4 /*yield*/, this.scanDirectory(entryPath, depth, summary, currentDepth + 1)];
                    case 4:
                        _b.apply(_a, [_c.sent()]);
                        return [3 /*break*/, 7];
                    case 5:
                        if (!entry.isFile()) return [3 /*break*/, 7];
                        summary.totalFiles++;
                        return [4 /*yield*/, fs.stat(entryPath)];
                    case 6:
                        fileStats = _c.sent();
                        fileType = path.extname(entry.name) || 'no-extension';
                        summary.fileTypes.set(fileType, (summary.fileTypes.get(fileType) || 0) + 1);
                        summary.totalSize += fileStats.size;
                        children.push({
                            path: entryPath,
                            name: entry.name,
                            type: 'file',
                            stats: {
                                size: fileStats.size,
                                lastModified: fileStats.mtime,
                                type: fileType
                            }
                        });
                        _c.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        node.children = children.sort(function (a, b) { return a.name.localeCompare(b.name); });
                        return [2 /*return*/, node];
                    case 9:
                        error_2 = _c.sent();
                        throw new Error("Failed to scan directory ".concat(dirPath, ": ").concat(error_2.message));
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    FileSystemScanner.prototype.getFilesToScan = function (dirPath) {
        try {
            var include = ['**/*'];
            var exclude = [
                'node_modules/**',
                '.git/**',
                'dist/**',
                'build/**',
                '*.log'
            ];
            var files_1 = new Set();
            var matches = glob.sync('**/*', {
                cwd: dirPath,
                ignore: exclude,
                nodir: true,
                absolute: true
            });
            matches.forEach(function (file) { return files_1.add(file); });
            return Array.from(files_1);
        }
        catch (error) {
            console.error("Error getting files to scan in ".concat(dirPath, ":"), error);
            return [];
        }
    };
    FileSystemScanner.prototype.getFileTypeStats = function () {
        if (!this.lastScanResult) {
            throw new Error('No scan results available. Please run scanProject() first.');
        }
        return this.lastScanResult.summary.fileTypes;
    };
    FileSystemScanner.prototype.getLastScanSummary = function () {
        var _a;
        return ((_a = this.lastScanResult) === null || _a === void 0 ? void 0 : _a.summary) || null;
    };
    FileSystemScanner.prototype.addIgnorePatterns = function (patterns) {
        this.ig.add(patterns);
    };
    return FileSystemScanner;
}());
exports.FileSystemScanner = FileSystemScanner;

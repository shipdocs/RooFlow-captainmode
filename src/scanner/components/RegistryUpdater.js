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
exports.RegistryUpdater = void 0;
var fs = require("fs/promises");
var path = require("path");
var RegistryUpdater = /** @class */ (function () {
    function RegistryUpdater(rootPath, options) {
        this.rootPath = rootPath;
        this.options = options;
        this.registryPath = path.resolve(rootPath, options.taskRegistryPath);
    }
    RegistryUpdater.prototype.updateRegistry = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var entries, markdown, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.convertTasksToEntries(context.tasks)];
                    case 1:
                        entries = _a.sent();
                        markdown = this.generateRegistryMarkdown(entries, context);
                        // Write to registry file
                        return [4 /*yield*/, this.writeRegistry(markdown)];
                    case 2:
                        // Write to registry file
                        _a.sent();
                        // Update memory bank if available
                        return [4 /*yield*/, this.updateMemoryBank(entries, context)];
                    case 3:
                        // Update memory bank if available
                        _a.sent();
                        console.log('Registry updated successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error updating registry:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RegistryUpdater.prototype.convertTasksToEntries = function (taskResults) {
        return __awaiter(this, void 0, void 0, function () {
            var now;
            var _this = this;
            return __generator(this, function (_a) {
                now = new Date().toISOString();
                return [2 /*return*/, taskResults.tasks.map(function (task) { return _this.convertTaskToEntry(task, now); })];
            });
        });
    };
    RegistryUpdater.prototype.convertTaskToEntry = function (task, timestamp) {
        var relativePath = path.relative(this.rootPath, task.location.filePath);
        return {
            taskId: this.generateTaskId(task),
            type: task.marker.type,
            description: task.marker.description,
            priority: task.marker.priority,
            assignee: task.marker.assignee,
            labels: task.marker.labels,
            file: relativePath,
            line: task.location.lineNumber,
            status: 'active',
            created: timestamp,
            updated: timestamp
        };
    };
    RegistryUpdater.prototype.generateTaskId = function (task) {
        // Generate a task ID based on file path and line number
        var hash = Buffer.from("".concat(task.location.filePath, ":").concat(task.location.lineNumber)).toString('base64').substring(0, 8);
        return "TASK-".concat(hash);
    };
    RegistryUpdater.prototype.generateRegistryMarkdown = function (entries, context) {
        var lines = [
            '# Task Registry',
            '',
            '## Project Context',
            '```json',
            JSON.stringify({
                name: context.metadata.name,
                version: context.metadata.version,
                totalFiles: context.fileSystem.summary.totalFiles,
                totalTasks: context.tasks.statistics.totalTasks
            }, null, 2),
            '```',
            '',
            '## Active Tasks',
            '',
            '| Task ID | Type | Description | Priority | Assignee | Labels | File | Line |',
            '|---------|------|-------------|----------|----------|--------|------|------|'
        ];
        var activeTasks = entries.filter(function (entry) { return entry.status === 'active'; });
        for (var _i = 0, activeTasks_1 = activeTasks; _i < activeTasks_1.length; _i++) {
            var task = activeTasks_1[_i];
            lines.push("| ".concat(task.taskId, " | ").concat(task.type, " | ").concat(task.description, " | ").concat(task.priority || '-', " | ").concat(task.assignee || '-', " | ").concat(task.labels.join(', ') || '-', " | ").concat(task.file, " | ").concat(task.line, " |"));
        }
        lines.push('', '## Task Statistics', '', '### By Type', '```json', JSON.stringify(Object.fromEntries(context.tasks.statistics.byType), null, 2), '```', '', '### By Priority', '```json', JSON.stringify(Object.fromEntries(context.tasks.statistics.byPriority), null, 2), '```', '', '### By Label', '```json', JSON.stringify(Object.fromEntries(context.tasks.statistics.byLabel), null, 2), '```');
        return lines.join('\n');
    };
    RegistryUpdater.prototype.writeRegistry = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.mkdir(path.dirname(this.registryPath), { recursive: true })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fs.writeFile(this.registryPath, content, 'utf-8')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RegistryUpdater.prototype.updateMemoryBank = function (entries, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, this would integrate with an actual memory bank system
                // For now, we'll just log the update
                console.log("Would update memory bank at ".concat(this.options.memoryBankUri, " with:"), {
                    taskCount: entries.length,
                    contextSummary: {
                        name: context.metadata.name,
                        version: context.metadata.version,
                        totalFiles: context.fileSystem.summary.totalFiles,
                        totalTasks: context.tasks.statistics.totalTasks
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    return RegistryUpdater;
}());
exports.RegistryUpdater = RegistryUpdater;

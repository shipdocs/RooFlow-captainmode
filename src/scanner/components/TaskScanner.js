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
exports.TaskScanner = void 0;
var fs = require("fs/promises");
var glob = require("glob");
var TaskScanner = /** @class */ (function () {
    function TaskScanner(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
    }
    TaskScanner.prototype.scanFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, lines, tasks, i, line, matches, _i, matches_1, match, fullMatch, isAnnotation, type, meta, description, startColumn, combinedText, priority, labels, assignee, contextStart, contextEnd, context, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.readFile(filePath, 'utf-8')];
                    case 1:
                        content = _a.sent();
                        lines = content.split('\n');
                        tasks = [];
                        for (i = 0; i < lines.length; i++) {
                            line = lines[i];
                            matches = Array.from(line.matchAll(TaskScanner.MARKER_PATTERN));
                            for (_i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
                                match = matches_1[_i];
                                fullMatch = match[0], isAnnotation = match[1], type = match[2], meta = match[3], description = match[4];
                                startColumn = match.index || 0;
                                combinedText = "".concat(meta || '', " ").concat(description);
                                priority = this.extractPriority(combinedText);
                                labels = this.extractLabels(description);
                                assignee = this.extractAssignee(description);
                                contextStart = Math.max(0, i - 2);
                                contextEnd = Math.min(lines.length, i + 3);
                                context = lines.slice(contextStart, contextEnd).join('\n');
                                tasks.push({
                                    marker: {
                                        type: type.toUpperCase(),
                                        description: description.trim(),
                                        priority: priority,
                                        assignee: assignee,
                                        labels: labels
                                    },
                                    location: {
                                        filePath: filePath,
                                        lineNumber: i + 1,
                                        columnNumber: startColumn + 1,
                                        context: context
                                    }
                                });
                            }
                        }
                        return [2 /*return*/, tasks];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Error scanning file ".concat(filePath, ":"), error_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TaskScanner.prototype.scanDirectory = function (dirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var tasks, statistics, files, _i, files_1, file, fileTasks, _a, fileTasks_1, task, typeCount, priority, priorityCount, _b, _c, label, labelCount, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        tasks = [];
                        statistics = {
                            totalTasks: 0,
                            byType: new Map(),
                            byPriority: new Map(),
                            byLabel: new Map()
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, , 7]);
                        files = this.getFilesToScan(dirPath);
                        _i = 0, files_1 = files;
                        _d.label = 2;
                    case 2:
                        if (!(_i < files_1.length)) return [3 /*break*/, 5];
                        file = files_1[_i];
                        return [4 /*yield*/, this.scanFile(file)];
                    case 3:
                        fileTasks = _d.sent();
                        tasks.push.apply(tasks, fileTasks);
                        // Update statistics
                        for (_a = 0, fileTasks_1 = fileTasks; _a < fileTasks_1.length; _a++) {
                            task = fileTasks_1[_a];
                            statistics.totalTasks++;
                            typeCount = statistics.byType.get(task.marker.type) || 0;
                            statistics.byType.set(task.marker.type, typeCount + 1);
                            priority = task.marker.priority === undefined ? 'none' : task.marker.priority;
                            priorityCount = statistics.byPriority.get(priority) || 0;
                            statistics.byPriority.set(priority, priorityCount + 1);
                            // Count by label
                            for (_b = 0, _c = task.marker.labels; _b < _c.length; _b++) {
                                label = _c[_b];
                                labelCount = statistics.byLabel.get(label) || 0;
                                statistics.byLabel.set(label, labelCount + 1);
                            }
                        }
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, { tasks: tasks, statistics: statistics }];
                    case 6:
                        error_2 = _d.sent();
                        console.error("Error scanning directory ".concat(dirPath, ":"), error_2);
                        return [2 /*return*/, { tasks: tasks, statistics: statistics }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    TaskScanner.prototype.getFilesToScan = function (dirPath) {
        try {
            var include = this.options.include || ['**/*'];
            var exclude = this.options.exclude || [];
            var files_2 = new Set();
            for (var _i = 0, include_1 = include; _i < include_1.length; _i++) {
                var pattern = include_1[_i];
                var matches = glob.sync(pattern, {
                    cwd: dirPath,
                    ignore: exclude,
                    nodir: true,
                    absolute: true
                });
                matches.forEach(function (file) { return files_2.add(file); });
            }
            return Array.from(files_2);
        }
        catch (error) {
            console.error("Error getting files to scan in ".concat(dirPath, ":"), error);
            return [];
        }
    };
    TaskScanner.prototype.extractPriority = function (text) {
        var matches = Array.from(text.matchAll(TaskScanner.PRIORITY_PATTERN));
        if (!matches.length)
            return undefined;
        var maxExclamations = Math.max.apply(Math, matches.map(function (m) { return m[1].length; }));
        return maxExclamations === 3 ? 'high' :
            maxExclamations === 2 ? 'medium' :
                maxExclamations === 1 ? 'low' : undefined;
    };
    TaskScanner.prototype.extractLabels = function (text) {
        var matches = Array.from(text.matchAll(TaskScanner.LABEL_PATTERN));
        return matches.map(function (match) { return match[1]; }).filter(Boolean);
    };
    TaskScanner.prototype.extractAssignee = function (text) {
        var match = text.match(TaskScanner.ASSIGNEE_PATTERN);
        return match ? match[1] : undefined;
    };
    TaskScanner.DEFAULT_MARKERS = [
        'TODO',
        'FIXME',
        'NOTE',
        'HACK',
        'BUG',
        'ISSUE'
    ];
    TaskScanner.MARKER_PATTERN = /(?:\/\/|\/\*|#)\s*(@?)(?:(TODO|FIXME|NOTE|HACK|BUG|ISSUE))(?:\(([^)]+)\))?:?\s*([^]*?)(?=\n|$)/gi;
    TaskScanner.PRIORITY_PATTERN = /(!{1,3})/g;
    TaskScanner.LABEL_PATTERN = /@(\w+)/g;
    TaskScanner.ASSIGNEE_PATTERN = /\bas:(@?\w+)\b/i;
    return TaskScanner;
}());
exports.TaskScanner = TaskScanner;

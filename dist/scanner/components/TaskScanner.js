"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskScanner = void 0;
const fs = __importStar(require("fs/promises"));
const glob = __importStar(require("glob"));
class TaskScanner {
    constructor(options = {}) {
        this.options = options;
        this.markers = options.customMarkers || TaskScanner.DEFAULT_MARKERS;
    }
    async scanDirectory(dirPath) {
        const tasks = [];
        const statistics = {
            totalTasks: 0,
            byType: new Map(),
            byPriority: new Map(),
            byLabel: new Map()
        };
        try {
            const files = this.getFilesToScan(dirPath);
            for (const file of files) {
                try {
                    const fileTasks = await this.scanFile(file);
                    tasks.push(...fileTasks);
                    for (const task of fileTasks) {
                        statistics.totalTasks++;
                        const typeCount = statistics.byType.get(task.marker.type) || 0;
                        statistics.byType.set(task.marker.type, typeCount + 1);
                        if (task.marker.priority) {
                            const priorityCount = statistics.byPriority.get(task.marker.priority) || 0;
                            statistics.byPriority.set(task.marker.priority, priorityCount + 1);
                        }
                        for (const label of task.marker.labels) {
                            const labelCount = statistics.byLabel.get(label) || 0;
                            statistics.byLabel.set(label, labelCount + 1);
                        }
                    }
                }
                catch (e) {
                    console.error(`Error processing file ${file}:`, e);
                }
            }
            return { tasks, statistics };
        }
        catch (error) {
            console.error(`Error scanning directory ${dirPath}:`, error);
            return { tasks: [], statistics };
        }
    }
    getFilesToScan(dirPath) {
        const globOptions = {
            cwd: dirPath,
            ignore: this.options.exclude,
            absolute: true,
            nodir: true
        };
        const patterns = this.options.include || ['**/*'];
        const files = [];
        for (const pattern of patterns) {
            try {
                const matches = glob.sync(pattern, globOptions) || [];
                files.push(...matches);
            }
            catch (e) {
                console.error(`Glob pattern ${pattern} failed:`, e.message);
            }
        }
        return files;
    }
    async scanFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            const tasks = [];
            let currentTask = null;
            let currentTaskStartLine = 0;
            let currentTaskEndLine = 0;
            let additionalContext = '';
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const matches = Array.from(line.matchAll(TaskScanner.MARKER_PATTERN));
                if (matches.length > 0) {
                    if (currentTask) {
                        currentTask.location.context = this.getTaskContext(lines, currentTaskStartLine, currentTaskEndLine);
                        tasks.push(currentTask);
                        currentTask = null;
                    }
                    for (const match of matches) {
                        const [fullMatch, isAnnotation, type, meta, description] = match;
                        const startColumn = match.index || 0;
                        const upperType = type.toUpperCase();
                        if (!this.markers.includes(upperType)) {
                            continue;
                        }
                        currentTaskStartLine = Math.max(0, i - 2);
                        currentTaskEndLine = i;
                        additionalContext = description;
                        currentTask = {
                            marker: {
                                type: upperType,
                                description: description.trim(),
                                priority: this.extractPriority(meta),
                                assignee: this.extractAssignee(meta),
                                labels: this.extractLabels(line)
                            },
                            location: {
                                filePath: filePath,
                                lineNumber: i + 1,
                                columnNumber: startColumn + 1,
                                context: ''
                            }
                        };
                    }
                }
                else if (currentTask && line.startsWith('//')) {
                    currentTaskEndLine = i;
                    additionalContext += ' ' + line.substring(2).trim();
                    const assignee = this.extractAssignee(line);
                    if (assignee) {
                        currentTask.marker.assignee = assignee;
                    }
                    const labels = this.extractLabels(line);
                    if (labels.length > 0) {
                        currentTask.marker.labels.push(...labels);
                    }
                }
                else if (currentTask) {
                    currentTask.marker.description = additionalContext.trim();
                    currentTask.location.context = this.getTaskContext(lines, currentTaskStartLine, currentTaskEndLine);
                    tasks.push(currentTask);
                    currentTask = null;
                }
            }
            if (currentTask) {
                currentTask.marker.description = additionalContext.trim();
                currentTask.location.context = this.getTaskContext(lines, currentTaskStartLine, currentTaskEndLine);
                tasks.push(currentTask);
            }
            return tasks;
        }
        catch (error) {
            console.error(`Error scanning file ${filePath}:`, error);
            return [];
        }
    }
    extractPriority(text) {
        const match = text?.match(TaskScanner.EXCLAMATION_PATTERN);
        if (!match)
            return undefined;
        const exclamationCount = match[1].length;
        return exclamationCount === 3 ? 'high' :
            exclamationCount === 2 ? 'medium' :
                exclamationCount === 1 ? 'low' : undefined;
    }
    extractAssignee(text) {
        const match = text?.match(TaskScanner.ASSIGNEE_PATTERN);
        return match ? match[1] : undefined;
    }
    extractLabels(text) {
        return Array.from(text.matchAll(TaskScanner.LABEL_PATTERN))
            .map(match => match[1])
            .filter(Boolean);
    }
    getTaskContext(lines, startLine, endLine) {
        const contextLines = lines.slice(startLine, endLine + 1);
        return contextLines.join('\n');
    }
}
exports.TaskScanner = TaskScanner;
TaskScanner.DEFAULT_MARKERS = [
    'TODO',
    'FIXME',
    'NOTE',
    'HACK',
    'BUG',
    'ISSUE'
];
TaskScanner.MARKER_PATTERN = /(?:\/\/|\/\*|#)\s*(@?)(?:(TODO|FIXME|NOTE|HACK|BUG|ISSUE))(?:\(([^)]+)\))?:?\s*([^]*?)(?=\n|$)/gi;
TaskScanner.EXCLAMATION_PATTERN = /(!{1,3})/;
TaskScanner.ASSIGNEE_PATTERN = /(?:^|\s)as:(@[^\s]+)/;
TaskScanner.LABEL_PATTERN = /#(\w+)/g;
//# sourceMappingURL=TaskScanner.js.map
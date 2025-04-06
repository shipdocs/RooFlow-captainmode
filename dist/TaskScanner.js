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
    }
    async scanFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            const tasks = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const matches = Array.from(line.matchAll(TaskScanner.MARKER_PATTERN));
                for (const match of matches) {
                    const [fullMatch, isAnnotation, type, meta, description] = match;
                    const startColumn = match.index || 0;
                    // Extract priority from both meta and description
                    const combinedText = `${meta || ''} ${description}`;
                    const priority = this.extractPriority(combinedText);
                    const labels = this.extractLabels(description);
                    const assignee = this.extractAssignee(description);
                    const contextStart = Math.max(0, i - 2);
                    const contextEnd = Math.min(lines.length, i + 3);
                    const context = lines.slice(contextStart, contextEnd).join('\n');
                    tasks.push({
                        marker: {
                            type: type.toUpperCase(),
                            description: description.trim(),
                            priority,
                            assignee,
                            labels
                        },
                        location: {
                            filePath,
                            lineNumber: i + 1,
                            columnNumber: startColumn + 1,
                            context
                        }
                    });
                }
            }
            return tasks;
        }
        catch (error) {
            console.error(`Error scanning file ${filePath}:`, error);
            return [];
        }
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
                const fileTasks = await this.scanFile(file);
                tasks.push(...fileTasks);
                // Update statistics
                for (const task of fileTasks) {
                    statistics.totalTasks++;
                    // Count by type
                    const typeCount = statistics.byType.get(task.marker.type) || 0;
                    statistics.byType.set(task.marker.type, typeCount + 1);
                    // Count by priority
                    const priority = task.marker.priority === undefined ? 'none' : task.marker.priority;
                    const priorityCount = statistics.byPriority.get(priority) || 0;
                    statistics.byPriority.set(priority, priorityCount + 1);
                    // Count by label
                    for (const label of task.marker.labels) {
                        const labelCount = statistics.byLabel.get(label) || 0;
                        statistics.byLabel.set(label, labelCount + 1);
                    }
                }
            }
            return { tasks, statistics };
        }
        catch (error) {
            console.error(`Error scanning directory ${dirPath}:`, error);
            return { tasks, statistics };
        }
    }
    getFilesToScan(dirPath) {
        try {
            const include = this.options.include || ['**/*'];
            const exclude = this.options.exclude || [];
            const files = new Set();
            for (const pattern of include) {
                const matches = glob.sync(pattern, {
                    cwd: dirPath,
                    ignore: exclude,
                    nodir: true,
                    absolute: true
                });
                matches.forEach(file => files.add(file));
            }
            return Array.from(files);
        }
        catch (error) {
            console.error(`Error getting files to scan in ${dirPath}:`, error);
            return [];
        }
    }
    extractPriority(text) {
        const matches = Array.from(text.matchAll(TaskScanner.PRIORITY_PATTERN));
        if (!matches.length)
            return undefined;
        const maxExclamations = Math.max(...matches.map(m => m[1].length));
        return maxExclamations === 3 ? 'high' :
            maxExclamations === 2 ? 'medium' :
                maxExclamations === 1 ? 'low' : undefined;
    }
    extractLabels(text) {
        const matches = Array.from(text.matchAll(TaskScanner.LABEL_PATTERN));
        return matches.map(match => match[1]).filter(Boolean);
    }
    extractAssignee(text) {
        const match = text.match(TaskScanner.ASSIGNEE_PATTERN);
        return match ? match[1] : undefined;
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
TaskScanner.PRIORITY_PATTERN = /(!{1,3})/g;
TaskScanner.LABEL_PATTERN = /@(\w+)/g;
TaskScanner.ASSIGNEE_PATTERN = /\bas:(@?\w+)\b/i;
//# sourceMappingURL=TaskScanner.js.map
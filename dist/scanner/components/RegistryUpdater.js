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
exports.RegistryUpdater = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
class RegistryUpdater {
    constructor(rootPath, options) {
        this.rootPath = rootPath;
        this.options = options;
        this.registryPath = path.resolve(rootPath, options.taskRegistryPath);
    }
    async updateRegistry(context) {
        try {
            // Convert tasks to registry entries
            const entries = await this.convertTasksToEntries(context.tasks);
            // Generate markdown content
            const markdown = this.generateRegistryMarkdown(entries, context);
            // Create necessary directories
            await fs.mkdir(path.dirname(this.registryPath), { recursive: true });
            // Write to registry file
            await fs.writeFile(this.registryPath, markdown, 'utf-8');
            // Update memory bank if available
            await this.updateMemoryBank(entries, context);
            console.log('Registry updated successfully');
        }
        catch (error) {
            console.error('Error updating registry:', error);
            throw error;
        }
    }
    async convertTasksToEntries(taskResults) {
        const now = new Date().toISOString();
        return taskResults.tasks.map(task => this.convertTaskToEntry(task, now));
    }
    convertTaskToEntry(task, timestamp) {
        const relativePath = path.relative(this.rootPath, task.location.filePath);
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
    }
    generateTaskId(task) {
        // Generate a consistent hash based on file location and content
        const uniqueKey = Buffer.from(`${task.location.filePath}:${task.location.lineNumber}:${task.location.columnNumber}:${task.marker.type}:${task.marker.description}`).toString('base64');
        // Create MD5 hash and take first 8 characters
        const hash = (0, crypto_1.createHash)('md5')
            .update(uniqueKey)
            .digest('hex')
            .substring(0, 8);
        return `TASK-${hash}`;
    }
    generateRegistryMarkdown(entries, context) {
        const lines = [
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
            ''
        ];
        // Add active tasks section only if there are tasks
        if (entries.length > 0) {
            lines.push('## Active Tasks', '', '| Task ID | Type | Description | Priority | Assignee | Labels | File | Line |', '|---------|------|-------------|----------|----------|--------|------|------|');
            const activeTasks = entries.filter(entry => entry.status === 'active');
            for (const task of activeTasks) {
                lines.push(`| ${task.taskId} | ${task.type} | ${task.description} | ${task.priority || '-'} | ${task.assignee || '-'} | ${task.labels.join(', ') || '-'} | ${task.file} | ${task.line} |`);
            }
            lines.push('');
        }
        // Add empty stats section if no tasks
        const stats = this.generateStatsSections(context);
        lines.push(...stats);
        return lines.join('\n');
    }
    generateStatsSections(context) {
        const lines = ['## Task Statistics', ''];
        if (context.tasks.statistics.totalTasks > 0) {
            lines.push('### By Type', '```json', JSON.stringify(Object.fromEntries(context.tasks.statistics.byType), null, 2), '```', '', '### By Priority', '```json', JSON.stringify(Object.fromEntries(context.tasks.statistics.byPriority), null, 2), '```', '', '### By Label', '```json', JSON.stringify(Object.fromEntries(context.tasks.statistics.byLabel), null, 2), '```');
        }
        else {
            lines.push('### By Type', '```json', '{}', '```', '', '### By Priority', '```json', '{}', '```', '', '### By Label', '```json', '{}', '```');
        }
        return lines;
    }
    async updateMemoryBank(entries, context) {
        // Log memory bank update for now (actual implementation would use a Memory Bank interface)
        const updateData = {
            taskCount: entries.length,
            contextSummary: {
                name: context.metadata.name,
                version: context.metadata.version,
                totalFiles: context.fileSystem.summary.totalFiles,
                totalTasks: context.tasks.statistics.totalTasks
            }
        };
        console.log(`Would update memory bank at ${this.options.memoryBankUri} with:`, updateData);
    }
}
exports.RegistryUpdater = RegistryUpdater;
//# sourceMappingURL=RegistryUpdater.js.map
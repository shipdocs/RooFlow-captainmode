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
exports.TaskManager = void 0;
const Task_1 = require("./interfaces/Task");
const crypto = __importStar(require("crypto"));
const MemoryBankManager_1 = require("../../memory-bank/MemoryBankManager");
class TaskManager {
    constructor(rootPath) {
        this.tasks = new Map();
        if (rootPath) {
            this.rootPath = rootPath;
            this.memoryBankManager = new MemoryBankManager_1.MemoryBankManager(rootPath);
            this.memoryBankManager.initialize().catch(error => {
                console.error('Failed to initialize memory bank:', error);
            });
        }
    }
    async createTask(params) {
        const id = crypto.randomBytes(6).toString('hex');
        const now = new Date();
        const task = {
            id,
            title: params.title || params.description.split('\n')[0],
            description: params.description,
            assignedMode: params.assignedMode,
            status: Task_1.TaskStatus.PENDING,
            priority: params.priority || 0,
            assignees: params.assignees || [],
            labels: params.labels || [],
            created: now,
            updated: now,
            modeChain: [params.assignedMode],
            transitions: [],
            dependencies: params.dependencies
        };
        this.tasks.set(id, task);
        // Update memory bank if available
        if (this.memoryBankManager) {
            try {
                await this.memoryBankManager.updateTasks(this.getAllTasks());
            }
            catch (error) {
                console.error('Failed to update memory bank:', error);
            }
        }
        return task;
    }
    getTask(id) {
        return this.tasks.get(id);
    }
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    async updateTask(id, updates) {
        const task = this.tasks.get(id);
        if (!task) {
            throw new Error(`Task ${id} not found`);
        }
        // Prevent modification of id and created timestamp
        const { id: _, created: __, ...validUpdates } = updates;
        Object.assign(task, {
            ...validUpdates,
            updated: new Date()
        });
        // Update memory bank if available
        if (this.memoryBankManager) {
            try {
                await this.memoryBankManager.updateTasks(this.getAllTasks());
            }
            catch (error) {
                console.error('Failed to update memory bank:', error);
            }
        }
        return task;
    }
    async updateTaskStatus(id, newStatus) {
        const task = this.tasks.get(id);
        if (!task) {
            throw new Error(`Task ${id} not found`);
        }
        task.transitions = task.transitions || [];
        task.transitions.push({
            from: task.status,
            to: newStatus,
            at: new Date(),
            comment: `Status changed from ${task.status} to ${newStatus}`
        });
        task.status = newStatus;
        task.updated = new Date();
        // Update memory bank if available
        if (this.memoryBankManager) {
            try {
                await this.memoryBankManager.updateTasks(this.getAllTasks());
            }
            catch (error) {
                console.error('Failed to update memory bank:', error);
            }
        }
    }
    async switchTaskMode(id, toMode, reason) {
        const task = this.tasks.get(id);
        if (!task) {
            throw new Error(`Task ${id} not found`);
        }
        const fromMode = task.assignedMode || 'unknown';
        task.transitions = task.transitions || [];
        task.transitions.push({
            from: task.status,
            to: task.status,
            at: new Date(),
            fromMode,
            toMode,
            reason
        });
        task.assignedMode = toMode;
        task.updated = new Date();
        task.modeChain = [...(task.modeChain || []), toMode];
        // Update memory bank if available
        if (this.memoryBankManager) {
            try {
                // Record mode transition
                await this.memoryBankManager.recordModeTransition(fromMode, toMode, reason);
                // Update tasks
                await this.memoryBankManager.updateTasks(this.getAllTasks());
            }
            catch (error) {
                console.error('Failed to update memory bank:', error);
            }
        }
    }
    async generateReport() {
        let content = '# Task Management Report\n\n';
        // Active Tasks
        content += '## Active Tasks\n\n';
        content += '| ID | Description | Mode | Status | Created | Updated |\n';
        content += '|:---|:-----------|:-----|:-------|:--------|:--------|\n';
        const activeTasks = this.getAllTasks()
            .filter(task => task.status !== Task_1.TaskStatus.COMPLETED);
        activeTasks.forEach(task => {
            content += `| ${task.id} | ${task.description} | ${task.assignedMode} | ${task.status} | ${task.created?.toISOString() || 'N/A'} | ${task.updated?.toISOString() || 'N/A'} |\n`;
        });
        // Completed Tasks
        content += '\n## Completed Tasks\n\n';
        content += '| ID | Description | Mode Chain | Completed | Notes |\n';
        content += '|:---|:-----------|:-----------|:----------|:------|\n';
        const completedTasks = this.getAllTasks()
            .filter(task => task.status === Task_1.TaskStatus.COMPLETED);
        completedTasks.forEach(task => {
            const modeChain = task.modeChain?.join(' → ') || task.assignedMode || 'N/A';
            content += `| ${task.id} | ${task.description} | ${modeChain} | ${task.updated?.toISOString() || 'N/A'} | ${task.notes || ''} |\n`;
        });
        // Mode Transitions
        content += '\n## Mode Transitions\n\n';
        content += '| Timestamp | From Mode | To Mode | Reason |\n';
        content += '|:----------|:----------|:--------|:-------|\n';
        this.getAllTasks().forEach(task => {
            task.transitions?.forEach(transition => {
                if (transition.fromMode && transition.toMode) {
                    content += `| ${transition.timestamp?.toISOString() || transition.at.toISOString()} | ${transition.fromMode} | ${transition.toMode} | ${transition.reason || ''} |\n`;
                }
            });
        });
        // Memory Bank Status
        if (this.memoryBankManager) {
            const status = this.memoryBankManager.getStatus();
            content += '\n## Memory Bank Status\n\n';
            content += `* Active: ${status.active ? 'Yes' : 'No'}\n`;
            if (status.lastSynchronized) {
                content += `* Last Synchronized: ${status.lastSynchronized.toISOString()}\n`;
            }
            if (status.missingFiles && status.missingFiles.length > 0) {
                content += `* Missing Files: ${status.missingFiles.join(', ')}\n`;
            }
        }
        return content;
    }
    /**
     * Gets the memory bank manager instance
     */
    getMemoryBankManager() {
        return this.memoryBankManager;
    }
    /**
     * Creates a memory bank if it doesn't exist
     */
    async createMemoryBank() {
        if (!this.rootPath) {
            console.error('Cannot create memory bank: root path not set');
            return false;
        }
        if (!this.memoryBankManager) {
            this.memoryBankManager = new MemoryBankManager_1.MemoryBankManager(this.rootPath);
        }
        try {
            const result = await this.memoryBankManager.createMemoryBank();
            return result.success;
        }
        catch (error) {
            console.error('Failed to create memory bank:', error);
            return false;
        }
    }
}
exports.TaskManager = TaskManager;
//# sourceMappingURL=TaskManager.js.map
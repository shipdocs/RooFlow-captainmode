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
exports.TaskStatus = exports.Roo = void 0;
exports.setupRooCommands = setupRooCommands;
const Task_1 = require("./scanner/components/interfaces/Task");
Object.defineProperty(exports, "TaskStatus", { enumerable: true, get: function () { return Task_1.TaskStatus; } });
const TaskManager_1 = require("./scanner/components/TaskManager");
const captain_1 = require("./cli/captain");
const memory_bank_1 = require("./cli/memory-bank");
const path = __importStar(require("path"));
class Roo {
    constructor(options = {}) {
        this.rootPath = options.rootPath || process.cwd();
        this.taskManager = options.taskManager || new TaskManager_1.TaskManager(this.rootPath);
        this.captain = options.captain || new captain_1.Captain();
    }
    getRootPath() {
        return this.rootPath;
    }
    async createTask(description, targetMode, dependencies) {
        const task = await this.taskManager.createTask({
            description,
            assignedMode: targetMode,
            title: description.split('\n')[0],
            dependencies
        });
        // Update the captain about the new task
        this.captain.notifyTaskCreated(task.id, targetMode);
        return task.id;
    }
    async updateTaskStatus(taskId, newStatus) {
        await this.taskManager.updateTaskStatus(taskId, newStatus);
    }
    async delegateTask(taskId, toMode, reason) {
        await this.taskManager.switchTaskMode(taskId, toMode, reason);
    }
    async getTaskReport() {
        return await this.taskManager.generateReport();
    }
    async createMemoryBank() {
        return await this.taskManager.createMemoryBank();
    }
    resolvePath(relativePath) {
        return path.resolve(this.rootPath, relativePath);
    }
}
exports.Roo = Roo;
function setupRooCommands(program, roo) {
    (0, captain_1.setupCaptainCommands)(program, roo);
    (0, memory_bank_1.setupMemoryBankCommands)(program, roo);
}
//# sourceMappingURL=roo.js.map
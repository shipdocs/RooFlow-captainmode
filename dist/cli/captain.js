"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Captain = void 0;
exports.setupCaptainCommands = setupCaptainCommands;
const Task_1 = require("../scanner/components/interfaces/Task");
class Captain {
    constructor() {
        // Initialize captain
    }
    notifyTaskCreated(taskId, mode) {
        // Handle task creation notification
    }
    updateTaskStatus(taskId, newStatus) {
        // Handle task status update
    }
    switchMode(mode) {
        // Handle mode switching
    }
}
exports.Captain = Captain;
function setupCaptainCommands(program, roo) {
    program
        .command('task:create')
        .description('Create a new task and assign it to a mode')
        .argument('<description>', 'Task description')
        .argument('<mode>', 'Target mode (architect, code, test, debug, ask)')
        .option('-d, --depends <taskIds>', 'Comma-separated list of dependent task IDs')
        .action((description, mode, options) => {
        const dependencies = options.depends ? options.depends.split(',') : undefined;
        const taskId = roo.createTask(description, mode, dependencies);
        console.log(`Created task ${taskId}`);
    });
    program
        .command('task:delegate')
        .description('Delegate a task to another mode')
        .argument('<taskId>', 'Task ID')
        .argument('<mode>', 'Target mode (architect, code, test, debug, ask)')
        .argument('<reason>', 'Reason for delegation')
        .action((taskId, mode, reason) => {
        roo.delegateTask(taskId, mode, reason);
        console.log(`Delegated task ${taskId} to ${mode}`);
    });
    program
        .command('task:status')
        .description('Update task status')
        .argument('<taskId>', 'Task ID')
        .argument('<status>', 'New status (pending, in_progress, blocked, completed, cancelled)')
        .action((taskId, status) => {
        const taskStatus = status.toUpperCase();
        if (!Task_1.TaskStatus[taskStatus]) {
            throw new Error('Invalid status. Must be one of: pending, in_progress, blocked, completed, cancelled');
        }
        roo.updateTaskStatus(taskId, Task_1.TaskStatus[taskStatus]);
        console.log(`Updated task ${taskId} status to ${status}`);
    });
    program
        .command('mode:switch')
        .description('Switch to another mode')
        .argument('<mode>', 'Target mode (architect, code, test, debug, ask)')
        .argument('<reason>', 'Reason for switching')
        .action((mode, reason) => {
        //captain.switchMode(mode, reason);
        console.log(`Switched to ${mode} mode`);
    });
}
//# sourceMappingURL=captain.js.map
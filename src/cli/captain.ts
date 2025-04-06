import { Command } from 'commander';
import { TaskStatus } from '../scanner/components/interfaces/Task';
import { Roo } from '../roo';

interface TaskOptions {
    depends?: string;
}

export class Captain {
    constructor() {
        // Initialize captain
    }

    notifyTaskCreated(taskId: string, mode: string): void {
        // Handle task creation notification
    }

    updateTaskStatus(taskId: string, newStatus: TaskStatus): void {
        // Handle task status update
    }

    switchMode(mode: string): void {
        // Handle mode switching
    }
}

export function setupCaptainCommands(program: Command, roo: Roo): void {
    program
        .command('task:create')
        .description('Create a new task and assign it to a mode')
        .argument('<description>', 'Task description')
        .argument('<mode>', 'Target mode (architect, code, test, debug, ask)')
        .option('-d, --depends <taskIds>', 'Comma-separated list of dependent task IDs')
        .action((description: string, mode: string, options: TaskOptions) => {
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
        .action((taskId: string, mode: string, reason: string) => {
            roo.delegateTask(taskId, mode, reason);
            console.log(`Delegated task ${taskId} to ${mode}`);
        });

    program
        .command('task:status')
        .description('Update task status')
        .argument('<taskId>', 'Task ID')
        .argument('<status>', 'New status (pending, in_progress, blocked, completed, cancelled)')
        .action((taskId: string, status: string) => {
            const taskStatus = status.toUpperCase() as keyof typeof TaskStatus;
            if (!TaskStatus[taskStatus]) {
                throw new Error('Invalid status. Must be one of: pending, in_progress, blocked, completed, cancelled');
            }
            roo.updateTaskStatus(taskId, TaskStatus[taskStatus]);
            console.log(`Updated task ${taskId} status to ${status}`);
        });

    program
        .command('mode:switch')
        .description('Switch to another mode')
        .argument('<mode>', 'Target mode (architect, code, test, debug, ask)')
        .argument('<reason>', 'Reason for switching')
        .action((mode: string, reason: string) => {
            //captain.switchMode(mode, reason);
            console.log(`Switched to ${mode} mode`);
        });
}
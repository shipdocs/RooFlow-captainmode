import { Command } from 'commander';
import { TaskStatus } from '../scanner/components/interfaces/Task';
import { Roo } from '../roo';
export declare class Captain {
    constructor();
    notifyTaskCreated(taskId: string, mode: string): void;
    updateTaskStatus(taskId: string, newStatus: TaskStatus): void;
    switchMode(mode: string): void;
}
export declare function setupCaptainCommands(program: Command, roo: Roo): void;

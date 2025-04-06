import { TaskStatus } from './scanner/components/interfaces/Task';
import { TaskManager } from './scanner/components/TaskManager';
import { Captain } from './cli/captain';
import { Command } from 'commander';
interface RooOptions {
    rootPath?: string;
    taskManager?: TaskManager;
    captain?: Captain;
}
export declare class Roo {
    private readonly taskManager;
    private readonly captain;
    private readonly rootPath;
    constructor(options?: RooOptions);
    getRootPath(): string;
    createTask(description: string, targetMode: string, dependencies?: string[]): Promise<string>;
    updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void>;
    delegateTask(taskId: string, toMode: string, reason: string): Promise<void>;
    getTaskReport(): Promise<string>;
    createMemoryBank(): Promise<boolean>;
    private resolvePath;
}
export declare function setupRooCommands(program: Command, roo: Roo): void;
export { TaskStatus };

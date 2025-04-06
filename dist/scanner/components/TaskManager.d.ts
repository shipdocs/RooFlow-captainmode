import { Task, TaskStatus } from './interfaces/Task';
import { MemoryBankManager } from '../../memory-bank/MemoryBankManager';
export declare class TaskManager {
    private tasks;
    private memoryBankManager?;
    private rootPath?;
    constructor(rootPath?: string);
    createTask(params: {
        description: string;
        assignedMode: string;
        title?: string;
        priority?: number;
        assignees?: string[];
        labels?: string[];
        dependencies?: string[];
    }): Promise<Task>;
    getTask(id: string): Task | undefined;
    getAllTasks(): Task[];
    updateTask(id: string, updates: Partial<Task>): Promise<Task>;
    updateTaskStatus(id: string, newStatus: TaskStatus): Promise<void>;
    switchTaskMode(id: string, toMode: string, reason: string): Promise<void>;
    generateReport(): Promise<string>;
    /**
     * Gets the memory bank manager instance
     */
    getMemoryBankManager(): MemoryBankManager | undefined;
    /**
     * Creates a memory bank if it doesn't exist
     */
    createMemoryBank(): Promise<boolean>;
}

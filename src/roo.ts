import { TaskStatus } from './scanner/components/interfaces/Task';
import { TaskManager } from './scanner/components/TaskManager';
import { Captain, setupCaptainCommands } from './cli/captain';
import { setupMemoryBankCommands } from './cli/memory-bank';
import * as path from 'path';
import { Command } from 'commander';

interface RooOptions {
  rootPath?: string;
  taskManager?: TaskManager;
  captain?: Captain;
}

export class Roo {
  private readonly taskManager: TaskManager;
  private readonly captain: Captain;
  private readonly rootPath: string;

  constructor(options: RooOptions = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.taskManager = options.taskManager || new TaskManager(this.rootPath);
    this.captain = options.captain || new Captain();
  }

  getRootPath(): string {
    return this.rootPath;
  }

  async createTask(description: string, targetMode: string, dependencies?: string[]): Promise<string> {
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

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
    await this.taskManager.updateTaskStatus(taskId, newStatus);
  }

  async delegateTask(taskId: string, toMode: string, reason: string): Promise<void> {
    await this.taskManager.switchTaskMode(taskId, toMode, reason);
  }

  async getTaskReport(): Promise<string> {
    return await this.taskManager.generateReport();
  }

  async createMemoryBank(): Promise<boolean> {
    return await this.taskManager.createMemoryBank();
  }

  private resolvePath(relativePath: string): string {
    return path.resolve(this.rootPath, relativePath);
  }
}

export function setupRooCommands(program: Command, roo: Roo): void {
  setupCaptainCommands(program, roo);
  setupMemoryBankCommands(program, roo);
}

export { TaskStatus };
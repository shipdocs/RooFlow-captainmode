import { Task, TaskStatus, TaskTransition } from './interfaces/Task';
import * as crypto from 'crypto';
import * as path from 'path';
import { MemoryBankManager } from '../../memory-bank/MemoryBankManager';

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private memoryBankManager?: MemoryBankManager;
  private rootPath?: string;

  constructor(rootPath?: string) {
    if (rootPath) {
      this.rootPath = rootPath;
      this.memoryBankManager = new MemoryBankManager(rootPath);
      this.memoryBankManager.initialize().catch(error => {
        console.error('Failed to initialize memory bank:', error);
      });
    }
  }

  async createTask(params: {
    description: string;
    assignedMode: string;
    title?: string;
    priority?: number;
    assignees?: string[];
    labels?: string[];
    dependencies?: string[];
  }): Promise<Task> {
    const id = crypto.randomBytes(6).toString('hex');
    const now = new Date();

    const task: Task = {
      id,
      title: params.title || params.description.split('\n')[0],
      description: params.description,
      assignedMode: params.assignedMode,
      status: TaskStatus.PENDING,
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
      } catch (error) {
        console.error('Failed to update memory bank:', error);
      }
    }

    return task;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
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
      } catch (error) {
        console.error('Failed to update memory bank:', error);
      }
    }

    return task;
  }

  async updateTaskStatus(id: string, newStatus: TaskStatus): Promise<void> {
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
      } catch (error) {
        console.error('Failed to update memory bank:', error);
      }
    }
  }

  async switchTaskMode(id: string, toMode: string, reason: string): Promise<void> {
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
      } catch (error) {
        console.error('Failed to update memory bank:', error);
      }
    }
  }

  async generateReport(): Promise<string> {
    let content = '# Task Management Report\n\n';

    // Active Tasks
    content += '## Active Tasks\n\n';
    content += '| ID | Description | Mode | Status | Created | Updated |\n';
    content += '|:---|:-----------|:-----|:-------|:--------|:--------|\n';

    const activeTasks = this.getAllTasks()
      .filter(task => task.status !== TaskStatus.COMPLETED);

    activeTasks.forEach(task => {
      content += `| ${task.id} | ${task.description} | ${task.assignedMode} | ${task.status} | ${task.created?.toISOString() || 'N/A'} | ${task.updated?.toISOString() || 'N/A'} |\n`;
    });

    // Completed Tasks
    content += '\n## Completed Tasks\n\n';
    content += '| ID | Description | Mode Chain | Completed | Notes |\n';
    content += '|:---|:-----------|:-----------|:----------|:------|\n';

    const completedTasks = this.getAllTasks()
      .filter(task => task.status === TaskStatus.COMPLETED);

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
  getMemoryBankManager(): MemoryBankManager | undefined {
    return this.memoryBankManager;
  }

  /**
   * Creates a memory bank if it doesn't exist
   */
  async createMemoryBank(): Promise<boolean> {
    if (!this.rootPath) {
      console.error('Cannot create memory bank: root path not set');
      return false;
    }

    if (!this.memoryBankManager) {
      this.memoryBankManager = new MemoryBankManager(this.rootPath);
    }

    try {
      const result = await this.memoryBankManager.createMemoryBank();
      return result.success;
    } catch (error) {
      console.error('Failed to create memory bank:', error);
      return false;
    }
  }
}

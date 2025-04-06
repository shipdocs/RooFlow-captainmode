import { Task } from '../scanner/components/interfaces/Task';
import { MemoryBankSynchronizer, SynchronizationResult } from './MemoryBankSynchronizer';

export interface MemoryBankStatus {
  active: boolean;
  lastSynchronized?: Date;
  missingFiles?: string[];
}

export class MemoryBankManager {
  public synchronizer: MemoryBankSynchronizer;
  private status: MemoryBankStatus = { active: false };

  constructor(private readonly rootPath: string) {
    this.synchronizer = new MemoryBankSynchronizer(rootPath);
  }

  /**
   * Initializes the memory bank and checks its status
   */
  async initialize(): Promise<MemoryBankStatus> {
    try {
      const validationResult = await this.synchronizer.validateMemoryBank();

      this.status = {
        active: validationResult.success,
        lastSynchronized: new Date(),
        missingFiles: validationResult.errors
      };

      return this.status;
    } catch (error) {
      this.status = {
        active: false,
        missingFiles: ['Memory bank initialization failed']
      };
      return this.status;
    }
  }

  /**
   * Gets the current status of the memory bank
   */
  getStatus(): MemoryBankStatus {
    return this.status;
  }

  /**
   * Updates the memory bank with task information
   */
  async updateTasks(tasks: Task[]): Promise<SynchronizationResult> {
    const result = await this.synchronizer.synchronizeTasks(tasks);

    if (result.success) {
      this.status.lastSynchronized = new Date();
      this.status.active = true;
    }

    return result;
  }

  /**
   * Records a mode transition in the memory bank
   */
  async recordModeTransition(fromMode: string, toMode: string, reason: string): Promise<SynchronizationResult> {
    const result = await this.synchronizer.synchronizeModeTransition(fromMode, toMode, reason);

    if (result.success) {
      this.status.lastSynchronized = new Date();
      this.status.active = true;
    }

    return result;
  }

  /**
   * Records a decision in the memory bank
   */
  async recordDecision(title: string, rationale: string, implementation: string): Promise<SynchronizationResult> {
    const result = await this.synchronizer.recordDecision(title, rationale, implementation);

    if (result.success) {
      this.status.lastSynchronized = new Date();
      this.status.active = true;
    }

    return result;
  }

  /**
   * Records a system pattern in the memory bank
   */
  async recordSystemPattern(
    patternName: string,
    patternType: 'Coding' | 'Architectural' | 'Testing',
    description: string
  ): Promise<SynchronizationResult> {
    const result = await this.synchronizer.updateSystemPattern(patternName, patternType, description);

    if (result.success) {
      this.status.lastSynchronized = new Date();
      this.status.active = true;
    }

    return result;
  }

  /**
   * Creates a complete memory bank structure if it doesn't exist
   */
  async createMemoryBank(): Promise<SynchronizationResult> {
    try {
      // Create basic structure for all required files
      const tasks: Task[] = [];
      await this.synchronizer.synchronizeTasks(tasks);

      // Record initial decision
      await this.synchronizer.recordDecision(
        'Memory Bank Implementation',
        'Need for persistent context across chat sessions\nCross-mode collaboration requirements\nProject history tracking requirements\nStandardized decision and progress tracking',
        'Core configuration files\nMemory Bank structure\nUpdate mechanisms\nCross-mode synchronization'
      );

      // Add basic system patterns
      await this.synchronizer.updateSystemPattern(
        'Memory Bank File Structure',
        'Architectural',
        'Core configuration files\nMemory Bank directory with mandatory files\nStandardized file naming and content structure'
      );

      // Validate the memory bank
      const validationResult = await this.synchronizer.validateMemoryBank();

      this.status = {
        active: validationResult.success,
        lastSynchronized: new Date(),
        missingFiles: validationResult.errors
      };

      return {
        success: validationResult.success,
        updatedFiles: validationResult.updatedFiles,
        errors: validationResult.errors
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        updatedFiles: [],
        errors: [message]
      };
    }
  }
}

import * as fs from 'fs/promises';
import * as path from 'path';
import { Task, TaskStatus } from '../scanner/components/interfaces/Task';

export interface MemoryBankFile {
  path: string;
  content: string;
}

export interface SynchronizationResult {
  success: boolean;
  updatedFiles: string[];
  errors?: string[];
}

export class MemoryBankSynchronizer {
  private readonly memoryBankPath: string;
  
  constructor(private readonly rootPath: string) {
    this.memoryBankPath = path.join(rootPath, 'memory-bank');
  }

  /**
   * Synchronizes task information across memory bank files
   */
  async synchronizeTasks(tasks: Task[]): Promise<SynchronizationResult> {
    try {
      // Ensure memory bank directory exists
      await this.ensureMemoryBankExists();
      
      // Update task registry
      await this.updateTaskRegistry(tasks);
      
      // Update active context with latest task information
      await this.updateActiveContext(tasks);
      
      // Update progress with completed tasks
      await this.updateProgress(tasks);
      
      return {
        success: true,
        updatedFiles: [
          'taskRegistry.md',
          'activeContext.md',
          'progress.md'
        ]
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

  /**
   * Synchronizes mode transition information across memory bank files
   */
  async synchronizeModeTransition(fromMode: string, toMode: string, reason: string): Promise<SynchronizationResult> {
    try {
      // Ensure memory bank directory exists
      await this.ensureMemoryBankExists();
      
      // Update active context with mode transition
      await this.updateActiveContextWithModeTransition(fromMode, toMode, reason);
      
      // Update progress with mode transition
      await this.updateProgressWithModeTransition(fromMode, toMode, reason);
      
      return {
        success: true,
        updatedFiles: [
          'activeContext.md',
          'progress.md'
        ]
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

  /**
   * Records a decision in the decision log
   */
  async recordDecision(title: string, rationale: string, implementation: string): Promise<SynchronizationResult> {
    try {
      // Ensure memory bank directory exists
      await this.ensureMemoryBankExists();
      
      const decisionLogPath = path.join(this.memoryBankPath, 'decisionLog.md');
      
      // Read existing content
      let content = '';
      try {
        content = await fs.readFile(decisionLogPath, 'utf-8');
      } catch (error) {
        // Create new file if it doesn't exist
        content = '# Decision Log\n\nThis file records architectural and implementation decisions using a list format.\n';
      }
      
      // Add new decision
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newDecision = `\n## Decision: ${title}\n\n* Decision: ${title}\n\n* Rationale: \n  ${rationale.split('\n').join('\n  ')}\n\n* Implementation Details:\n  ${implementation.split('\n').join('\n  ')}\n\n[${timestamp}] - Decision recorded\n`;
      
      content += newDecision;
      
      // Write updated content
      await fs.writeFile(decisionLogPath, content, 'utf-8');
      
      return {
        success: true,
        updatedFiles: ['decisionLog.md']
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

  /**
   * Updates system patterns documentation
   */
  async updateSystemPattern(patternName: string, patternType: 'Coding' | 'Architectural' | 'Testing', description: string): Promise<SynchronizationResult> {
    try {
      // Ensure memory bank directory exists
      await this.ensureMemoryBankExists();
      
      const systemPatternsPath = path.join(this.memoryBankPath, 'systemPatterns.md');
      
      // Read existing content
      let content = '';
      try {
        content = await fs.readFile(systemPatternsPath, 'utf-8');
      } catch (error) {
        // Create new file if it doesn't exist
        content = '# System Patterns\n\nThis file documents recurring patterns and standards used in the project.\n';
      }
      
      // Check if pattern type section exists
      const patternTypeSection = `## ${patternType} Patterns`;
      if (!content.includes(patternTypeSection)) {
        content += `\n${patternTypeSection}\n\n`;
      }
      
      // Add new pattern
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newPattern = `\n* ${patternName}\n  ${description.split('\n').join('\n  ')}\n\n[${timestamp}] - Pattern added\n`;
      
      // Insert pattern under the appropriate section
      const sectionIndex = content.indexOf(patternTypeSection);
      const nextSectionIndex = content.indexOf('## ', sectionIndex + patternTypeSection.length);
      
      if (nextSectionIndex > sectionIndex) {
        // Insert before next section
        content = content.substring(0, nextSectionIndex) + newPattern + content.substring(nextSectionIndex);
      } else {
        // Append to end of file
        content += newPattern;
      }
      
      // Write updated content
      await fs.writeFile(systemPatternsPath, content, 'utf-8');
      
      return {
        success: true,
        updatedFiles: ['systemPatterns.md']
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

  /**
   * Validates the memory bank structure and files
   */
  async validateMemoryBank(): Promise<SynchronizationResult> {
    const requiredFiles = [
      'activeContext.md',
      'decisionLog.md',
      'productContext.md',
      'progress.md',
      'systemPatterns.md',
      'taskRegistry.md'
    ];
    
    const errors: string[] = [];
    const existingFiles: string[] = [];
    
    try {
      // Check if memory bank directory exists
      try {
        await fs.access(this.memoryBankPath);
      } catch (error) {
        return {
          success: false,
          updatedFiles: [],
          errors: ['Memory bank directory does not exist']
        };
      }
      
      // Check each required file
      for (const file of requiredFiles) {
        const filePath = path.join(this.memoryBankPath, file);
        try {
          await fs.access(filePath);
          existingFiles.push(file);
        } catch (error) {
          errors.push(`Missing required file: ${file}`);
        }
      }
      
      return {
        success: errors.length === 0,
        updatedFiles: existingFiles,
        errors: errors.length > 0 ? errors : undefined
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

  // Private helper methods

  private async ensureMemoryBankExists(): Promise<void> {
    try {
      await fs.access(this.memoryBankPath);
    } catch (error) {
      await fs.mkdir(this.memoryBankPath, { recursive: true });
    }
  }

  private async updateTaskRegistry(tasks: Task[]): Promise<void> {
    const taskRegistryPath = path.join(this.memoryBankPath, 'taskRegistry.md');
    
    // Read existing content
    let content = '';
    try {
      content = await fs.readFile(taskRegistryPath, 'utf-8');
    } catch (error) {
      // Create new file if it doesn't exist
      content = '# Task Registry\n\nThis file maintains a registry of tasks, their status, and dependencies.\n';
    }
    
    // Add timestamp
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    if (!content.includes(timestamp)) {
      content += `[${timestamp}] - Updated task registry\n\n`;
    }
    
    // Active Tasks section
    content += '## Active Tasks\n\n';
    const activeTasks = tasks.filter(task => task.status !== TaskStatus.COMPLETED);
    
    activeTasks.forEach(task => {
      content += `* ${task.title || task.description.split('\n')[0]}\n`;
      content += `  * Status: ${this.formatStatus(task.status)}\n`;
      content += `  * Dependencies: ${task.dependencies?.length ? task.dependencies.join(', ') : 'None'}\n`;
      content += `  * Description: ${task.description}\n`;
      if (task.assignedMode) {
        content += `  * Assigned Mode: ${task.assignedMode}\n`;
      }
      if (task.labels && task.labels.length > 0) {
        content += `  * Labels: ${task.labels.join(', ')}\n`;
      }
      content += '\n';
    });
    
    // Completed Tasks section
    content += '## Completed Tasks\n\n';
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
    
    completedTasks.forEach(task => {
      content += `* ${task.title || task.description.split('\n')[0]}\n`;
      content += `  * Status: Complete\n`;
      content += `  * Description: ${task.description}\n`;
      if (task.updated) {
        content += `  * Completed: [${task.updated.toISOString().replace('T', ' ').substring(0, 19)}]\n`;
      }
      if (task.modeChain && task.modeChain.length > 0) {
        content += `  * Mode Chain: ${task.modeChain.join(' → ')}\n`;
      }
      content += '\n';
    });
    
    // Planned Tasks section (if any tasks have dependencies)
    const tasksWithDependencies = tasks.filter(task => 
      task.status !== TaskStatus.COMPLETED && 
      task.dependencies && 
      task.dependencies.length > 0
    );
    
    if (tasksWithDependencies.length > 0) {
      content += '## Planned Tasks\n\n';
      
      tasksWithDependencies.forEach(task => {
        content += `* ${task.title || task.description.split('\n')[0]}\n`;
        content += `  * Status: Planned\n`;
        content += `  * Dependencies: ${task.dependencies?.join(', ')}\n`;
        content += `  * Description: ${task.description}\n`;
        if (task.assignedMode) {
          content += `  * Assigned Mode: ${task.assignedMode}\n`;
        }
        content += '\n';
      });
    }
    
    // Write updated content
    await fs.writeFile(taskRegistryPath, content, 'utf-8');
  }

  private async updateActiveContext(tasks: Task[]): Promise<void> {
    const activeContextPath = path.join(this.memoryBankPath, 'activeContext.md');
    
    // Read existing content
    let content = '';
    try {
      content = await fs.readFile(activeContextPath, 'utf-8');
    } catch (error) {
      // Create new file if it doesn't exist
      content = '# Active Context\n\nThis file tracks the project\'s current status, including recent changes, current goals, and open questions.\n';
    }
    
    // Add timestamp
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Update Current Focus section
    if (!content.includes('## Current Focus')) {
      content += '\n## Current Focus\n\n';
    }
    
    // Get in-progress tasks
    const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
    
    if (inProgressTasks.length > 0) {
      // Find the Current Focus section
      const currentFocusIndex = content.indexOf('## Current Focus');
      const nextSectionIndex = content.indexOf('##', currentFocusIndex + 14);
      
      // Extract existing content
      let currentFocusContent = '';
      if (nextSectionIndex > currentFocusIndex) {
        currentFocusContent = content.substring(currentFocusIndex, nextSectionIndex);
      } else {
        currentFocusContent = content.substring(currentFocusIndex);
      }
      
      // Check if we need to update
      let needsUpdate = false;
      for (const task of inProgressTasks) {
        if (!currentFocusContent.includes(task.description.split('\n')[0])) {
          needsUpdate = true;
          break;
        }
      }
      
      if (needsUpdate) {
        // Create updated Current Focus section
        let updatedSection = '## Current Focus\n\n';
        
        inProgressTasks.forEach(task => {
          updatedSection += `* ${task.title || task.description.split('\n')[0]}:\n`;
          const descLines = task.description.split('\n');
          if (descLines.length > 1) {
            descLines.slice(1).forEach(line => {
              if (line.trim()) {
                updatedSection += `  * ${line.trim()}\n`;
              }
            });
          }
        });
        
        updatedSection += `\n[${timestamp}] - Updated current focus\n`;
        
        // Replace the old section with the new one
        if (nextSectionIndex > currentFocusIndex) {
          content = content.substring(0, currentFocusIndex) + updatedSection + content.substring(nextSectionIndex);
        } else {
          content = content.substring(0, currentFocusIndex) + updatedSection;
        }
      }
    }
    
    // Write updated content
    await fs.writeFile(activeContextPath, content, 'utf-8');
  }

  private async updateProgress(tasks: Task[]): Promise<void> {
    const progressPath = path.join(this.memoryBankPath, 'progress.md');
    
    // Read existing content
    let content = '';
    try {
      content = await fs.readFile(progressPath, 'utf-8');
    } catch (error) {
      // Create new file if it doesn't exist
      content = '# Progress\n\nThis file tracks the project\'s progress using a task list format.\n';
    }
    
    // Add timestamp
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Get recently completed tasks (completed in the last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentlyCompletedTasks = tasks.filter(task => 
      task.status === TaskStatus.COMPLETED && 
      task.updated && 
      task.updated > oneDayAgo
    );
    
    if (recentlyCompletedTasks.length > 0) {
      // Add entry for recently completed tasks
      content += `\n[${timestamp}] - Tasks completed\n\n`;
      
      // Update Completed Tasks section
      if (!content.includes('## Completed Tasks')) {
        content += '## Completed Tasks\n\n';
      }
      
      // Find the Completed Tasks section
      const completedTasksIndex = content.indexOf('## Completed Tasks');
      const nextSectionIndex = content.indexOf('##', completedTasksIndex + 17);
      
      // Create updated section content
      let updatedSection = '## Completed Tasks\n\n';
      
      recentlyCompletedTasks.forEach(task => {
        updatedSection += `* ${task.title || task.description.split('\n')[0]}\n`;
      });
      
      // Add existing completed tasks (if any)
      if (nextSectionIndex > completedTasksIndex) {
        const existingContent = content.substring(completedTasksIndex + 17, nextSectionIndex);
        const existingTasks = existingContent.split('\n').filter(line => line.trim().startsWith('*'));
        
        existingTasks.forEach(task => {
          // Check if this task is not already included
          const taskName = task.substring(task.indexOf('*') + 1).trim();
          if (!recentlyCompletedTasks.some(t => 
            (t.title || t.description.split('\n')[0]).includes(taskName)
          )) {
            updatedSection += `${task}\n`;
          }
        });
      }
      
      // Replace the old section with the new one
      if (nextSectionIndex > completedTasksIndex) {
        content = content.substring(0, completedTasksIndex) + updatedSection + content.substring(nextSectionIndex);
      } else {
        content = content.substring(0, completedTasksIndex) + updatedSection;
      }
    }
    
    // Get current tasks
    const currentTasks = tasks.filter(task => 
      task.status === TaskStatus.IN_PROGRESS || 
      task.status === TaskStatus.PENDING
    );
    
    if (currentTasks.length > 0) {
      // Update Current Tasks section
      if (!content.includes('## Current Tasks')) {
        content += '\n## Current Tasks\n\n';
      }
      
      // Find the Current Tasks section
      const currentTasksIndex = content.indexOf('## Current Tasks');
      const nextSectionIndex = content.indexOf('##', currentTasksIndex + 15);
      
      // Create updated section content
      let updatedSection = '## Current Tasks\n\n';
      
      currentTasks.forEach(task => {
        updatedSection += `* ${task.title || task.description.split('\n')[0]}:\n`;
        const descLines = task.description.split('\n');
        if (descLines.length > 1) {
          descLines.slice(1).forEach(line => {
            if (line.trim()) {
              updatedSection += `  * ${line.trim()}\n`;
            }
          });
        }
      });
      
      // Replace the old section with the new one
      if (nextSectionIndex > currentTasksIndex) {
        content = content.substring(0, currentTasksIndex) + updatedSection + content.substring(nextSectionIndex);
      } else {
        content = content.substring(0, currentTasksIndex) + updatedSection;
      }
    }
    
    // Get next tasks (pending with dependencies)
    const nextTasks = tasks.filter(task => 
      task.status === TaskStatus.PENDING && 
      task.dependencies && 
      task.dependencies.length > 0
    );
    
    if (nextTasks.length > 0) {
      // Update Next Steps section
      if (!content.includes('## Next Steps')) {
        content += '\n## Next Steps\n\n';
      }
      
      // Find the Next Steps section
      const nextStepsIndex = content.indexOf('## Next Steps');
      const nextSectionIndex = content.indexOf('##', nextStepsIndex + 13);
      
      // Create updated section content
      let updatedSection = '## Next Steps\n\n';
      
      nextTasks.forEach(task => {
        updatedSection += `* ${task.title || task.description.split('\n')[0]}\n`;
      });
      
      // Replace the old section with the new one
      if (nextSectionIndex > nextStepsIndex) {
        content = content.substring(0, nextStepsIndex) + updatedSection + content.substring(nextSectionIndex);
      } else {
        content = content.substring(0, nextStepsIndex) + updatedSection;
      }
    }
    
    // Write updated content
    await fs.writeFile(progressPath, content, 'utf-8');
  }

  private async updateActiveContextWithModeTransition(fromMode: string, toMode: string, reason: string): Promise<void> {
    const activeContextPath = path.join(this.memoryBankPath, 'activeContext.md');
    
    // Read existing content
    let content = '';
    try {
      content = await fs.readFile(activeContextPath, 'utf-8');
    } catch (error) {
      // Create new file if it doesn't exist
      content = '# Active Context\n\nThis file tracks the project\'s current status, including recent changes, current goals, and open questions.\n';
    }
    
    // Add timestamp
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Update Recent Changes section
    if (!content.includes('## Recent Changes')) {
      content += '\n## Recent Changes\n\n';
    }
    
    // Find the Recent Changes section
    const recentChangesIndex = content.indexOf('## Recent Changes');
    const nextSectionIndex = content.indexOf('##', recentChangesIndex + 16);
    
    // Create updated section content
    let updatedSection = '## Recent Changes\n\n';
    updatedSection += `* Mode transition: ${fromMode} → ${toMode}\n`;
    updatedSection += `  * Reason: ${reason}\n`;
    
    // Add existing recent changes (if any)
    if (nextSectionIndex > recentChangesIndex) {
      const existingContent = content.substring(recentChangesIndex + 16, nextSectionIndex);
      const existingChanges = existingContent.split('\n').filter(line => line.trim().startsWith('*'));
      
      existingChanges.forEach(change => {
        updatedSection += `${change}\n`;
      });
    }
    
    updatedSection += `\n[${timestamp}] - Mode transition recorded\n`;
    
    // Replace the old section with the new one
    if (nextSectionIndex > recentChangesIndex) {
      content = content.substring(0, recentChangesIndex) + updatedSection + content.substring(nextSectionIndex);
    } else {
      content = content.substring(0, recentChangesIndex) + updatedSection;
    }
    
    // Write updated content
    await fs.writeFile(activeContextPath, content, 'utf-8');
  }

  private async updateProgressWithModeTransition(fromMode: string, toMode: string, reason: string): Promise<void> {
    const progressPath = path.join(this.memoryBankPath, 'progress.md');
    
    // Read existing content
    let content = '';
    try {
      content = await fs.readFile(progressPath, 'utf-8');
    } catch (error) {
      // Create new file if it doesn't exist
      content = '# Progress\n\nThis file tracks the project\'s progress using a task list format.\n';
    }
    
    // Add timestamp
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Add mode transition entry
    content += `\n[${timestamp}] - Mode transition: ${fromMode} → ${toMode} (${reason})\n`;
    
    // Write updated content
    await fs.writeFile(progressPath, content, 'utf-8');
  }

  private formatStatus(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'Pending';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.BLOCKED:
        return 'Blocked';
      case TaskStatus.COMPLETED:
        return 'Completed';
      case TaskStatus.FAILED:
        return 'Failed';
      default:
        return String(status);
    }
  }
}

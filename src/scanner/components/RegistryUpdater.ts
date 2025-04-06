import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { ProjectContext } from './ContextBuilder';
import { TaskScanResults, DiscoveredTask } from './TaskScanner';

export interface RegistryEntry {
  taskId: string;
  type: string;
  description: string;
  priority?: string;
  assignee?: string;
  labels: string[];
  file: string;
  line: number;
  status: 'active' | 'completed';
  created: string;
  updated: string;
}

export interface RegistryUpdaterOptions {
  memoryBankUri: string;
  taskRegistryPath: string;
}

export class RegistryUpdater {
  private registryPath: string;

  constructor(
    private readonly rootPath: string,
    private readonly options: RegistryUpdaterOptions
  ) {
    this.registryPath = path.resolve(rootPath, options.taskRegistryPath);
  }

  async updateRegistry(context: ProjectContext): Promise<void> {
    try {
      // Convert tasks to registry entries
      const entries = await this.convertTasksToEntries(context.tasks);
      
      // Generate markdown content
      const markdown = this.generateRegistryMarkdown(entries, context);
      
      // Create necessary directories
      await fs.mkdir(path.dirname(this.registryPath), { recursive: true });
      
      // Write to registry file
      await fs.writeFile(this.registryPath, markdown, 'utf-8');

      // Update memory bank if available
      await this.updateMemoryBank(entries, context);

      console.log('Registry updated successfully');
    } catch (error) {
      console.error('Error updating registry:', error);
      throw error;
    }
  }

  private async convertTasksToEntries(taskResults: TaskScanResults): Promise<RegistryEntry[]> {
    const now = new Date().toISOString();
    return taskResults.tasks.map(task => this.convertTaskToEntry(task, now));
  }

  private convertTaskToEntry(task: DiscoveredTask, timestamp: string): RegistryEntry {
    const relativePath = path.relative(this.rootPath, task.location.filePath);
    
    return {
      taskId: this.generateTaskId(task),
      type: task.marker.type,
      description: task.marker.description,
      priority: task.marker.priority,
      assignee: task.marker.assignee,
      labels: task.marker.labels,
      file: relativePath,
      line: task.location.lineNumber,
      status: 'active',
      created: timestamp,
      updated: timestamp
    };
  }

  private generateTaskId(task: DiscoveredTask): string {
    // Generate a consistent hash based on file location and content
    const uniqueKey = Buffer.from(
      `${task.location.filePath}:${task.location.lineNumber}:${task.location.columnNumber}:${task.marker.type}:${task.marker.description}`
    ).toString('base64');
    
    // Create MD5 hash and take first 8 characters
    const hash = createHash('md5')
      .update(uniqueKey)
      .digest('hex')
      .substring(0, 8);
    
    return `TASK-${hash}`;
  }

  private generateRegistryMarkdown(entries: RegistryEntry[], context: ProjectContext): string {
    const lines: string[] = [
      '# Task Registry',
      '',
      '## Project Context',
      '```json',
      JSON.stringify({
        name: context.metadata.name,
        version: context.metadata.version,
        totalFiles: context.fileSystem.summary.totalFiles,
        totalTasks: context.tasks.statistics.totalTasks
      }, null, 2),
      '```',
      ''
    ];

    // Add active tasks section only if there are tasks
    if (entries.length > 0) {
      lines.push(
        '## Active Tasks',
        '',
        '| Task ID | Type | Description | Priority | Assignee | Labels | File | Line |',
        '|---------|------|-------------|----------|----------|--------|------|------|'
      );

      const activeTasks = entries.filter(entry => entry.status === 'active');
      for (const task of activeTasks) {
        lines.push(
          `| ${task.taskId} | ${task.type} | ${task.description} | ${task.priority || '-'} | ${task.assignee || '-'} | ${task.labels.join(', ') || '-'} | ${task.file} | ${task.line} |`
        );
      }

      lines.push('');
    }

    // Add empty stats section if no tasks
    const stats = this.generateStatsSections(context);
    lines.push(...stats);

    return lines.join('\n');
  }

  private generateStatsSections(context: ProjectContext): string[] {
    const lines: string[] = ['## Task Statistics', ''];

    if (context.tasks.statistics.totalTasks > 0) {
      lines.push(
        '### By Type',
        '```json',
        JSON.stringify(Object.fromEntries(context.tasks.statistics.byType), null, 2),
        '```',
        '',
        '### By Priority',
        '```json',
        JSON.stringify(Object.fromEntries(context.tasks.statistics.byPriority), null, 2),
        '```',
        '',
        '### By Label',
        '```json',
        JSON.stringify(Object.fromEntries(context.tasks.statistics.byLabel), null, 2),
        '```'
      );
    } else {
      lines.push(
        '### By Type',
        '```json',
        '{}',
        '```',
        '',
        '### By Priority',
        '```json',
        '{}',
        '```',
        '',
        '### By Label',
        '```json',
        '{}',
        '```'
      );
    }

    return lines;
  }

  private async updateMemoryBank(entries: RegistryEntry[], context: ProjectContext): Promise<void> {
    // Log memory bank update for now (actual implementation would use a Memory Bank interface)
    const updateData = {
      taskCount: entries.length,
      contextSummary: {
        name: context.metadata.name,
        version: context.metadata.version,
        totalFiles: context.fileSystem.summary.totalFiles,
        totalTasks: context.tasks.statistics.totalTasks
      }
    };
    console.log(`Would update memory bank at ${this.options.memoryBankUri} with:`, updateData);
  }
}
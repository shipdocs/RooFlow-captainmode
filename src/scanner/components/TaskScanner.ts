import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob';

export type Priority = 'low' | 'medium' | 'high' | undefined;

export interface TaskMarker {
  type: 'TODO' | 'FIXME' | 'NOTE' | 'HACK' | 'BUG' | 'ISSUE';
  description: string;
  priority?: Priority;
  assignee?: string;
  labels: string[];
}

export interface TaskLocation {
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  context: string;
}

export interface DiscoveredTask {
  marker: TaskMarker;
  location: TaskLocation;
}

export interface TaskStatistics {
  totalTasks: number;
  byType: Map<string, number>;
  byPriority: Map<string, number>;
  byLabel: Map<string, number>;
}

export interface TaskScanResults {
  tasks: DiscoveredTask[];
  statistics: TaskStatistics;
}

export interface TaskScanOptions {
  include?: string[];
  exclude?: string[];
  customMarkers?: string[];
}

export class TaskScanner {
  private static readonly DEFAULT_MARKERS = [
    'TODO',
    'FIXME',
    'NOTE',
    'HACK',
    'BUG',
    'ISSUE'
  ];

  private static readonly MARKER_PATTERN = /(?:\/\/|\/\*|#)\s*(@?)(?:(TODO|FIXME|NOTE|HACK|BUG|ISSUE))(?:\(([^)]+)\))?:?\s*([^]*?)(?=\n|$)/gi;
  private static readonly EXCLAMATION_PATTERN = /(!{1,3})/;
  private static readonly ASSIGNEE_PATTERN = /(?:^|\s)as:(@[^\s]+)/;
  private static readonly LABEL_PATTERN = /#(\w+)/g;

  private readonly markers: string[];

  constructor(private readonly options: TaskScanOptions = {}) {
    this.markers = options.customMarkers || TaskScanner.DEFAULT_MARKERS;
  }

  async scanDirectory(dirPath: string): Promise<TaskScanResults> {
    const tasks: DiscoveredTask[] = [];
    const statistics: TaskStatistics = {
      totalTasks: 0,
      byType: new Map<string, number>(),
      byPriority: new Map<string, number>(),
      byLabel: new Map<string, number>()
    };

    try {
      const files = this.getFilesToScan(dirPath);

      for (const file of files) {
        try {
          const fileTasks = await this.scanFile(file);
          tasks.push(...fileTasks);

          for (const task of fileTasks) {
            statistics.totalTasks++;

            const typeCount = statistics.byType.get(task.marker.type) || 0;
            statistics.byType.set(task.marker.type, typeCount + 1);

            if (task.marker.priority) {
              const priorityCount = statistics.byPriority.get(task.marker.priority) || 0;
              statistics.byPriority.set(task.marker.priority, priorityCount + 1);
            }

            for (const label of task.marker.labels) {
              const labelCount = statistics.byLabel.get(label) || 0;
              statistics.byLabel.set(label, labelCount + 1);
            }
          }
        } catch (e) {
          console.error(`Error processing file ${file}:`, e);
        }
      }

      return { tasks, statistics };
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
      return { tasks: [], statistics };
    }
  }

  private getFilesToScan(dirPath: string): string[] {
    const globOptions: glob.IOptions = {
      cwd: dirPath,
      ignore: this.options.exclude,
      absolute: true,
      nodir: true
    };

    const patterns = this.options.include || ['**/*'];
    const files: string[] = [];

    for (const pattern of patterns) {
      try {
        const matches = glob.sync(pattern, globOptions) || [];
        files.push(...matches);
      } catch (e) {
        console.error(`Glob pattern ${pattern} failed:`, (e as Error).message);
      }
    }

    return files;
  }

  private async scanFile(filePath: string): Promise<DiscoveredTask[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const tasks: DiscoveredTask[] = [];

      let currentTask: DiscoveredTask | null = null;
      let currentTaskStartLine = 0;
      let currentTaskEndLine = 0;
      let additionalContext = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const matches = Array.from(line.matchAll(TaskScanner.MARKER_PATTERN));

        if (matches.length > 0) {
          if (currentTask) {
            currentTask.location.context = this.getTaskContext(lines, currentTaskStartLine, currentTaskEndLine);
            tasks.push(currentTask);
            currentTask = null;
          }

          for (const match of matches) {
            const [fullMatch, isAnnotation, type, meta, description] = match;
            const startColumn = match.index || 0;

            const upperType = type.toUpperCase();
            if (!this.markers.includes(upperType)) {
              continue;
            }

            currentTaskStartLine = Math.max(0, i - 2);
            currentTaskEndLine = i;
            additionalContext = description;

            currentTask = {
              marker: {
                type: upperType as TaskMarker['type'],
                description: description.trim(),
                priority: this.extractPriority(meta),
                assignee: this.extractAssignee(meta),
                labels: this.extractLabels(line)
              },
              location: {
                filePath: filePath,
                lineNumber: i + 1,
                columnNumber: startColumn + 1,
                context: ''
              }
            };
          }
        } else if (currentTask && line.startsWith('//')) {
          currentTaskEndLine = i;
          additionalContext += ' ' + line.substring(2).trim();
          
          const assignee = this.extractAssignee(line);
          if (assignee) {
            currentTask.marker.assignee = assignee;
          }
          const labels = this.extractLabels(line);
          if (labels.length > 0) {
            currentTask.marker.labels.push(...labels);
          }
        } else if (currentTask) {
          currentTask.marker.description = additionalContext.trim();
          currentTask.location.context = this.getTaskContext(lines, currentTaskStartLine, currentTaskEndLine);
          tasks.push(currentTask);
          currentTask = null;
        }
      }

      if (currentTask) {
        currentTask.marker.description = additionalContext.trim();
        currentTask.location.context = this.getTaskContext(lines, currentTaskStartLine, currentTaskEndLine);
        tasks.push(currentTask);
      }

      return tasks;
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error);
      return [];
    }
  }

  private extractPriority(text: string): Priority {
    const match = text?.match(TaskScanner.EXCLAMATION_PATTERN);
    if (!match) return undefined;

    const exclamationCount = match[1].length;
    return exclamationCount === 3 ? 'high' :
           exclamationCount === 2 ? 'medium' :
           exclamationCount === 1 ? 'low' : undefined;
  }

  private extractAssignee(text: string): string | undefined {
    const match = text?.match(TaskScanner.ASSIGNEE_PATTERN);
    return match ? match[1] : undefined;
  }

  private extractLabels(text: string): string[] {
    return Array.from(text.matchAll(TaskScanner.LABEL_PATTERN))
      .map(match => match[1])
      .filter(Boolean);
  }

  private getTaskContext(lines: string[], startLine: number, endLine: number): string {
    const contextLines = lines.slice(startLine, endLine + 1);
    return contextLines.join('\n');
  }
}
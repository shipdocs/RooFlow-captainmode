import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob';

export type Priority = 'low' | 'medium' | 'high' | 'none' | undefined;

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

export interface TaskScanResults {
  tasks: DiscoveredTask[];
  statistics: {
    totalTasks: number;
    byType: Map<string, number>;
    byPriority: Map<string, number>;
    byLabel: Map<string, number>;
  };
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
  private static readonly PRIORITY_PATTERN = /(!{1,3})/g;
  private static readonly LABEL_PATTERN = /@(\w+)/g;
  private static readonly ASSIGNEE_PATTERN = /\bas:(@?\w+)\b/i;

  constructor(private readonly options: TaskScanOptions = {}) {}

  async scanFile(filePath: string): Promise<DiscoveredTask[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const tasks: DiscoveredTask[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matches = Array.from(line.matchAll(TaskScanner.MARKER_PATTERN));

        for (const match of matches) {
          const [fullMatch, isAnnotation, type, meta, description] = match;
          const startColumn = match.index || 0;

          // Extract priority from both meta and description
          const combinedText = `${meta || ''} ${description}`;
          const priority = this.extractPriority(combinedText);

          const labels = this.extractLabels(description);
          const assignee = this.extractAssignee(description);

          const contextStart = Math.max(0, i - 2);
          const contextEnd = Math.min(lines.length, i + 3);
          const context = lines.slice(contextStart, contextEnd).join('\n');

          tasks.push({
            marker: {
              type: type.toUpperCase() as TaskMarker['type'],
              description: description.trim(),
              priority,
              assignee,
              labels
            },
            location: {
              filePath,
              lineNumber: i + 1,
              columnNumber: startColumn + 1,
              context
            }
          });
        }
      }

      return tasks;
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error);
      return [];
    }
  }

  async scanDirectory(dirPath: string): Promise<TaskScanResults> {
    const tasks: DiscoveredTask[] = [];
    const statistics = {
      totalTasks: 0,
      byType: new Map<string, number>(),
      byPriority: new Map<string, number>(),
      byLabel: new Map<string, number>()
    };

    try {
      const files = this.getFilesToScan(dirPath);

      for (const file of files) {
        const fileTasks = await this.scanFile(file);
        tasks.push(...fileTasks);

        // Update statistics
        for (const task of fileTasks) {
          statistics.totalTasks++;

          // Count by type
          const typeCount = statistics.byType.get(task.marker.type) || 0;
          statistics.byType.set(task.marker.type, typeCount + 1);

          // Count by priority
          const priority = task.marker.priority === undefined ? 'none' : task.marker.priority;
          const priorityCount = statistics.byPriority.get(priority) || 0;
          statistics.byPriority.set(priority, priorityCount + 1);

          // Count by label
          for (const label of task.marker.labels) {
            const labelCount = statistics.byLabel.get(label) || 0;
            statistics.byLabel.set(label, labelCount + 1);
          }
        }
      }

      return { tasks, statistics };
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
      return { tasks, statistics };
    }
  }

  private getFilesToScan(dirPath: string): string[] {
    try {
      const include = this.options.include || ['**/*'];
      const exclude = this.options.exclude || [];

      const files = new Set<string>();

      for (const pattern of include) {
        const matches = glob.sync(pattern, {
          cwd: dirPath,
          ignore: exclude,
          nodir: true,
          absolute: true
        });
        matches.forEach(file => files.add(file));
      }

      return Array.from(files);
    } catch (error) {
      console.error(`Error getting files to scan in ${dirPath}:`, error);
      return [];
    }
  }

  private extractPriority(text: string): Priority | undefined {
    const matches = Array.from(text.matchAll(TaskScanner.PRIORITY_PATTERN));
    if (!matches.length) return undefined;

    const maxExclamations = Math.max(...matches.map(m => m[1].length));
    return maxExclamations === 3 ? 'high' :
           maxExclamations === 2 ? 'medium' :
           maxExclamations === 1 ? 'low' : undefined;
  }

  private extractLabels(text: string): string[] {
    const matches = Array.from(text.matchAll(TaskScanner.LABEL_PATTERN));
    return matches.map(match => match[1]).filter(Boolean);
  }

  private extractAssignee(text: string): string | undefined {
    const match = text.match(TaskScanner.ASSIGNEE_PATTERN);
    return match ? match[1] : undefined;
  }
}
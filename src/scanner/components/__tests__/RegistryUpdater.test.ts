import { RegistryUpdater, RegistryUpdaterOptions, RegistryEntry } from '../RegistryUpdater';
import { ProjectContext } from '../ContextBuilder';
import { TaskScanResults, DiscoveredTask, TaskLocation } from '../TaskScanner';
import { PathLike } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('RegistryUpdater', () => {
  let updater: RegistryUpdater;
  const testRoot = '/test/project';
  const options: RegistryUpdaterOptions = {
    memoryBankUri: 'memory-bank://',
    taskRegistryPath: 'docs/tasks.md'
  };

  const mockLocation: TaskLocation = {
    filePath: path.join(testRoot, 'src/test.ts'),
    lineNumber: 42,
    columnNumber: 1,
    context: 'Test context'
  };

  const mockTask: DiscoveredTask = {
    marker: {
      type: 'TODO',
      description: 'Test task',
      priority: 'high',
      assignee: '@johndoe',
      labels: ['test', 'important']
    },
    location: mockLocation
  };

  const mockContext: ProjectContext = {
    metadata: {
      name: 'Test Project',
      version: '1.0.0'
    },
    fileSystem: {
      root: {
        path: testRoot,
        name: 'project',
        type: 'directory',
        stats: {
          size: 0,
          lastModified: new Date(),
          type: 'directory'
        }
      },
      summary: {
        totalFiles: 10,
        totalDirs: 2,
        fileTypes: new Map(),
        totalSize: 1000
      }
    },
    tasks: {
      tasks: [mockTask],
      statistics: {
        totalTasks: 1,
        byType: new Map([['TODO', 1]]),
        byPriority: new Map([['high', 1]]),
        byLabel: new Map([
          ['test', 1],
          ['important', 1]
        ])
      }
    },
    documentation: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    updater = new RegistryUpdater(testRoot, options);

    mockedFs.mkdir.mockResolvedValue(undefined);
    mockedFs.writeFile.mockImplementation(((path: PathLike, data: string) => {
      return Promise.resolve();
    }) as typeof fs.writeFile);
  });

  describe('updateRegistry', () => {
    it('should generate a valid markdown registry', async () => {
      let writtenContent = '';
      mockedFs.writeFile.mockImplementation(((path: PathLike, content: string) => {
        writtenContent = content;
        return Promise.resolve();
      }) as typeof fs.writeFile);

      await updater.updateRegistry(mockContext);

      expect(writtenContent).toContain('# Task Registry');
      expect(writtenContent).toContain('## Project Context');
      expect(writtenContent).toContain('## Active Tasks');
      expect(writtenContent).toContain('## Task Statistics');

      // Check task table
      expect(writtenContent).toContain('| Task ID | Type | Description |');
      expect(writtenContent).toContain('| TODO | Test task | high |');
      expect(writtenContent).toContain('@johndoe');
      expect(writtenContent).toContain('test, important');

      // Check statistics
      expect(writtenContent).toContain('"TODO": 1');
      expect(writtenContent).toContain('"high": 1');
      expect(writtenContent).toContain('"test": 1');
      expect(writtenContent).toContain('"important": 1');
    });

    it('should generate consistent task IDs', () => {
      const task1: DiscoveredTask = {
        ...mockTask,
        location: {
          ...mockTask.location,
          filePath: path.join(testRoot, 'src/test1.ts')
        }
      };
      const task2: DiscoveredTask = {
        ...mockTask,
        location: {
          ...mockTask.location,
          filePath: path.join(testRoot, 'src/test2.ts')
        }
      };
      const task3: DiscoveredTask = {
        ...task1,
        location: {
          ...task1.location,
          lineNumber: 43
        }
      };

      const id1 = updater['generateTaskId'](task1);
      const id2 = updater['generateTaskId'](task1); // Same task = same ID
      const id3 = updater['generateTaskId'](task3); // Different line = different ID

      expect(id1).toBe(id2);
      expect(id1).not.toBe(id3);
      expect(id1).toMatch(/^TASK-[A-Za-z0-9+/]{8}$/);
    });

    it('should create necessary directories', async () => {
      await updater.updateRegistry(mockContext);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        path.dirname(path.resolve(testRoot, options.taskRegistryPath)),
        { recursive: true }
      );
    });

    it('should handle file system errors gracefully', async () => {
      const error = new Error('Write failed');
      mockedFs.writeFile.mockRejectedValue(error);

      await expect(updater.updateRegistry(mockContext)).rejects.toThrow(error);
    });

    it('should handle empty task list', async () => {
      const emptyContext: ProjectContext = {
        ...mockContext,
        tasks: {
          tasks: [],
          statistics: {
            totalTasks: 0,
            byType: new Map(),
            byPriority: new Map(),
            byLabel: new Map()
          }
        }
      };

      let writtenContent = '';
      mockedFs.writeFile.mockImplementation(((path: PathLike, content: string) => {
        writtenContent = content;
        return Promise.resolve();
      }) as typeof fs.writeFile);

      await updater.updateRegistry(emptyContext);

      expect(writtenContent).toContain('# Task Registry');
      expect(writtenContent).toContain('"totalTasks": 0');
      expect(writtenContent).not.toMatch(/\| Task ID \|.*\|[\r\n][-|]+[\r\n]/);
    });

    it('should convert tasks to registry entries correctly', async () => {
      const entries = await updater['convertTasksToEntries'](mockContext.tasks);
      const entry = entries[0];

      expect(entry.type).toBe(mockTask.marker.type);
      expect(entry.description).toBe(mockTask.marker.description);
      expect(entry.priority).toBe(mockTask.marker.priority);
      expect(entry.assignee).toBe(mockTask.marker.assignee);
      expect(entry.labels).toEqual(mockTask.marker.labels);
      expect(entry.line).toBe(mockTask.location.lineNumber);
      expect(entry.status).toBe('active');
      expect(entry.taskId).toMatch(/^TASK-/);
      expect(entry.created).toBeDefined();
      expect(entry.updated).toBeDefined();
      expect(entry.file).toBe(path.relative(testRoot, mockTask.location.filePath));
    });

    it('should handle missing optional task fields', async () => {
      const minimalLocation: TaskLocation = {
        filePath: 'test.ts',
        lineNumber: 1,
        columnNumber: 1,
        context: ''
      };

      const minimalTask: DiscoveredTask = {
        marker: {
          type: 'TODO',
          description: 'Minimal task',
          labels: []
        },
        location: minimalLocation
      };

      const minimalContext: ProjectContext = {
        ...mockContext,
        tasks: {
          tasks: [minimalTask],
          statistics: {
            totalTasks: 1,
            byType: new Map([['TODO', 1]]),
            byPriority: new Map(),
            byLabel: new Map()
          }
        }
      };

      let writtenContent = '';
      mockedFs.writeFile.mockImplementation(((path: PathLike, content: string) => {
        writtenContent = content;
        return Promise.resolve();
      }) as typeof fs.writeFile);

      await updater.updateRegistry(minimalContext);

      expect(writtenContent).toContain('| - | - |');
    });
  });
});
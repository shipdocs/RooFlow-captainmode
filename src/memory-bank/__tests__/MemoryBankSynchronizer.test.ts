import * as fs from 'fs/promises';
import * as path from 'path';
import { MemoryBankSynchronizer } from '../MemoryBankSynchronizer';
import { Task, TaskStatus } from '../../scanner/components/interfaces/Task';

// Mock fs module
jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('MemoryBankSynchronizer', () => {
  let synchronizer: MemoryBankSynchronizer;
  const testRoot = '/test/project';
  const memoryBankPath = path.join(testRoot, 'memory-bank');

  // Sample tasks for testing
  const sampleTasks: Task[] = [
    {
      id: 'task1',
      title: 'Active Task',
      description: 'This is an active task',
      status: TaskStatus.IN_PROGRESS,
      priority: 1,
      assignees: ['@user1'],
      labels: ['test'],
      created: new Date('2025-04-01T10:00:00Z'),
      updated: new Date('2025-04-01T11:00:00Z'),
      assignedMode: 'code',
      modeChain: ['architect', 'code']
    },
    {
      id: 'task2',
      title: 'Completed Task',
      description: 'This is a completed task',
      status: TaskStatus.COMPLETED,
      priority: 2,
      assignees: ['@user2'],
      labels: ['test', 'completed'],
      created: new Date('2025-04-01T09:00:00Z'),
      updated: new Date('2025-04-01T12:00:00Z'),
      assignedMode: 'test',
      modeChain: ['architect', 'code', 'test'],
      notes: 'Completed successfully'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    synchronizer = new MemoryBankSynchronizer(testRoot);

    // Mock fs.access to simulate directory exists
    mockedFs.access.mockResolvedValue(undefined);

    // Mock fs.mkdir
    mockedFs.mkdir.mockResolvedValue(undefined);

    // Mock fs.readFile to return empty content
    mockedFs.readFile.mockRejectedValue(new Error('File not found'));

    // Mock fs.writeFile
    mockedFs.writeFile.mockResolvedValue(undefined);
  });

  describe('synchronizeTasks', () => {
    it('should create memory bank directory if it does not exist', async () => {
      // Simulate directory does not exist
      mockedFs.access.mockRejectedValueOnce(new Error('Directory not found'));

      await synchronizer.synchronizeTasks(sampleTasks);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(memoryBankPath, { recursive: true });
    });

    it('should update task registry with active and completed tasks', async () => {
      const result = await synchronizer.synchronizeTasks(sampleTasks);

      expect(result.success).toBe(true);
      expect(result.updatedFiles).toContain('taskRegistry.md');
      
      // Verify task registry was written
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'taskRegistry.md'),
        expect.stringContaining('# Task Registry'),
        'utf-8'
      );
      
      // Check active tasks section
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'taskRegistry.md'),
        expect.stringContaining('## Active Tasks'),
        'utf-8'
      );
      
      // Check completed tasks section
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'taskRegistry.md'),
        expect.stringContaining('## Completed Tasks'),
        'utf-8'
      );
    });

    it('should update active context with in-progress tasks', async () => {
      const result = await synchronizer.synchronizeTasks(sampleTasks);

      expect(result.success).toBe(true);
      expect(result.updatedFiles).toContain('activeContext.md');
      
      // Verify active context was written
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'activeContext.md'),
        expect.stringContaining('# Active Context'),
        'utf-8'
      );
      
      // Check current focus section
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'activeContext.md'),
        expect.stringContaining('## Current Focus'),
        'utf-8'
      );
      
      // Check task title is included
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'activeContext.md'),
        expect.stringContaining('Active Task'),
        'utf-8'
      );
    });

    it('should update progress with completed tasks', async () => {
      const result = await synchronizer.synchronizeTasks(sampleTasks);

      expect(result.success).toBe(true);
      expect(result.updatedFiles).toContain('progress.md');
      
      // Verify progress was written
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'progress.md'),
        expect.stringContaining('# Progress'),
        'utf-8'
      );
      
      // Check current tasks section
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'progress.md'),
        expect.stringContaining('## Current Tasks'),
        'utf-8'
      );
    });

    it('should handle file system errors gracefully', async () => {
      // Simulate write error
      mockedFs.writeFile.mockRejectedValueOnce(new Error('Write failed'));

      const result = await synchronizer.synchronizeTasks(sampleTasks);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Write failed');
    });
  });

  describe('synchronizeModeTransition', () => {
    it('should update active context with mode transition', async () => {
      const result = await synchronizer.synchronizeModeTransition('code', 'test', 'Testing needed');

      expect(result.success).toBe(true);
      expect(result.updatedFiles).toContain('activeContext.md');
      
      // Verify active context was written with mode transition
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'activeContext.md'),
        expect.stringContaining('Mode transition: code → test'),
        'utf-8'
      );
    });

    it('should update progress with mode transition', async () => {
      const result = await synchronizer.synchronizeModeTransition('code', 'test', 'Testing needed');

      expect(result.success).toBe(true);
      expect(result.updatedFiles).toContain('progress.md');
      
      // Verify progress was written with mode transition
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'progress.md'),
        expect.stringContaining('Mode transition: code → test'),
        'utf-8'
      );
    });
  });

  describe('recordDecision', () => {
    it('should add a decision to the decision log', async () => {
      const result = await synchronizer.recordDecision(
        'Test Decision',
        'This is the rationale',
        'Implementation details'
      );

      expect(result.success).toBe(true);
      expect(result.updatedFiles).toContain('decisionLog.md');
      
      // Verify decision log was written
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'decisionLog.md'),
        expect.stringContaining('## Decision: Test Decision'),
        'utf-8'
      );
    });
  });

  describe('updateSystemPattern', () => {
    it('should add a system pattern to the patterns file', async () => {
      const result = await synchronizer.updateSystemPattern(
        'Test Pattern',
        'Coding',
        'This is a test pattern'
      );

      expect(result.success).toBe(true);
      expect(result.updatedFiles).toContain('systemPatterns.md');
      
      // Verify system patterns was written
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'systemPatterns.md'),
        expect.stringContaining('## Coding Patterns'),
        'utf-8'
      );
      
      // Check pattern is included
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        path.join(memoryBankPath, 'systemPatterns.md'),
        expect.stringContaining('Test Pattern'),
        'utf-8'
      );
    });
  });

  describe('validateMemoryBank', () => {
    it('should validate all required files exist', async () => {
      // Mock all files exist
      mockedFs.access.mockResolvedValue(undefined);

      const result = await synchronizer.validateMemoryBank();

      expect(result.success).toBe(true);
      expect(result.updatedFiles).toHaveLength(6); // All 6 required files
    });

    it('should report missing files', async () => {
      // Mock some files don't exist
      mockedFs.access
        .mockResolvedValueOnce(undefined) // memory-bank directory exists
        .mockRejectedValueOnce(new Error('File not found')) // activeContext.md missing
        .mockResolvedValueOnce(undefined) // decisionLog.md exists
        .mockResolvedValueOnce(undefined) // productContext.md exists
        .mockRejectedValueOnce(new Error('File not found')) // progress.md missing
        .mockResolvedValueOnce(undefined) // systemPatterns.md exists
        .mockResolvedValueOnce(undefined); // taskRegistry.md exists

      const result = await synchronizer.validateMemoryBank();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing required file: activeContext.md');
      expect(result.errors).toContain('Missing required file: progress.md');
      expect(result.updatedFiles).toHaveLength(4); // 4 existing files
    });

    it('should handle memory bank directory not existing', async () => {
      // Mock directory doesn't exist
      mockedFs.access.mockRejectedValueOnce(new Error('Directory not found'));

      const result = await synchronizer.validateMemoryBank();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Memory bank directory does not exist');
    });
  });
});

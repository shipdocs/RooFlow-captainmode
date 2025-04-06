import { TaskManager } from '../TaskManager';
import { TaskStatus } from '../interfaces/Task';

describe('TaskManager', () => {
  let taskManager: TaskManager;

  beforeEach(() => {
    taskManager = new TaskManager();
  });

  describe('createTask', () => {
    it('should create a task with required fields', async () => {
      const description = 'Test task';
      const mode = 'test';

      const task = await taskManager.createTask({
        description,
        assignedMode: mode,
        title: 'Test Task',
        priority: 1,
        assignees: ['@user1'],
        labels: ['test']
      });

      expect(task).toBeDefined();
      expect(task.id).toBeTruthy();
      expect(task.description).toBe(description);
      expect(task.assignedMode).toBe(mode);
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.created).toBeInstanceOf(Date);
      expect(task.updated).toBeInstanceOf(Date);
    });

    it('should create task with minimal fields', async () => {
      const task = await taskManager.createTask({
        description: 'Test task',
        assignedMode: 'test'
      });

      expect(task).toBeDefined();
      expect(task.id).toBeTruthy();
      expect(task.status).toBe(TaskStatus.PENDING);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status and add transition', async () => {
      const task = await taskManager.createTask({
        description: 'Test task',
        assignedMode: 'test'
      });

      await taskManager.updateTaskStatus(task.id, TaskStatus.IN_PROGRESS);
      const updatedTask = taskManager.getTask(task.id);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.status).toBe(TaskStatus.IN_PROGRESS);
      expect(updatedTask?.transitions).toHaveLength(1);
      expect(updatedTask?.transitions?.[0].from).toBe(TaskStatus.PENDING);
      expect(updatedTask?.transitions?.[0].to).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should throw error for non-existent task', async () => {
      await expect(taskManager.updateTaskStatus('non-existent', TaskStatus.IN_PROGRESS))
        .rejects.toThrow();
    });
  });

  describe('switchTaskMode', () => {
    it('should switch task mode and add transition', async () => {
      const task = await taskManager.createTask({
        description: 'Test task',
        assignedMode: 'test'
      });
      await taskManager.switchTaskMode(task.id, 'code', 'Testing mode transition');

      const updatedTask = taskManager.getTask(task.id);
      expect(updatedTask?.assignedMode).toBe('code');
      expect(updatedTask?.modeChain).toContain('code');
      expect(updatedTask?.transitions).toHaveLength(1);
      expect(updatedTask?.transitions?.[0].fromMode).toBe('test');
      expect(updatedTask?.transitions?.[0].toMode).toBe('code');
    });

    it('should throw error for non-existent task', async () => {
      await expect(taskManager.switchTaskMode('non-existent', 'code', 'reason'))
        .rejects.toThrow();
    });
  });

  describe('updateTask', () => {
    it('should update task fields', async () => {
      const task = await taskManager.createTask({
        description: 'Test task',
        assignedMode: 'test'
      });

      const updates = {
        description: 'Updated description',
        labels: ['new-label'],
        notes: 'test note'
      };

      const updatedTask = await taskManager.updateTask(task.id, updates);

      expect(updatedTask.description).toBe(updates.description);
      expect(updatedTask.labels).toEqual(updates.labels);
      expect(updatedTask.notes).toBe(updates.notes);
      expect(updatedTask.updated).toBeInstanceOf(Date);
    });

    it('should not allow modification of id or created fields', async () => {
      const task = await taskManager.createTask({
        description: 'Test task',
        assignedMode: 'test'
      });

      const originalId = task.id;
      const originalCreated = task.created;

      await taskManager.updateTask(task.id, {
        id: 'new-id',
        created: new Date(2020, 1, 1)
      });

      const updatedTask = taskManager.getTask(task.id);
      expect(updatedTask?.id).toBe(originalId);
      expect(updatedTask?.created).toBe(originalCreated);
    });
  });

  describe('generateReport', () => {
    it('should generate report with tasks and transitions', async () => {
      const task1 = await taskManager.createTask({
        description: 'Active task',
        assignedMode: 'code'
      });

      const task2 = await taskManager.createTask({
        description: 'Completed task',
        assignedMode: 'test'
      });

      await taskManager.updateTaskStatus(task2.id, TaskStatus.COMPLETED);
      await taskManager.switchTaskMode(task1.id, 'test', 'Testing');

      const report = await taskManager.generateReport();

      expect(report).toContain('Active Tasks');
      expect(report).toContain('Completed Tasks');
      expect(report).toContain('Mode Transitions');
      expect(report).toContain(task1.id);
      expect(report).toContain(task2.id);
      expect(report).toContain('code → test');
    });
  });

  describe('Memory Bank integration', () => {
    it('should get memory bank manager', () => {
      const taskManagerWithPath = new TaskManager('/test/path');
      const memoryBankManager = taskManagerWithPath.getMemoryBankManager();

      expect(memoryBankManager).toBeDefined();
    });

    it('should create memory bank', async () => {
      // Mock implementation to avoid actual file system operations
      const taskManagerWithPath = new TaskManager('/test/path');
      const mockMemoryBankManager = taskManagerWithPath.getMemoryBankManager();

      if (mockMemoryBankManager) {
        // Mock the createMemoryBank method
        const originalMethod = mockMemoryBankManager.createMemoryBank;
        mockMemoryBankManager.createMemoryBank = jest.fn().mockResolvedValue({ success: true, updatedFiles: [] });

        const result = await taskManagerWithPath.createMemoryBank();
        expect(result).toBe(true);

        // Restore original method
        mockMemoryBankManager.createMemoryBank = originalMethod;
      }
    });
  });
});
import { TaskScanner, TaskScanOptions } from '../TaskScanner';
import type { PathLike } from 'fs';
import type { FileHandle } from 'fs/promises';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

jest.mock('fs/promises');
jest.mock('glob');

type MockedFS = jest.Mocked<typeof fs>;
type MockedGlob = jest.Mocked<typeof glob>;

const mockedFs: MockedFS = fs as MockedFS;
const mockedGlob: MockedGlob = glob as MockedGlob;

describe('TaskScanner', () => {
  let scanner: TaskScanner;
  const testRoot = '/test/project';
  const testFile = path.join(testRoot, 'src', 'test.ts');
  
  // Default mock data
  const defaultFileContent = `
// TODO(!!!): Test task
// as:@team/frontend
// #api #frontend #urgent
// Some additional context
const x = 1;
`.trim();

  beforeEach(() => {
    jest.clearAllMocks();
    scanner = new TaskScanner();

    // Setup glob.sync mock with explicit typing
    mockedGlob.sync.mockImplementation(function mockGlobSync(pattern: string, options?: { [key: string]: any }): string[] {
      return [testFile];
    });

    // Setup default fs.readFile mock with explicit typing
    mockedFs.readFile.mockImplementation(async function mockReadFile(path: PathLike | FileHandle, options?: any): Promise<string> {
      const filePathString = path.toString();
      if (filePathString === testFile) {
        return Promise.resolve(defaultFileContent);
      }
      return Promise.reject(new Error(`File not found: ${filePathString}`));
    });
  });

  describe('scanDirectory', () => {
    it('should scan files and extract tasks', async () => {
      const result = await scanner.scanDirectory(testRoot);

      expect(result.tasks.length).toBeGreaterThan(0);
      if (result.tasks.length > 0) {
        const task = result.tasks[0];
        expect(task.marker.type).toBe('TODO');
        expect(task.marker.priority).toBe('high');
        expect(task.marker.assignee).toBe('@team/frontend');
        expect(task.marker.labels).toEqual(['api', 'frontend', 'urgent']);
      }
    });

    it('should respect scan options', async () => {
      const options: TaskScanOptions = {
        include: ['src/**/*.ts'],
        exclude: ['**/*.test.ts'],
        customMarkers: ['TODO', 'FIXME']
      };

      scanner = new TaskScanner(options);
      const result = await scanner.scanDirectory(testRoot);

      expect(mockedGlob.sync).toHaveBeenCalledWith(
        'src/**/*.ts',
        expect.objectContaining({ ignore: ['**/*.test.ts'], cwd: testRoot, absolute: true, nodir: true })
      );
    });

    it('should collect accurate task statistics', async () => {
      const multipleTasksContent = `
// TODO(!!!): First task
// as:@johndoe #test
function test1() {}

// FIXME: Second task
function test2() {}
      `.trim();

      mockedFs.readFile.mockImplementation(async function mockReadFile(path: PathLike | FileHandle): Promise<string> {
        return Promise.resolve(multipleTasksContent);
      });

      const result = await scanner.scanDirectory(testRoot);
      const stats = result.statistics;

      expect(stats.totalTasks).toBe(2);
      expect(stats.byType.get('TODO')).toBe(1);
      expect(stats.byType.get('FIXME')).toBe(1);
      expect(stats.byPriority.get('high')).toBe(1);
      expect(stats.byLabel.get('test')).toBe(1);
    });

    it('should handle no tasks found', async () => {
      mockedFs.readFile.mockImplementation(async function mockReadFile(): Promise<string> {
        return Promise.resolve('// No tasks here\nfunction empty() {}');
      });

      const result = await scanner.scanDirectory(testRoot);

      expect(result.tasks).toEqual([]);
      expect(result.statistics.totalTasks).toBe(0);
      expect(result.statistics.byType.size).toBe(0);
    });

    it('should handle file read errors', async () => {
      mockedFs.readFile.mockRejectedValueOnce(new Error('File not found'));

      const result = await scanner.scanDirectory(testRoot);

      expect(result.tasks).toEqual([]);
      expect(result.statistics.totalTasks).toBe(0);
      expect(result.statistics.byType.size).toBe(0);
    });

    it('should handle glob errors', async () => {
      mockedGlob.sync.mockImplementationOnce(function mockGlobSync(): never {
        throw new Error('Glob error');
      });

      const result = await scanner.scanDirectory(testRoot);

      expect(result.tasks).toEqual([]);
      expect(result.statistics.totalTasks).toBe(0);
      expect(result.statistics.byType.size).toBe(0);
    });

    it('should handle invalid marker formats', async () => {
      const invalidMarkers = `
// TODO: Valid task
// TODO(invalid priority): Invalid priority task
// TODO(low, invalid assignee) Missing colon
// TODO(low): No labels but has #tag in description
      `;

      mockedFs.readFile.mockImplementation(async function mockReadFile(): Promise<string> {
        return Promise.resolve(invalidMarkers);
      });

      const result = await scanner.scanDirectory(testRoot);
      
      expect(result.tasks.length).toBeGreaterThan(0);
      const validTask = result.tasks.find(t => t.marker.description.includes('Valid task'));
      expect(validTask).toBeDefined();
    });

    it('should parse complex marker formats', async () => {
      const complexMarker = `
// Extra context line before
const myFunc = () => {
  // TODO(!!!): Complex task
  // as:@team/frontend
  // #api #frontend #urgent
  // Some additional context
  const x = 1;
};
// Extra context line after`;

      mockedFs.readFile.mockImplementation(async function mockReadFile(): Promise<string> {
        return Promise.resolve(complexMarker);
      });

      const result = await scanner.scanDirectory(testRoot);
      const task = result.tasks[0];

      expect(task).toBeDefined();
      expect(task.marker.type).toBe('TODO');
      expect(task.marker.priority).toBe('high');
      expect(task.marker.assignee).toBe('@team/frontend');
      expect(task.location.context).toBeDefined();
    });

    it('should aggregate multi-line task descriptions', async () => {
      const multilineDescription = `
// TODO(low): First line
// Second line
// #tag1 #tag2
// Last line
      `;

      mockedFs.readFile.mockImplementation(async function mockReadFile(): Promise<string> {
        return Promise.resolve(multilineDescription);
      });

      const result = await scanner.scanDirectory(testRoot);
      const task = result.tasks[0];

      expect(task).toBeDefined();
      expect(task.marker.description).toContain('First line');
      expect(task.marker.labels).toEqual(['tag1', 'tag2']);
    });

    it('should track task locations accurately', async () => {
      const result = await scanner.scanDirectory(testRoot);
      const task = result.tasks[0];

      expect(task).toBeDefined();
      expect(task.location.filePath).toBe(testFile);
      expect(task.location.lineNumber).toBeGreaterThan(0);
      expect(task.location.columnNumber).toBeGreaterThan(0);
      expect(task.location.context).toBeDefined();
    });
  });
});

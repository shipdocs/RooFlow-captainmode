import { TaskScanner } from '../components/TaskScanner';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');
jest.mock('path');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;

const TEST_DIR = '/test/project';

describe('TaskScanner', () => {
  let mockFiles: Map<string, string>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFiles = new Map([
      [`${TEST_DIR}/src/test.ts`, `
        // TODO: Implement error handling
        function test() {
          // FIXME: This is broken
          console.log('test');
          // NOTE: Add validation
        }
      `]
    ]);

    mockedPath.join.mockImplementation((...paths) => paths.join('/'));
    mockedPath.relative.mockImplementation((from, to) => to.replace(from + '/', ''));
    mockedPath.basename.mockImplementation(filePath => filePath.split('/').pop() || '');

    mockedFs.readFile.mockImplementation(async (filePath) => {
      const filePathString = filePath.toString();
      console.log('readFile mock:', filePathString);
      const content = mockFiles.get(filePathString);
      if (!content) throw new Error(`File not found: ${filePathString}`);
      console.log('readFile content:', content);
      return Buffer.from(content);
    });
  });

  describe('scanDirectory', () => {
    it('should scan files for tasks', async () => {
      const scanner = new TaskScanner();
      const result = await scanner.scanDirectory(TEST_DIR);

      expect(result.tasks).toHaveLength(3);
      expect(result.statistics.totalTasks).toBe(3);
    });

    it('should categorize tasks by type', async () => {
      const scanner = new TaskScanner();
      const result = await scanner.scanDirectory(TEST_DIR);

      expect(result.statistics.byType.get('TODO')).toBe(1);
      expect(result.statistics.byType.get('FIXME')).toBe(1);
      expect(result.statistics.byType.get('NOTE')).toBe(1);
    });

    it('should handle file read errors', async () => {
      mockedFs.readFile.mockRejectedValueOnce(new Error('Read error'));
      const scanner = new TaskScanner();
      const result = await scanner.scanDirectory(TEST_DIR);

      expect(result.tasks).toHaveLength(0);
    });

    it('should handle invalid marker formats', async () => {
      mockFiles.set(`${TEST_DIR}/example.ts`, `
        // INVALID FORMAT
        // TODO without colon
        // NOTE:without space
      `);

      const scanner = new TaskScanner();
      const result = await scanner.scanDirectory(TEST_DIR);

      expect(result.tasks).toHaveLength(0);
    });

    it('should parse complex marker formats', async () => {
      mockFiles.set(`${TEST_DIR}/example.ts`, `
        // TODO(@user1): High priority task [p1]
        // FIXME(@user2, @user3): Needs review #bug
        // NOTE(@team): Consider refactoring [tech-debt]
      `);

      const scanner = new TaskScanner();
      const result = await scanner.scanDirectory(TEST_DIR);

      expect(result.tasks).toHaveLength(3);
      expect(result.tasks[0].marker.assignee).toBe('@user1');
      expect(result.tasks[0].marker.labels).toContain('p1');
    });

    it('should aggregate multi-line task descriptions', async () => {
      mockFiles.set(`${TEST_DIR}/example.ts`, `
        // TODO: This is a multi-line task
        //       that continues here
        //       and ends here
      `);

      const scanner = new TaskScanner();
      const result = await scanner.scanDirectory(TEST_DIR);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].marker.description).toContain('continues here');
      expect(result.tasks[0].marker.description).toContain('ends here');
    });

    it('should track task locations accurately', async () => {
      const scanner = new TaskScanner();
      const result = await scanner.scanDirectory(TEST_DIR);

      expect(result.tasks[0].location.filePath).toBe('src/test.ts');
      expect(result.tasks[0].location.lineNumber).toBeDefined();
    });
  });
});
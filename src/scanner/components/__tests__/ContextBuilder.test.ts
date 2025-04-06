import { ContextBuilder, ProjectContext, ContextBuilderOptions } from '../ContextBuilder';
import { FileSystemScanner, ProjectStructure } from '../FileSystemScanner';
import { TaskScanner, TaskScanResults } from '../TaskScanner';
import { PathLike } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob';

// Mock dependencies
jest.mock('../FileSystemScanner');
jest.mock('../TaskScanner');
jest.mock('fs/promises');
jest.mock('glob');

const mockedFs = fs as jest.Mocked<typeof fs>;
const MockedFileSystemScanner = FileSystemScanner as jest.MockedClass<typeof FileSystemScanner>;
const MockedTaskScanner = TaskScanner as jest.MockedClass<typeof TaskScanner>;
const mockedGlob = glob as jest.Mocked<typeof glob>;

describe('ContextBuilder', () => {
  let builder: ContextBuilder;
  const testRoot = '/test/project';

  beforeEach(() => {
    jest.clearAllMocks();
    builder = new ContextBuilder(testRoot);

    // Mock file system structure
    const mockFileSystem: ProjectStructure = {
      root: {
        path: testRoot,
        name: 'project',
        type: 'directory',
        stats: {
          size: 0,
          lastModified: new Date(),
          type: 'directory'
        },
        children: []
      },
      summary: {
        totalFiles: 0,
        totalDirs: 1,
        fileTypes: new Map(),
        totalSize: 0
      }
    };

    // Mock task scan results
    const mockTasks: TaskScanResults = {
      tasks: [],
      statistics: {
        totalTasks: 0,
        byType: new Map(),
        byPriority: new Map(),
        byLabel: new Map()
      }
    };

    // Setup FileSystemScanner mock
    MockedFileSystemScanner.prototype.scanProject.mockResolvedValue(mockFileSystem);

    // Setup TaskScanner mock
    MockedTaskScanner.prototype.scanDirectory.mockResolvedValue(mockTasks);

    // Setup default fs mocks
    mockedFs.readFile.mockImplementation(((path: PathLike | fs.FileHandle, options?: any) => {
      const filePath = path.toString();
      if (filePath.includes('package.json')) {
        return Promise.reject(new Error('File not found'));
      }
      return Promise.reject(new Error('File not found'));
    }) as typeof fs.readFile);
  });

  describe('buildContext', () => {
    it('should build a complete project context', async () => {
      const packageJson = {
        name: 'Test Project',
        version: '1.0.0',
        description: 'A test project for demonstration',
        license: 'MIT'
      };

      mockedFs.readFile.mockImplementation(((path: PathLike | fs.FileHandle, options?: any) => {
        const filePath = path.toString();
        if (filePath.includes('package.json')) {
          return Promise.resolve(JSON.stringify(packageJson));
        }
        if (filePath.includes('README.md')) {
          return Promise.resolve('# Test Project\nThis is a test.');
        }
        return Promise.reject(new Error('File not found'));
      }) as typeof fs.readFile);

      mockedGlob.sync.mockReturnValue(['README.md']);

      const context = await builder.buildContext();

      expect(context.metadata.name).toBe('Test Project');
      expect(context.metadata.description).toBe('A test project for demonstration');
      expect(context.fileSystem).toBeDefined();
      expect(context.tasks).toBeDefined();
      expect(context.documentation).toHaveLength(1);
      expect(context.documentation[0]).toContain('README.md');
    });

    it('should handle missing productContext.md gracefully', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('File not found'));

      const context = await builder.buildContext();

      expect(context.metadata).toEqual({});
      expect(context.fileSystem).toBeDefined();
      expect(context.tasks).toBeDefined();
    });

    it('should respect documentation patterns', async () => {
      const options: ContextBuilderOptions = {
        includeDocumentation: ['**/*.txt'],
        excludeDocumentation: ['**/*.md']
      };

      builder = new ContextBuilder(testRoot, options);

      mockedGlob.sync.mockReturnValueOnce(['doc1.txt', 'doc2.txt']);
      mockedFs.readFile.mockImplementation(((path: PathLike | fs.FileHandle, options?: any) => {
        const filePath = path.toString();
        if (filePath.endsWith('.txt')) {
          return Promise.resolve('Test content');
        }
        return Promise.reject(new Error('File not found'));
      }) as typeof fs.readFile);

      const context = await builder.buildContext();

      expect(context.documentation).toHaveLength(2);
      expect(mockedGlob.sync).toHaveBeenCalledWith(
        '**/*.txt',
        expect.objectContaining({ ignore: options.excludeDocumentation })
      );
    });

    it('should pass task scan options to TaskScanner', async () => {
      const options: ContextBuilderOptions = {
        taskScanOptions: {
          include: ['src/**/*.ts'],
          exclude: ['**/*.test.ts']
        }
      };

      builder = new ContextBuilder(testRoot, options);
      await builder.buildContext();

      expect(MockedTaskScanner).toHaveBeenCalledWith(options.taskScanOptions);
    });

    it('should extract metadata from markdown content', async () => {
      const markdownContent = `
## Project Goal
*Advanced Testing System*

## Key Features
*Comprehensive testing framework*

## Version
*1.0.0*

## License
*MIT*
`;

      mockedFs.readFile.mockImplementation(((path: PathLike | fs.FileHandle, options?: any) => {
        const filePath = path.toString();
        if (filePath.includes('productContext.md')) {
          return Promise.resolve(markdownContent);
        }
        return Promise.reject(new Error('File not found'));
      }) as typeof fs.readFile);

      const context = await builder.buildContext();

      expect(context.metadata.name).toBe('Advanced Testing System');
      expect(context.metadata.description).toBe('Comprehensive testing framework');
    });

    it('should handle documentation read errors gracefully', async () => {
      mockedGlob.sync.mockReturnValue(['error.md', 'valid.md']);
      mockedFs.readFile.mockImplementation(((path: PathLike | fs.FileHandle, options?: any) => {
        const filePath = path.toString();
        if (filePath.includes('error.md')) {
          return Promise.reject(new Error('Read error'));
        }
        return Promise.resolve('# Valid Doc');
      }) as typeof fs.readFile);

      const context = await builder.buildContext();

      expect(context.documentation).toHaveLength(1);
      expect(context.documentation[0]).toContain('valid.md');
    });
  });
});
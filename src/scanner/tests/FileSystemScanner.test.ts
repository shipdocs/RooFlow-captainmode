import { FileSystemScanner } from '../components/FileSystemScanner';
import { PathLike, Dirent, Stats } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock dependencies
jest.mock('fs/promises');
jest.mock('path');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;

const TEST_DIR = '/test/test-project';

describe('FileSystemScanner', () => {
  let mockFileSystem: Map<string, { type: 'file' | 'directory', name: string }>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize mock file system using Map for better path matching
    mockFileSystem = new Map([
      [TEST_DIR, { type: 'directory', name: 'test-project' }],
      [`${TEST_DIR}/src`, { type: 'directory', name: 'src' }],
      [`${TEST_DIR}/src/components`, { type: 'directory', name: 'components' }],
      [`${TEST_DIR}/src/index.ts`, { type: 'file', name: 'index.ts' }],
      [`${TEST_DIR}/src/test.spec.ts`, { type: 'file', name: 'test.spec.ts' }],
      [`${TEST_DIR}/package.json`, { type: 'file', name: 'package.json' }],
      [`${TEST_DIR}/node_modules`, { type: 'directory', name: 'node_modules' }],
      [`${TEST_DIR}/node_modules/test`, { type: 'directory', name: 'test' }],
      [`${TEST_DIR}/node_modules/test/index.js`, { type: 'file', name: 'index.js' }]
    ]);

    // Mock path methods
    mockedPath.join.mockImplementation((...paths) => paths.join('/'));
    mockedPath.basename.mockImplementation(filePath => filePath.split('/').pop() || '');
    mockedPath.extname.mockImplementation(filePath => {
      const basename = filePath.split('/').pop() || '';
      const match = basename.match(/\.[^.]+$/);
      return match ? match[0] : '';
    });
    mockedPath.relative.mockImplementation((from, to) => {
      const fromParts = from.split('/').filter(Boolean);
      const toParts = to.split('/').filter(Boolean);
      
      let i = 0;
      while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
        i++;
      }
      
      const result = toParts.slice(i).join('/');
      return result;
    });

    // Mock fs.stat
    mockedFs.stat.mockImplementation(async (filePath: PathLike) => {
      const entry = mockFileSystem.get(filePath.toString());
      if (!entry) {
        throw new Error('ENOENT: file not found');
      }

      const stats = {
        isFile: () => entry.type === 'file',
        isDirectory: () => entry.type === 'directory',
        isSymbolicLink: () => false,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isFIFO: () => false,
        isSocket: () => false,
        dev: 0,
        ino: 0,
        mode: 0,
        nlink: 1,
        uid: 0,
        gid: 0,
        rdev: 0,
        size: 100,
        blksize: 4096,
        blocks: 1,
        atimeMs: Date.now(),
        mtimeMs: Date.now(),
        ctimeMs: Date.now(),
        birthtimeMs: Date.now(),
        atime: new Date(),
        mtime: new Date(),
        ctime: new Date(),
        birthtime: new Date()
      } as Stats;

      return stats;
    });

    // Mock fs.readdir
    mockedFs.readdir.mockImplementation(async (dirPath: PathLike, options?: { withFileTypes?: boolean }) => {
      const dir = dirPath.toString();
      if (!mockFileSystem.has(dir) || mockFileSystem.get(dir)?.type !== 'directory') {
        throw new Error('ENOTDIR: not a directory');
      }

      const entries = [...mockFileSystem.entries()]
        .filter(([path, _]) => {
          const parentPath = path.substring(0, path.lastIndexOf('/'));
          return parentPath === dir;
        })
        .map(([_, entry]) => {
          if (options?.withFileTypes) {
            return {
              name: entry.name,
              isDirectory: () => entry.type === 'directory',
              isFile: () => entry.type === 'file',
              isSymbolicLink: () => false
            } as Dirent;
          }
          return entry.name;
        });

      return entries as any;
    });
  });

  it('should scan project structure correctly', async () => {
    const scanner = new FileSystemScanner(TEST_DIR);
    const result = await scanner.scanProject();

    expect(result.root.type).toBe('directory');
    expect(result.root.name).toBe('test-project');
    expect(result.summary.totalDirs).toBe(3); // test-project, src, components
    expect(result.summary.totalFiles).toBe(3); // package.json, index.ts, test.spec.ts
  });

  it('should throw error on invalid root path', async () => {
    const scanner = new FileSystemScanner('/invalid/path');
    await expect(scanner.scanProject()).rejects.toThrow('Failed to scan project');
  });

  it('should respect depth limit', async () => {
    const scanner = new FileSystemScanner(TEST_DIR);
    const result = await scanner.scanProject({ depth: 1 });

    const hasDeepChildren = result.root.children?.some(child =>
      child.type === 'directory' && child.children && child.children.length > 0
    );

    expect(hasDeepChildren).toBe(false);
  });

  it('should track file types correctly', async () => {
    const scanner = new FileSystemScanner(TEST_DIR);
    const result = await scanner.scanProject();

    expect(result.summary.fileTypes.get('.ts')).toBe(2);
    expect(result.summary.fileTypes.get('.json')).toBe(1);
  });

  it('should ignore specified patterns', async () => {
    const scanner = new FileSystemScanner(TEST_DIR);
    scanner.addIgnorePatterns(['**/*.spec.ts']);
    const result = await scanner.scanProject();

    // Verify the file exists in mock filesystem
    const hasSpecFile = [...mockFileSystem.values()].some(
      entry => entry.name === 'test.spec.ts'
    );
    expect(hasSpecFile).toBe(true);

    // Verify it's excluded from scan results
    const allFiles = getAllFiles(result.root);
    expect(allFiles.includes('test.spec.ts')).toBe(false);
  });

  it('should ignore node_modules by default', async () => {
    const scanner = new FileSystemScanner(TEST_DIR);
    const result = await scanner.scanProject();

    // Verify node_modules exists in mock filesystem
    const hasNodeModules = [...mockFileSystem.values()].some(
      entry => entry.name === 'node_modules'
    );
    expect(hasNodeModules).toBe(true);

    // Verify it's excluded from scan results
    const allFiles = getAllFiles(result.root);
    expect(allFiles.some(name => name === 'node_modules')).toBe(false);
  });

  it('should provide file type statistics', async () => {
    const scanner = new FileSystemScanner(TEST_DIR);
    await scanner.scanProject();

    const stats = scanner.getFileTypeStats();
    expect(stats.get('.ts')).toBe(2);
    expect(stats.get('.json')).toBe(1);
  });

  it('should throw error when getting stats before scan', () => {
    const scanner = new FileSystemScanner(TEST_DIR);
    expect(() => scanner.getFileTypeStats()).toThrow();
  });

  it('should handle directory read errors', async () => {
    mockedFs.readdir.mockRejectedValueOnce(new Error('Read error'));
    const scanner = new FileSystemScanner(TEST_DIR);
    const result = await scanner.scanProject();
    expect(result.root.children).toEqual([]);
  });
});

// Helper function to get all file names in the tree
function getAllFiles(node: { name: string, type: string, children?: any[] }): string[] {
  const files: string[] = [];
  if (node.type === 'file') {
    files.push(node.name);
  }
  if (node.children) {
    for (const child of node.children) {
      files.push(...getAllFiles(child));
    }
  }
  return files;
}
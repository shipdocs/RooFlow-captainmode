import { FileSystemScanner } from '../FileSystemScanner';
import { PathLike, Dirent, Stats } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock dependencies
jest.mock('fs/promises');
jest.mock('path');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;

describe('FileSystemScanner', () => {
  describe('scanProject', () => {
    const testRoot = '/test/root';
    let mockFiles: Map<string, { type: 'file' | 'directory', name: string }>;

    beforeEach(() => {
      jest.clearAllMocks();

      mockFiles = new Map([
        [testRoot, { type: 'directory', name: 'root' }],
        [`${testRoot}/src`, { type: 'directory', name: 'src' }],
        [`${testRoot}/src/a.js`, { type: 'file', name: 'a.js' }],
        [`${testRoot}/src/b.js`, { type: 'file', name: 'b.js' }],
        [`${testRoot}/src/c.js`, { type: 'file', name: 'c.js' }]
      ]);

      // Mock path methods
      mockedPath.join.mockImplementation((...paths) => paths.join('/'));
      mockedPath.basename.mockImplementation(filepath => filepath.split('/').pop() || '');
      mockedPath.relative.mockImplementation((from, to) => {
        const fromParts = from.split('/').filter(Boolean);
        const toParts = to.split('/').filter(Boolean);
        
        let i = 0;
        while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
          i++;
        }
        
        return toParts.slice(i).join('/');
      });
      mockedPath.extname.mockImplementation(filepath => {
        const basename = filepath.split('/').pop() || '';
        const match = basename.match(/\.[^.]+$/);
        return match ? match[0] : '';
      });

      // Mock fs methods
      mockedFs.stat.mockImplementation(async (filepath: PathLike) => {
        const entry = mockFiles.get(filepath.toString());
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
          size: 1000,
          atime: new Date(),
          mtime: new Date(),
          ctime: new Date(),
          birthtime: new Date()
        } as Stats;

        return stats;
      });

      mockedFs.readdir.mockImplementation(async (dirPath: PathLike, options?: { withFileTypes?: boolean }) => {
        const dir = dirPath.toString();
        const entry = mockFiles.get(dir);
        if (!entry || entry.type !== 'directory') {
          throw new Error('ENOTDIR: not a directory');
        }

        const children = Array.from(mockFiles.entries())
          .filter(([path, _]) => {
            const parent = path.substring(0, path.lastIndexOf('/'));
            return parent === dir;
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

        return children as any;
      });
    });

    it('should scan root directory', async () => {
      const scanner = new FileSystemScanner(testRoot);
      const result = await scanner.scanProject();

      expect(result.root).toBeDefined();
      expect(result.root.path).toBe(testRoot);
      expect(result.summary.totalDirs).toBe(2); // root and src
    });

    it('should handle nested files and directories', async () => {
      const scanner = new FileSystemScanner(testRoot);
      const result = await scanner.scanProject();

      expect(result.summary.totalFiles).toBe(3); // a.js, b.js, c.js
      expect(result.summary.totalDirs).toBe(2); // root and src
      expect(result.summary.fileTypes.get('.js')).toBe(3);
    });

    it('should respect depth option', async () => {
      const scanner = new FileSystemScanner(testRoot);
      const result = await scanner.scanProject({ depth: 0 });

      expect(result.root.children).toBeUndefined();
    });

    it('should handle scan errors gracefully', async () => {
      mockedFs.readdir.mockRejectedValueOnce(new Error('Permission denied'));

      const scanner = new FileSystemScanner(testRoot);
      const result = await scanner.scanProject();

      expect(result.root.children).toEqual([]);
    });

    it('should sort children by name', async () => {
      const scanner = new FileSystemScanner(testRoot);
      const result = await scanner.scanProject();

      const srcDir = result.root.children?.find(c => c.name === 'src');
      const files = srcDir?.children?.map(c => c.name) || [];

      expect(files).toEqual(['a.js', 'b.js', 'c.js']);
    });
  });

  describe('exclusion patterns', () => {
    const testRoot = '/test/root';
    let mockFiles: Map<string, { type: 'file' | 'directory', name: string }>;

    beforeEach(() => {
      jest.clearAllMocks();

      mockFiles = new Map([
        [testRoot, { type: 'directory', name: 'root' }],
        [`${testRoot}/node_modules`, { type: 'directory', name: 'node_modules' }],
        [`${testRoot}/node_modules/test`, { type: 'directory', name: 'test' }],
        [`${testRoot}/src`, { type: 'directory', name: 'src' }],
        [`${testRoot}/src/test.spec.ts`, { type: 'file', name: 'test.spec.ts' }],
        [`${testRoot}/src/code.ts`, { type: 'file', name: 'code.ts' }]
      ]);

      // Mock fs methods (same as above)
      mockedFs.stat.mockImplementation(async (filepath: PathLike) => {
        const entry = mockFiles.get(filepath.toString());
        if (!entry) throw new Error('File not found');

        return {
          isFile: () => entry.type === 'file',
          isDirectory: () => entry.type === 'directory',
          isSymbolicLink: () => false,
          size: 1000,
          mtime: new Date()
        } as Stats;
      });

      mockedFs.readdir.mockImplementation(async (dirPath: PathLike, options?: { withFileTypes?: boolean }) => {
        const dir = dirPath.toString();
        if (!mockFiles.has(dir)) throw new Error('Directory not found');

        const children = Array.from(mockFiles.entries())
          .filter(([path, _]) => path.startsWith(dir + '/'))
          .filter(([path, _]) => path.split('/').length === dir.split('/').length + 1)
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

        return children as any;
      });
    });

    it('should ignore node_modules by default', async () => {
      const scanner = new FileSystemScanner(testRoot);
      const result = await scanner.scanProject();

      expect(result.root.children?.some(c => c.name === 'node_modules')).toBeFalsy();
    });

    it('should respect custom ignore patterns', async () => {
      const scanner = new FileSystemScanner(testRoot);
      scanner.addIgnorePatterns(['**/*.spec.ts']);
      const result = await scanner.scanProject();

      const hasSpecFile = result.root.children?.some(dir =>
        dir.children?.some(file => file.name === 'test.spec.ts')
      );

      expect(hasSpecFile).toBeFalsy();
      expect(result.summary.fileTypes.get('.ts')).toBe(1); // Only code.ts
    });
  });
});
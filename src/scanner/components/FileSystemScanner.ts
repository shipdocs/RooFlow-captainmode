import * as fs from 'fs/promises';
import { Stats } from 'fs';
import * as path from 'path';
import { PathLike } from 'fs';

export interface FileStats {
  size: number;
  lastModified: Date;
  type: 'file' | 'directory' | 'symlink';
}

export interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory' | 'symlink';
  stats: FileStats;
  children?: FileNode[];
}

export interface ProjectStructure {
  root: FileNode;
  summary: {
    totalFiles: number;
    totalDirs: number;
    fileTypes: Map<string, number>;
    totalSize: number;
  };
}

export interface ScanOptions {
  depth?: number;
  excludePatterns?: string[];
}

export class FileSystemScanner {
  private currentOptions: ScanOptions;
  private fileTypeStats: Map<string, number> = new Map();
  private ignorePatterns: string[] = ['node_modules/**/*'];
  private summary: ProjectStructure['summary'];

  constructor(
    private readonly rootPath: string,
    defaultOptions: ScanOptions = {}
  ) {
    this.currentOptions = defaultOptions;
    this.summary = {
      totalFiles: 0,
      totalDirs: 0,
      fileTypes: new Map(),
      totalSize: 0
    };
  }

  public addIgnorePatterns(patterns: string[]): void {
    this.ignorePatterns.push(...patterns);
  }

  public getFileTypeStats(): Map<string, number> {
    if (!this.fileTypeStats.size) {
      throw new Error('No file stats available. Run scanProject first.');
    }
    return new Map(this.fileTypeStats);
  }

  async scanProject(options?: ScanOptions): Promise<ProjectStructure> {
    // Reset counters
    this.summary.totalFiles = 0;
    this.summary.totalDirs = 0;
    this.summary.totalSize = 0;
    this.summary.fileTypes.clear();
    this.fileTypeStats.clear();

    // Merge options
    this.currentOptions = { ...this.currentOptions, ...options };

    try {
      const root = await this.scanDirectory(this.rootPath, 0);
      this.fileTypeStats = this.summary.fileTypes;
      return { root, summary: { ...this.summary } };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to scan project at ${this.rootPath}: ${message}`);
    }
  }

  private async scanDirectory(dirPath: string, currentDepth: number): Promise<FileNode> {
    const stats = await fs.stat(dirPath);
    const name = path.basename(dirPath);
    const type = this.getFileType(stats);
    
    // Early exit if path should be excluded
    const relativePath = path.relative(this.rootPath, dirPath);
    if (relativePath && this.shouldExclude(relativePath)) {
      throw new Error('EXCLUDED_PATH');
    }

    const node: FileNode = {
      path: dirPath,
      name,
      type,
      stats: {
        size: stats.size,
        lastModified: stats.mtime,
        type
      }
    };

    if (stats.isDirectory()) {
      // Don't count excluded directories
      if (!this.shouldExclude(relativePath)) {
        this.summary.totalDirs++;
      }

      // Check depth limit
      if (this.currentOptions.depth !== undefined && currentDepth >= this.currentOptions.depth) {
        return node;
      }

      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        node.children = [];

        // Process child entries
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relPath = path.relative(this.rootPath, fullPath);
          
          if (!this.shouldExclude(relPath)) {
            try {
              const childNode = await this.scanDirectory(fullPath, currentDepth + 1);
              node.children.push(childNode);
            } catch (error) {
              if (error instanceof Error && error.message === 'EXCLUDED_PATH') {
                continue;
              }
              throw error;
            }
          }
        }

        // Sort children by name
        node.children.sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error scanning directory ${dirPath}:`, message);
        node.children = [];
      }
    } else if (stats.isFile()) {
      this.summary.totalFiles++;
      this.summary.totalSize += stats.size;
      
      const ext = path.extname(name).toLowerCase();
      const currentCount = this.summary.fileTypes.get(ext) || 0;
      this.summary.fileTypes.set(ext, currentCount + 1);
    }

    return node;
  }

  private getFileType(stats: Stats): FileNode['type'] {
    if (stats.isFile()) return 'file';
    if (stats.isDirectory()) return 'directory';
    if (stats.isSymbolicLink()) return 'symlink';
    return 'file'; // Default to file for other types
  }

  private shouldExclude(relativePath: string): boolean {
    if (!relativePath) return false;

    const patterns = [...(this.currentOptions.excludePatterns || []), ...this.ignorePatterns];
    if (!patterns.length) return false;

    return patterns.some(pattern => {
      // Convert glob pattern to regex
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '__DOUBLE_STAR__')
        .replace(/\*/g, '[^/]*')
        .replace(/__DOUBLE_STAR__/g, '.*');

      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(relativePath);
    });
  }
}
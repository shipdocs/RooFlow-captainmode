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
export declare class FileSystemScanner {
    private readonly rootPath;
    private currentOptions;
    private fileTypeStats;
    private ignorePatterns;
    private summary;
    constructor(rootPath: string, defaultOptions?: ScanOptions);
    addIgnorePatterns(patterns: string[]): void;
    getFileTypeStats(): Map<string, number>;
    scanProject(options?: ScanOptions): Promise<ProjectStructure>;
    private scanDirectory;
    private getFileType;
    private shouldExclude;
}

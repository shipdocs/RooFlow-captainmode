"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemScanner = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class FileSystemScanner {
    constructor(rootPath, defaultOptions = {}) {
        this.rootPath = rootPath;
        this.fileTypeStats = new Map();
        this.ignorePatterns = ['node_modules/**/*'];
        this.currentOptions = defaultOptions;
        this.summary = {
            totalFiles: 0,
            totalDirs: 0,
            fileTypes: new Map(),
            totalSize: 0
        };
    }
    addIgnorePatterns(patterns) {
        this.ignorePatterns.push(...patterns);
    }
    getFileTypeStats() {
        if (!this.fileTypeStats.size) {
            throw new Error('No file stats available. Run scanProject first.');
        }
        return new Map(this.fileTypeStats);
    }
    async scanProject(options) {
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to scan project at ${this.rootPath}: ${message}`);
        }
    }
    async scanDirectory(dirPath, currentDepth) {
        const stats = await fs.stat(dirPath);
        const name = path.basename(dirPath);
        const type = this.getFileType(stats);
        // Early exit if path should be excluded
        const relativePath = path.relative(this.rootPath, dirPath);
        if (relativePath && this.shouldExclude(relativePath)) {
            throw new Error('EXCLUDED_PATH');
        }
        const node = {
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
                        }
                        catch (error) {
                            if (error instanceof Error && error.message === 'EXCLUDED_PATH') {
                                continue;
                            }
                            throw error;
                        }
                    }
                }
                // Sort children by name
                node.children.sort((a, b) => a.name.localeCompare(b.name));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`Error scanning directory ${dirPath}:`, message);
                node.children = [];
            }
        }
        else if (stats.isFile()) {
            this.summary.totalFiles++;
            this.summary.totalSize += stats.size;
            const ext = path.extname(name).toLowerCase();
            const currentCount = this.summary.fileTypes.get(ext) || 0;
            this.summary.fileTypes.set(ext, currentCount + 1);
        }
        return node;
    }
    getFileType(stats) {
        if (stats.isFile())
            return 'file';
        if (stats.isDirectory())
            return 'directory';
        if (stats.isSymbolicLink())
            return 'symlink';
        return 'file'; // Default to file for other types
    }
    shouldExclude(relativePath) {
        if (!relativePath)
            return false;
        const patterns = [...(this.currentOptions.excludePatterns || []), ...this.ignorePatterns];
        if (!patterns.length)
            return false;
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
exports.FileSystemScanner = FileSystemScanner;
//# sourceMappingURL=FileSystemScanner.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectSummaryMarkdown = exports.formatSize = exports.DEFAULT_SCAN_OPTIONS = exports.RegistryUpdater = exports.ContextBuilder = exports.TaskScanner = exports.FileSystemScanner = void 0;
const FileSystemScanner_1 = require("./scanner/components/FileSystemScanner");
Object.defineProperty(exports, "FileSystemScanner", { enumerable: true, get: function () { return FileSystemScanner_1.FileSystemScanner; } });
const TaskScanner_1 = require("./scanner/components/TaskScanner");
Object.defineProperty(exports, "TaskScanner", { enumerable: true, get: function () { return TaskScanner_1.TaskScanner; } });
const ContextBuilder_1 = require("./scanner/components/ContextBuilder");
Object.defineProperty(exports, "ContextBuilder", { enumerable: true, get: function () { return ContextBuilder_1.ContextBuilder; } });
const RegistryUpdater_1 = require("./scanner/components/RegistryUpdater");
Object.defineProperty(exports, "RegistryUpdater", { enumerable: true, get: function () { return RegistryUpdater_1.RegistryUpdater; } });
// Re-export default configuration
exports.DEFAULT_SCAN_OPTIONS = {
    depth: Infinity,
    excludePatterns: []
};
// Export utility functions
const formatSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
};
exports.formatSize = formatSize;
const getProjectSummaryMarkdown = (summary) => {
    const fileTypes = Array.from(summary.fileTypes.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([ext, count]) => {
        return `- ${ext}: ${count} files`;
    })
        .join('\n');
    return `# Project Scan Summary

## Statistics
- Total Files: ${summary.totalFiles}
- Total Directories: ${summary.totalDirs}
- Total Size: ${(0, exports.formatSize)(summary.totalSize)}

## File Types
${fileTypes}
`;
};
exports.getProjectSummaryMarkdown = getProjectSummaryMarkdown;
//# sourceMappingURL=index.js.map
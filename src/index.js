"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectSummaryMarkdown = exports.formatSize = exports.DEFAULT_SCAN_OPTIONS = exports.RegistryUpdater = exports.ContextBuilder = exports.TaskScanner = exports.FileSystemScanner = void 0;
var FileSystemScanner_1 = require("./scanner/components/FileSystemScanner");
Object.defineProperty(exports, "FileSystemScanner", { enumerable: true, get: function () { return FileSystemScanner_1.FileSystemScanner; } });
var TaskScanner_1 = require("./scanner/components/TaskScanner");
Object.defineProperty(exports, "TaskScanner", { enumerable: true, get: function () { return TaskScanner_1.TaskScanner; } });
var ContextBuilder_1 = require("./scanner/components/ContextBuilder");
Object.defineProperty(exports, "ContextBuilder", { enumerable: true, get: function () { return ContextBuilder_1.ContextBuilder; } });
var RegistryUpdater_1 = require("./scanner/components/RegistryUpdater");
Object.defineProperty(exports, "RegistryUpdater", { enumerable: true, get: function () { return RegistryUpdater_1.RegistryUpdater; } });
// Re-export default configuration
exports.DEFAULT_SCAN_OPTIONS = {
    depth: Infinity,
    excludePatterns: [],
    includeHidden: false
};
// Export utility functions
var formatSize = function (bytes) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var size = bytes;
    var unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return "".concat(size.toFixed(2), " ").concat(units[unitIndex]);
};
exports.formatSize = formatSize;
var getProjectSummaryMarkdown = function (summary) {
    var fileTypes = Array.from(summary.fileTypes.entries())
        .sort(function (a, b) { return b[1] - a[1]; })
        .map(function (entry) {
        var ext = entry[0], count = entry[1];
        return "- ".concat(ext, ": ").concat(count, " files");
    })
        .join('\n');
    return "# Project Scan Summary\n\n## Statistics\n- Total Files: ".concat(summary.totalFiles, "\n- Total Directories: ").concat(summary.totalDirs, "\n- Total Size: ").concat((0, exports.formatSize)(summary.totalSize), "\n\n## File Types\n").concat(fileTypes, "\n");
};
exports.getProjectSummaryMarkdown = getProjectSummaryMarkdown;

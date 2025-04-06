import { FileSystemScanner } from './scanner/components/FileSystemScanner';
import type { FileStats, FileNode, ScanOptions, ProjectStructure } from './scanner/components/FileSystemScanner';
import { TaskScanner } from './scanner/components/TaskScanner';
import type { TaskMarker, TaskLocation, DiscoveredTask, TaskScanResults, TaskScanOptions, Priority } from './scanner/components/TaskScanner';
import { ContextBuilder } from './scanner/components/ContextBuilder';
import type { ProjectMetadata, ProjectContext, ContextBuilderOptions } from './scanner/components/ContextBuilder';
import { RegistryUpdater } from './scanner/components/RegistryUpdater';
import type { RegistryUpdaterOptions } from './scanner/components/RegistryUpdater';

export {
  FileSystemScanner,
  TaskScanner,
  ContextBuilder,
  RegistryUpdater
};

export type {
  FileStats,
  FileNode,
  ScanOptions,
  ProjectStructure,
  TaskMarker,
  TaskLocation,
  DiscoveredTask,
  TaskScanResults,
  TaskScanOptions,
  Priority,
  ProjectMetadata,
  ProjectContext,
  ContextBuilderOptions,
  RegistryUpdaterOptions
};

// Re-export default configuration
export const DEFAULT_SCAN_OPTIONS: ScanOptions = {
  depth: Infinity,
  excludePatterns: []
};

// Export utility functions
export const formatSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const getProjectSummaryMarkdown = (summary: ProjectStructure['summary']): string => {
  const fileTypes = Array.from(summary.fileTypes.entries())
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    .map(([ext, count]: [string, number]) => {
      return `- ${ext}: ${count} files`;
    })
    .join('\n');

  return `# Project Scan Summary

## Statistics
- Total Files: ${summary.totalFiles}
- Total Directories: ${summary.totalDirs}
- Total Size: ${formatSize(summary.totalSize)}

## File Types
${fileTypes}
`;
};
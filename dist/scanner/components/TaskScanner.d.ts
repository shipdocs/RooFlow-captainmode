export type Priority = 'low' | 'medium' | 'high' | undefined;
export interface TaskMarker {
    type: 'TODO' | 'FIXME' | 'NOTE' | 'HACK' | 'BUG' | 'ISSUE';
    description: string;
    priority?: Priority;
    assignee?: string;
    labels: string[];
}
export interface TaskLocation {
    filePath: string;
    lineNumber: number;
    columnNumber: number;
    context: string;
}
export interface DiscoveredTask {
    marker: TaskMarker;
    location: TaskLocation;
}
export interface TaskStatistics {
    totalTasks: number;
    byType: Map<string, number>;
    byPriority: Map<string, number>;
    byLabel: Map<string, number>;
}
export interface TaskScanResults {
    tasks: DiscoveredTask[];
    statistics: TaskStatistics;
}
export interface TaskScanOptions {
    include?: string[];
    exclude?: string[];
    customMarkers?: string[];
}
export declare class TaskScanner {
    private readonly options;
    private static readonly DEFAULT_MARKERS;
    private static readonly MARKER_PATTERN;
    private static readonly EXCLAMATION_PATTERN;
    private static readonly ASSIGNEE_PATTERN;
    private static readonly LABEL_PATTERN;
    private readonly markers;
    constructor(options?: TaskScanOptions);
    scanDirectory(dirPath: string): Promise<TaskScanResults>;
    private getFilesToScan;
    private scanFile;
    private extractPriority;
    private extractAssignee;
    private extractLabels;
    private getTaskContext;
}

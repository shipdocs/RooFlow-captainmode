export type Priority = 'low' | 'medium' | 'high' | 'none' | undefined;
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
export interface TaskScanResults {
    tasks: DiscoveredTask[];
    statistics: {
        totalTasks: number;
        byType: Map<string, number>;
        byPriority: Map<string, number>;
        byLabel: Map<string, number>;
    };
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
    private static readonly PRIORITY_PATTERN;
    private static readonly LABEL_PATTERN;
    private static readonly ASSIGNEE_PATTERN;
    constructor(options?: TaskScanOptions);
    scanFile(filePath: string): Promise<DiscoveredTask[]>;
    scanDirectory(dirPath: string): Promise<TaskScanResults>;
    private getFilesToScan;
    private extractPriority;
    private extractLabels;
    private extractAssignee;
}

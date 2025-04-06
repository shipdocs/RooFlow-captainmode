export interface TaskLocation {
    file: string;
    line: number;
    column?: number;
}
export interface DiscoveredTask {
    type: string;
    description: string;
    priority?: number;
    assignees?: string[];
    labels?: string[];
    location: TaskLocation;
    lineContent: string;
    metadata?: Record<string, unknown>;
}
export interface TaskScanOptions {
    include?: string[];
    exclude?: string[];
    customMarkers?: string[];
}
export interface TaskScanResult {
    tasks: DiscoveredTask[];
    statistics: {
        totalTasks: number;
        byType: Map<string, number>;
        byPriority?: Map<number, number>;
        byLabel?: Map<string, number>;
    };
}
export interface TaskScannerOptions {
    markers?: string[];
    assigneePrefix?: string;
    labelPrefix?: string;
    priorityPattern?: RegExp;
}
export declare enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    BLOCKED = "blocked",
    COMPLETED = "completed",
    FAILED = "failed"
}
export interface TaskTransition {
    from: TaskStatus;
    to: TaskStatus;
    by?: string;
    at: Date;
    comment?: string;
    fromMode?: string;
    toMode?: string;
    reason?: string;
    timestamp?: Date;
}
export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: number;
    assignees: string[];
    labels: string[];
    created: Date;
    updated?: Date;
    transitions?: TaskTransition[];
    metadata?: Record<string, unknown>;
    location?: TaskLocation;
    assignedMode?: string;
    modeChain?: string[];
    notes?: string;
    dependencies?: string[];
}

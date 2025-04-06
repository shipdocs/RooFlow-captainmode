import { ProjectContext } from './ContextBuilder';
export interface RegistryEntry {
    taskId: string;
    type: string;
    description: string;
    priority?: string;
    assignee?: string;
    labels: string[];
    file: string;
    line: number;
    status: 'active' | 'completed';
    created: string;
    updated: string;
}
export interface RegistryUpdaterOptions {
    memoryBankUri: string;
    taskRegistryPath: string;
}
export declare class RegistryUpdater {
    private readonly rootPath;
    private readonly options;
    private registryPath;
    constructor(rootPath: string, options: RegistryUpdaterOptions);
    updateRegistry(context: ProjectContext): Promise<void>;
    private convertTasksToEntries;
    private convertTaskToEntry;
    private generateTaskId;
    private generateRegistryMarkdown;
    private generateStatsSections;
    private updateMemoryBank;
}

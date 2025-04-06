import { ProjectStructure } from './FileSystemScanner';
import { TaskScanResults, TaskScanOptions } from './TaskScanner';
export interface ProjectMetadata {
    name?: string;
    version?: string;
    description?: string;
    license?: string;
    authors?: string[];
    dependencies?: string[];
    devDependencies?: string[];
}
export interface ProjectContext {
    metadata: ProjectMetadata;
    fileSystem: ProjectStructure;
    tasks: TaskScanResults;
    documentation: string[];
}
export interface ContextBuilderOptions {
    includeDocumentation?: string[];
    excludeDocumentation?: string[];
    taskScanOptions?: TaskScanOptions;
}
export declare class ContextBuilder {
    private readonly rootPath;
    private readonly options;
    constructor(rootPath: string, options?: ContextBuilderOptions);
    buildContext(): Promise<ProjectContext>;
    private extractMetadata;
    private parseMetadataFromMarkdown;
    private scanFileSystem;
    private scanTasks;
    private extractDocumentation;
}

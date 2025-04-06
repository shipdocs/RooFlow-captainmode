import * as fs from 'fs/promises';
import * as path from 'path';
import { FileSystemScanner, ProjectStructure } from './FileSystemScanner';
import { TaskScanner, TaskScanResults, TaskScanOptions } from './TaskScanner';
import * as glob from 'glob';

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

export class ContextBuilder {
  constructor(
    private readonly rootPath: string,
    private readonly options: ContextBuilderOptions = {}
  ) {}

  async buildContext(): Promise<ProjectContext> {
    const metadata = await this.extractMetadata();
    const fileSystem = await this.scanFileSystem();
    const tasks = await this.scanTasks();
    const documentation = await this.extractDocumentation();

    return {
      metadata,
      fileSystem,
      tasks,
      documentation
    };
  }

  private async extractMetadata(): Promise<ProjectMetadata> {
    try {
      // Try reading from package.json first
      const packagePath = path.join(this.rootPath, 'package.json');
      try {
        const packageContent = await fs.readFile(packagePath, 'utf-8');
        const packageJson = JSON.parse(packageContent);
        return {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          license: packageJson.license,
          authors: packageJson.authors,
          dependencies: packageJson.dependencies ? Object.keys(packageJson.dependencies) : [],
          devDependencies: packageJson.devDependencies ? Object.keys(packageJson.devDependencies) : []
        };
      } catch (e) {
        // If no package.json, try productContext.md
        const productContextPath = path.join(this.rootPath, 'memory-bank/productContext.md');
        let productContextContent: string;
        try {
            productContextContent = await fs.readFile(productContextPath, 'utf-8');
        } catch (e) {
            console.warn("Could not read productContext.md, using default metadata");
            return {};
        }

        return this.parseMetadataFromMarkdown(productContextContent);
      }
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {};
    }
  }

  private parseMetadataFromMarkdown(markdownContent: string): ProjectMetadata {
    const metadata: ProjectMetadata = {};

    // Extract project name
    const nameMatch = markdownContent.match(/## Project Goal\s*\n\s*\*([^*]+)/);
    if (nameMatch && nameMatch[1]) {
      metadata.name = nameMatch[1].trim();
    }

    // Extract project description
    const descriptionMatch = markdownContent.match(/## Key Features\s*\n\s*\*([^*]+)/);
    if (descriptionMatch && descriptionMatch[1]) {
      metadata.description = descriptionMatch[1].trim();
    }

    // Extract version if available
    const versionMatch = markdownContent.match(/## Version\s*\n\s*\*([^*]+)/);
    if (versionMatch && versionMatch[1]) {
      metadata.version = versionMatch[1].trim();
    }

    // Extract license if available
    const licenseMatch = markdownContent.match(/## License\s*\n\s*\*([^*]+)/);
    if (licenseMatch && licenseMatch[1]) {
      metadata.license = licenseMatch[1].trim();
    }

    return metadata;
  }

  private async scanFileSystem(): Promise<ProjectStructure> {
    const fileScanner = new FileSystemScanner(this.rootPath);
    return fileScanner.scanProject();
  }

  private async scanTasks(): Promise<TaskScanResults> {
    const taskScanner = new TaskScanner(this.options.taskScanOptions);
    return taskScanner.scanDirectory(this.rootPath);
  }

  private async extractDocumentation(): Promise<string[]> {
    try {
      const includePatterns = this.options.includeDocumentation || [
        '**/*.md',
        '**/doc/**/*',
        '**/docs/**/*',
        '**/documentation/**/*',
        'README*'
      ];
      const excludePatterns = this.options.excludeDocumentation || [
        'node_modules/**',
        'dist/**',
        'build/**',
        'coverage/**'
      ];

      const docFiles = new Set<string>();

      for (const pattern of includePatterns) {
        const matches = glob.sync(pattern, {
          cwd: this.rootPath,
          ignore: excludePatterns,
          nodir: true,
          absolute: true
        });
        matches.forEach(file => docFiles.add(file));
      }

      const documentationContents = await Promise.all(
        Array.from(docFiles).map(async file => {
          try {
            const content = await fs.readFile(file, 'utf-8');
            const relativePath = path.relative(this.rootPath, file);
            return `# ${relativePath}\n\n${content}`;
          } catch (error) {
            console.error(`Error reading documentation file ${file}:`, error);
            return '';
          }
        })
      );

      return documentationContents.filter(content => content !== '');
    } catch (error) {
      console.error('Error extracting documentation:', error);
      return [];
    }
  }
}

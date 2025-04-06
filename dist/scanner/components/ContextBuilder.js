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
exports.ContextBuilder = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const FileSystemScanner_1 = require("./FileSystemScanner");
const TaskScanner_1 = require("./TaskScanner");
const glob = __importStar(require("glob"));
class ContextBuilder {
    constructor(rootPath, options = {}) {
        this.rootPath = rootPath;
        this.options = options;
    }
    async buildContext() {
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
    async extractMetadata() {
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
            }
            catch (e) {
                // If no package.json, try productContext.md
                const productContextPath = path.join(this.rootPath, 'memory-bank/productContext.md');
                let productContextContent;
                try {
                    productContextContent = await fs.readFile(productContextPath, 'utf-8');
                }
                catch (e) {
                    console.warn("Could not read productContext.md, using default metadata");
                    return {};
                }
                return this.parseMetadataFromMarkdown(productContextContent);
            }
        }
        catch (error) {
            console.error('Error extracting metadata:', error);
            return {};
        }
    }
    parseMetadataFromMarkdown(markdownContent) {
        const metadata = {};
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
    async scanFileSystem() {
        const fileScanner = new FileSystemScanner_1.FileSystemScanner(this.rootPath);
        return fileScanner.scanProject();
    }
    async scanTasks() {
        const taskScanner = new TaskScanner_1.TaskScanner(this.options.taskScanOptions);
        return taskScanner.scanDirectory(this.rootPath);
    }
    async extractDocumentation() {
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
            const docFiles = new Set();
            for (const pattern of includePatterns) {
                const matches = glob.sync(pattern, {
                    cwd: this.rootPath,
                    ignore: excludePatterns,
                    nodir: true,
                    absolute: true
                });
                matches.forEach(file => docFiles.add(file));
            }
            const documentationContents = await Promise.all(Array.from(docFiles).map(async (file) => {
                try {
                    const content = await fs.readFile(file, 'utf-8');
                    const relativePath = path.relative(this.rootPath, file);
                    return `# ${relativePath}\n\n${content}`;
                }
                catch (error) {
                    console.error(`Error reading documentation file ${file}:`, error);
                    return '';
                }
            }));
            return documentationContents.filter(content => content !== '');
        }
        catch (error) {
            console.error('Error extracting documentation:', error);
            return [];
        }
    }
}
exports.ContextBuilder = ContextBuilder;
//# sourceMappingURL=ContextBuilder.js.map
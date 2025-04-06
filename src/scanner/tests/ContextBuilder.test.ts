import { ContextBuilder } from '../components/ContextBuilder';
import * as fs from 'fs/promises';
import * as path from 'path';

const TEST_DIR = path.join(__dirname, '../../..', 'test-context');

describe('ContextBuilder', () => {
  beforeAll(async () => {
    // Create test project structure
    await fs.mkdir(TEST_DIR, { recursive: true });
    await fs.writeFile(
      path.join(TEST_DIR, 'package.json'),
      `{
        "name": "test-project",
        "version": "1.0.0",
        "description": "Test project for context builder",
        "license": "MIT",
        "authors": ["Test Author"],
        "dependencies": {"dep1": "1.0.0"},
        "devDependencies": {"devDep1": "2.0.0"}
      }`
    );
    await fs.writeFile(path.join(TEST_DIR, 'test.txt'), 'Test file content');
  });

  afterAll(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should build project context correctly', async () => {
    const contextBuilder = new ContextBuilder(TEST_DIR);
    const context = await contextBuilder.buildContext();

    // Check metadata
    expect(context.metadata.name).toBe('test-project');
    expect(context.metadata.version).toBe('1.0.0');
    expect(context.metadata.description).toBe('Test project for context builder');
    expect(context.metadata.license).toBe('MIT');
    expect(context.metadata.authors).toEqual(['Test Author']);
    expect(context.metadata.dependencies).toEqual(['dep1']);
    expect(context.metadata.devDependencies).toEqual(['devDep1']);

    // Check file system
    expect(context.fileSystem.root.name).toBe('test-context');
    expect(context.fileSystem.summary.totalFiles).toBeGreaterThanOrEqual(1);

    // Check tasks
    expect(context.tasks.statistics.totalTasks).toBe(0);

    // Check documentation
    expect(context.documentation).toEqual([]);
  });
});
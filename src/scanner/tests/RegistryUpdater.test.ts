import { RegistryUpdater, RegistryUpdaterOptions } from '../components/RegistryUpdater';
import { ProjectContext } from '../components/ContextBuilder';

describe('RegistryUpdater', () => {
  it('should call updateRegistry', async () => {
    const rootPath = './';
    const options: RegistryUpdaterOptions = {
      memoryBankUri: 'test',
      taskRegistryPath: 'test'
    };
    const registryUpdater = new RegistryUpdater(rootPath, options);

    const context: ProjectContext = {
      metadata: {},
      fileSystem: {root: {path: 'test', name: 'test', type: 'directory', stats: {size: 0, lastModified: new Date(), type: 'directory'}}, summary: {totalFiles: 0, totalDirs: 0, fileTypes: new Map(), totalSize: 0}},
      tasks: {tasks: [], statistics: {totalTasks: 0, byType: new Map(), byPriority: new Map(), byLabel: new Map()}},
      documentation: []
    };

    const consoleLogSpy = jest.spyOn(console, 'log');

    await registryUpdater.updateRegistry(context);

    expect(consoleLogSpy).toHaveBeenCalledWith('Updating registry with context:', context);
  });
});
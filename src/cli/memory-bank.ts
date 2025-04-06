import { Command } from 'commander';
import { Roo } from '../roo';
import { MemoryBankManager } from '../memory-bank/MemoryBankManager';
import * as path from 'path';

export function setupMemoryBankCommands(program: Command, roo: Roo): void {
  const memoryBankCommand = program
    .command('memory-bank')
    .description('Memory Bank management commands');

  memoryBankCommand
    .command('status')
    .description('Check Memory Bank status')
    .action(async () => {
      const memoryBankManager = new MemoryBankManager(roo.getRootPath());
      const status = await memoryBankManager.initialize();
      
      console.log('Memory Bank Status:');
      console.log(`- Active: ${status.active ? 'Yes' : 'No'}`);
      
      if (status.lastSynchronized) {
        console.log(`- Last Synchronized: ${status.lastSynchronized.toISOString()}`);
      }
      
      if (status.missingFiles && status.missingFiles.length > 0) {
        console.log(`- Missing Files: ${status.missingFiles.join(', ')}`);
      }
    });

  memoryBankCommand
    .command('create')
    .description('Create Memory Bank if it does not exist')
    .action(async () => {
      const memoryBankManager = new MemoryBankManager(roo.getRootPath());
      const result = await memoryBankManager.createMemoryBank();
      
      if (result.success) {
        console.log('Memory Bank created successfully');
        console.log(`Created files: ${result.updatedFiles.join(', ')}`);
      } else {
        console.error('Failed to create Memory Bank');
        if (result.errors) {
          console.error(`Errors: ${result.errors.join(', ')}`);
        }
      }
    });

  memoryBankCommand
    .command('validate')
    .description('Validate Memory Bank structure')
    .action(async () => {
      const memoryBankManager = new MemoryBankManager(roo.getRootPath());
      const result = await memoryBankManager.synchronizer.validateMemoryBank();
      
      if (result.success) {
        console.log('Memory Bank validation successful');
        console.log(`Found files: ${result.updatedFiles.join(', ')}`);
      } else {
        console.error('Memory Bank validation failed');
        if (result.errors) {
          console.error(`Errors: ${result.errors.join(', ')}`);
        }
      }
    });

  memoryBankCommand
    .command('record-decision')
    .description('Record a decision in the Memory Bank')
    .argument('<title>', 'Decision title')
    .argument('<rationale>', 'Decision rationale')
    .argument('<implementation>', 'Implementation details')
    .action(async (title: string, rationale: string, implementation: string) => {
      const memoryBankManager = new MemoryBankManager(roo.getRootPath());
      const result = await memoryBankManager.recordDecision(title, rationale, implementation);
      
      if (result.success) {
        console.log('Decision recorded successfully');
      } else {
        console.error('Failed to record decision');
        if (result.errors) {
          console.error(`Errors: ${result.errors.join(', ')}`);
        }
      }
    });

  memoryBankCommand
    .command('record-pattern')
    .description('Record a system pattern in the Memory Bank')
    .argument('<name>', 'Pattern name')
    .argument('<type>', 'Pattern type (Coding, Architectural, Testing)')
    .argument('<description>', 'Pattern description')
    .action(async (name: string, type: string, description: string) => {
      const memoryBankManager = new MemoryBankManager(roo.getRootPath());
      
      // Validate pattern type
      const patternType = type as 'Coding' | 'Architectural' | 'Testing';
      if (!['Coding', 'Architectural', 'Testing'].includes(patternType)) {
        console.error('Invalid pattern type. Must be one of: Coding, Architectural, Testing');
        return;
      }
      
      const result = await memoryBankManager.recordSystemPattern(name, patternType, description);
      
      if (result.success) {
        console.log('Pattern recorded successfully');
      } else {
        console.error('Failed to record pattern');
        if (result.errors) {
          console.error(`Errors: ${result.errors.join(', ')}`);
        }
      }
    });

  memoryBankCommand
    .command('record-mode-transition')
    .description('Record a mode transition in the Memory Bank')
    .argument('<from-mode>', 'Source mode')
    .argument('<to-mode>', 'Target mode')
    .argument('<reason>', 'Transition reason')
    .action(async (fromMode: string, toMode: string, reason: string) => {
      const memoryBankManager = new MemoryBankManager(roo.getRootPath());
      const result = await memoryBankManager.recordModeTransition(fromMode, toMode, reason);
      
      if (result.success) {
        console.log('Mode transition recorded successfully');
      } else {
        console.error('Failed to record mode transition');
        if (result.errors) {
          console.error(`Errors: ${result.errors.join(', ')}`);
        }
      }
    });
}

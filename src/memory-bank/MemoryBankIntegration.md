# Memory Bank Integration Documentation

This document describes how the Memory Bank system is integrated with the RooFlow Captain Mode implementation.

## Overview

The Memory Bank system provides persistent context across different modes and chat sessions. It consists of several key files:

1. **activeContext.md** - Tracks the current session's context
2. **decisionLog.md** - Records architectural and implementation decisions
3. **productContext.md** - Provides a high-level overview of the project
4. **progress.md** - Tracks the progress of the project
5. **systemPatterns.md** - Documents recurring patterns and standards
6. **taskRegistry.md** - Task tracking system

## Integration Components

The Memory Bank integration consists of the following components:

1. **MemoryBankSynchronizer** - Handles file operations and synchronization
2. **MemoryBankManager** - Manages the Memory Bank lifecycle and status
3. **TaskManager Integration** - Connects task management with Memory Bank

## Usage

### Initializing the Memory Bank

```typescript
// Create a TaskManager with Memory Bank support
const taskManager = new TaskManager('/path/to/project');

// Check if Memory Bank exists
const memoryBankManager = taskManager.getMemoryBankManager();
if (memoryBankManager) {
  const status = await memoryBankManager.initialize();
  console.log(`Memory Bank active: ${status.active}`);
} else {
  // Create Memory Bank if needed
  const created = await taskManager.createMemoryBank();
  console.log(`Memory Bank created: ${created}`);
}
```

### Task Management with Memory Bank

```typescript
// Create a task (automatically updates Memory Bank)
const task = await taskManager.createTask({
  description: 'Implement feature X',
  assignedMode: 'code'
});

// Update task status (automatically updates Memory Bank)
await taskManager.updateTaskStatus(task.id, TaskStatus.IN_PROGRESS);

// Switch task mode (automatically updates Memory Bank)
await taskManager.switchTaskMode(task.id, 'test', 'Ready for testing');
```

### Direct Memory Bank Operations

```typescript
const memoryBankManager = taskManager.getMemoryBankManager();
if (memoryBankManager) {
  // Record a decision
  await memoryBankManager.recordDecision(
    'Use TypeScript for implementation',
    'Better type safety and developer experience',
    'Configure TypeScript compiler options for strict mode'
  );
  
  // Record a system pattern
  await memoryBankManager.recordSystemPattern(
    'Repository Pattern',
    'Architectural',
    'Use repository pattern for data access layer'
  );
}
```

## Cross-Mode Synchronization

The Memory Bank system ensures that context is maintained across different modes:

1. When a task is delegated to another mode, the transition is recorded
2. The active context is updated to reflect the current focus
3. Progress is tracked across mode transitions
4. Decisions and system patterns are accessible to all modes

## Testing

The Memory Bank system includes comprehensive tests:

1. **MemoryBankSynchronizer.test.ts** - Tests file operations and synchronization
2. **TaskManager.test.ts** - Tests integration with task management

Run tests with:

```bash
npm test
```

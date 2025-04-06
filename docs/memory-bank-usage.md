# Memory Bank Usage Guide

## Overview

The Memory Bank system provides persistent context across different modes and chat sessions in RooFlow Captain Mode. This guide explains how to use and maintain the Memory Bank.

## Memory Bank Files

The Memory Bank consists of several key files:

1. **activeContext.md** - Tracks the current session's context
2. **decisionLog.md** - Records architectural and implementation decisions
3. **productContext.md** - Provides a high-level overview of the project
4. **progress.md** - Tracks the progress of the project
5. **systemPatterns.md** - Documents recurring patterns and standards
6. **taskRegistry.md** - Task tracking system

## Command Line Interface

The Memory Bank can be managed through the command line interface:

```bash
# Check Memory Bank status
roo memory-bank status

# Create Memory Bank if it doesn't exist
roo memory-bank create

# Validate Memory Bank structure
roo memory-bank validate

# Record a decision
roo memory-bank record-decision "Decision Title" "Rationale" "Implementation Details"

# Record a system pattern
roo memory-bank record-pattern "Pattern Name" "Architectural" "Pattern Description"

# Record a mode transition
roo memory-bank record-mode-transition "code" "test" "Ready for testing"
```

## Programmatic Usage

The Memory Bank can also be used programmatically:

```typescript
import { Roo } from './roo';
import { TaskStatus } from './scanner/components/interfaces/Task';

// Create a Roo instance
const roo = new Roo();

// Create a task (automatically updates Memory Bank)
const taskId = await roo.createTask('Implement feature X', 'code');

// Update task status (automatically updates Memory Bank)
await roo.updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);

// Delegate task to another mode (automatically updates Memory Bank)
await roo.delegateTask(taskId, 'test', 'Ready for testing');

// Create Memory Bank if it doesn't exist
const created = await roo.createMemoryBank();
```

## Cross-Mode Synchronization

The Memory Bank ensures that context is maintained across different modes:

1. When a task is delegated to another mode, the transition is recorded in:
   - taskRegistry.md
   - activeContext.md
   - progress.md

2. When a decision is made, it is recorded in:
   - decisionLog.md

3. When a system pattern is identified, it is recorded in:
   - systemPatterns.md

## Best Practices

1. **Regular Updates**: Update the Memory Bank regularly to maintain accurate context.
2. **Detailed Descriptions**: Provide detailed descriptions when creating tasks, recording decisions, or documenting patterns.
3. **Mode Transitions**: Always record mode transitions with clear reasons.
4. **Task Dependencies**: Specify task dependencies to maintain a clear workflow.
5. **Validation**: Periodically validate the Memory Bank structure to ensure integrity.

## Troubleshooting

If you encounter issues with the Memory Bank:

1. **Check Status**: Run `roo memory-bank status` to check the Memory Bank status.
2. **Validate Structure**: Run `roo memory-bank validate` to validate the Memory Bank structure.
3. **Create Missing Files**: If files are missing, run `roo memory-bank create` to create them.
4. **Check Permissions**: Ensure you have write permissions to the Memory Bank directory.
5. **Check Logs**: Check the console output for error messages.

## Monitoring and Maintenance

To monitor and maintain the Memory Bank:

1. **Regular Backups**: Periodically back up the Memory Bank directory.
2. **Clean Up**: Remove completed tasks that are no longer relevant.
3. **Update Context**: Keep the active context up to date with the current focus.
4. **Review Decisions**: Periodically review decisions to ensure they are still valid.
5. **Update Patterns**: Update system patterns as the project evolves.

# Captain Mode for RooFlow

## Overview

Captain Mode is a project orchestration and task management mode for RooFlow. It serves as the central coordinator for your project, breaking down complex tasks into manageable subtasks and delegating them to specialized modes (Architect, Code, Test, Debug, Ask).

## Key Features

- **Project Orchestration**: Maintains a high-level view of the entire project
- **Task Decomposition**: Breaks down complex tasks into smaller, well-defined subtasks
- **Task Delegation**: Assigns tasks to the most appropriate specialized modes
- **Progress Tracking**: Monitors task status and project progress
- **Memory Bank Management**: Ensures project context is maintained and updated

## When to Use Captain Mode

Captain Mode is ideal for:

- Starting new projects that require coordination between multiple aspects
- Managing complex features that span multiple domains
- Organizing work across different specialized areas
- Maintaining project overview and ensuring coherent progress
- Coordinating between different team members or AI agents

## How to Use Captain Mode

1. **Start in Captain Mode**: Begin your session in Captain Mode to get a project overview
   ```
   /mode captain
   ```

2. **Describe Your Project or Task**: Provide a high-level description of what you want to accomplish

3. **Let Captain Mode Orchestrate**: The Captain will:
   - Analyze requirements
   - Break down the task into subtasks
   - Delegate to specialized modes
   - Track progress
   - Maintain project context

4. **Review Task Registry**: Captain Mode maintains a `taskRegistry.md` file in the Memory Bank that tracks all tasks, their status, and outcomes

## Task Registry

Captain Mode introduces a new Memory Bank file called `taskRegistry.md` that tracks:

- Active tasks and their current status
- Completed tasks and their outcomes
- Task assignments to specific modes
- Creation and completion dates

## Mode Delegation

Captain Mode delegates tasks based on specialized expertise:

- **Architect Mode**: System design, architecture, component relationships
- **Code Mode**: Implementation, refactoring, API development
- **Test Mode**: Test planning, implementation, execution
- **Debug Mode**: Issue investigation, bug fixing, troubleshooting
- **Ask Mode**: Research, information gathering, concept explanation

## Example Workflow

1. Start in Captain Mode
2. Describe your project: "I want to build a weather dashboard application"
3. Captain Mode analyzes the request and breaks it down:
   - Architecture design (Architect Mode)
   - API integration (Code Mode)
   - UI implementation (Code Mode)
   - Testing strategy (Test Mode)
   - Documentation (Ask Mode)
4. Captain Mode delegates the first task (e.g., to Architect Mode)
5. When Architect Mode completes its task, control returns to Captain Mode
6. Captain Mode delegates the next task, and so on
7. Captain Mode maintains the task registry and project context throughout

## Benefits of Captain Mode

- **Reduced Context Pollution**: Each mode focuses only on its specialized area
- **Improved Organization**: Clear task breakdown and assignment
- **Better Progress Tracking**: Centralized task registry
- **Enhanced Project Coherence**: Maintained high-level overview
- **Optimized Resource Usage**: Right mode for the right task

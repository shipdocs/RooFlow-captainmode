# Refactoring Plan: RooFlow to roo-code-memory-bank

## Overview

This document outlines the plan for refactoring the current project to use roo-code-memory-bank instead of RooFlow, and to implement the captain mode with Boomerang Tasks.

## Goals

*   Migrate the project to use roo-code-memory-bank for persistent project context.
*   Implement captain mode using Boomerang Tasks for improved task management.
*   Preserve existing scanner component functionality.
*   Maintain current test coverage levels.

## Plan

1.  **Understand Current Project:**
    *   Review the existing project structure, components, and functionalities.
    *   Identify key modules like TaskScanner, ContextBuilder, RegistryUpdater, and FileSystemScanner.
    *   Analyze the current implementation of Captain Mode and its interactions with other modes.
    *   **Action:** Review `src/roo.ts`, `src/scanner/components/*`, `.clinerules-*`, and `.roomodes`

2.  **Explore `roo-code-memory-bank`:**
    *   Clone and examine the `roo-code-memory-bank` repository.
    *   Understand its core components, architecture, and memory bank implementation.
    *   Identify how it handles tasks, context, and persistence.
    *   Pay special attention to the mode collaboration and triggers.
    *   **Action:** Clone `https://github.com/GreatScottyMac/roo-code-memory-bank` to `reference/memory-bank`

3.  **Analyze Boomerang Tasks:**
    *   Study the Boomerang Tasks documentation to understand its features and implementation.
    *   Identify how it manages task dependencies, metrics, and mode transitions.
    *   Understand how it interacts with the memory bank.
    *   **Action:** Review `https://docs.roocode.com/features/boomerang-tasks/`

4.  **Identify Core Components:**
    *   List the essential components from both the current project and `roo-code-memory-bank`.
        *   **Current Project:** TaskScanner, ContextBuilder, RegistryUpdater, FileSystemScanner, Captain Mode
        *   **roo-code-memory-bank:** Memory Bank system, Mode collaboration, Mode triggers
    *   Determine which components can be reused, refactored, or need to be created from scratch.

5.  **Map Current to New:**
    *   Create a mapping between the current project's components and the corresponding components in `roo-code-memory-bank`.
        *   TaskScanner --> Task Management in `roo-code-memory-bank`
        *   ContextBuilder --> Memory Bank context management
        *   RegistryUpdater --> Task Registry in `roo-code-memory-bank`
        *   FileSystemScanner --> Project Structure Analysis in `roo-code-memory-bank`
        *   Captain Mode --> Captain Mode with Boomerang Tasks
    *   Identify any missing components or functionalities that need to be implemented.

6.  **Design Refactoring Plan:**
    *   Develop a step-by-step plan for refactoring the current project to align with the architecture of `roo-code-memory-bank`.
    *   Include details on code migration, database schema changes (if any), and API updates.
    *   Ensure that the existing scanner component functionality is preserved.
    *   Create a new branch for the refactoring work.

7.  **Define Boomerang Integration:**
    *   Outline how to integrate the Boomerang Tasks functionality into the refactored project.
    *   Specify the changes needed in the captain mode to support boomerang tasks.
    *   Define the task workflow and how it interacts with the Memory Bank.

8.  **Update Memory Bank:**
    *   Update the Memory Bank files (`activeContext.md`, `productContext.md`, `progress.md`, `decisionLog.md`, `systemPatterns.md`, `taskRegistry.md`) to reflect the changes made during the refactoring process.
    *   Ensure that the context is preserved across mode transitions.

9.  **Document Changes:**
    *   Create a detailed documentation outlining the changes made during the refactoring process.
    *   Include migration guides, API documentation, and usage examples.

10. **Get User Approval:**
    *   Present the refactoring plan and documentation to the user for review and approval.
    *   Incorporate any feedback or suggestions from the user.

11. **Switch to Code Mode:**
    *   Once the user approves the plan, switch to code mode to implement the changes.

12. **Implement Changes:**
    *   Start by integrating the `roo-code-memory-bank` framework into the project.
    *   Migrate the scanner components to work with the new framework.
    *   Implement the Boomerang Tasks functionality in the captain mode.
    *   Update the Memory Bank files to reflect the changes.

13. **Test and Validate:**
    *   Thoroughly test the refactored project to ensure that it works as expected.
    *   Validate that the Memory Bank is properly updated and that the context is preserved across sessions.
    *   Maintain current test coverage levels.

## Refactoring Process

```mermaid
graph LR
    A[Analyze Existing Code] --> B(Integrate roo-code-memory-bank);
    B --> C{Migrate Scanner Components};
    C -- Yes --> D(Implement Boomerang Tasks);
    C -- No --> E(Implement Boomerang Tasks);
    D --> F{Update Memory Bank};
    E --> F;
    F --> G[Test and Validate];
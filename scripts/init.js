#!/usr/bin/env node

/**
 * Initialization script for rooflow-captainmode
 * This script initializes the RooFlow Captain Mode in the user's project by creating
 * all necessary configuration files and directories.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory
const projectRoot = process.cwd();
// Get the package root directory
const packageRoot = path.join(__dirname, '..');

console.log('Initializing RooFlow Captain Mode in your project...');

// Create directories
const directories = [
  '.roo',
  'memory-bank'
];

directories.forEach(dir => {
  const dirPath = path.join(projectRoot, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

// Copy configuration files
const configFiles = [
  '.clinerules-architect',
  '.clinerules-ask',
  '.clinerules-captain',
  '.clinerules-code',
  '.clinerules-debug',
  '.clinerules-test',
  '.rooignore',
  '.roo/cline_custom_modes.json',
  '.roo/custom-instructions.yaml'
];

configFiles.forEach(file => {
  const sourcePath = path.join(packageRoot, file);
  const destPath = path.join(projectRoot, file);
  
  if (fs.existsSync(sourcePath)) {
    if (!fs.existsSync(destPath)) {
      console.log(`Copying file: ${file}`);
      fs.copyFileSync(sourcePath, destPath);
    } else {
      console.log(`File already exists: ${file}`);
    }
  } else {
    console.warn(`Source file not found: ${file}`);
  }
});

// Create memory bank files
const memoryBankFiles = [
  { 
    name: 'activeContext.md',
    content: '# Active Context\n\nThis file tracks the project\'s current status, including recent changes, current goals, and open questions.\n\n## Current Focus\n\n* Initial project setup\n* Defining project requirements\n* Setting up development environment\n\n[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + '] - Memory Bank initialized\n'
  },
  { 
    name: 'decisionLog.md',
    content: '# Decision Log\n\nThis file records architectural and implementation decisions using a list format.\n\n## Decision: Initialize RooFlow Captain Mode\n\n* Decision: Initialize RooFlow Captain Mode for project management\n\n* Rationale: \n  * Need for structured task management\n  * Requirement for persistent context across sessions\n  * Improved project organization\n\n* Implementation Details:\n  * Set up Memory Bank structure\n  * Configure mode transitions\n  * Initialize task registry\n\n[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + '] - Decision recorded\n'
  },
  { 
    name: 'productContext.md',
    content: '# Product Context\n\nThis file provides a high-level overview of the project, including its purpose, goals, and key features.\n\n## Project Overview\n\n[Add your project description here]\n\n## Key Features\n\n* [Feature 1]\n* [Feature 2]\n* [Feature 3]\n\n## Technical Stack\n\n* [Technology 1]\n* [Technology 2]\n* [Technology 3]\n\n## Project Timeline\n\n* Start Date: [Date]\n* Milestone 1: [Date]\n* Milestone 2: [Date]\n* Target Completion: [Date]\n\n[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + '] - Product context initialized\n'
  },
  { 
    name: 'progress.md',
    content: '# Progress\n\nThis file tracks the project\'s progress using a task list format.\n\n[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + '] - Memory Bank initialized\n\n## Current Tasks\n\n* Set up project structure\n* Configure development environment\n* Define initial requirements\n\n## Next Steps\n\n* Implement core functionality\n* Set up testing framework\n* Create documentation\n'
  },
  { 
    name: 'systemPatterns.md',
    content: '# System Patterns\n\nThis file documents recurring patterns and standards used in the project.\n\n## Coding Patterns\n\n* [Add your coding patterns here]\n\n## Architectural Patterns\n\n* [Add your architectural patterns here]\n\n## Testing Patterns\n\n* [Add your testing patterns here]\n\n[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + '] - System patterns initialized\n'
  },
  { 
    name: 'taskRegistry.md',
    content: '# Task Registry\n\nThis file maintains a registry of tasks, their status, and dependencies.\n\n[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + '] - Task registry initialized\n\n## Active Tasks\n\n* Project Setup\n  * Status: In Progress\n  * Dependencies: None\n  * Description: Set up the project structure and configuration\n\n## Planned Tasks\n\n* Core Implementation\n  * Status: Planned\n  * Dependencies: Project Setup\n  * Description: Implement core functionality\n\n* Testing Framework\n  * Status: Planned\n  * Dependencies: Project Setup\n  * Description: Set up testing framework and write tests\n\n* Documentation\n  * Status: Planned\n  * Dependencies: Core Implementation\n  * Description: Create project documentation\n'
  }
];

memoryBankFiles.forEach(file => {
  const filePath = path.join(projectRoot, 'memory-bank', file.name);
  if (!fs.existsSync(filePath)) {
    console.log(`Creating memory bank file: ${file.name}`);
    fs.writeFileSync(filePath, file.content);
  } else {
    console.log(`Memory bank file already exists: ${file.name}`);
  }
});

console.log('');
console.log('RooFlow Captain Mode has been successfully initialized in your project!');
console.log('');
console.log('To use RooFlow Captain Mode:');
console.log('1. Open your project in VS Code');
console.log('2. Ensure the Roo Code extension is installed');
console.log('3. Select "Captain" mode in the Roo Code chat panel');
console.log('');
console.log('For more information, see the documentation at:');
console.log('  https://github.com/shipdocs/RooFlow-captainmode');

# RooFlow Captain Mode Installation Guide

This guide provides detailed instructions for installing and using the RooFlow Captain Mode with the VSCode Roo-Code extension in your projects.

## Prerequisites

Before installing RooFlow Captain Mode, ensure you have:

1. **Visual Studio Code** - [Download and install VSCode](https://code.visualstudio.com/download)
2. **Roo Code Extension** - Install from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=roo-code.roo-code)
3. **Node.js** (v14 or higher) - [Download and install Node.js](https://nodejs.org/en/download/)
4. **npm** (usually comes with Node.js)

## Installation Options

There are two ways to install RooFlow Captain Mode:

### Option 1: Using npm (Recommended)

1. Open your terminal or command prompt
2. Navigate to your project directory
3. Install RooFlow Captain Mode as a dependency:

```bash
npm install rooflow-captainmode --save-dev
```

4. Initialize RooFlow Captain Mode in your project:

```bash
npx rooflow-captainmode init
```

This will create all necessary configuration files and the memory-bank directory in your project.

### Option 2: Manual Installation

1. Clone the RooFlow Captain Mode repository:

```bash
git clone https://github.com/shipdocs/RooFlow-captainmode.git
```

2. Copy the following files and directories to your project:
   - `.clinerules-*` files (all mode rule files)
   - `.roo/` directory
   - `memory-bank/` directory (or create it if you want to start fresh)

## Configuration

After installation, you'll need to configure RooFlow Captain Mode for your project:

1. **Mode Configuration**:
   - The `.roo/cline_custom_modes.json` file contains mode configurations
   - You can customize the available modes and their descriptions

2. **Memory Bank Setup**:
   - The `memory-bank/` directory contains files for maintaining project context
   - You can initialize these files with your project-specific information

## Using RooFlow Captain Mode with VSCode

1. **Open your project in VSCode**:
   ```bash
   code /path/to/your/project
   ```

2. **Access the Roo Code Extension**:
   - Click on the Roo Code icon in the VSCode sidebar
   - Or use the keyboard shortcut (default: `Ctrl+Shift+R` or `Cmd+Shift+R` on Mac)

3. **Select Captain Mode**:
   - In the Roo Code chat panel, click on the mode selector at the top
   - Select "Captain" from the available modes

4. **Start Using Captain Mode**:
   - Describe your project or task to Captain Mode
   - Let Captain Mode orchestrate your project by breaking down tasks and delegating to specialized modes

## Command Line Interface

RooFlow Captain Mode provides a CLI for managing tasks and the memory bank:

```bash
# View task registry
npx rooflow-captainmode tasks list

# Create a new task
npx rooflow-captainmode tasks create "Implement feature X" --mode code

# Check Memory Bank status
npx rooflow-captainmode memory-bank status

# Create Memory Bank if it doesn't exist
npx rooflow-captainmode memory-bank create
```

## Memory Bank Management

The Memory Bank is a key component of RooFlow Captain Mode. It maintains project context across different modes and sessions:

1. **Memory Bank Files**:
   - `activeContext.md` - Current session context
   - `decisionLog.md` - Architectural and implementation decisions
   - `productContext.md` - Project overview
   - `progress.md` - Project progress
   - `systemPatterns.md` - Recurring patterns and standards
   - `taskRegistry.md` - Task tracking

2. **Accessing Memory Bank**:
   - Through the Roo Code chat panel
   - Via the command line interface
   - Directly editing the files (not recommended)

## Troubleshooting

If you encounter issues with RooFlow Captain Mode:

1. **Check Configuration Files**:
   - Verify JSON syntax in `.roo/cline_custom_modes.json`
   - Check YAML syntax in `.roo/custom-instructions.yaml`

2. **Restart VSCode**:
   - After making configuration changes, restart VSCode

3. **Check Memory Bank**:
   - Ensure the `memory-bank/` directory exists and is writable
   - Verify that all required files exist in the memory bank

4. **Update Roo Code Extension**:
   - Ensure you have the latest version of the Roo Code extension

## Example Workflow

Here's an example of how to use RooFlow Captain Mode in a project:

1. **Start in Captain Mode**:
   - Select "Captain" in the Roo Code chat panel

2. **Describe Your Project**:
   - "I want to build a weather dashboard application"

3. **Captain Mode Analysis**:
   - Captain Mode breaks down the task into subtasks
   - Delegates to specialized modes (Architect, Code, Test, etc.)

4. **Task Delegation**:
   - Captain Mode delegates the first task (e.g., to Architect Mode)
   - When Architect Mode completes, control returns to Captain Mode
   - Captain Mode delegates the next task, and so on

5. **Project Completion**:
   - Captain Mode maintains the task registry and project context throughout
   - You can track progress in the `memory-bank/progress.md` file

## Additional Resources

- [Memory Bank Usage Guide](memory-bank-usage.md)
- [Captain Mode Documentation](../rooflow-captainmode-docs/captain-mode.md)
- [Project Scan Feature](../rooflow-captainmode-docs/project-scan-feature.md)
- [Mode Management Guide](../rooflow-captainmode-docs/mode-management.md)

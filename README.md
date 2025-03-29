# RooFlow Captain Mode Implementation

This repository contains the implementation of the Captain Mode for RooFlow, developed by Martin. The Captain Mode serves as a project orchestrator and task manager, providing enhanced project coordination and workflow efficiency.

## 🎯 Overview

This implementation enhances the Captain Mode with:
- Advanced task dependency tracking
- Project metrics monitoring
- Automated mode transitions
- Comprehensive task registry system

## 🔧 Key Components

### Task Registry System
- Tracks active and completed tasks
- Manages task dependencies
- Records mode transitions
- Monitors project metrics

### Enhanced Mode Transitions
- Automatic switching between specialized modes
- Return triggers for task completion
- Post-return action handling
- Context preservation during transitions

### Project Metrics
- Task completion time tracking
- Mode transition analysis
- Dependency chain monitoring
- Progress visualization

## 📂 Project Structure

```
.
├── config/
│   ├── default-mode/
│   │   ├── cline_custom_modes.json   # Mode configurations
│   │   ├── custom-instructions.yaml  # Mode instructions
│   │   └── README.md                # Mode documentation
│   └── .rooignore                   # Roo ignore patterns
├── docs/
│   ├── captain-mode.md             # Captain mode documentation
│   └── captain-mode-implementation.md # Implementation details
├── memory-bank/
│   └── taskRegistry.md             # Task tracking system
└── README.md                       # This file
```

## 🚀 Features

1. **Task Dependencies**
   - Dependency tracking in task registry
   - Blocking/blocked status management
   - Automated prioritization based on dependencies

2. **Project Metrics**
   - Completion time tracking
   - Mode transition monitoring
   - Task pattern analysis
   - Progress insights

3. **Mode-Specific Context**
   - Specialized context preservation
   - Seamless context transfer
   - Mode-specific data storage

4. **Task Validation**
   - Completion criteria verification
   - Handoff checklists
   - Context validation

## ⚙️ Installation

1.  Roo Code Extension:
    - Ensure you have the latest version of the Roo Code extension installed in VS Code.
    - Verify that the extension is properly activated and configured.

2.  Download RooFlow Files:
    - Download all necessary files from the GitHub repository, including:
      - `cline_custom_modes.json`
      - `custom-instructions.yaml`
      - `README.md`
      - `taskRegistry.md`
      - `insert-variables.sh`
      - `.rooignore`

3.  Project Structure:
    - Create the following directory structure in your project:
      ```
      project-root/
      ├── .roo/
      │   ├── cline_custom_modes.json
      │   └── custom-instructions.yaml
      ├── memory-bank/
      │   └── taskRegistry.md
      ├── .rooignore
      └── insert-variables.sh
      ```

4.  Configuration:
    - Place the downloaded files in the appropriate directories.
    - Ensure that the `.rooignore` file contains the necessary ignore patterns.

5.  Setup Script:
    - Run the `insert-variables.sh` script to configure the project.
    - Verify that the script executes without errors.

## 🤝 Contributing

Contributions are welcome! Please check the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## 📝 License

[Apache 2.0](LICENSE)

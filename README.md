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
├── rooflow-captainmode-docs/
│   ├── captain-mode.md             # Captain mode documentation
│   └── captain-mode-implementation.md # Implementation details
├── memory-bank/
│   ├── activeContext.md            # Tracks the current session's context
│   ├── decisionLog.md              # Records architectural and implementation decisions
│   ├── productContext.md           # Provides a high-level overview of the project
│   ├── progress.md                 # Tracks the progress of the project
│   ├── systemPatterns.md           # (Optional) Documents recurring patterns and standards
│   └── taskRegistry.md             # Task tracking system
├── .roo/
│   ├── cline_custom_modes.json    # Mode configurations
│   └── custom-instructions.yaml   # Mode instructions
├── .clinerules-architect          # Architect mode rules
├── .clinerules-ask                # Ask mode rules
├── .clinerules-captain            # Captain mode rules
├── .clinerules-code               # Code mode rules
├── .clinerules-debug              # Debug mode rules
├── .clinerules-test                # Test mode rules
├── rooflow-captainmode-supportfiles/                  # Supporting files
│   ├── LICENSE
│   ├── CONTRIBUTING.md
│   └── insert-variables.sh
├── .rooignore                    # Roo ignore patterns
└── README.md                     # This file
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

1.  Clone or download the repository from GitHub.
2.  Open the project in VS Code.
3.  Ensure that the Roo Code extension is installed and activated.
4.  Select the desired mode (Captain, Architect, Code, Test, Debug, or Ask) in the Roo Code chat panel.

## 🤝 Contributing

Contributions are welcome! Please check the [CONTRIBUTING.md](rooflow-captainmode-supportfiles/CONTRIBUTING.md) file for guidelines.

## 📝 License

[Apache 2.0](rooflow-captainmode-supportfiles/LICENSE)

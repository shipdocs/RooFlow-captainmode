# Mode Management in RooFlow

This document provides guidance on managing and troubleshooting modes in RooFlow, including the enhanced Captain mode.

## Verification Steps

After installing or updating modes:

1. Restart Visual Studio Code
2. Open the Roo Code chat panel
3. Click the mode selector (top of chat panel)
4. Verify that all modes are listed and available
5. Test the Captain mode to ensure it:
   - Can access the task registry
   - Properly delegates tasks
   - Successfully transitions between modes
   - Updates the memory bank correctly

## Troubleshooting

If you encounter issues:

1. Configuration Files:
   - Verify JSON syntax in `.roo/cline_custom_modes.json`
   - Check YAML syntax in `.roo/custom-instructions.yaml`
   - Ensure all files are in their correct locations

2. File Permissions:
   - `.roo/` directory and its contents should be readable
   - `memory-bank/` directory should be readable and writable
   - `.rooignore` should be readable

3. Memory Bank:
   - Verify that `taskRegistry.md` exists in the `memory-bank/` directory
   - Check that the memory bank is being updated properly
   - Ensure mode transitions are being recorded

4. Mode Transitions:
   - Confirm that mode switching triggers are working
   - Verify that context is preserved during transitions
   - Check that task status updates properly

5. General Steps:
   - Restart VS Code after making configuration changes
   - Check the VS Code Developer Tools console for error messages
   - Verify that the Roo Code extension is up to date

## Support

If you need help or encounter issues:

1. Check the documentation in the `docs/` directory
2. Review the Captain mode implementation details
3. File an issue on the GitHub repository with:
   - Description of the problem
   - Steps to reproduce
   - Relevant error messages
   - Configuration file contents (if applicable)
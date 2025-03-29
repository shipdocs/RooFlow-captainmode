#!/bin/bash

# --- Get Environment Variables Correctly ---
if [[ "$(uname)" == "Darwin" ]]; then
    # macOS specific
    OS="macOS $(sw_vers -productVersion)"
    SED_IN_PLACE=(-i "")
else
    # Linux specific
    OS=$(uname -s -r)
    SED_IN_PLACE=(-i)
fi

SHELL="bash"  # Hardcode to bash since we're explicitly using it
HOME=$(echo "$HOME")  # Use existing $HOME, but quote it
WORKSPACE=$(pwd)

# --- Construct Paths ---
GLOBAL_SETTINGS="$HOME/.vscode-server/data/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_custom_modes.json"
MCP_LOCATION="$HOME/.local/share/Roo-Code/MCP"
MCP_SETTINGS="$HOME/.vscode-server/data/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json"

# --- Directory Setup ---
ROO_DIR="$WORKSPACE/.roo"

# Check if the .roo directory exists
if [ ! -d "$ROO_DIR" ]; then
  echo "Error: .roo directory not found in $WORKSPACE"
  exit 1
fi

# --- Function to escape strings for sed ---
escape_for_sed() {
    echo "$1" | sed 's/[\/&]/\\&/g'
}

# --- Perform Replacements using sed ---
find "$ROO_DIR" -type f -name "system-prompt-*" -print0 | while IFS= read -r -d $'\0' file; do
  echo "Processing: $file"
  
  # Basic variables - using sed with escaped strings
  sed "${SED_IN_PLACE[@]}" "s/OS_PLACEHOLDER/$(escape_for_sed "$OS")/g" "$file"
  sed "${SED_IN_PLACE[@]}" "s/SHELL_PLACEHOLDER/$(escape_for_sed "$SHELL")/g" "$file"
  sed "${SED_IN_PLACE[@]}" "s|HOME_PLACEHOLDER|$(escape_for_sed "$HOME")|g" "$file"
  sed "${SED_IN_PLACE[@]}" "s|WORKSPACE_PLACEHOLDER|$(escape_for_sed "$WORKSPACE")|g" "$file"
  
  # Complex paths - using sed with escaped strings
  sed "${SED_IN_PLACE[@]}" "s|GLOBAL_SETTINGS_PLACEHOLDER|$(escape_for_sed "$GLOBAL_SETTINGS")|g" "$file"
  sed "${SED_IN_PLACE[@]}" "s|MCP_LOCATION_PLACEHOLDER|$(escape_for_sed "$MCP_LOCATION")|g" "$file"
  sed "${SED_IN_PLACE[@]}" "s|MCP_SETTINGS_PLACEHOLDER|$(escape_for_sed "$MCP_SETTINGS")|g" "$file"

  echo "Completed: $file"
done

echo "Done."
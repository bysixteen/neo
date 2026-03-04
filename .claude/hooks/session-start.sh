#!/bin/bash
cd "$CLAUDE_PROJECT_DIR"

if [ -d ".beads" ]; then
  echo "=== BEADS TASK CONTEXT ==="
  bd ready 2>/dev/null || echo "No ready tasks"
  echo ""
  echo "Active tasks:"
  bd list --status in_progress 2>/dev/null || echo "None in progress"
fi

exit 0

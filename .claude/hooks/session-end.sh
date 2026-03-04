#!/bin/bash
cd "$CLAUDE_PROJECT_DIR"

if [ -d ".beads" ]; then
  OPEN_COUNT=$(bd list --status open 2>/dev/null | wc -l)
  IN_PROGRESS=$(bd list --status in_progress 2>/dev/null | wc -l)

  if [ "$IN_PROGRESS" -gt 0 ]; then
    echo "Warning: You have $IN_PROGRESS tasks still in progress"
    echo "Consider: bd close <id> -r 'Done: reason' or leaving as in_progress"
  fi

  echo "Remember: bd sync && git push"
fi

exit 0

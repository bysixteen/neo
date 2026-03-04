# CLAUDE.md - Amazon

Project description pending.

---

## Overview

| Item | Value |
|------|-------|
| Type | TBD |
| Stack | TBD |
| Status | active |

---

## Structure

```
amazon/
├── .beads/            # Task tracking
├── .claude/           # Agent configuration
│   ├── commands/      # Custom slash commands
│   ├── hooks/         # Session automation
│   └── rules/         # Domain-specific rules
├── docs/
│   └── decisions/     # Architecture Decision Records
├── knowledge/         # Living knowledge base
├── research/          # Project brain (principles, personas)
└── CLAUDE.md          # This file
```

---

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | AI agent context entry point |
| `.beads/beads.db` | Task tracking database |

---

## Commands

```bash
# Setup
# TBD

# Build
# TBD

# Test
# TBD
```

---

## Task Tracking

This project uses [beads](https://github.com/steveyegge/beads) for persistent task memory.

```bash
bd ready          # Show unblocked work
bd create "Task"  # Create task
bd close <id>     # Complete task
bd sync           # Sync to git
```

---

## Preferences

- British English
- No emojis unless requested
- Concise output
- Never delete files - move to `_to-be-deleted/`

---

**Last Updated**: 2026-03-04

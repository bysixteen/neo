# Decisions — Amazon Touch Display Fragment System

Living document. Updated by sprints and spikes as decisions are made and revisited.

---

## Decision Index

| ID | Title | Date | Status | Sprint/Spike |
|----|-------|------|--------|-------------|
| D001 | Adopt 4px base grid | 2026-03-17 | Stable | Pre-sprint |
| D002 | Connectivity padding model (internal vs gap) | 2026-03-17 | Stable | Pre-sprint |
| D003 | Pivot from Figma token automation to web tool | 2026-03-18 | Stable | Pre-sprint |
| D004 | Defer BNY per-component collections | 2026-03-18 | Under review | Pre-sprint |
| D005 | Fragment Group Figma component as structural scaffold only | 2026-03-18 | Stable | Pre-sprint |
| D006 | Fragment Layout Tool MVP scope and win condition | 2026-03-18 | Stable | Sprint 001 |

---

## D001 — Adopt 4px base grid

**Date:** 2026-03-17
**Status:** Stable

Adopted the design director's 4px base grid, replacing 12px as the base tier. The 12px structural grid is kept for fragment sizing and width ratios.

| Tier | Size | Purpose |
|------|------|---------|
| Base | 4px | Padding, gaps, fine alignment |
| Structural | 12px | Fragment sizing, width ratios |
| Compositional | 36px | Large-scale layout divisions |

**Why:** Aligns with director's existing approach. 4px is divisible into all relevant spacing values. `space/6` removed (not on 4px grid); `space/4` and `space/8` added.

---

## D002 — Connectivity padding model

**Date:** 2026-03-17
**Status:** Stable

Connected state: 4px internal padding per side (8px visual gap). Unconnected: 8px internal padding per side (16px visual gap). Model is internal padding on each slot, not gap/itemSpacing on the container, not external shims.

**Why:** Internal padding is encapsulated and translates directly to code. Shims create layout coupling.

**Token mapping:**
- `spacing/connected` → 8px (gap between slots)
- `spacing/unconnected` → 16px (gap between slots)
- `radii/connected` → 40px (inner corners)
- `radii/large` → 80px (outer corners)

---

## D003 — Pivot from Figma token automation to web tool

**Date:** 2026-03-18
**Status:** Stable
**Document:** `.context/docs/pivot-rationale.md`

The Figma variable system cannot bind per-corner radius programmatically (only uniform `cornerRadius` is accessible via the plugin API). The 4-collection, 11-mode, 200+ variable design was a square peg in a round hole. Pivoted to:

1. Simplified Figma component — static structural scaffold, static defaults (8px padding, 80px radii). Designers apply tokens manually.
2. Web-based layout tool — grid selector, connectivity toggles, live spec panel with exact token values per slot.

**What carries forward unchanged:** Rules framework, grid spec, shape vocabulary, connectivity model, token values.

---

## D004 — Defer BNY per-component collections

**Date:** 2026-03-18
**Status:** Under review — reassess when connectivity pattern stabilises

Fragment Group tokens live in the global Semantic Scale rather than BNY-style per-component collections (`Structure.FragmentGroup`, `Size.FragmentGroup`).

**Why deferred:** Fragment Groups have a unique compositional property — radii depend on spatial relationships with neighbours. This doesn't cleanly map to any BNY dimension (not State, not Density, not Sentiment). Defer until the pattern has stabilised and it's clear whether other Amazon components will follow BNY conventions.

**When to revisit:** When a second component shows the same connectivity-dependent radius pattern, or when BNY adoption across the broader Amazon DxD system becomes a priority.

---

## D005 — Fragment Group as structural scaffold only

**Date:** 2026-03-18
**Status:** Stable

The Fragment Group Figma component is a layout scaffold only. Relationship and Position variable collections archived. Designers apply connectivity tokens manually using the token reference guide. The web tool handles rule enforcement and spec generation.

**Why:** Automation that requires understanding defeats its purpose. The Figma component's job is to provide the right proportions and slot structure — not to enforce radii.

---

## D006 — Fragment Layout Tool MVP scope and win condition

**Date:** 2026-03-18
**Status:** Stable
**Sprint:** `research/sprints/sprint-001-layout-tool/decision.md`

The interactive web layout tool MVP is scoped to: drag-to-resize grid composition with 12px grid snap, per-edge connectivity toggles, and a live spec panel showing token names and pixel values per slot.

**Deferred:** Figma export, Shape Playground unification, motion authoring, multi-user collaboration, undo/redo, template library.

**Win condition:** A designer composes a valid 3-fragment connected layout and receives a correct per-slot spec in under 2 minutes, without consulting the token reference guide.

**Why:** The pivot rationale (D003) was already sound. Sprint 001 sharpened the scope and added a measurable success criterion. Elias Vance's dissent — that a win condition must be defined before building — was partially upheld and incorporated.

**Architectural imperatives:**
1. Define the Zustand state model (`slots[][]`, `edges Map`, `viewMode`, `device`) and `getSlotRadii` pure function before writing any interaction code
2. Implement `getSlotRadii` as a standalone utility with unit tests — it is the core rule of the system
3. Design contained/fullscreen view modes into the state model from day one

---

**Last updated**: 2026-03-18

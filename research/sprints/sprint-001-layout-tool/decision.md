---
title: "Sprint 001: Decision"
type: sprint-decision
status: complete
date: 2026-03-18
sprint: "001"
decision: "Proceeded with the interactive web tool MVP, scoped to drag-to-resize grid composition, per-edge connectivity toggles, and a live spec panel — all other features deferred."
---

## Decision

We are building the interactive layout tool. The MVP scope is: drag-to-resize grid composition with 12px grid snap, per-edge connectivity toggles, and a live spec panel showing token names and pixel values per slot. Figma export, Shape Playground unification, and motion authoring are explicitly deferred. The tool is considered successful when a designer can compose a valid 3-fragment connected layout and receive a correct per-slot spec in under 2 minutes, without consulting the token reference guide.

## Rationale

The pivot rationale (D003) was already sound — Figma's variable system cannot bind per-corner radius, and the logic is 20 lines of code, not 200 variable values. This sprint's Map and Sketch phases reinforced that decision and sharpened the scope. The sketch perspectives converged on three architectural imperatives: (1) get the state model right before writing interaction code — it is the hardest thing to refactor; (2) implement the radii function as a pure, independently-tested utility — it is the core rule of the system; (3) keep contained/fullscreen view modes architecturally clean from day one.

Aris's reframe of the problem was decisive for the win condition: the real test is whether the tool is self-evident enough that a designer who has never read the fragment rules can still produce a rule-compliant layout. That became the primary success criterion.

## Elias Vance's Dissent

Elias challenged the team to define the win condition before building — and was partially upheld. His dissent that "designers are using it" is insufficient as a success metric was incorporated: the win condition is now specific and measurable (2-minute, no-reference-guide, rule-compliant layout). His broader challenge — what evidence do we have the problem is severe enough to justify 5+ sessions — was overruled. The Figma pivot rationale is sufficient justification; the per-corner radius limitation is a hard technical blocker, not a preference.

His secondary point (tool ownership / single point of failure) was noted. Documentation and maintainability are first-class concerns in implementation.

Elias's dissent is recorded but does not block proceeding.

## What We Are NOT Doing

| Deferred feature | Why |
|-----------------|-----|
| Figma export | Nice to have; does not affect the core composition and spec workflow |
| Shape Playground unification | Different problem space (motion vs. structure); coupling risks quality of both |
| Motion authoring / elastic animation in output | A later sprint; the tool's own UI uses elastic transitions, but the export spec is static |
| Multi-user collaboration | Out of scope for the design team's workflow |
| Undo/redo | Out of scope for MVP; browser refresh is acceptable in a prototyping context |
| Template library | Prescriptive templates conflict with free composition; add after usage patterns emerge |
| General-purpose layout tool | The tool has one job: fragment layouts for the 1440×900 display |

## Win Condition

A designer composes a valid 3-fragment connected layout (e.g. Trio-H) and receives a correct per-slot spec — showing token names, pixel values, and connectivity state — in under 2 minutes, without consulting the token reference guide. The spec is correct by definition (verified against the radii function's unit tests).

## Next Action

Before writing any interaction code: define the state model data shape and get alignment. Specifically — confirm the Zustand store shape (`slots[][]`, `edges Map`, `viewMode`, `device`), the edge ID normalisation convention, and the `getSlotRadii` function signature. Write unit tests for `getSlotRadii` and the grid snap utility. Only then build the drag-to-resize interaction on top.

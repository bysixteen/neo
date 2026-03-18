---
title: "Sprint 001: Fragment Layout Tool"
type: sprint-brief
status: in-progress
date: 2026-03-18
sprint: "001"
personas: [leo, lena, marcus, kira, aris, rowan, elias]
depends-on: []
feeds-into: []
tags: [layout-tool, fragment-system, web-tool, interaction]
---

**TL;DR:** Can we build an interactive web tool that lets designers compose fragment layouts, toggle per-edge connectivity, and receive a correct spec — without ever consulting the token reference guide?

---

## Sprint Challenge

Designers create too many ad-hoc layouts with inconsistent spacing, radii, and structure — we need an interactive tool that enforces fragment rules while giving designers the freedom to compose.

## Long-Term Goal

The DxD design team composes all 1440×900 layouts using the web tool. Every layout produced is token-correct, rule-compliant, and spec-ready. Engineering receives structured handoff data — not redlined Figma frames. The tool is the source of truth for the fragment system: designers cannot get the radii wrong because the tool enforces them. New team members onboard in an afternoon because the rules are baked into the interface.

## Sprint Questions

1. Can we build a drag-to-resize grid interaction that snaps to the 12px structural grid and feels fast enough to replace ad-hoc Figma frame arrangement?
2. Will designers adopt per-edge connectivity toggles as a natural part of layout composition, or will they revert to applying tokens manually?
3. Can we produce a per-slot spec sheet (token names, pixel values, connectivity state) that an engineer can implement without supplementary documentation?

## Target User

The DxD Designer — a designer on the Amazon DxD team who is fluent in Figma, understands the fragment vocabulary, and does not want to learn token chains or memorise position lookup tables. (See `research/PERSONAS.md`.)

## Target Moment on the Map

The moment a designer commits to a layout structure — they have decided how many fragments and their rough proportions, and now need to set connectivity and verify the spec is correct. This is where ad-hoc decisions currently happen and where rule violations occur most often.

## Project Squad

| Persona | Name | Role in This Sprint |
|---------|------|---------------------|
| Visual Designer | Leo Finch | Sketch phase |
| Design Engineer | Dr. Lena Petrova | Map + Sketch |
| Senior Developer | Marcus Thorne | Sketch + Decide |
| Developer | Kira Sharma | Sketch |
| Strategist | Dr. Aris Thorne | Map lead + Synthesise |
| Craftsman | Rowan Vale | Sketch |
| Client | Elias Vance | Decide (mandatory dissent) |

## How Might We Questions

1. HMW give designers immediate visual feedback when a layout violates fragment rules — without them needing to know the rules?
2. HMW make per-edge connectivity so fast and obvious that designers adopt it without training?
3. HMW let designers freely explore compositions while keeping all fragment edges on the 12px structural grid?
4. HMW produce a spec complete enough to hand to an engineer without supplementary documentation?
5. HMW support all three device sizes (Electra, Hoya, Madeline) without requiring designers to duplicate their work?

## Constraints

- **Canvas**: 1440×900 reference; three device configs — Electra 11" (960px container), Hoya 15" (TBD), Madeline 8" (TBD)
- **Grid**: All fragment edges must snap to 12px structural grid; drag-to-resize must honour this
- **Minimum slot**: 108×108px
- **Safe areas**: Status bar + EDL header (top), utility bar (bottom) — these are outside the fragment system
- **Connectivity**: Per-edge (each pair of adjacent slots toggles independently, not whole-group)
- **View modes**: Contained ("root" frame within chrome) and fullscreen (root expands, chrome overlays)
- **Ratio presets**: Width ratio presets (1:1, 2:1, 1:2, 1:1:1, 2:1:1) in addition to free drag
- **Stack**: Vite + React + TypeScript + Zustand + Framer Motion (scaffold exists in `layout-tool/src/`)
- **Figma export**: Nice to have — not in scope for MVP
- **Sprint scope**: Production quality, 5+ sessions

## Known Data and Assumptions

**Known:**
- Scaffold exists with token data, device configs, radii/gap calculations, grid selector, canvas, fragment slots, and spec panel — all display-only
- Token values are codified: `spacing/connected` (8px), `spacing/unconnected` (16px), `radii/large` (80px), `radii/connected` (40px)
- 10 Fragment Group variants, 27 slots total, all defined in fragment rules
- Connectivity radii are a pure function: inner corner facing connected edge = 40px, all others = 80px
- Figma contained view reference at node 39-326 — safe area dimensions need verification
- Director's vector grid philosophy: attachment vectors, not rigid column grids — ratio presets align with this

**Unvalidated assumptions:**
- Designers will prefer the web tool once they experience live connectivity preview (adoption not tested)
- Per-edge connectivity is the right interaction model vs. whole-group toggles
- 12px grid snap will feel natural in a drag interaction rather than restrictive
- Framer Motion is the right animation library for elastic movement behaviour
- The tool reduces the time to produce a rule-compliant spec vs. working in Figma with the reference guide

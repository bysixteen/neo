---
title: "Sprint 001: Synthesis"
type: sprint-synthesis
status: complete
date: 2026-03-18
sprint: "001"
---

**TL;DR:** Sprint 001 validated the web tool approach, set a measurable win condition, and identified the state model and radii function as the critical first implementation step — before any UI interaction code is written.

---

## What Changed

| Document | Change |
|----------|--------|
| `research/DECISIONS.md` | Added D006: Fragment Layout Tool MVP scope and win condition |
| `research/sprint-status.md` | Sprint 001 marked complete with all 7 personas |
| `research/PRINCIPLES.md` | Added Principle 9: Win condition and self-evidence test |

`research/PERSONAS.md` — no changes. The DxD Designer persona was confirmed as the primary user; no new insights changed the description.

## What the Next Sprint Should Know

1. **State model first.** The Zustand store shape (`slots[][]`, `edges Map`, `viewMode`, `device`) and the `getSlotRadii` pure function must be defined and unit-tested before any drag or connectivity interaction is built. Every component downstream reads from this state.

2. **Self-evidence is the success criterion.** The tool is not successful if designers use it correctly because they already know the rules. It is successful if they use it correctly because the tool makes the right choice obvious. Every interaction decision should be tested against this standard.

3. **Elias's ownership concern stands.** The tool needs to be maintainable by at least two team members. Documentation (inline comments, a short README, data shape diagram) is not optional — it is part of the win condition.

4. **Contained/fullscreen is architecturally load-bearing.** It must be designed into the state model from the start. Bolting it on later will require restructuring the canvas layout calculations.

5. **Per-edge connectivity, not per-group.** The plan specifies that each pair of adjacent slots toggles independently. The edge ID convention (`"${minIdx}-${maxIdx}"`) must be established early and used consistently across state, event handlers, and the radii function.

## Open Questions

- What are the exact safe area pixel dimensions for the EDL header (top) and utility bar (bottom) on Electra? The Figma reference at node 39-326 needs to be measured.
- What are the container widths for Hoya (15") and Madeline (8")? Currently listed as TBD.
- Does the director's vector grid philosophy suggest we should support arbitrary ratio snapping (e.g. 3:7) in addition to the defined presets, or is the preset list sufficient?
- Should the "+" connectivity affordance appear on hover only, or always be visible between connected slots?
- Is Framer Motion's spring physics configurable enough to produce the elastic snap feel, or do we need a custom spring implementation?

---

_Appendix: Full sprint folder at `research/sprints/sprint-001-layout-tool/`_

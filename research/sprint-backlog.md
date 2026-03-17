# Alexa Expression System — Sprint & Spike Backlog

**Last updated:** 2026-03-04

This document is a lightweight backlog of sprint and spike candidates. It is the input to `/create-sprint` and `/create-spike` — those commands will read this file and offer to pull the next candidate from it.

**How to use:**
- Add a row whenever a new sprint or spike candidate is identified.
- Set `Status` to `Candidate` when first added, `In Progress` when running, and `Done` when complete.
- Set `Priority` to `High`, `Medium`, or `Low`.
- The `Blocking` column identifies what work cannot start until this sprint or spike is complete.

---

## Active Backlog

| # | Type | Topic / Question | Priority | Status | Blocking |
|---|------|-----------------|----------|--------|----------|
| 1 | Sprint | **Foundation** — establish shared context, review internal seeds | High | Done | All other sprints |
| 2 | Sprint | **Expression Principles** — visual identity, morphology, motion language | High | Blocked | Awaiting seed review from DxD |
| 3 | Sprint | **Alexa Embodiment** — state behaviours, intent expression, agency levels | High | Candidate | Multi-surface integration |
| 4 | Spike | **Low-end Constraints** — rendering budgets for Echo Spot, Echo Frames | High | Candidate | Generative logic, Foundations |
| 5 | Sprint | **System Foundations** — tokens, patterns, templates, transformation rules | High | Candidate | Generative logic |
| 6 | Sprint | **Generative & Adaptive Logic** — transformation mechanics, context-aware variants | High | Candidate | Multi-surface integration |
| 7 | Sprint | **Multi-surface Integration** — cross-surface continuity flows, device transitions | Medium | Candidate | Leadership narrative |
| 8 | Sprint | **Leadership Narrative** — vision decks, documentation, blueprint | High | Candidate | — |

---

## Feature Questions (Sprint Candidates)

These questions from the RFP should be addressed in sprints:

- How does Alexa's embodiment express different agency levels (reactive vs proactive)?
- How do state transitions (idle -> listening -> thinking -> resolving) feel across high-end and low-end devices?
- What is the morphology language — how do shapes transform and relate?
- How does the system adapt to user context (communal vs personal, adult vs child)?
- What does cross-surface continuity look like in practice (e.g., starting on Echo Show, continuing on mobile)?

---

## Technical Questions (Spike Candidates)

These questions from the RFP should be addressed in spikes:

- What rendering budgets are realistic for low-end devices (Echo Spot, Echo Frames)?
- How do we define "graceful degradation" in measurable terms?
- What prototyping tools best support multi-surface, capability-aware validation?
- How do we document transformation mechanics (template -> pattern -> card) for engineering handoff?

---

## Parking Lot

Items explicitly out of scope for this engagement, but may be relevant for future phases:

| Topic | Reason for Parking |
|-------|-------------------|
| Additional surfaces beyond core set | RFP explicitly out of scope; extensibility target only |
| Final component library | System-level definition only; internal teams scale |
| Character/mascot design | Embodiment is functional, not anthropomorphic |

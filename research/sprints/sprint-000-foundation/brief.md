---
title: "Sprint 000: Foundation"
type: sprint-brief
status: complete
date: 2026-03-04
sprint: "000"
format: lite
personas: [lena, marcus, aris, elias]
depends-on: []
feeds-into: [sprint-001-expression-principles, spike-low-end-constraints]
tags: [foundation, alignment, context-setting]
---

**TL;DR:** Establish shared context from the RFP, identify gaps in our understanding, and align on how the squad will evolve Amazon's internal seeds into a mature expression system.

---

## Sprint Challenge

How do we establish shared context and identify what's missing so the squad can confidently evolve Amazon's internal seeds into a cross-platform expression system?

## Long-Term Goal

In 3 months, the Alexa Expression System is a fully realised, generative-ready design foundation. DxD designers apply it confidently across Echo Show and Echo Spot without designing twice. DxD engineers implement it without guessing degradation rules. VP+ leadership sees a unified vision they can champion. The internal seeds have matured into a system that Amazon's teams can scale independently.

## Sprint Questions

1. Can we define what "evolving the seeds" means in practice without access to the seeds themselves?
2. Will the RFP scope constraints (system-level definition, not component library) satisfy DxD's actual needs?
3. Can we identify the critical gaps that must be filled before design work begins?

## Target User

**DxD Designer** — the primary consumer of the expression system. Their frustration ("I need a system I can trust to work on Echo Show and Echo Spot without designing twice") is the success metric.

## Target Moment on the Map

The moment a DxD Designer picks up the expression system for the first time and asks: "What do I actually have to work with, and what's missing?"

## Project Squad

| Persona | Name | Role in This Sprint |
|---------|------|---------------------|
| Design Engineer | Dr. Lena Petrova | Evaluates system readiness of the RFP scope |
| Senior Developer | Marcus Thorne | Defines scope boundaries and flags risks |
| Strategist | Dr. Aris Thorne | Leads Map phase, frames the gaps |
| Client | Elias Vance | Represents DxD team, challenges assumptions |

## How Might We Questions

1. HMW establish a shared vocabulary for morphology, motion, and state that both designers and engineers can use?
2. HMW ensure "system-level definition" is concrete enough for DxD to scale without partner hand-holding?
3. HMW define "graceful degradation" in terms engineers can implement without guessing?
4. HMW identify which assumptions are highest-risk and need validation first?

## Constraints

| Constraint | Source | Impact |
|------------|--------|--------|
| 3-month engagement | RFP | Limits depth; system-level definition only |
| Must evolve existing seeds | RFP | Cannot start from scratch; direction is set |
| Internal seeds not yet available | Current state | Cannot evaluate seeds directly in this sprint |
| VP+ prototype quality required | RFP | High-fidelity prototyping throughout |
| Multi-surface coverage required | RFP | Echo Show, Echo Spot, mobile, web, Fire TV |

## Known Data and Assumptions

**Known (from RFP):**
- Amazon has internal seeds covering shape morphology, motion, generative behaviour
- The seeds represent strategic direction already aligned internally
- Target surfaces span high-end (Echo Show) to constrained (Echo Spot, Frames)
- Embodiment must communicate state, intent, attention, responsiveness, agency
- Graceful degradation is required, not optional

**Assumptions (unvalidated):**
- The internal seeds are mature enough to evolve (not restart)
- DxD team has capacity to collaborate throughout the 3 months
- Performance budgets for low-end devices are known or discoverable
- The "generative and adaptive logic" requirement is achievable within timeline

## Open Actions

| Action | Owner | Blocking |
|--------|-------|----------|
| Provide internal seeds for squad review | DxD Team | Expression Principles sprint |
| Confirm device performance budgets | DxD Engineering | Low-end Constraints spike |
| Identify prototyping tools/environment | Partner + DxD | All prototyping work |

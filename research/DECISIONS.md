# Alexa Expression System — Decision Log

**Last updated:** 2026-03-04 — Sprint 000 (Foundation) Complete

This document is a high-level log of significant decisions made during sprints and spikes. For full rationale, follow the ADR links.

| # | Decision | Sprint / Spike | Date | ADR |
|---|----------|----------------|------|-----|
| 1 | Evolve existing internal seeds, not blank-slate exploration | RFP Scope | 2026-01 | — |
| 2 | Prototyping is a required continuous track, not a final step | RFP Scope | 2026-01 | — |
| 3 | System-level definition, not final component library delivery | RFP Scope | 2026-01 | — |
| 4 | Embodiment is functional expression, not character/mascot | RFP Scope | 2026-01 | — |
| 5 | Capability-aware degradation required (high-end to low-end) | RFP Scope | 2026-01 | — |
| 6 | Foundation requirements: seed review gates Sprint 001, deliverables must be engineer-consumable, adoption testing is success metric | Sprint 000 | 2026-03-04 | [decision.md](sprints/sprint-000-foundation/decision.md) |

---

## Decision Details

### D1: Evolve existing internal seeds, not blank-slate exploration

**Context:** Amazon DxD has developed early seeds covering shape morphology, motion, and generative behaviour concepts. These represent the strategic direction for Alexa's future UI.

**Decision:** The engagement must evolve, refine, and validate these existing seeds — not start from scratch.

**Rationale:** Internal alignment has already been achieved on direction. A blank-slate exploration would waste time re-establishing consensus and risk diverging from strategic intent.

**Rejected alternative:** Starting from scratch — rejected to preserve internal alignment and respect prior investment.

---

### D2: Prototyping is a required continuous track, not a final step

**Context:** VP+ leadership alignment requires high-fidelity prototypes. Engineering feasibility validation requires prototypes that test real constraints.

**Decision:** Prototypes must be produced throughout all phases, not as a final deliverable.

**Rationale:** Prototyping is the primary discovery and validation method. Decisions made without prototype validation are high-risk.

**Rejected alternative:** Waterfall documentation-first approach — rejected as insufficient for leadership buy-in and feasibility validation.

---

### D3: System-level definition, not final component library delivery

**Context:** This is a 3-month engagement. Building a complete component library is not feasible in this timeframe.

**Decision:** The partner defines building blocks (tokens, patterns, templates, transformation rules) that internal teams will scale into a full component library.

**Rationale:** Internal teams have the context and capacity for long-term maintenance. The partner's value is in establishing the foundation and rules, not in building every component.

**Rejected alternative:** Full component library delivery — rejected as out of scope for timeline.

---

### D4: Embodiment is functional expression, not character/mascot

**Context:** Alexa's visual presence needs to communicate system state and intent.

**Decision:** The embodiment system is a functional expressive system, not a character or mascot design.

**Rationale:** The goal is clarity and responsiveness, not personality. Embodiment must communicate: system state, intent, attention, responsiveness level, and agency level.

**Rejected alternative:** Character/mascot approach — rejected as out of scope and misaligned with functional goals.

---

### D5: Capability-aware degradation required (high-end to low-end)

**Context:** The Alexa ecosystem spans high-end devices (Echo Show, Fire TV) to constrained devices (Echo Spot, Echo Frames).

**Decision:** Every expressive behaviour must have a defined degradation path for constrained devices.

**Rationale:** A single system must work across all surfaces. Degradation cannot be improvised by engineers at implementation time.

**Rejected alternative:** High-end only design with "best effort" on constrained devices — rejected as insufficient for ecosystem coherence.

---

### D6: Foundation sprint requirements

**Context:** Sprint 000 (Foundation) established shared context from the RFP and identified gaps before design work begins.

**Decision:** Three non-negotiable requirements for the engagement:
1. Seed review gates Sprint 001 — cannot evolve seeds without seeing them
2. Deliverables must be engineer-consumable — specifications, not prose
3. Adoption testing is the success metric — 30-minute design test, 2-minute lookup test

**Rationale:** The RFP scopes this as "system-level definition," but user personas need usable outputs. Abstract deliverables won't change how DxD works.

**Rejected alternative:** Proceeding without seed review — rejected as too high-risk; cannot calibrate approach.

**Dissent logged:** Elias Vance raised concern that scope may be too abstract for adoption. See `research/dissent-register.md`.

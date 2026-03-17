---
title: "Sprint 000: Decision"
type: sprint-decision
status: complete
date: 2026-03-04
sprint: "000"
decision: "Established Foundation sprint priorities: seed review is gating, deliverables must be engineer-consumable, and adoption testing is the success metric."
---

## Decision

The Foundation sprint established three non-negotiable requirements for the engagement:

1. **Seed review gates Sprint 001.** The squad cannot confidently evolve the internal seeds without seeing them. DxD must provide access before the Expression Principles sprint begins.

2. **Deliverables must be engineer-consumable, not just designer-readable.** Every token, pattern, and degradation rule must have a specification format that engineering can implement directly. Prose principles are insufficient.

3. **Adoption testing is the success metric.** A DxD Designer must be able to design a state transition within 30 minutes. A DxD Engineer must be able to look up a degradation rule within 2 minutes. If the system doesn't pass these tests, it hasn't succeeded.

## Rationale

The HMW questions exposed a core tension: the RFP scopes this as "system-level definition," but the user personas need usable outputs. Lena and Elias aligned on the risk: abstract deliverables won't change how DxD works.

Marcus's priority ranking provides a fallback if time runs short. Aris's assumption validation ensures we don't build on unstable foundations.

The decision balances RFP constraints (3 months, system-level) with user needs (usable Day 1).

## Elias Vance's Dissent

Elias raised a significant concern: **"System-level definition, not component library" may prioritise partner constraints over user needs.**

His argument: DxD doesn't need definitions — they need components. If the output is too abstract, adoption will fail regardless of quality.

**Outcome:** Dissent acknowledged but not fully resolved. The decision includes adoption testing as a success metric, which partially addresses the concern. However, the scope remains system-level definition. This dissent should be revisited if Month 2 progress shows adoption risk.

**Review trigger:** Revisit if prototype user testing shows designers struggling to apply the system.

## What We Are NOT Doing

| Option Considered | Rejected Because |
|-------------------|------------------|
| Full component library delivery | Out of scope for 3-month timeline; RFP explicitly excludes |
| Proceeding without seed review | Too high-risk; cannot calibrate approach without seeing current state |
| Prose-only documentation | Fails engineer-consumable requirement; would require rework |
| All surfaces with equal depth | Not feasible; will prioritise 2-3 representative surfaces |

## Priority Ranking (if time runs short)

| Priority | Deliverable | Rationale |
|----------|-------------|-----------|
| P0 — Must ship | Expression principles + embodiment states | Answers "what is Alexa" |
| P0 — Must ship | Capability-aware degradation rules | Answers "how does it scale" |
| P1 — Should ship | Token schema and pattern definitions | Answers "how do teams use it" |
| P2 — Could slip | Advanced generative/adaptive logic | Can be Phase 2 work |
| P2 — Could slip | Full multi-surface prototype suite | 2-3 surfaces sufficient for validation |

## Open Actions from This Sprint

| Action | Owner | Due | Blocking |
|--------|-------|-----|----------|
| Provide internal seeds for squad review | DxD Team | Before Sprint 001 | Expression Principles sprint |
| Confirm device performance budgets (Echo Spot, Frames) | DxD Engineering | Before Low-end Spike | Degradation rules |
| Identify prototyping tools/environment | Partner + DxD | Week 1 | All prototype work |
| Define token specification format | Partner (Lena lead) | Sprint 001 | Engineer-consumable deliverables |

## Next Action

**DxD Team to provide internal seeds** (shape morphology, motion, generative behaviour concepts) for squad review. This is the single blocker for Sprint 001.

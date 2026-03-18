---
title: "Sprint 001: Sketches"
type: sprint-sketches
status: complete
date: 2026-03-18
sprint: "001"
---

## Leo Finch — Visual Designer
> "Does this feel like us?"

The tool must embody the same visual language it helps designers create. If the canvas looks like a developer utility, designers will resent every second they spend in it. The fragments on-screen should use the actual radius tokens — 80px outer, 40px inner — so the layout being composed is indistinguishable from the final output. The connectivity toggle ("+" between adjacent slots) should feel gestural, not clinical. When you connect two fragments, the inner corners should animate to their new radius — a subtle morph that mirrors the elastic movement language the director has defined.

The contained vs fullscreen distinction is a first-class visual decision. It should not live in a settings panel. It should be visible as a toggle on the canvas itself, and switching modes should animate the chrome sliding in and out. The tool's own aesthetic — sparse, typographically precise, using the same spacing tokens it produces — is a form of dogfooding. If we can't apply the fragment rules to the tool's own interface, we haven't understood them.

The spec panel is part of the visual experience. It should read like a design token receipt, not a developer dump. Each slot's values laid out with clear hierarchy: connectivity state first, then radii, then dimensions. That sequence mirrors how a designer thinks.

---

## Dr. Lena Petrova — Design Engineer
> "How will we build, test, and maintain this?"

The scaffold is sound — Vite, React, TypeScript, Zustand, Framer Motion are the right choices. The gap is interactivity. The state model needs to represent three things correctly from day one: (1) the grid — an array of slot objects, each with width and height in 12px grid units; (2) the edge connectivity map — a map from edge ID (defined as the sorted pair of adjacent slot indices) to a boolean; (3) view mode and active device config.

The connectivity radii function is a pure, stateless computation from edge state to per-corner radius values. It should be extracted as a standalone utility and unit-tested independently of the React layer. This is critical — it's the core rule of the system, and if it's wrong, every spec output is wrong.

Maintenance risk: the drag-to-resize interaction is the most complex surface. Framer Motion's spring physics must not fight the grid snap. The interaction should compute the snapped position first, then animate to it — not animate freely and snap at the end. The Figma export path (deferred) must not leak into the MVP state model; keep the export as a serialisation of existing state, not a reason to change the state shape.

Test coverage target: the radii function, the grid snap logic, and the edge ID normalisation function should all be unit-tested before any UI is built on top of them.

---

## Marcus Thorne — Senior Developer
> "What are we NOT building here?"

We are not building a general-purpose layout tool. We are not building a design system manager. We are not building a Figma replacement or a motion authoring tool. The Figma export feature, the Shape Playground unification, and any multi-user collaboration features are explicitly out of scope for Sprint 001.

The most dangerous scope creep in this sprint is the "unified tool" idea — the plan mentions consolidating the layout tool with the Shape Playground. That's two different problem spaces. The layout tool produces static composition specs. The Shape Playground (whatever form it eventually takes) deals with motion and morphology. Building them together before either is proven introduces coupling that will be expensive to undo.

The hardest-to-reverse decision in this sprint is the state model. Once interaction is built on top of a data shape, refactoring the shape requires touching every layer. Get it right before writing a single event handler. The second hardest-to-reverse decision is the contained/fullscreen model — it needs to be architecturally clean from the start, not bolted on later.

Undo/redo is also out of scope for MVP. The browser is a forgiving prototyping environment — designers can refresh. Don't let this become a reason to delay shipping the core loop.

---

## Kira Sharma — Developer
> "What does the implementation actually look like?"

The existing scaffold gives us the token data and device configs. The core implementation has three parts:

**State model (Zustand):** `slots: SlotObject[][]` (a 2D grid, each slot has `colSpan`, `rowSpan`, `widthUnits`, `heightUnits` in 12px units), `edges: Map<string, boolean>` (edge ID → connected boolean, where edge ID is `"${minIdx}-${maxIdx}"`), `viewMode: 'contained' | 'fullscreen'`, `device: 'electra' | 'hoya' | 'madeline'`.

**Drag-to-resize:** Pointer event on a divider between slots. On `pointerMove`, compute the raw delta, convert to 12px grid units (floor to nearest unit, clamp to minimum slot size), update the adjacent slots' widths/heights in the store. Framer Motion animates the layout reflow. The grid snap happens before Framer sees the values.

**Connectivity toggle:** Click event on the "+" element between adjacent slots. Derive the edge ID from the two slot indices, toggle the boolean in the edge map. Immediately re-derive the radii for both affected slots using the pure radii function. The spec panel reads from the same computed radii — no second computation.

The pure radii function signature: `getSlotRadii(slotIdx: number, slots: SlotObject[][], edges: Map<string, boolean>): { tl: number; tr: number; bl: number; br: number }`. For each corner, identify the edge(s) adjacent to that corner, check their connectivity state, return 40px if connected or 80px otherwise.

Estimated core implementation: ~400 lines across state, radii function, drag handler, and spec panel.

---

## Dr. Aris Thorne — Strategist
> "What is the real problem we are trying to solve?"

The stated problem is "designers make inconsistent layouts." But one level beneath that: the rules live in a document and not in the workflow. The designers know there are rules — they lack an efficient way to apply them mid-composition without breaking their creative flow to consult a reference guide.

The pivot from Figma token automation was correct for this reason: it recognised that automation requiring understanding defeats itself. The question now is whether the web tool actually eliminates the lookup. If a designer using the tool still needs to understand connectivity logic to make decisions, we've built a faster way to make the same mistakes.

The primary sprint question should be reframed from "can we build this?" (we clearly can) to "will the tool be self-evident enough that a designer who has never read the fragment rules can still produce a rule-compliant layout?" That is the actual test of whether we've solved the problem. The tool should make the right choice the obvious choice — not just the documented choice.

Simplest-possible alternative worth steelmanning: a Figma plugin with one button that applies the correct connectivity tokens to a selected Fragment Group. Cheaper to build, no context switch. Rejected because: (a) Figma can't bind per-corner radius, the core limitation that drove the pivot; (b) no multi-device preview; (c) no drag-to-resize. The web tool is justified — but only if it actually eliminates the lookup.

---

## Rowan Vale — Craftsman
> "What is the feeling we want to create?"

The experience should feel like working with responsive, tactile material — the same quality the director describes in the visual language: soft morphology, graphic clarity, elastic movement. When you drag a divider, it should resist slightly and snap cleanly — not jump rigidly to grid values. The snap should feel like a physical sensation: tension, then release.

When you connect two fragments, the inner corners should animate to 40px — a brief morph that confirms the action. When you disconnect, they bloom back to 80px. The contained/fullscreen toggle should feel like lifting a frame off the page or setting it down.

The spec panel is not a developer afterthought — it's the end of the designer's journey. It should feel like the tool reading your decisions back to you: "Here is what you built. Here is what it says to engineering." That moment of confirmation is the emotional payoff. The designer should leave feeling confident, not just faster. Confidence is the actual product.

The tool should not feel like a utility. It should feel like a design instrument — precise, minimal, with just enough feedback to confirm every choice. The interactions should be few but deeply satisfying. Fewer, better affordances over more, mediocre ones.

---

## Elias Vance — Client (Mandatory Dissent)
> "Does this solve a real problem for my users?"

I need to steelman the alternative before we commit 5+ sessions to this.

The alternative: we write a better reference guide, run a workshop, and trust the design team to apply the fragment rules. The web tool requires context switching — designers move between Figma (where they design) and the tool (where they spec). Every context switch has a cost. What evidence do we have that the layout ad-hoc problem is severe enough to justify that cost and a production-quality build?

I'm not opposed to the tool. The Figma pivot rationale is sound — per-corner radius genuinely can't be automated in Figma. But I have one demand before we start: **define the win condition now**. Not after launch. What does success look like in 6 weeks? "Designers are using it" is not a win condition. "Layouts produced with the tool have zero token violations" is a win condition. "A designer composes and specs a 3-fragment connected layout in under 2 minutes without consulting the reference guide" is a win condition.

Without a measurable outcome agreed before Sprint 001 implementation begins, we will declare success at launch and never know if the tool changed behaviour. The tool might be technically complete and functionally ignored. Define the win first.

Additionally: who owns the tool? If Daniel is the only person who can fix bugs, the tool has a single point of failure. The team needs to be able to maintain it.

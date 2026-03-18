# Design Principles — Amazon Touch Display Fragment System

Living document. Updated by sprints and spikes as the system matures.

---

## 1. Grid

| Tier | Size | Purpose |
|------|------|---------|
| Base | 4px | Padding, gaps, fine alignment |
| Structural | 12px | Fragment sizing, width ratios |
| Compositional | 36px | Large-scale layout divisions |

**Principle:** All fragment edges must land on 12px structural grid lines. Content determines width ratios — no column count is prescribed.

---

## 2. Shape Vocabulary

Three shape primitives at fragment level:

| Shape | Radius | Signal | When |
|-------|--------|--------|------|
| Squidgy | `radii/large` (80px) outer / `radii/connected` (40px) docked | "Explore me" | Default for all content fragments |
| Pill | `radii/pill` (999px) | "Tap me to go somewhere" | Narrow preview cards, navigation |
| Circle | `radii/pill` (999px), 1:1 aspect | "Do this now" | Primary action, max 1 per screen |

**Principle:** Buttons are part of the parent fragment, not separate structural elements.

---

## 3. Connectivity

Two modes applied as gap on the Fragment Group container:

| Mode | Gap token | Gap value | Inner radii | Use when |
|------|-----------|-----------|-------------|----------|
| Connected | `spacing/connected` | 8px | 40px | Fragments serve one task |
| Unconnected | `spacing/unconnected` | 16px | 80px | Fragments are independent |

**Principle:** Gap is uniform within a group. For mixed connectivity, nest Fragment Groups — each controls its own gap independently.

---

## 4. Composition

**Principle:** Complex layouts compose from simple primitives via nesting. A slot in any Fragment Group can contain another Fragment Group.

Fragment Group variants: Single, Pair-H, Pair-V, Trio-H, Trio-V, 1L-2R, 2L-1R, 1T-2B, 2T-1B, Grid-2x2.

Width ratios: 1:1, 2:1, 1:2, 1:1:1, 2:1:1. All edges on 12px grid.

---

## 5. Fragment System Scope

**Principle:** The fragment system governs structure, not content. Shape rules apply to fragments, not to UI controls within them.

Structural elements outside the fragment system: AlexaChrome bezel, EDL Header, Global Handle. Fragment Groups live in `ContentSurface`.

---

## 6. Tool Philosophy

**Principle:** Logic over encoding. The connectivity rules are ~20 lines of code — they should not be encoded as hundreds of variable values. The right tool for conditional, positional logic is code, not a design token graph.

**Principle:** Web tool as enforcement mechanism. The fragment rules are stable; the tool makes them easy to apply correctly. Designers should not need to understand the token chain to get the right values.

---

## 7. Token Architecture

**Principle:** Semantic tokens for now, per-component collections when patterns stabilise. Fragment Group tokens live in the global Semantic Scale. BNY per-component collections deferred until the connectivity pattern has proven stable across multiple components.

**Principle:** Primitives only multiply on 4px grid. `space/4`, `space/8`, `space/12`, `space/24`, etc. No values that don't sit on the 4px base.

---

## 8. Visual Language (Director's Framework)

The fragment system provides the skeleton; the visual language provides skin and motion.

- **Surface & membrane**: UI layer over Alexa's luminous presence beneath
- **Elastic movement**: shapes that snap back, bend with momentum
- **Simple morphology**: state transitions using shape change

**Principle:** Fragment corner radius tokens and connectivity modes must support elastic movement and morphological transitions.

---

---

## 9. Tool Success Standard (Sprint 001)

**Principle:** The tool is not successful if designers use it correctly because they already know the rules. It is successful if they use it correctly because the tool makes the right choice obvious. Every interaction decision should be tested against this standard.

**Win condition:** A designer composes a valid 3-fragment connected layout and receives a correct per-slot spec in under 2 minutes, without consulting the token reference guide.

---

**Last updated**: 2026-03-18

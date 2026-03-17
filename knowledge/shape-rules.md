# Neo-EDL Shape Rules — Canonical Specification

**Source:** ~60 concept screens from Amazon DxD team (Figma + shared assets)
**Date extracted:** 2026-03-16
**Last updated:** 2026-03-16 (Smart Fragment model, tokenised padding, 24x15 grid)

> This document is the single source of truth for the Neo-EDL shape system.
> All tooling and prompts should reference this file exclusively.

---

## 1. Smart Fragments

Components are **smart fragments** — self-contained elements that carry their own tokenised padding. There are no external gutters or grid margins.

**Properties:**
- **Padding** — tokenised [top, right, bottom, left], baked into each fragment
- **Relationship** — `associated` (tight, related content) or `disassociated` (breathing room, unrelated)
- **Action Type** — `primary`, `secondary`, or `none` (determines notch eligibility)
- **Size Category** — computed from area ratio: `full` (>75%), `half` (25-75%), `quarter` (<25%)

**Association rules:**
- Associated fragments: 8px gap, inner-facing corners reduce to 40px
- Disassociated fragments: 24px gap, all corners stay 80px

---

## 2. Token System

Inspired by the BNY three-layer token pipeline (primitives → semantics → component), simplified for a Canvas 2D exploration tool.

| Category | Token | Value |
|----------|-------|-------|
| **Grid** | `GRID_UNIT` | 16px |
| **Spacing** | `spacing.xs` | 8px |
| | `spacing.sm` | 16px |
| | `spacing.md` | 24px |
| | `spacing.lg` | 32px |
| | `spacing.xl` | 48px |
| **Radii** | `radii.outer` | 80px |
| | `radii.inner` | 40px |
| | `radii.notch` | 240px |
| | `radii.organic` | 72px |
| **Gaps** | `gaps.associated` | 8px |
| | `gaps.disassociated` | 24px |
| | `gaps.notch` | 8px |
| | `gaps.diagonal` | 16px |

All spatial values are multiples of 8.

---

## 3. Shape Math (Construction Method)

Shapes are NOT simple rounded rectangles. They are built through **boolean operations**:

| Token | Meaning | Value |
|-------|---------|-------|
| `radius-base` | Container corner radius | 80px |
| `notch-shape` | Notch primitive type | circle or rectangle |
| `notch-offset` | Boolean offset (gap) | 8px |
| `radius-organic` | Final smoothing radius | 64-80px |

**Process:**
1. Start with a container (rounded rect, `radius-base: 80`)
2. Position a notch shape (circle or rect) at a corner
3. Boolean-subtract the notch from the container with `notch-offset: 8` gap
4. Apply `radius-organic` smoothing to the resulting shape

This produces the organic, flowing curves seen in the explorations — not sharp geometric cuts.

---

## 4. The Notch (formerly "Bibble")

The notch is a secondary shape that embeds into a corner of the main container. Three sizes:

| Size | Notch Shape | Notch Radius | Use Case | Surface Tension |
|------|-------------|--------------|----------|-----------------|
| Small | Circle | n/a | Secondary quick action (arrow, close, next, prev) | Low |
| Medium | Rectangle | 240px | Standard action (timer, nav arrows, "+ Add") | Medium |
| Large | Rectangle | 240px | Immersive/live (notifications, content cards) | High |

**Rules:**
- Spacing between notch and container: always **8px**
- Placement: corner-fixed (typically bottom-right or bottom-left)
- No text labels inside small notches — icon only
- Maximum one icon per small notch
- Medium/large notches can contain text + icon
- Multiple stacked notifications allowed in large notch area

---

## 5. Notch Eligibility

Notch eligibility is determined by **action hierarchy** and **fragment size**, not just aspect ratios.

| Condition | Notch? |
|-----------|--------|
| Fragment area < 25% of canvas (quarter) | No |
| No action type (none) | No |
| Primary action + half/full size | Medium or Large |
| Secondary action + half/full size | Small (circle) |

The weighting of the notch relates to the parent fragment size. "Don't need a notch when it's a quarter."

---

## 5b. Collision Knockouts

In addition to authored notches, the system supports **proximity-driven knockouts** inspired by Pete's Shapes canvas tool. When fragments come within a configurable "collision gap" distance of each other, the smaller fragment's profile is boolean-subtracted from the larger one.

**How it works:**
- A global **Collision Gap** slider (0-48px) controls the proximity threshold
- When the expanded bounds of a smaller fragment (invader) overlap a larger fragment (host), a knockout is computed
- The knockout cut follows the invader's own profile (its radii), expanded by 8px
- An inner highlight stroke along the cut edge creates visual depth

**Collision vs authored notches:**
- Authored notches (`notch: true`) are predefined and always render
- Collision knockouts are computed from fragment proximity at render time
- Both use the same boolean subtraction technique (offscreen canvas + `destination-out`)

---

## 6. Gap Rules

| Relationship | Gap | Effect on Corners |
|-------------|-----|-------------------|
| Associated | 8px | Inner-facing corners reduce to 40px |
| Disassociated | 24px | All corners stay 80px |
| Notch offset | 8px | Boolean subtraction gap |
| Diagonal gap | 16px | Between diagonal-cut panels |

---

## 7. Corner Radius Rules

| Position | Radius | When |
|----------|--------|------|
| Outer (facing device edge) | 80px | Always |
| Inner (facing associated neighbour) | 40px | When adjacent fragment is within 8px |
| Notch rectangle | 240px | Medium/large notch shapes |
| Container base | 80px | Default for all containers |
| Organic smoothing | 64-80px | Applied after boolean operations |

---

## 8. The "Diagonal" (Grid Shift, Not Fixed Angle)

The diagonal effect is NOT a fixed -98° geometric angle. It is created by:

1. Shapes whose top edges are shifted **1-2 grid columns** from their bottom edges
2. The very large corner radii (80px+) create smooth curved transitions at the edges
3. The "very large round rect as cutting shape" technique (per Liron Damir) — a circle with radius ~2000px+ creates an approximately straight diagonal line

The diagonal gap is **16px** between panels.

The visual effect approximates -98° from vertical but the construction is grid-based, not angle-based.

---

## 9. Vector Grid (Edge-to-Edge)

The EDL uses a **vector grid** — thin lines that act as attachment vectors. Not a traditional column/gutter grid.

**Layout grid: 24 columns × 15 rows** (80px × 72px cells, both divisible by 8)
**Snap grid: 16px** increments for precise positioning

- Grid spans the **full device canvas** (edge-to-edge, 0,0 to 1920,1080)
- Grid lines are thin, hairline-width horizontals and verticals
- Shapes **attach** to grid lines — their edges snap to the nearest line
- Attached lines render brighter; unattached lines are very faint
- The grid extends beyond the device frame when toggled on
- Chrome elements (status bar) participate in attachment detection

---

## 10. Chrome as Fragments

Chrome elements (status bar, pagination, title bar) are themselves smart fragments that occupy grid positions. They participate in the association model — typically disassociated from content fragments.

Currently implemented: status bar only. Others to be added as the system evolves.

---

## 11. Canonical Content Types

| Type | Description | Layout Pattern |
|------|-------------|---------------|
| Modular | Flexible layout built from cards/widgets | Grid of cards |
| Editorial | Content with large focus intended to be read | Hero + supporting |
| Stepped Flow | Things intended to be paged through | Sequential panels |
| Related in Context | Two pieces of information related in context | Side-by-side |

---

## 12. Generative & Adaptive Logic

The UI adapts based on:
- **Room context:** Kitchen (recipe-first), Bedroom (wind-down), Living Room (entertainment hub), Entryway (departure briefing)
- **User context:** Family/shared mode, child-safe content
- **Temporal context:** Rush/compressed mode, default ambient
- **Social context:** Party mode (stripped to music controls)
- **Modality:** Seamless voice-to-touch and touch-to-voice transitions

---

## Open Questions

1. Exact ratio of notch-to-main-shape for notch sizing (specs say "??x Main Shape")
2. Exact organic smoothing value (64 vs 80 in different examples)
3. Whether diagonal shifts are always exactly 1 or 2 columns, or can be fractional
4. Additional chrome elements beyond status bar (pagination, title bar, actions)
5. Breakpoint adaptation — how tokens map across different device sizes

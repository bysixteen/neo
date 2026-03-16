# Neo-EDL Shape Rules — Extracted from Design Explorations

**Source:** ~60 concept screens from Amazon DxD team (Figma + shared assets)
**Date extracted:** 2026-03-16

---

## 1. Shape Math (Construction Method)

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

## 2. The Notch (formerly "Bibble")

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

## 3. Aspect Ratios & Notch Eligibility

Components have aspect ratios measured in grid units (e.g. 4x3 = 4 cols x 3 rows).

**No notch allowed:**
1x1, 2x1, 2x2, 2x3, 3x1, 3x3, 4x2, 5x2

**Notch recommended (enough surface area):**
4x3, 4x4, 5x5, 6x5, 7x5, 10x6

"Whole card is the button" for small aspect ratios (no room for a separate notch).

---

## 4. Gap Rules

| Relationship | Gap | Effect on Corners |
|-------------|-----|-------------------|
| Related | 8px | Inner-facing corners reduce to 40px |
| Unrelated | 24px | All corners stay 80px |
| Notch offset | 8px | Boolean subtraction gap |
| Diagonal gap | 16px | Between diagonal-cut panels |

---

## 5. Corner Radius Rules

| Position | Radius | When |
|----------|--------|------|
| Outer (facing device edge) | 80px | Always |
| Inner (facing related neighbour) | 40px | When adjacent shape is within 8px |
| Notch rectangle | 240px | Medium/large notch shapes |
| Container base | 80px | Default for all containers |
| Organic smoothing | 64-80px | Applied after boolean operations |

---

## 6. The "Diagonal" (Grid Shift, Not Fixed Angle)

The diagonal effect is NOT a fixed -98° geometric angle. It is created by:

1. Shapes whose top edges are shifted **1-2 grid columns** from their bottom edges
2. The very large corner radii (80px+) create smooth curved transitions at the edges
3. The "very large round rect as cutting shape" technique (per Liron Damir) — a circle with radius ~2000px+ creates an approximately straight diagonal line

The diagonal gap is **16px** between panels.

The visual effect approximates -98° from vertical but the construction is grid-based, not angle-based.

---

## 7. Grid System (Circle Grid)

The grid uses **circles** arranged in a regular pattern, not traditional lines or dots.

- Circles are uniform in size
- Shapes sit ON TOP of the grid
- Circles are visible through the gaps between shapes
- The grid exists both inside and outside the device frame
- Grid coordinates use (col, row) notation, e.g. (11,0), (14,0)

"The EDL uses a grid of lines that act as 'attachment' vectors. Not a traditional grid. Spacing tokens or the edges of components can be attached to this grid."

---

## 8. Canonical Content Types

| Type | Description | Layout Pattern |
|------|-------------|---------------|
| Modular | Flexible layout built from cards/widgets | Grid of cards |
| Editorial | Content with large focus intended to be read | Hero + supporting |
| Stepped Flow | Things intended to be paged through | Sequential panels |
| Related in Context | Two pieces of information related in context | Side-by-side |

---

## 9. Generative & Adaptive Logic

The UI adapts based on:
- **Room context:** Kitchen (recipe-first), Bedroom (wind-down), Living Room (entertainment hub), Entryway (departure briefing)
- **User context:** Family/shared mode, child-safe content
- **Temporal context:** Rush/compressed mode, default ambient
- **Social context:** Party mode (stripped to music controls)
- **Modality:** Seamless voice-to-touch and touch-to-voice transitions

---

## Open Questions (from the explorations)

1. Exact ratio of circle-to-main-shape for notch sizing (specs say "??x Main Shape")
2. Exact organic smoothing value (64 vs 80 in different examples)
3. How the circle grid dimensions map to device resolution (18x12? different?)
4. Whether diagonal shifts are always exactly 1 or 2 columns, or can be fractional

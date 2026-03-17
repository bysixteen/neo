# Manus Feedback — Structure Lab Review

**Date:** 2026-03-16
**Reviewer:** Manus (AI review agent)
**Subject:** Structure Lab prototype evaluation

---

## 1. Circle Grid vs Vector Grid (Critical)

The Structure Lab was rendering a **circle grid** (large semi-transparent circles at intersections). The design direction has moved to a **vector grid** — thin lines acting as attachment vectors.

The circle grid is explicitly marked as outdated in reference slides:

> "The current circle grid only helps layout shapes, but even still as shapes move and morph and edges change the shapes no longer fit to the grid. We need something that fully describes the system we're designing."

**Recommendation:** Replace circles with thin hairline horizontal/vertical lines. Attached lines (where shape edges snap) render brighter. Lines extend beyond the device frame.

**Status:** Implemented — `renderer.js` now draws vector lines.

---

## 2. Notch Visual Ambiguity (Critical)

The boolean subtraction works technically but the 8px gap is nearly invisible at default scale. The notch appears to simply overlap the container rather than being carved out.

**Recommendations:**
1. Add inner highlight/shadow along the cut edge to create depth
2. Use distinct colours for container vs notch in debug mode
3. Add explicit annotations showing the 8px offset distance

**Status:** Implemented — inner highlight stroke, teal debug fill for notch shapes, offset annotation in gap markers.

---

## 3. Visual Refinements

| Issue | Recommendation | Status |
|-------|---------------|--------|
| Tiny labels | Increase font size, add dark background for contrast | Implemented |
| No diagonal annotations | Extend annotation logic to diagonal panels | Pending |
| Notch animation popping | Animate notch shapes in sync with containers | Implemented (metadata preserved in transitions) |

---

## 4. Prompting Strategy (Advisory)

Manus recommends three strategies for effective Claude prompting:

1. **Canonical Specification** — consolidate all rules into a single authoritative document. Use it as the only source of truth in prompts.
2. **Visual Diffing** — annotate screenshots showing "before" (wrong) and "after" (right). Frame prompts with both images.
3. **Show Your Work** — ask Claude to explain its reasoning before generating code, referencing specific rules from the spec.

**Status:** `knowledge/shape-rules.md` updated as single source of truth.

---

## Summary of Actions Taken

- [x] Vector grid replaces circle grid in `renderer.js`
- [x] Notch inner highlight along cut edge
- [x] Distinct notch colour in debug mode (corner labels on)
- [x] Notch offset annotation in gap markers
- [x] Larger labels with dark backgrounds for contrast
- [x] Notch metadata preserved in transitions (no animation popping)
- [x] `shape-rules.md` reconciled — circle grid references removed
- [ ] Diagonal mode annotations (future)

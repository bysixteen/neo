# Personas — Amazon Touch Display Fragment System

Living document. Updated as the team and user understanding evolves.

---

## Primary User: Design Team

The design team creates layouts for the 1440×900 Echo Show touch display. They work across multiple content types (media, commerce, task flows, dashboards) and need layouts that are consistent, token-correct, and fast to produce.

### Composite Designer Persona

**Name:** The DxD Designer
**Role:** UI/UX designer on the Amazon DxD team
**Experience:** Fluent in Figma, understands the fragment vocabulary, does not want to learn token chains or memorise position lookup tables

**Goals:**
- Compose a new layout quickly with correct spacing and radii
- Preview the layout at the target device size (Electra 11", Hoya 15", Madeline 8")
- Know immediately whether a layout follows the fragment rules
- Hand off an exact spec to engineering without redlining frames

**Pain points:**
- Currently creates layouts ad hoc — inconsistent spacing, radii applied from memory
- Has to cross-reference the token reference guide manually
- No way to verify a layout is rule-compliant without reading the spec
- Switching between device sizes means duplicating frames

**Behaviours:**
- Works in Figma but is open to a companion web tool if it's faster
- Explores creative layouts — needs flexibility within the rules, not just templates
- Primarily works in the shared exploration file (`-INT- Amazon DxD — Design Playground`)

---

## Team Members (Real Users)

| Person | Role | Notes |
|--------|------|-------|
| Matt | Overall design lead | Shape and layout explorations |
| Caroline | Designer | — |
| Minh | Designer | Active explorations |
| Vitalii | Designer | — |
| Ruslan | Designer | — |
| Mark | Designer | — |
| Pete | Designer | iPad Shapes canvas tool — proximity-driven knockouts |
| Design director | Design director | 4px grid, attachment vector philosophy, visual language author |
| Daniel Cork | DxD / system author | Primary tool builder |

---

## Engineering Persona (Secondary User)

**Name:** The DxD Engineer
**Role:** Front-end engineer implementing designed layouts

**Goals:**
- Receive a complete spec with exact pixel values per slot
- Know which tokens to apply (not just raw values)
- Understand connectivity state at a glance

**Pain points:**
- Redlining Figma frames is slow and error-prone
- Gap vs padding model is confusing without documentation

---

**Last updated**: 2026-03-18

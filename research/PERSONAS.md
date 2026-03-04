# Alexa Expression System — User Personas

**Last updated:** 2026-03-04 — Sprint 000 (Foundation)
**Next review:** Sprint 002

> **Note:** These are the project's *user* personas — the real people who will use the product. They are distinct from the Project Squad personas (the seven archetypes in `.squad/project-squad.md`).

---

## Persona 1: DxD Designer

**Role:** Internal Amazon designer responsible for Alexa device experiences

**Goal:** Apply a consistent, expressive design language across devices without reinventing patterns for each surface. Wants to ship work that looks and feels cohesive whether it's on Echo Show, mobile, or web.

**Frustrations:**
- Current seeds are too nascent to scale across the device ecosystem
- No clear rules for adapting designs to constrained hardware
- Has to make judgment calls that should be codified in the system
- Prototypes are one-off; no systematic way to show capability variants

**Key Quote:** "I need a system I can trust to work on Echo Show and Echo Spot without designing twice."

---

## Persona 2: DxD Engineer

**Role:** Internal Amazon engineer implementing Alexa UI across platforms

**Goal:** Translate design intent into performant, capability-aware code. Wants clear specs that account for device constraints so implementation isn't guesswork.

**Frustrations:**
- No clear spec for graceful degradation — has to guess what drops out on low-end devices
- Motion and adaptive logic are undefined; has to reverse-engineer from prototypes
- Performance budgets aren't specified per device tier
- Transformation mechanics (template -> pattern -> card) are implicit, not documented

**Key Quote:** "Tell me the rules for what drops out on low-end devices — I can't guess."

---

## Persona 3: VP+ Leadership

**Role:** Senior Amazon leadership evaluating Alexa's future direction

**Goal:** See a compelling, unified vision for Alexa's visual identity. Needs to make go/no-go decisions and communicate direction to stakeholders.

**Frustrations:**
- Hard to evaluate direction without high-fidelity prototypes
- Disconnected explorations don't tell a cohesive story
- Wants to see the system in context — real flows, real content, real devices
- Needs confidence that the direction can scale to the full device ecosystem

**Key Quote:** "Show me what this feels like in context — across devices, in real flows."

---

## Persona 4: Alexa End User (Ambient)

**Role:** Consumer using Alexa in communal home spaces (kitchen, living room)

**Goal:** Interact with Alexa naturally, understanding at a glance what the system is doing. Wants responsiveness and clarity without having to think about it.

**Frustrations:**
- Sometimes unclear if Alexa heard the request
- State transitions can feel abrupt or unclear
- Different devices feel like different products

**Key Quote:** "I just want to know it's working — don't make me guess."

---

## Persona 5: Alexa End User (Personal)

**Role:** Consumer using Alexa on personal devices (mobile app, Echo Frames)

**Goal:** Quick, private interactions that respect context. Wants Alexa to feel present but not intrusive.

**Frustrations:**
- Mobile app can feel disconnected from device experience
- Constrained devices (Frames) lose too much expression
- Cross-device continuity is weak — starting on one device and continuing on another feels fragmented

**Key Quote:** "It should feel like the same Alexa, whether I'm at home or on my phone."

# Alexa Expression System — Dissent Register

**Last updated:** 2026-03-04 — Sprint 000 (Foundation) Complete

This document records all significant dissenting opinions raised during sprints and spikes, primarily from Elias Vance (the Mandatory Challenger). Dissent is a feature. Recording it ensures that overruled concerns are not lost and can be revisited.

The `Review Trigger` column specifies the condition under which a dissenting view should be actively revisited. The `/create-sprint` command scans this column before each sprint and surfaces any entries whose trigger matches the upcoming sprint's topic.

| Sprint / Spike | Topic | Dissenting Persona | Dissenting View | Outcome | Review Trigger |
|---|---|---|---|---|---|
| Sprint 000 | Scope abstraction | Elias Vance | "System-level definition, not component library" may prioritise partner constraints over user needs. DxD needs usable components, not abstract definitions. If output is too abstract, adoption will fail regardless of quality. | Acknowledged; adoption testing added as success metric. Not fully resolved. | Prototype user testing shows designers struggling to apply the system |

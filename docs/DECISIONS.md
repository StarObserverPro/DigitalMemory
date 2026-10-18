# Architecture decision register

This is the concise record of decisions and their authority, not a second copy of every contract. Detailed semantics live in the linked owners. A later change records its reason and affected decision IDs; it does not silently rewrite the original user constraint.

## Baseline decisions

| ID | Decision | Basis / owner |
| --- | --- | --- |
| ADR-001 | Geography is the registration/query skeleton; opaque stable object IDs survive coordinate corrections. | User geography-first direction; technical identity design in [data model](DATA_MODEL.md). |
| ADR-002 | Institutions, sites and time-bounded occupancy are separate. | User warning about relocated schools; [Phase 1](PHASE_1.md), [data model](DATA_MODEL.md). |
| ADR-003 | Browsing has an active sparse period, with discoverable other-time entrances; route timeline is a separate function. | Explicit user interaction direction; [interaction](INTERACTION.md). |
| ADR-004 | Stylized registered ground plus selective 2.5D volumes; interior destinations may be images rather than full geometry. | Explicit user visual/depth direction; [assets](ASSET_PIPELINE.md). |
| ADR-005 | One session owns place/time/view/return stack; adapters do not create parallel state authorities. | Architecture design within authorized scope; [architecture](ARCHITECTURE.md). |
| ADR-006 | Original input, organized statements and display text remain separate; no added substantive autobiographical meaning. | Explicit user editorial constraint; [content](CONTENT_PIPELINE.md). |
| ADR-007 | Registration, wording, appearance, evidence and publication approvals are separate and revision-bound. | User batch-review workflow plus technical provenance design; [content](CONTENT_PIPELINE.md). |
| ADR-008 | Approved scenes use pinned asset revisions; generation is authoring, never an implicit browse-time update. | Stability requirement and architecture design; [assets](ASSET_PIPELINE.md). |
| ADR-009 | Public code repository and private memory archive are separate; publishing is an explicit additional effect. | Observed public repository plus privacy-preserving architecture; [content](CONTENT_PIPELINE.md). |
| ADR-010 | Phase 1 is the compact walking network, with 新华街 first; no high-school cycling extension. | Latest explicit user scope, superseding the earlier longer route proposal; [Phase 1](PHASE_1.md). |
| ADR-011 | Use a small task router and intent/evidence packet, not Crystal Garden's complete governance system. | User asks for selective borrowing; [attention](attention/README.md). |
| ADR-012 | Logical modules first; select concrete app/storage/generation technology in bounded implementation tasks. | Documentation-only activation and no existing runtime to preserve; [architecture](ARCHITECTURE.md). |

User-defined requirements above are established project constraints. Technical choices are the v1 architecture proposed by this deliverable, not claims of separate user aesthetic acceptance or implemented behavior. Already authorized ordinary implementation choices do not need a new product-alignment meeting for every file.

## First runtime decisions — DM-0002

- Native ES modules and Node built-ins keep the first runtime install-free. SVG/bitmap layers share one transform; no renderer or dependency is imported from Crystal Garden.
- The first canvas is an approximately 1.8 km square supported by contemporary OSM vectors, not a historical satellite slice. School registration remains unresolved.
- A/C are reproducible vector candidates; B uses one built-in imagegen style-transfer result from the same skeleton. B remains a registration/art candidate and does not become geographic evidence.
- Keep the few assets in `assets/maps/` with revision/checksum manifest; defer a separate image repository and private backend.

## Explicitly deferred

Exact historical school coordinates, entrances and walking segments; evidence-backed base-map acquisitions; exact life-stage date mapping; final illustration style, fonts and camera pitch; renderer/UI framework and versions; private storage/authentication/hosting provider; measured performance targets; later cycling/transit interaction; and any deployment or public-content release.

Deferral is not permission for an executor to invent values. It is also not a requirement to block unrelated work. A suitable activated packet can resolve the relevant choice and record evidence.

## Reference reviewed for Agent construction

Read-only reference snapshot: `StarObserverPro/crystal-garden` at commit `d60044a8bbe5682573bb518841baa3418d9d6efa`.

- [Agent entry](https://github.com/StarObserverPro/crystal-garden/blob/d60044a8bbe5682573bb518841baa3418d9d6efa/AGENTS.md): outcome/fact/authority separation, focused boot, identity, actual evidence and delivery boundaries.
- [Execution control guidance](https://github.com/StarObserverPro/crystal-garden/blob/d60044a8bbe5682573bb518841baa3418d9d6efa/docs/control/README.md): hot routing versus cold history, capsule ownership, sparse context selection and handoff.
- [Context policy](https://github.com/StarObserverPro/crystal-garden/blob/d60044a8bbe5682573bb518841baa3418d9d6efa/docs/control/context-policy.json): bounded local attention without a global execution cap.

Adopt the principles, not the full implementation. Do not import Crystal Garden's renderer, save keys, economy, deployment integration, gate manifests, artifact schedule, historical worklets, or gate-maintenance bureaucracy. It is not a dependency and was not modified for this task.

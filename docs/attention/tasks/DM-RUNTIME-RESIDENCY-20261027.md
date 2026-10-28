# DM-RUNTIME-RESIDENCY-20261027 — bounded map runtime and current documentation

## Intent and authority

- User request (2026-10-27): implement the discussed engine/resource-management improvements against current main and open a PR; record sandbox scope in the repository, read and align affected docs before CI/PR, and reconcile current documentation.
- Authorized effects: repository changes, validation, branch/PR publication. This mixed runtime/documentation task does not authorize merge or deployment.
- Repository: `StarObserverPro/DigitalMemory`; branch `agent/map-runtime-residency-r1`; exact base `928528b36596bbc4ac64b8d34638c1dae6f0f963`.
- Preserve registered geometry, accepted outline artwork/ink occlusion, route/session/period ownership and public-only source data.

## Scope and context

- Current consumer: `src/explorer/outline-stage.js` and `scenes/xinhua-sanli-outline/`, corridor layout/art r4.
- Runtime work: one cancellable frame owner; suspend/resume versus final disposal; one navigation instance; spatially selected resident rendering resources with bounded warm retention; ownership-safe cleanup and stale-result handling; measurable lifecycle diagnostics and regression checks.
- Documentation work: AGENTS/README routing, canonical current implementation and gaps, sandbox scope handoff, explicit docs → validation → PR sequence. Historical packets remain historical.
- Canonical owners: `docs/ARCHITECTURE.md`, `docs/RUNTIME.md`, `docs/VERIFICATION.md`, `docs/STATUS.md`, `docs/README.md`, `docs/attention/README.md`.
- No new locations, asset generation, visual redesign, private-content publication or production release.

## Acceptance

| ID | Required observable outcome | Consumer / fixture / view | Evidence or gap |
| --- | --- | --- | --- |
| R1 | Paused scenes schedule no frames; resume has one frame chain; dispose is idempotent | runtime scheduler, actual street/menu/map flow | Pending |
| R2 | Nearby render resources activate; remote resources stop updating and warm resources are evicted within explicit budgets | selected corridor and deterministic spatial tests | Pending |
| R3 | Returning to the same street restores its state without repeated full construction; stale loads cannot remount | main session and loader | Pending |
| R4 | Render resources shared across chunks remain valid until their owner releases them | lifecycle/disposal tests | Pending |
| R5 | Main street still walks, turns, pauses, returns, fits phone; accepted line occlusion and geography remain intact | real WebGL desktop/phone and same-view comparison | Pending |
| R6 | Main docs describe current consumer; sandbox scope and docs-before-CI requirements are discoverable and links resolve | canonical docs and PR checklist | Pending |

## Working envelope

- Keep source data/revisions unchanged; change runtime organization and caching around the existing builders.
- Use current native ES modules and pinned Three.js; no engine migration or runtime service dependency.
- Tests cover ownership, eviction, cancellation and actual consumer behavior; build checks retain existing hashes and publication boundaries.
- Preserve baseline screenshots outside Git; publish only concise evidence and the reviewable code/documentation diff.

## Current state — read last

- Lifecycle: executing; phase: authoring.
- Observed base: main `928528b`; new corridor is the active consumer, old graybox/student entry is retained historical code.
- Next action: implement runtime ownership/spatial residency, reconcile documentation, then validate and open PR.

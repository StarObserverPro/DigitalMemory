# DM-RUNTIME-RESIDENCY-20261027 — bounded map runtime and current documentation

## Intent and authority

- User request: implement the discussed engine/resource-management improvements against current main and open a PR; record sandbox scope in the repository, read and align affected docs before CI/PR, and reconcile current documentation.
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
| R1 | Paused scenes schedule no frames; resume has one frame chain; dispose is idempotent | runtime scheduler, actual street/menu/map flow | Frame-loop race tests passed; browser menu/map checks observed unchanged frame serial and no scheduled callback. |
| R2 | Nearby render resources activate; remote resources stop updating and warm resources are evicted within explicit budgets | selected corridor and deterministic spatial tests | Eight real pointer turns kept warm count ≤8 and estimated bytes within policy; 56 chunk evictions observed. Factory/re-entry/fence-buffer tests passed. |
| R3 | Returning to the same street restores its state without repeated full construction; stale loads cannot remount | main session and loader | Same host reused on quick return; real expiry removed it after 60.216 s; fresh entry restored pose. Delayed-request cancellation/retry passed without a late mount. |
| R4 | Render resources shared across chunks remain valid until their owner releases them | lifecycle/disposal tests | Private geometries/materials/textures released once; shared owners survived chunk eviction. Late font completion did not mutate a disposed sign. |
| R5 | Main street still walks, turns, pauses, returns, fits phone; accepted line occlusion and geography remain intact | real WebGL desktop/phone and same-view comparison | Built main walkthrough passed at 1280×800 / 390×844. Three settled fixed-view comparisons had 0 differing RGB pixels; 24 existing destinations remained reachable. Source geometry bytes unchanged. |
| R6 | Main docs describe current consumer; sandbox scope and docs-before-CI requirements are discoverable and links resolve | canonical docs and PR checklist | Current/legacy ownership reconciled; scope and docs-first sequence added. Documentation audit covered 62 Markdown files and 316 local links/anchors without failures; final closure rechecked before publication. |

## Working envelope

- Keep source data/revisions unchanged; change runtime organization and caching around the existing builders.
- Use current native ES modules and pinned Three.js; no engine migration or runtime service dependency.
- Tests cover ownership, eviction, cancellation and actual consumer behavior; build checks retain existing hashes and publication boundaries.
- Preserve baseline screenshots outside Git; publish only concise evidence and the reviewable code/documentation diff.

## Current state — read last

- Lifecycle: delivered for PR review. The active route is closed; this does not mean merged, deployed or newly approved artwork.
- Implementation/test source: `338d89995ea7f1c099d528516f1be85d3ad00bc6`, parent main `928528b36596bbc4ac64b8d34638c1dae6f0f963`. The following closure commit changes only this packet, routing and STATUS.
- Local validation: `npm run check` passed all 14 application test files, all 5 selected-scene test files and the public/checksum build. The built main browser flow passed walking, true menu pause, heading, map controls, retained re-entry, chunk eviction, phone fit and the real 60-second expiry/rebuild. The final delayed-request cancellation/retry scenario was also run against the same application code; the PR workflow runs the combined browser script.
- Navigation: 699,141 logical grid cells no longer force a startup scan. The sampled main entry cached 153 cells. All 24 destinations were reachable; maximum observed search was 12,585 nodes, below the 50,000 policy. Empty/disconnected large fixtures exhausted their explicit budgets safely; a 5 km straight route did not repeat quadratic prefix scans during smoothing.
- Visual evidence: shared Chromium CDP session, WebGL2 probe/readback, SwiftShader, DPR 1, reduced motion. The baseline was main `928528b`, selected source SHA-256 `79ddf20177ce72527aaa6efb148841acbaa58fa62d280ead4c58cf3839882637`; source/art/layout revisions remain unchanged. Screenshots and JSON are external evidence, not repository assets.

| Fixed desktop view | Baseline calls / geometries | Implementation calls / geometries | Comparison |
| --- | --- | --- | --- |
| Default entry `(-36,9)` | 824 / 825 | 203 / 205 | Same visible composition; initial camera height differed by about 0.005 m while settling. |
| Bridge underpass `(-443.28501868888,186.37389067025)`, yaw `2.82789752597` | 771 / 775 | 38 / 41 | 0 different RGB pixels; bridge-pier camera collision preserved. |
| Daoxiangcun forecourt `(-434,113)`, yaw `π` | 790 / 791 | 93 / 93 | 0 different RGB pixels. |
| Same forecourt toward sign, yaw `-0.99649149662` | 821 / 821 | 182 / 181 | 0 different RGB pixels, including the sign texture. |

The three settled comparisons used 1280×800, distance 23 and pitch 0.68; their final camera-coordinate differences were below `3×10⁻⁹ m`. No page/console/network/context-loss errors were observed in those comparisons. These counters and images establish reduced submitted work with the tested appearance, not hardware FPS, measured GPU memory or a loading-time benchmark.

- Documentation scope: current GLB/orthographic/parked-outline contradictions were corrected; historical task/source evidence, geographic uncertainty and documentation-only standing authorization retain their scope. Main entry, runtime, architecture, verification, workflow and PR template agree on the implemented lifecycle and remaining limits.
- Boundaries: full JSON and metadata remain resident; warm budgets exclude active/pinned/shared resources; 15-second chunk expiry is checked during updates, with the separate 60-second stage expiry while on the map. Searches remain synchronous but have work caps. Network data sharding, automatic LOD and hierarchical routing are future work, not active successors.
- Publication carrier: `agent/map-runtime-residency-r1` → `main`. The PR description/checks record its published head and actual GitHub CI outcome; no unrun CI result is claimed here. Main was rechecked before publication.
- Next action: review the implementation and actual-head PR checks. Merge/deployment requires authorization covering this mixed code/documentation change. Recovery is a revert of the PR; public scene data and registrations need no migration.

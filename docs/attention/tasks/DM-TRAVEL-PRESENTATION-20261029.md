# DM-TRAVEL-PRESENTATION-20261029 — a short passage between places

## Intent and authority

The user requests a comparison of lightweight memoir travel presentations, one working sample based on current main and existing art, desktop/phone/reduced-motion verification, and an independent review PR. Repository changes and PR delivery are authorized; merge and deployment are excluded.

- Repository: `StarObserverPro/DigitalMemory`.
- Exact base: `94cb3b3c1f299d9cd13e71adea40f550bc2f9c5c` (merged PR #35).
- Carrier: `agent/paper-plane-travel-20261029`; separate checkout, same bounded scope.
- Preserve registered landing, cancellation, keyboard walking, period/camera/session ownership, reduced motion and optional free walking. Keep ordinary map-to-street journal writing distinct.

## Scope and owners

Production targets are `src/explorer/travel-transition.js`, a small presentation helper if useful, travel CSS, browser regression checks and affected INTERACTION / ARCHITECTURE / ASSET_PIPELINE / RUNTIME / STATUS sections. Existing paper/ink palette and fonts supply the visual vocabulary. No new geographic/historical claims, scene geometry, journal copy, interiors, deployment or unrelated refactoring. Trial scripts/captures remain outside Git; selected production presentation code and concise comparison/evidence stay in the repository.

## Comparison and decision

| Option | Fit and motion | Tradeoff |
| --- | --- | --- |
| Paper plane with a loose ink trail | Familiar childhood object; folded paper bridges journal and outline street; a near-lens paper sweep hides the registered cut | Keep one brief arc, without a route animation or distant camera flight |
| Drifting feather | Quiet, light silhouette with soft depth cues | Needs slower motion to read; less connected to this project's paper vocabulary |
| Wind-lifted newspaper | Paper and memory fragments link naturally | Legible newspaper text risks invented historical detail and more visual noise |
| Turning scrapbook leaf | Reuses warm paper and clearly separates recollection fragments | Too close to ordinary journal entry; a large rotating page adds motion cost |

Selected for the sample: one outlined paper plane, a restrained fading pencil trail, a warm paper fold crossing the lens, then the plane receding as the destination appears. Use an approximately 1.5-second bounded passage, an opaque relocation seam, and a static short fade under reduced motion. This is a proposed aesthetic for review, not user approval.

## Acceptance

| ID | Observable outcome | Evidence |
| --- | --- | --- |
| PRESENT-A01 | Named and ground-click travel use the selected passage; ordinary journal entry remains distinct | Pending actual consumer replay |
| PRESENT-A02 | Fully opaque paper covers arrival; no route flight or camera/period preference changes | Pending seam and landing checks |
| PRESENT-A03 | Escape/touch/hidden/superseding cancellation cleans up; no late relocation before commit | Pending cancellation replay |
| PRESENT-A04 | Desktop, narrow phone, resize and reduced motion fit; keyboard/free walking and return persist | Pending browser + existing regressions |

## Working envelope

Use a bounded animation with no persistent loop, asset fetch or new renderer. Review full diff and canonical docs before checks and every PR push. Run applicable Node/build checks, actual rendered desktop/phone/reduced-motion/cancellation replay and published-head CI. Reserve one visual refinement after representative captures. Replan on missing real browser evidence; record the specific limitation instead of declaring visual acceptance.

## Current state

- Lifecycle: executing; implementation phase: authoring.
- Baseline and PR #35 confirmed; no open competing PR observed.
- Canonical documentation aligned and full diff reviewed before validation. Local syntax, 99 application tests, 17 scene tests, production build/pinned hashes, 89 affected-document file links and diff whitespace pass.
- The browser extension timed out; cloud browser cannot reach this checkout preview, and no local Chrome is installed. The added real built-app CI replay is required for rendered desktop/phone/reduced-motion evidence; local build is not visual acceptance.
- No merge, deployment or user aesthetic approval.
- Next action: inspect published-head WebGL CI and its representative captures, refine any observed issue, then close routing and deliver the independent PR.

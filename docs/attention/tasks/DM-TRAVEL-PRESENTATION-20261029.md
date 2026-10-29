# DM-TRAVEL-PRESENTATION-20261029 — a short passage between places

## Intent and authority

The user requests a comparison of lightweight memoir travel presentations, one working sample based on current main and existing art, desktop/phone/reduced-motion verification, and an independent review PR. Repository changes and PR delivery are authorized; merge and deployment are excluded.

- Repository: `StarObserverPro/DigitalMemory`.
- Initial exact base: `94cb3b3c1f299d9cd13e71adea40f550bc2f9c5c` (merged PR #35). Latest main `2cac134fdd2be0d1ab074662c14f723857faabb7` was incorporated after concurrent documentation-only PR #36; its school research is preserved.
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
| PRESENT-A01 | Named and ground-click travel use the selected passage; ordinary journal entry remains distinct | Real built-app menu/ground-click travel passes; existing journal/cloud entry replay also passes. |
| PRESENT-A02 | Fully opaque paper covers arrival; no route flight or camera/period preference changes | Covered frame has solid RGB(250,247,237), opacity 1 and no clipping; registered landing, empty path, camera and period retained. |
| PRESENT-A03 | Escape/touch/hidden/superseding cancellation cleans up; no late relocation before commit | Escape, touch, post-commit, visibility and delayed-load cancellation/retry pass; the existing superseding generation owner is unchanged, with no separate UI trigger exercised. |
| PRESENT-A04 | Desktop, narrow phone, resize and reduced motion fit; keyboard/free walking and return persist | 1280×800 DPR 1; 390×844 and rotated 844×390 DPR 2; 90/1/90 ms reduced fade; keyboard and existing persistence/return checks pass. |

## Working envelope

Use a bounded animation with no persistent loop, asset fetch or new renderer. Review full diff and canonical docs before checks and every PR push. Run applicable Node/build checks, actual rendered desktop/phone/reduced-motion/cancellation replay and published-head CI. Reserve one visual refinement after representative captures. Replan on missing real browser evidence; record the specific limitation instead of declaring visual acceptance.

## Current state

- Lifecycle: delivered; verification complete for the recorded runtime revision. Active routing is closed; the aesthetic remains a sample for user review.
- Baseline and PR #35 confirmed; concurrent documentation-only PR #36 incorporated without changing its research.
- Canonical documentation aligned and full diff reviewed before validation. Local syntax, 99 application tests, 17 scene tests, production build/pinned hashes, 91 affected-document file links and diff whitespace pass.
- Actual runtime verified at `e3d6b260f73dd323a76592e2ba1ec8db4f82ee8a`, tree `3502296978c6210d57b311d1d161eff50c3267eb`. Selected outline integration run `40931409002` and street/resource/journal/travel run `40931409135` both pass. The final closure changes only this packet/current routing; production code, assets and browser checks retain these verified bytes.
- Downloaded and visually inspected desktop approach/opaque cover/reveal/arrival and phone portrait/rotated/reduced frames from the real CI consumer. No application console/runtime/HTTP errors were recorded. WebGL2 ran on ANGLE/SwiftShader: this verifies the rendered flow and emulated phone layout, not physical-device performance.
- Review evidence: [travel captures and JSON](https://github.com/StarObserverPro/DigitalMemory/actions/runs/40931409135/artifacts/12922258399), including delayed first-load cover. Trial/capture binaries remain outside Git. Local browser extension/preview access was unavailable; CI is the real browser evidence.
- Independent [PR #37](https://github.com/StarObserverPro/DigitalMemory/pull/37) is open. No merge, deployment or user aesthetic approval.
- Next action, unactivated: user reviews the plane passage in PR #37. To run it, check out the carrier, run `npm run dev`, then choose a supported destination through “想去哪儿”. Ordinary “到街上走走” retains its separate journal. Rollback is a revert of this scoped presentation change; no data migration is needed.

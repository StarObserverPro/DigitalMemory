# DM-STREET-TRANSITION-20261028 — 手账街景转场

## Intent, scope and authority

2026-10-28 用户选择地图开窗方向，并明确要求：粗线条素描手以低帧率晃动，在右下画建筑方盒，移到左上写随机三至五版手账文字，整体淡出进入街景；选项提供简化开关，简化为俯瞰、云遮、落地。本任务实施两种正式入口转场及设置、恢复与取消行为，交付可运行实现和可审阅 PR。未授权合并或部署。

Repository: StarObserverPro/DigitalMemory. Exact base: `ed2cc85633e39e470c66e1b03669c53602fd8f43`. Carrier: `agent/street-entry-transition-20261028` in a dedicated worktree. Existing overview repair work remains separate.

Allowed paths: application presentation/session preference, the selected renderer's temporary entry camera seam, focused tests, canonical interaction/runtime/asset/verification/status documentation and this packet. No map repainting, geographic edits, permanent scene art changes, new dependencies or autobiographical content. The sketch is transient screen-space transition art, not a registered building. Trial captures and review scripts stay outside Git.

## Acceptance

| ID | Observable result |
| --- | --- |
| TR01 | Default entry draws a lower-right box then moves a Haring-style hand to upper-left handwriting, with stepped motion and one of five dated fictional street observations; the whole layer fades into the actual street. |
| TR02 | Menu options provide a persisted simple-transition switch; simple entry shows the registered scene from above, cloud cover and a descent to the saved valid street camera. |
| TR03 | Map camera/route and street pose remain session-owned; transition camera values are transient and never saved over the user's camera. Re-entry, reload and return retain the same valid context. |
| TR04 | Escape/menu cancellation, failed or superseded load and page hide remove the overlay and retain a usable origin. Navigation is blocked during transition; reduced motion skips drawing jitter and camera travel. |
| TR05 | Actual built entry on desktop and a narrow viewport is readable and bounded; no leaked overlays, duplicate loops or unexpected console errors after repeated entries. |

Owners: INTERACTION, ARCHITECTURE, RUNTIME, ASSET_PIPELINE, VERIFICATION and STATUS. Read these before implementation; align docs and review the full diff before tests/build/PR.

## Current state and next action

### Visual rejection and replacement — 2026-10-28

The user explicitly rejected the first procedural hand and all five initial phrases, then rejected a realistic sketch and clarified **Haring's hand**. That correction supersedes both earlier visual directions: use bold, rounded, continuous black contours and flat fill in the selected Haring-inspired language, with a readable pencil grip and sparse detail. Runtime checks establish behavior only. Built-in image generation supplies replacement raster animation frames; rejected images stay outside Git. The user clarified the text as dated street observations, for example seeing something on the road or a shop's freshly cooked food. Author five fictional decorative journal fragments in that form, without attaching them to named real shops or creating memory records. Preserve the lower-right box → upper-left writing → fade sequence and the simple-mode option. Merge/deployment remain unauthorized.

Superseded extended-arm preview: `journal-entry-haring-r1` uses a 1536×1024 three-pose RGBA sheet, individual pen-tip anchors and continuous off-screen forearm contours. All 71 distinct journal glyphs are included in the 25,084-byte renamed Long Cang subset, with the SIL OFL license. Selected delivery assets total approximately 1.05 MB; the two rejected generated images remain outside Git.

Earlier extended-arm evidence: 11 built-browser scenarios passed on Edge 156 / SwiftShader with no normal-flow console errors; desktop and phone captures include the Haring hand, dated handwriting and both transition modes. The final forearm seam correction was then viewed through the actual in-app browser at 1280×720 and approximately 645×540. The browser arrived in a controllable street and the final writing capture shows the date and cat/bicycle-basket observation with an aligned pencil tip. These are implementation observations; user aesthetic acceptance is still outstanding.

Next action: user review of the corrected short-wrist composition in the local preview and draft PR #30. Merge/deployment remain unauthorized.

- Lifecycle: delivered / wrist-fade visual review pending.
- Baseline entry loads the selected scene and switches views without a transition; existing generation tokens and AbortController own cancellation.
- No open PR was returned at task start. Base worktree is clean and isolated from ongoing overview repairs.
- Implementation and canonical-owner alignment are in place. Five focused application tests cover cancellation, frame ownership, variant selection and preference persistence; the built-browser script exercises both real entry modes, cancellation, loading failure, reload and narrow-screen rendering. The existing scene smoke now waits for the entry presentation to finish before walking. The existing browser CI job includes this new walkthrough and temporary review captures.
- Initial validation: 87 application tests and 16 scene tests passed. Build identified Windows checkout CRLF conversion in five unchanged `src/engine` files; their committed LF bytes match the pre-existing manifest. Their exact committed LF bytes were restored locally without changing the manifest or source behavior, and the build then passed.
- First built-browser pass: 10 real-entry checks passed on Edge 156 / SwiftShader, 1280×800 and 390×844 with an entry-time resize to 430×844. Normal-flow console errors: 0. Captures show the requested lower-right box, upper-left writing, real overhead camera and cloud cover. Reduced-motion full interaction took approximately 330 ms in this run. Slow/failed loads, cancellation during drawing/descent, reload preference, saved pose and return/retry passed.
- Final review adds redraw on a resize during the short journal fade and restores keyboard focus to the map menu on cancellation. Existing scene smoke accepts a library-external evidence directory. These local adjustments preserve the documented contract and are covered by the final local tests/build and the browser evidence below.
- Lifecycle review additionally covers cancelling after a fresh stage mounts but before reveal: dispatch the map state even if it is already displayed, so the new stage enters its bounded suspended slot. The browser test explicitly checks this first-entry case and restored keyboard focus.
- Runtime regression: the existing main WebGL smoke passed real walking, camera turn, menu pause, retained re-entry, chunk eviction, narrow-screen fit, actual 60-second expiry, rebuilt pose and cancelled-load retry. The final journal asset replacement retains those runtime ownership contracts.

- Final runtime/art revision: `887e0a53aee68a786eb1e921bf88ed8482ad5378`. After the final composed view, `npm run check` passed (87 application tests, 16 scene tests and static build). The packaging-only follow-up normalizes the font license to LF without trailing spaces and updates its checksum; transition asset/test changes now trigger the existing browser CI. No drawing or runtime behavior changed in that follow-up.

- Draft review: [PR #30](https://github.com/StarObserverPro/DigitalMemory/pull/30). While preparing delivery, main advanced to `f8d7345fe29890f0482828e8f49cf2af8e6aeffe` with the separately authorized R7 map recovery. This draft synchronizes that baseline and preserves both STATUS sections; its diff against current main remains limited to the transition. After the documentation/full-diff review, `npm run check` passed on the combined R7 map and transition; the existing real WebGL lifecycle smoke passed, and a sequential run of all 11 transition scenarios passed with zero normal-flow console errors (reduced-motion interaction: 378 ms). The actual in-app browser also reached the street and returned to the R7 map. An earlier concurrent run failed the overhead progress assertion after screenshot capture delayed sampling; the unchanged test passes when run sequentially, matching CI ordering. This timing sensitivity is retained in the evidence rather than treated as a product fix.

### User correction — short fading wrist

The user rejected the composited extended forearm and explicitly allowed fading it out or ending at a sleeve. Use the fading-wrist option: remove the procedural off-screen extension entirely, retain the selected Haring pencil grip, and fade the short source wrist before its cut edge. This is a presentation correction to the existing raster consumer; no new generation or map/scene/session change. Check the whole draw → move → write sequence at desktop and phone size, especially the map/box area beyond the wrist. Earlier behavioral passes do not constitute acceptance of the rejected arm.

Correction evidence: the runtime removes the long vector extension and caches three diagonally masked source poses. The pencil/grip remain opaque and the short wrist fades completely before the raster cut. Desktop 1280×800 and phone 390/430×844 captures show the restored map/box area; the built entry still completes draw → move → write → fade. Five focused transition tests, hash-verifying build and all 11 sequential built-browser checks pass, with zero normal-flow console errors (reduced-motion interaction: 364 ms). Tested `entry-transition.js` SHA-256: `94bb7891937da5972281f90c801b71b4ee3e24d2d98195607c1f3ce9db9d5df6`. Existing hand/font bytes and five text variants are unchanged. Published-head CI is recorded on PR #30; no user aesthetic acceptance, merge or deployment is asserted.

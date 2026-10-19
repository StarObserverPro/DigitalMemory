# Repository status

Status date: 2026-10-18 (America/New_York). This is an observed delivery ledger, not task activation.

## Current art specification — DM-0015

User verdict, 2026-10-19: specification accepted; proportions and scaling are usable; generated finish rejected for excessive meaningless noise and insufficient brushwork differentiation. Neither trial is a selected style reference.

Follow-up research read primary-source hand-drawn route-map, journal/watercolor, architectural graphite/observation and game-art/icon skills. The art contract now combines proportion checks, concrete contour/wash/hatching rules, subject CSS-pixel budgets and detail hierarchy across map tiers. Pen/light watercolor and graphite are proposed directions only; no new image was generated or style accepted by this research.

Delivery contains documentation and ignore rules only. Trial images, visual examples and dedicated demonstration scripts are excluded from the new branch and its history; future visual examples also stay out of Git. Runtime, manifests, registrations and hosting are unchanged. Existing R4 SVG art/fallback still requires a later consumer migration. See [DM-0015](attention/tasks/DM-0015.md) and [current art contract](HANDPAINTED_MAP_ART.md).

## Current overview correction — DM-0009

Soft paper-compatible roads replace the heavy black overview bars. Context continuations and Four Ring service roads use public source geometry. All feature anchors now share the road projection; the three Sanli symbols remain inside Sanli instead of being spread across Wuli. Thumbnail art retains aspect ratio. A local pen-like handwritten font and screen-pixel label placement keep names readable at all three tiers and on narrow screens; label budgets and collision checks suppress excess names.

Thirty-four automated tests pass. Native consumer SVG renders cover the submitted screenshot size, two closer tiers and a narrow phone view. These verify composition/label geometry, not browser gestures or WebGL. The Sites skill requires skipping managed browser QA without control-browser. Deployment provenance is recorded in the integration PR.

Limits: public contemporary geographic references are not historical proof; tower roof picks have stated uncertainty, and Nankai symbols are not individual-building registrations. Exact historic facade/entrance details and the tall underpass wall are still unresolved. Street artwork and the existing short walking slice are unchanged.

## Previous visible map review — DM-0008

PR5 and PR6 are merged. The consumer overview now uses the map assembly planner, three zoom stops, separate pale context / roads / solid places, no overview avatar and immediate entry on the modeled Xinhua street slice. New tower/slab candidates use broad pencil/watercolor marks designed for small display; the detailed architecture-render attempts are not active assets. Main, service and walking corridors plus schematic retaining walls are reserved independently. The street camera is moderately elevated; street figure and facade assets remain previous candidates rather than a completed new chibi scene.

Thirty automated tests and the static build pass. Native SVG renders at three tiers are recorded in `evidence/layered-view-results.json`; these are not browser screenshots. Managed browser QA is skipped because control-browser is unavailable, following the Sites skill. Final merge/deployment provenance is recorded by the integration PR and Sites saved version.

Limits: contextual geometry uses contemporary orientation; individual facade/entrance/site layouts and the tall wall profile are not historically verified. No private memories or durable authoring backend were added. This is a visual review release, not acceptance of all local geography or art.

## Previous architecture foundation — DM-0007

The latest target is captured in [MAP_ASSEMBLY](MAP_ASSEMBLY.md): three overview tiers without a character, pale replaceable background patches, solid roads and selected memory/landmark objects, separate compound/road assets, road-owned underpass walls and explicit vertical relationships. The previously deployed half-body street framing is superseded by elevated chibi framing as a target, not yet migrated.

Implemented: a pure map assembly planner and local insertion/revision command, explicit accepted-period resolver, independent road-band profiles, conservative road/feature reservations and context exclusions, loaded-asset filtering, deterministic label selection and a synthetic fixture. See DM-0007 for tested revision and review status.

Not implemented by this foundation: real Fengtai underpass registration, polygon/alpha compositing, production art, compound child rendering, overview/session/street wiring, durable memory writes or a new deployment. Amap/Baidu street-view verification of the tall wall remains unavailable in this attempt. The accepted general drawing direction is not approval of previous cutout defects or invented site layouts.

## Previous correction — DM-0005

The consumer surface exposes only a closed menu button. Developer inspectors, fixture language and permanent controls are removed. The map fills the viewport with contemporary-reference surrounding streets and apartment vignettes; this display context does not enlarge the editable registry or assert historical facades. The child is an upright cutout in a close half-body composition, with desktop/mobile camera distances and direct drag-to-walk controls.

Validation and final integration are recorded in the DM-0005 packet and its PR. Earlier evidence below documents superseded visual behavior.

## Previous correction — DM-0004

Independent roads, shells, shops, entrances and character layers replace the all-in-one map and long strip. The theatre drawing is moved off the road while its registered coordinate is retained. Local photo research informs apartment typology; exact historic facades and tenants remain unverified. Five original modules, 16 shell instances and 24 slots are pinned in the public manifest. The default pedestrian is an anonymous 1.4 m child, with a correspondingly lowered camera.

Seventeen domain tests and fourteen actual-browser checks pass. The temporary single-slot shop preview demonstrates replacement without road/shell/route changes. This is not a durable private authoring backend.

PR3 carries all PR2 changes plus this correction. The user explicitly authorized superseding PR2, merging PR3 and deployment. The final merge SHA and deployment outcome are recorded in the [PR3 integration section](https://github.com/StarObserverPro/DigitalMemory/pull/3). Tested implementation: `0c337176842b3f21d7121f366e46a5c36a2f18d1`; carrier `agent/layered-street-pr3`, base `c12bf01eea443687863d930a3f0ac99d057c45e0`. Active task routing is closed. The old delivery records below describe their historical state, not today's integration state.

## Previous correction — DM-0003

The user explicitly clarified a hand-drawn/cartoon/travel-journal overview with real-node mapping, then a close sidewalk scene built like cinematic scenery. This replaces the earlier aerial-board visual assumption.

Implemented: original illustrated map; 11 contemporary-reference shape/end nodes and 10 Xinhua Street edges mapped into an independent artboard; one shared route position; a 140 m close street of transparent facade flats, shallow returns, procedural pavement, a grounded pedestrian, follow camera, fog and directional signs; keyboard/pointer/hold-button movement; nearby synthetic gate; nested scene return; optional geographic/illustration comparison.

Verification: 13 domain tests and static build; 12 actual-browser journey checks on built files at 1440 × 1000 and 390 × 844; WebGL2 probe and actual app rendering with SwiftShader. Exact evidence binding is in [evidence](../evidence/README.md) and `evidence/street-browser-results.json`. Browser testing found and fixed Escape handling inside the search input; visual inspection corrected camera distance when turning near the facade so the character's feet remain visible.

Current gaps: art and registration still need user approval; no historically verified facades/entrances, real private memories, full network routing, skeletal walk cycle, private authentication/archive or durable write backend. One ordered street chain is implemented. The sprite sways while translating. Original A/B/C candidates remain cold provenance/reference, not active choices.

Delivery stays in PR #2 on `agent/phase1-map-foundation`; main is unchanged and no deployment is performed. Tested implementation: `845b05d327fadec71dca37415462a8d1398c075e`; closure changes delivery documentation and routing only.

## Earlier Phase 1 construction — DM-0002 (visual approach rejected)

Branch: `agent/phase1-map-foundation`. Tested implementation commit: `9487c95f0b208b966bd13eea69ff9a9e9ab43863`. The closure change updates delivery documentation/routing only. Integration and user art/registration review remain pending. Main is unchanged by this task; no deployment or hosting publication was performed.

### Implemented

- Install-free native ES-module static application with map-dominant desktop/mobile explorer.
- Stable place IDs, separately revised WGS84 geometry, one world/image transform, point-window/corridor queries and optimistic registration conflicts.
- Sparse temporal relationships, unmapped life stages, explicit unsupported environments, one session owner and nested scene return.
- Manifest-directed static public data adapter with lazy per-place content and scene reads. Public synthetic fixtures are opt-in.
- Three sparse map candidates covering the same approximately 1.8 km square: A paper SVG, B generated low-relief board PNG, C blue-ink SVG. Separate labels/hit layer; hashes/provenance pinned in the manifest.
- Four public orientation anchors. The two historical school-site identities stay searchable and unplaced.
- Bundled licensed CJK font subset for a legible current UI without runtime font downloads.

### Observed checks

- `npm test`: nine tests pass for spatial/time/session/repository/restore seams.
- `npm run build`: static bundle produced; asset checksums and public package envelopes verified.
- Real Chromium 151.0.7922.34 walkthrough at 1440×1000 and 390×844: nine user-flow observations, zero JavaScript exceptions and zero unexpected request failures. Deliberately aborted map-image requests verified an independently usable hit layer.
- Nested map → courtyard → room → courtyard → map restored the full origin session, including selected fragment, period and camera. Other-time selection retained place and camera. Unknown historical sites had no marker. Reload, Escape, mobile picker and reduced-motion preference were exercised.
- Screenshots inspected: all three desktop candidates, candidate picker, mobile map/panel/picker and synthetic scene states. See [evidence](../evidence/README.md) and [browser result](../evidence/browser-results.json).
- `git diff --check` passed. Original LICENSE retained unchanged.

The browser walkthrough found and fixed a native-fetch binding error. Rendering inspection found the test environment lacked Chinese fonts; the prototype now bundles an OFL-licensed subset. These fixes were included in the tested implementation commit.

### Remaining boundaries

No historical satellite/tile package was acquired. OSM is a contemporary orientation reference. B is an imagegen style candidate; its raster registration and all aesthetic choices remain subject to user review. No exact route, historical school entrance, private memory, verified historical scene, production private archive/authentication, durable content-write backend, capture/review UI or complete 2.5D renderer is delivered.

The public GitHub feature branch/PR contains public non-personal assets and synthetic fixtures. That repository write is distinct from deploying a viewer or releasing private memories. Static/local browsing persistence is not the durable author archive.

## Earlier architecture baseline

The documentation baseline was delivered in PR #1 and is present at base `00239079b4d9a3c61fa5d5d6e98b417f384815c3`. The original MIT license remains unchanged. The earlier [bootstrap packet](attention/tasks/DM-0001.md) is cold history; [DM-0002](attention/tasks/DM-0002.md) records this implementation scope.

## Next action

Review the illustrated-overview → scenic-flat-street sample and the real/art node correspondence. Keep future art expansion, historical registration and private archive work unactivated until directed. Technical verification is not user aesthetic or historical approval.

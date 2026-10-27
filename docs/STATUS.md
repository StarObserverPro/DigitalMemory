# Repository status

## Accepted Sanli outline integration — 2026-10-27, review branch

The user approved sanli-outline-r5 for intake and integration. The supported main overview→street entry now lazy-loads the selected full Sanli/junction close view, including continuous outline person, sparse motion, north-up collapsible minimap, compass, irregular rounded UI and local ZCOOL KuaiLe. Existing overview assets and retained schoolboy source/rig are unchanged. Session owns the local pose/camera/path; public registration/hash, spatial frame and explicit temporal membership select the working composite. Returning to map releases the renderer and input; re-entry and reload preserve a valid same-entry pose.

The accepted junction intake is carried into this branch from4d919e5 on current main1242dbd; unrelated dirty overview artwork remains in the original checkout. Reusable style, expansion/filtering/validation lessons and controlled intake process live in [outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md), with selected data/code/licences in [Sanli scene](../scenes/xinhua-sanli-outline/README.md). Geographic correction history, raw photos, private inputs and screenshots are excluded. Visual selection does not certify a historical year or all inferred surfaces.

Local validation:55 application tests plus12 selected-scene tests and build passed; actual built entry/walk/menu/return/reload observed at runtime commit748aabe. Source/font byte and documentation-link checks passed. CI status remains a separate GitHub result.

Verification/delivery record: [DM-SANLI-INTEGRATE-20261027](attention/tasks/DM-SANLI-INTEGRATE-20261027.md). PR branch only; main is not merged and nothing is deployed. Earlier street-renderer/character status entries below are historical where this consumer supersedes them.


## Integration checkpoint — 2026-10-26 (authoritative current main)

Older packets/branch descriptions below are historical. This checkpoint reconciles the user's latest decision with merged code.

- **Live student**: [PR #22](https://github.com/StarObserverPro/DigitalMemory/pull/22) merged a male skinned GLB on 2026-10-23 (red junior/blue high-school uniforms, KayKit idle/walk). Running `src/explorer/schoolboy.js` normalizes it to **1.4 presentation units** with `headBoneScale=0.48`. The user finds it a little stocky, and on 2026-10-26 explicitly chose to **use it as-is**: do not further adjust physical proportions, perceived size, height or head/body ratios now. The old **2× apparent-size** result in [STREET_VISUAL_CALIBRATION](STREET_VISUAL_CALIBRATION.md) was a synthetic placeholder comparison, not a live GLB multiplier or mandatory future task. Chromium WebGL smoke was completed; detailed gait/foot planting and final aesthetics are not approved. The donor geometry still lacks explicit independent licensing proof; see [avatar source notes](../assets/characters/schoolboy/README.md).
- **Marble 2 / World Labs**: [WORLDLABS_HANDOFF](WORLDLABS_HANDOFF.md) consolidates the proposed local Codex setup and camera/geometry constraints. **No World Labs generation, upload, export, installed runtime adapter or produced scene.** Local CLI/auth/account capabilities are not verified at this checkpoint.
- **桥南／桥北 history**: [FENGTAI_BRIDGES_ZHENGYANG](research/FENGTAI_BRIDGES_ZHENGYANG.md) holds public evidence, naming and chronology uncertainties only. No new bridge geometry registration, map drawing or private-memory material was added.
- **Product / map**: [PR #21](https://github.com/StarObserverPro/DigitalMemory/pull/21) merged the area → street/route → roadside attachment documentation contract, not a complete running dispatcher or authoring backend. The existing Xinhua R6 map and 161 selected masses were untouched.
- **Parked concept**: a future **Keith Haring-inspired** sparse box/line treatment with selective color on memorable elements, recorded in [HANDPAINTED_MAP_ART](HANDPAINTED_MAP_ART.md), is *not yet an accepted visual system or active assignment*.
- **Agent**: `docs/attention/current.json` still has `"active": []`. No generation, private-publication, new implementation, deployment or successor task is activated by this documentation integration.


## Male Y2K school-student rig — DM-0019 (merged; provisional appearance)

The Xinhua street runtime now has a 3D skinned male-student candidate with independently replaceable hair, jacket, trousers and shoes, plus KayKit `Idle_A` and `Walking_A` source clips. The previous ball/cylinder walker is removed from the **browser player's** mesh group when the stage initializes; isolated prototype tests still contain that geometry. Red/white junior and blue/white high-school kits use one shared mesh and a bind-space jersey/stripe shader, without copying the user's private photograph or a school logo. Street picking/route registration are unchanged.

Status: merged into main via [PR #22](https://github.com/StarObserverPro/DigitalMemory/pull/22) on 2026-10-23. **Chromium WebGL runtime smoke now passes**: CI [run 39486090781](https://github.com/StarObserverPro/DigitalMemory/actions/runs/39486090781) verified 50 Node tests, build, live red/blue menu switch, registered walking displacement (0.18 scene units), mobile fit and reload persistence with zero HTTP/page errors. Six temporary screenshots are in CI artifacts. Detailed planted-feet animation review, user aesthetics and the donor's independently documented geometry CC0 grant remain **open** after integration and need resolution before claiming the third-party geometry is fully cleared for ongoing redistribution. Evidence and source lineage: [DM-0019](attention/tasks/DM-0019.md), [asset README](../assets/characters/schoolboy/README.md). The older r3 street CPU screenshots do **not** validate this GLB model.

Original evidence date 2026-10-19; runtime integration and current provisional-use status rechecked 2026-10-26. Not a task activation.

## Route-first documentation integration — 2026-10-19

A documentation change package was prepared against main `2b2bd01b52934cd28be57e050a90b250b3455c6a`. It consolidates area → route → attachment navigation; note/sequence/local-scene targets; selective gate-centered depiction; editable brick/railing/detached-frontage segments; and repeated observations/versioned local states with uncertain dates. Existing owners are indexed by [the documentation map](README.md).

The initial offline preparation did not change the remote repository. An authorized GitHub documentation integration followed; its review and merge provenance is in [PR #21](https://github.com/StarObserverPro/DigitalMemory/pull/21) and the commit history. This is a documentation contract, not evidence that route attachment dispatch or memory authoring is implemented.

No runtime, public data, imagery, generated art, private memory record, character setting or World Labs request changed. The generalized contracts are not claimed as implemented. At the 2026-10-19 inspection, PR #18 (World Labs) and #19 (2× synthetic character study) were separate tracks; their content is now reconciled in the checkpoint above. See [the bounded packet](attention/tasks/DM-DOCS-ROUTE-FIRST-20261019.md) for the delivery boundary and unactivated next action.

## Registered Xinhua masses and zoom detail — DM-0018

R6 replaces the geographically rejected R5 compound layouts with 161 source-linked building/low-rise masses across the eleven Xinhua groups. The other chat's acquired Sanli data is included; a bounded corridor acquisition supplies 774 source polygons, with no native height fields. Floor estimates now have explicit evidence roles and ranges. The school uses its retrieved OSM boundary; Bali has two tall blocks; Wuli east retains the two curved perimeter runs; Sanli's front and rear tower families and differently oriented slabs follow the inspected source plan.

Original imagegen wax/pencil materials are composed onto those geographic masses. Three raster detail levels preserve position and height, suppress tiny low-rise clutter at far scale, add restrained window rhythm at medium and more facade detail near. The pipeline and limits are recorded in [Xinhua spatial pipeline](research/XINHUA_SPATIAL_PIPELINE.md). Integration/publication and final verification are recorded in [DM-0018](attention/tasks/DM-0018.md). R5 observations below are superseded for this corridor; they are not current geographic or aesthetic acceptance.

## Sanli licensed footprint benchmark — DM-0017

The source acquisition was merged through PR 15, and the later DM-0018 production spatial plan uses the related Overture geographic evidence. This is **data acquisition**, not commercial 3D reconstruction or individual-building address verification. The [source lineage](GEO_DATA_LINEAGE.md) and [repeatable QA runbook](GEO_DATA_RUNBOOK.md) explain the actual data chain, CLI invocation, source hashes, geodetic conversion, limitations and promotion gates.

The bounded 2026-10-19 Sanli snapshot contains 249 retained polygons, including 34 objects with more than 80% of their area within the registered estate (14 over 300 m²). The dataset contains zero source-provided building heights/storey counts and zero building-part features here. Four named OSM roads and four nearby (outside-Sanli) centreline-proximity flags are retained. These counts do not establish actual apartment-building identities, surveyed heights or historical conditions. The later R6 review separately selects 161 masses across 11 Xinhua groups and records inferred Z evidence; see DM-0018 above. The original acquisition had no independent deployment.

## Complete Xinhua overview corridor — DM-0016

The requested corridor now uses eleven selected compound/large-parcel raster paintings: nine residential units (Wuli east/west separate), heating plant and the background 丰台一中 campus. Sanli retains five tall blocks and five lower slabs; the east keeps earlier low fabric up to Zaojia Street. Three short southern shop groups are detached from residential buildings, including the retained frontage opposite Sanli. Building counts and minor footprints are a contextual reconstruction, not an exact historical inventory.

Sixteen production rasters replace the current overview's visible SVG buildings, vegetation, yard decoration and road/ground artwork. SVG supplies only invisible masks and ordinary labels. The overview's legacy vector rendering branch is removed, including missing-image/configuration fallback. One north-up cartographic-oblique projection, scalar frame registration and coherent compound calibration preserve tower proportions and road clearance. Sanli was rebuilt after the user rejected the count-based arrangement: three cream/red-cap towers across the southern row, two white/green flat-top towers at the northern corners, five differently oriented/length slabs and an open shared court. The three stable source feature IDs now link to detailed painted footprints; their obsolete rectangular glyph reservations are retired, with an executable polygon/road clearance check retained. Ground art and raised bodies render separately in depth order. Geographic place identity, walking route, street scene and personal-school anchors are unchanged.

Forty-six automated tests and the build pass. A refreshed map-font subset covers every new compound label. Native actual-consumer rendering is recorded in [DM-0016](attention/tasks/DM-0016.md). Native views cover three tiers, two closer subareas and a phone budget; these are not browser screenshots or a gesture walkthrough. Partial Wayback imagery has a queried 2011-02-01 capture date; it is not a complete old satellite base. Raw references, rejected generations, guides, examples and QA images are excluded from the outgoing Git history. Only selected product rasters and concise provenance are added. User aesthetic/historical approval and merge/deployment remain separate and pending.

## Art specification and prior verdict — DM-0015

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

## Historical suggested action (not active)

That old scenic-flat review predates the merged volumetric student. Refer to the 2026-10-26 checkpoint and the empty active-task index instead. Keep future art expansion, historical registration and private archive work unactivated until directed. Technical verification is not user aesthetic or historical approval.

Corridor integration revision xinhua-corridor-integrated-r1 extends the selected street consumer to western Qili/Fourth Ring frontage and eastern Xinhua. Daoxiangcun west frontage has map/panorama evidence. Integration validation and merge outcome are recorded in DM-XINHUA-CORRIDOR-20261027.

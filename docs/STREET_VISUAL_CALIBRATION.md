# Street visual calibration — selected scale and reference findings (DM-0021)

**State (2026-10-19):** User-selected **2× apparent character size** from local review 02, for the *next street-view character integration*. Documentation decision only; not a change to the current app, not a final character design, camera approval, or historical dimension. Main's street prototype remains the baseline described in [STREET_PROTOTYPE](STREET_PROTOTYPE.md).

## Intent and limits

The objective is a readable person/sidewalk/gate/building relationship, convincing grounded motion, and a modestly elevated street composition for the Xinhua walking-memory scene. The user is building the character **separately**; this document describes the **street integration target**, not its mesh authoring or rigging specification.

Richman 10/11 is an *observational reference* for legibility, body/environment proportion and buoyant but grounded movement. It is not a source of game mechanics, copied character geometry, a colorful rendering style, turn-based movement, property logic or HUD. The overview remains a separate illustrated map with **no avatar**; this trial concerns **street view only**. The Phase 1 walking network is unchanged, with no new historical cycling corridor.

## Evidence: why the broad-scale comparison supersedes review 01

- **Review 01 did not discriminate proportions.** Camera options A/B/C changed projection/pitch with fixed actor/world size, so they could not decide relative scale. The actor-height trials (1.25/1.40/1.55 presentation units) differed by only about ±11%, and the head-count control did not reconstruct different body silhouettes. The user explicitly found the compositions visually indistinguishable. Do **not** use those subtle variants as evidence of approved proportions.
- **Review 02 fixed the context.** One synthetic, non-historical street fixture, one 36° elevated orthographic view, fixed camera target and 8.8 presentation-unit vertical span, 640×640 output, fixed facing/pose, static buildings/gate/pavement and fixed 3.5-head placeholder. Only character **display size** was changed: 1×, 1.5×, 2× relative to the 1.4-unit synthetic reference.
- **User verdict:** choose **2×** when the separately authored character is brought into the street. **1× is too small.** 1.5× remains merely an intermediate comparison, not the selected target.

| Review 02 actor size | Fixture character height | Projected vertical reference at 640px | Fraction of this *square test* |
| --- | ---: | ---: | ---: |
| 1× — rejected as too small | 1.40 presentation units | 82.37 px | 12.87% |
| 1.5× — intermediate | 2.10 presentation units | 123.56 px | 19.31% |
| **2× — selected integration target** | **2.80 presentation units** | **164.75 px** | **25.74%** |

The height pixels above measure a vertical *reference line*, not a precise figure silhouette or a design target for all aspect ratios. The test units are **not metres** and **not source GIS coordinates**. The synthetic test gate is 2.35 units high, so making the actual character physically 2.80 units high without recalibrating the scene would be misleading. **Carry over the perceived prominence of 2×; do not assert that a historical human should be taller than a gate.** In the real registered street scene, inspect gate/door scale and achieve the comparable visual presence through a documented scene-local visual scale/framing decision. Do not quietly revert to 1×.

The screenshot and the independent HTML test fixture were reviewed in chat but are **not committed** here. The comparative result and user selection survive in text; local CPU screenshots are not production/browser evidence.

## Integration rules for the separate avatar

1. **One character asset, one visual adapter.** The character track owns mesh, rig, silhouette and selected appearance. The street renderer maps its visible stature to the chosen 2× comparison target; this is an integration transform, not a requirement to model a two-metre-plus child or duplicate asset geometry. Preserve a stable, grounded foot/pivot anchor.
2. **Never scale geographic identity or movement state along with the mesh.** The spatial registry remains authoritative for footprints and road positions; the application session owns route distance, lateral offset, facing, period and return state. Keep actor visual scale separate from route coordinates, sidewalk width, camera orbit, translation speed, click reach and entrance triggers.
3. **Retest feet, gates and occlusion.** Rescale the effective rig and contact points consistently, enforce planted feet during support, avoid root bobbing that detaches the character from the pavement, and verify gate approach, hidden/revealed actor and doorway pass-through. A body that reads well but has enormous hit boxes or clips entrances is not accepted.
4. **Retest camera only after the scale is visible in the actual scene.** 36° orthographic and a tight 8.8-unit square-fixture span are *test settings*, not the official desktop/mobile camera defaults. Compare at least desktop and narrow display in the same *registered* Xinhua segment; keep mobile framing independently legible. Preserve camera orbit independent of walking direction.
5. **Separate walking and cycling modes.** Reuse distance-driven gait for walking; tune starting/stopping, stride and turning/stance-foot lock under real input. A bicycle prototype may be tested locally for wheel/pedal coupling and seat/foot fit; it is **not** approval for a new area, an obligatory bike mode or a historical cycling route.
6. **No replacement of the scene with a purely decorative picture.** A generated or painted surface can cover registered shallow geometry, but cannot author roads, move buildings or own interaction state. A coherent finish will be chosen only after geometry, scale and movement have been judged in the consumer.

## Useful source-code references, narrowly applied

| Reference | Reusable learning | Intentionally excluded |
| --- | --- | --- |
| [Richman 11, publisher screenshots](https://store.steampowered.com/app/2074800/Richman_11/) and [Richman 10](https://store.steampowered.com/app/1162520/Richman10/) | Figure prominence, movement readability, roofs/walls/sidewalk in one oblique composition | Dice, board tiles, economy, original assets and cheerful material palette |
| [ProceduralBuildingsThreeJS](https://github.com/achrefelouafi/ProceduralBuildingsThreeJS), especially [Chinese apartment module](https://github.com/achrefelouafi/ProceduralBuildingsThreeJS/blob/main/src/cn/building.ts) | Parametric width/depth, storeys, bays, parapets, balconies, exterior AC/shops; modular facade grammar | Importing the full geometry-nodes evaluator, procedural random streets, or treating its corner tower as a verified Beijing slab |
| [threejs-city-simulation camera manager](https://github.com/AlanFnz/threejs-city-simulation/blob/main/src/cameraManager/index.ts) | Separate focus, azimuth, elevation, zoom and input cleanup | Simulation, tiled roads, economy and wholesale camera-system migration |
| Existing [GIS runbook](GEO_DATA_RUNBOOK.md) | OSM/Overture footprints, source provenance, independent height evidence and historical caution | Replacing reviewed Xinhua geometry with synthetic/generated footprints |

A possible supplemental height source, [GlobalBuildingAtlas](https://github.com/zhu-xlab/GlobalBuildingAtlas), is **unverified for the relevant Fengtai blocks** and is not selected or imported by this note. Test source permissions, CRS, coverage, separation and height plausibility on a few matched buildings before using it. Modern heights do not establish 1990s–2000s history.

World Labs/Marble work is owned by a separate agent handoff ([pending PR #18](https://github.com/StarObserverPro/DigitalMemory/pull/18)). Treat perspective/depth generation as environment/material exploration against a registered graybox; the avatar remains separate. Do not pretend an orthographic consumer camera is a Marble pinhole input, or treat generated images as historic geometry. No World Labs call, quota use, asset upload or generation is part of this change.

## Verification and next comparison

- **Known:** the 1×, 1.5× and 2× fixture images used fixed scene/camera/pose and changed actor scale only; the user selected 2× and rejected 1×. This is a **visual preference for a comparative test**, not acceptance of a new runtime build.
- **Still open:** import the independently authored character; confirm its actual footprint and gait in consumer WebGL; camera/pitch, full head-body ratio, surface treatment, turning, bicycle behavior, mobile framing and historical scene correctness; compare at least one registered block and real gate/door proportions. Review 01/02 used a CPU depth-buffer fallback, not a native GPU browser walkthrough.
- **Next task, not automatically activated:** plug the separate avatar into the existing street scene at the selected visual prominence, capture fixed-camera side-by-side desktop/mobile views and a movement/doorway interaction, and gather user review. Later stabilize repeatable visual principles only after a few observed revisions.

For the current implementation interfaces see [STREET_PROTOTYPE](STREET_PROTOTYPE.md), [INTERACTION](INTERACTION.md), [PHASE_1](PHASE_1.md) and [VERIFICATION](VERIFICATION.md). This research note deliberately does not add trial screenshots, GLB/EXR exports, original game resources, generated textures, or one-off scripts to production Git history.

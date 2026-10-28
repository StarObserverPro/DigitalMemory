# Selected street consumer and retained prototypes

## Current selected Xinhua close-view consumer — 2026-10-27

The main Xinhua entry uses the user-approved [Sanli outline scene](../scenes/xinhua-sanli-outline/README.md) and its corridor extension, with the continuous outline figure, sparse motion and navigation UI. `src/explorer/outline-stage.js` adapts it to the existing spatial/time/session owners. Its camera is perspective; the old orthographic values below do not configure this consumer. [RUNTIME](RUNTIME.md) owns current loading/lifecycle and [the outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md) owns selected style, source geometry and visual checks.

Earlier GLB schoolwear/graybox descriptions and evidence below remain historical or legacy-module records. The 3D schoolboy assets are retained, with their existing rights/appearance gaps; they do not run alongside the active outline figure.


> **Historical consumer, 2026-10-26 (superseded for Xinhua by the selected outline integration):** The street player now displays the merged skinned male-student GLB, with KayKit idle/walk and two selectable schoolwear palettes. Actual scale: `SCHOOLBOY_SCALE.height=1.4` and `headBoneScale=0.48`. User elects to keep the existing slightly stocky character unchanged. The older [2× synthetic comparison](STREET_VISUAL_CALIBRATION.md) does not control the current runtime. Chrome WebGL smoke passed earlier, but detailed foot planting, final aesthetics and donor rights remain unresolved.


## Historical DM-0010 reference and scope

For the earlier DM-0010 study, the user prioritized volume, readable scale and interaction before street artwork. The simplified models replaced the facade cutouts and paper person in that Xinhuajie sample. They are spatial prototypes, not a verified historical block or the later accepted outline style.

Inspected the actual screenshots from the publishers' Steam store pages on 2026-10-18:

- [Richman 10](https://store.steampowered.com/app/1162520/Richman10/), screenshot `ss_8fec5a0837b60393701b23e9bc2bd82f9c0ffbc5`.
- [Richman 11](https://store.steampowered.com/app/2074800/Richman_11/), screenshot `ss_6eabf7fda13d81be0b23dbd3514bd6658917b1aa`.

Observed: elevated oblique views, large-headed volumetric figures, plainly visible ground contacts, roofs and building sides, and a readable route within one composition. The following numerical choices are our prototype decisions, not measurements of either game. No screenshot, game character or third-party model is redistributed.

## Retained graybox / GLB presentation record

| Part | Legacy implementation / historical reference |
| --- | --- |
| Retained avatar | Modular skinned GLB fitted to 1.4 presentation units, donor head scale 0.48, red/blue uniform; ball/cylinder figure retained as a unit fixture |
| Retained walking | KayKit idle/walk blended by route displacement; procedural two-bone tests do not validate actual GLB foot contacts |
| Shops | Independent short volumes, 2.65 units high; frontage slots/occupants remain separate |
| Housing | 6.16 units for the current 17.6 m source proxies, roof and wall thickness, outside the sidewalk |
| Gate | 2.35 units high; open passage with independent leaves and posts; source synthetic portal retained |
| Ground | Uniform 0.48 presentation scale applied after geographic projection; source route metres unchanged |
| Camera | Fixed elevated orthographic view, 44° above ground, 15.2-unit desktop span / 14-unit narrow span; orbit independent of facing |
| Occlusion | A foreground building blocking the character becomes translucent; it does not move its registered root |

Within that legacy implementation, `street-layout.js` owns presentation calculations, `street-world.js` constructs its meshes and `stage.js` owns its renderer/input loop. `session.js` owns the recorded route, lateral position, facing, orbit and click destination. These retained modules are not the selected outline runtime's rendering owner.

## Historical graybox interaction

Click/tap the modeled sidewalk to walk to a bounded destination. Arrow keys/WASD move in camera-relative ground directions. A new directional input cancels the click destination. Drag horizontally to orbit without turning the body. Click the gate to approach first and enter after reaching it; Enter and the closed menu's gate action remain available only nearby. Opening a dialog, leaving the scene, blur or visibility change cancels walking. Portal return restores the route, sidewalk offset, facing and orbit. Map mode has no person.

No dice, compulsory board spaces, costs, hovering instructions, controls outside the menu, or named historical shop claims are added. The existing courtyard remains an explicitly imagined fixture.

## Legacy evidence and limits

- `tests/street.test.mjs`: route/target/bounds and camera tests; its procedural planted-feet and joint checks are **legacy fixtures**, not GLB foot-contact proof.
- `evidence/street-*-r3.webp` and `street-proportions-r3.json`: native CPU projections of the consumer's actual meshes and camera. They show arrival, gate, mid-step/orbit and narrow screen. They are **not WebGL screenshots**; browser lighting, shadows, label textures, input events, GPU draw count and device performance have not been observed.
- Reproduce geometry evidence: `node scripts/render-street-evidence.mjs`, then `python scripts/raster-street-evidence.py` (NumPy/Pillow). Intermediate triangles stay in ignored `local-evidence/`.
- Earlier Sites-controlled browser review was unavailable; the merged GLB later passed [Chromium WebGL smoke](https://github.com/StarObserverPro/DigitalMemory/actions/runs/39486090781). Detailed gait/foot acceptance and visual sign-off remain separate.
- Detailed GLB aesthetic approval remains open. A future use of those neutral volumes or illustrated surfaces requires its own selected consumer; it does not supersede the approved outline scene.

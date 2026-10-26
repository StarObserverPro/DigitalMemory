# Grounded street prototype — DM-0010

> **Running consumer, 2026-10-26:** The street player now displays the merged skinned male-student GLB, with KayKit idle/walk and two selectable schoolwear palettes. Actual scale: `SCHOOLBOY_SCALE.height=1.4` and `headBoneScale=0.48`. User elects to keep the existing slightly stocky character unchanged. The older [2× synthetic comparison](STREET_VISUAL_CALIBRATION.md) does not control the current runtime. Chrome WebGL smoke passed earlier, but detailed foot planting, final aesthetics and donor rights remain unresolved.


## Reference and scope

The user explicitly prioritizes volume, readable scale and interaction before street artwork. The current simplified models replace the old facade cutouts and paper person only in the existing Xinhuajie sample. They are spatial prototypes, not a verified historical block.

Inspected the actual screenshots from the publishers' Steam store pages on 2026-10-18:

- [Richman 10](https://store.steampowered.com/app/1162520/Richman10/), screenshot `ss_8fec5a0837b60393701b23e9bc2bd82f9c0ffbc5`.
- [Richman 11](https://store.steampowered.com/app/2074800/Richman_11/), screenshot `ss_6eabf7fda13d81be0b23dbd3514bd6658917b1aa`.

Observed: elevated oblique views, large-headed volumetric figures, plainly visible ground contacts, roofs and building sides, and a readable route within one composition. The following numerical choices are our prototype decisions, not measurements of either game. No screenshot, game character or third-party model is redistributed.

## Presentation contract

| Part | Current runtime / historical reference |
| --- | --- |
| Live avatar | Modular skinned GLB fitted to 1.4 presentation units, donor head scale 0.48, red/blue uniform; old ball/cylinder figure now only a unit fixture |
| Live walking | KayKit idle/walk blended by route displacement; old procedural two-bone test does not validate actual GLB foot contacts |
| Shops | Independent short volumes, 2.65 units high; frontage slots/occupants remain separate |
| Housing | 6.16 units for the current 17.6 m source proxies, roof and wall thickness, outside the sidewalk |
| Gate | 2.35 units high; open passage with independent leaves and posts; source synthetic portal retained |
| Ground | Uniform 0.48 presentation scale applied after geographic projection; source route metres unchanged |
| Camera | Fixed elevated orthographic view, 44° above ground, 15.2-unit desktop span / 14-unit narrow span; orbit independent of facing |
| Occlusion | A foreground building blocking the character becomes translucent; it does not move its registered root |

`street-layout.js` owns pure presentation calculations. `street-world.js` constructs the same meshes used by the consumer and native evidence. `stage.js` owns the sole renderer/input loop. `session.js` owns route, lateral position, facing, orbit and click destination. The spatial registry and time resolver are unchanged.

## Interaction

Click/tap the modeled sidewalk to walk to a bounded destination. Arrow keys/WASD move in camera-relative ground directions. A new directional input cancels the click destination. Drag horizontally to orbit without turning the body. Click the gate to approach first and enter after reaching it; Enter and the closed menu's gate action remain available only nearby. Opening a dialog, leaving the scene, blur or visibility change cancels walking. Portal return restores the route, sidewalk offset, facing and orbit. Map mode has no person.

No dice, compulsory board spaces, costs, hovering instructions, controls outside the menu, or named historical shop claims are added. The existing courtyard remains an explicitly imagined fixture.

## Evidence and limits

- `tests/street.test.mjs`: route/target/bounds and camera tests; its procedural planted-feet and joint checks are **legacy fixtures**, not GLB foot-contact proof.
- `evidence/street-*-r3.webp` and `street-proportions-r3.json`: native CPU projections of the consumer's actual meshes and camera. They show arrival, gate, mid-step/orbit and narrow screen. They are **not WebGL screenshots**; browser lighting, shadows, label textures, input events, GPU draw count and device performance have not been observed.
- Reproduce geometry evidence: `node scripts/render-street-evidence.mjs`, then `python scripts/raster-street-evidence.py` (NumPy/Pillow). Intermediate triangles stay in ignored `local-evidence/`.
- Earlier Sites-controlled browser review was unavailable; the merged GLB later passed [Chromium WebGL smoke](https://github.com/StarObserverPro/DigitalMemory/actions/runs/39486090781). Detailed gait/foot acceptance and visual sign-off remain separate.
- User aesthetic approval remains open. Current neutral volumes can later receive modular illustrated surfaces after the spatial relationship is accepted.

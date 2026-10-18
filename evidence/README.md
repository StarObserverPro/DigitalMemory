# Current evidence — DM-0003

Current consumer: built illustrated overview → close sidewalk scenic flats → synthetic courtyard/room → exact street return → same position in overview. The original planar A/B/C evidence is archived below and was rejected by the user as the main experience.

Source binding: tested implementation `845b05d327fadec71dca37415462a8d1398c075e`, exact tree `55bf1e6e695cc3a34f8f38d7fdc8591aeb8115d8`; build content SHA-256 and exact initial state are recorded in `street-browser-results.json`. Images were captured from that built application, not a standalone art viewer. No art/historical approval is inferred.

| Evidence | Observation |
| --- | --- |
| `journal-overview.png`, `journal-mobile.png` | Hand-drawn map, grounded marker, street entry and restrained controls |
| `node-correspondence.png` | One edge/progress shown in real geographic and independent art coordinates |
| `street-initial.png` | Person on pavement, close perspective, upright painted facades and distance fog |
| `street-door.png`, `street-turned.png` | Nearby gate action, turn with feet visible and camera kept streetward of flats |
| `street-mobile.png` | 390 × 844 scene with usable controls |
| `journal-returned.png` | Updated route progress retained after street/interior return |
| `street-browser-results.json`, `webgl-probe.png` | 12 actual journey checks, WebGL2 non-black probe, renderer diagnostics, no unexpected runtime/network errors |

`npm test`: 13 tests, including independent real/art layout changes, edge continuity, stage limits, shared session and exact nested portal restoration. `npm run build` checks asset hashes and public envelopes.

One headless Chromium 151 session was attached over CDP 9333 with ANGLE/SwiftShader. The WebGL skill's plugin doctor/ab.sh files are not installed in this environment, so the repo harness performs an equivalent pixel, navigation and screenshot gate in that same CDP session. No Spector capture was necessary: the observed defects were camera composition and DOM Escape handling, not a shader/state failure. SwiftShader is rendering evidence, not hardware performance evidence.

The near view uses static illustrated flats and a static anonymous-person cutout with small motion sway. Repeated facades, a 140 m extent and no verified historical doors are explicit prototype limitations. Two historical campuses are still searchable but unplaced. Deliberately failed facade loading preserves a usable overview and location. Reduced-motion and reload were exercised.

## Archived DM-0002

`browser-results.json`, desktop-paper/board/ink, old style picker/mobile board and synthetic interior screenshots belong to implementation `9487c95f0b208b966bd13eea69ff9a9e9ab43863`. Their runtime checks passed, but the user rejected the primary map/interaction direction. They are not acceptance evidence for the current visual design.

# DM-0004 — layered scene evidence

The current screenshots come from the built static application, not an image mockup. Tested implementation: `0c337176842b3f21d7121f366e46a5c36a2f18d1`; tree `1a39e03e26ff3e5bab0d68e517b8ebc04a0f83ca`, identical to the local verified tree. Built-file SHA-256: `73d5df63607a77932ff31738d5f4415720f0ea3ebb82dd38a177987b8c3b25f2`. The delivery closure changes documentation/routing only. `street-browser-results.json` records initial session, camera/renderer state and all fourteen journey checks. The final merged revision and deployment result are recorded in [PR3](https://github.com/StarObserverPro/DigitalMemory/pull/3).

- `journal-overview.png` / `journal-mobile.png`: independent paper, registered road layer, off-road building groups, labels and child.
- `roads-only.png`: building layer disabled without changing geographic registration.
- `map-frontage-preview.png`: one synthetic occupant attached to a stable slot/group.
- `street-initial.png`, `street-door.png`, `street-turned.png`, `street-mobile.png`: 1.4 m child, lowered follow camera, short apartment/service/entry modules, perspective and fog.
- `street-frontage-preview.png` / `street-frontage-replaced.png`: same camera and buildings; only one shop sign changes from stationery to repair.
- `node-correspondence.png`: geographic and illustration positions share identity.
- `webgl-probe.png`: WebGL2 non-black pixel gate in the same Chromium CDP session.

Seventeen domain tests cover the existing location/time/session seams plus building-road clearance, slot bounds, entrance attachment and exact-period occupant resolution. Fourteen browser journey checks cover desktop 1440×1000 and mobile 390×844, route-preserving street entry, movement/turning, nested return, unknown schools, layer changes, one-slot replacement, reload and failed texture recovery. No unexpected console exceptions, request failures or HTTP errors were observed.

This uses the repository's existing single-Chromium CDP harness with ANGLE/SwiftShader. The skill's standalone doctor/ab helper is absent here; the repository harness implements the non-black WebGL2 probe, navigation, screenshots and shared-CDP checks. SwiftShader is rendering evidence, not real-device performance evidence. No Spector escalation was needed for the geometry/composition changes.

Prior rejected monolithic artwork and long-strip screenshots are preserved in Git history at `c12bf01eea443687863d930a3f0ac99d057c45e0`. Current files supersede those screenshots. This is implementation evidence, not approval of historical likeness or final art style.

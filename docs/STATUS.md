# Repository status

Status date: 2026-10-17 (America/New_York). This is an observed delivery ledger, not task activation.

## Phase 1 construction — DM-0002

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

User selects or revises the map style. Historical street/campus registration and the private archive provider can then be addressed in separately authorized bounded work. No successor task or recurring automation is activated.

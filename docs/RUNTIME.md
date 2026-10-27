# Phase 1 runtime foundation

> Historical DM-0004 baseline: 16 shell modules, 24 frontage/door slots and a 1.4-unit character profile. Its inspection/shop controls and lower follow-camera description are not the current consumer contract. Later street behavior belongs in [STREET_PROTOTYPE](STREET_PROTOTYPE.md); overview/source deliveries and release evidence belong in [STATUS](STATUS.md).

The application uses native ES modules, original illustrated PNGs and a small static public repository adapter. The close street view lazy-loads a locally pinned Three.js runtime (0.180.0); no package installation or CDN request is required to run it. It implements the basic contracts without choosing a private archive, authentication service or hosting provider.

## Accepted Xinhua/Sanli close-view integration — 2026-10-27

The normal supported overview→street entry now lazy-loads scenes/xinhua-sanli-outline via outline-stage.js instead of the legacy stage.js. It keeps the approved continuous outline walker, sparse motion, muted green ground, irregular menu/minimap/compass outlines and locally served ZCOOL KuaiLe. Existing schoolwear code/assets remain; its old browser smoke is not evidence for this new consumer.

Application session owns outline pose/path/camera; reload opens a usable map then restores the valid pose on street entry, while a changed overview route gets its own entry. Returning to map cancels targets and disposes renderer/input; the overview still has no person. The public registration fixes data/art revisions and explicit working-composite periods. Final layout estimates remain in data; no historical year or new private content was certified. npm run test:outline checks the selected library; npm test includes session/registration/loading tests; npm run build includes selected scenes and verifies hashes.

## Run and check

Requires Node.js 22 or later. No dependency installation is needed for these commands:

```sh
npm run dev
npm test
npm run build
```

Open `http://localhost:4173`. `npm run build` verifies map checksums and public package envelopes, then produces `dist/`. `node scripts/serve.mjs --dist` serves the built files. Relative asset URLs support hosting under a repository subpath as well as a domain root.

Optional browser checks use Playwright installed separately. Run `node scripts/browser-check.mjs`; set `CHROMIUM_EXECUTABLE` if using an existing Chromium binary. `CODEX_PRIMARY_RUNTIME_NODE_MODULES` is supported as a dependency lookup fallback. These checks start their own static server, exercise real UI controls in one Chromium shared over CDP 9333, and save screenshots/results under `evidence/`. The gate verifies a WebGL2 non-black pixel and actual app frames. SwiftShader execution does not establish hardware-device performance.

## Implemented ownership

| Concern | Owner | Current behavior |
| --- | --- | --- |
| Place identity and registration | `src/domain/spatial.js` | Stable IDs; separate versioned WGS84 geometry; shared local metric and pixel transform; optimistic revision conflict; point-window and metric corridor queries |
| Sparse time | `src/domain/temporal.js` | Five temporal relations; separate life stages and date windows; explicit unsupported environment; no nearest-year fallback |
| Session and portals | `src/application/session.js` | One place/period/camera/selection/scene owner; nested return snapshots; rejected stale loads |
| Data connection | `src/adapters/public-repository.js` | Manifest-directed public records; place-filtered lazy chunks; paginated memory results; lazy scene loading; errors preserve origin |
| Browsing persistence | `src/adapters/session-storage.js` | Best-effort local session preferences only; validation and usable map origin on restore |
| Overview and street | `src/explorer/` | Hand-drawn overview; enter a sidewalk scene of upright scenic flats, minimal ground and fog; near-door interaction and exact return; the former consumer mapping inspector is removed |
| Illustration mapping | `src/domain/illustration.js` | Real-node / drawing-node correspondence, stable route edge/progress, metre-based street movement; one ordered Xinhua chain |
| Resources and references | `content/public/manifest.json`, `assets/maps/` | Revision/checksum-pinned candidates and explicit provenance; exact transform for vector candidates; B raster alignment still reviewable |

The raster is not an identity store. The initial A/B/C boards were rejected as the primary visual experience; their assets remain as provenance/reference, not active choices. The new journal image and geographic map have independently authored coordinates linked by stable IDs. School names are not geocoders: old campus identities remain registered with `geometry: null` until the specific sites are researched. Correcting a place geometry never changes its ID or rewrites linked memory records.

## Current frame and uncertainty

The square is approximately 1.8 km across, covering 新华街, the adjacent southwest/west Fourth Ring section, 丰台大桥 and 丰台影剧院. 南开西里 remains a general neighborhood anchor. This is the visual canvas, not a newly asserted walked itinerary. Roads/rails come from a selected contemporary OSM extract; historical registration remains open. No private home position is recorded.

The original prototype filtered synthetic memory relationships and could return `no_supported_state`. Later Xinhua artwork has explicitly selected approximate working-composite membership, recorded in STATUS and the source plan; it still does not prove the entire orientation board existed in every chosen period. Do not place historical development notices over the ordinary scene.

## New route-first contract: implementation gap register

The shared location/session, ordered Xinhua chain, prototype near-gate journey and separate composition/time owners are foundations. This documentation task did not modify or execute them.

The following are **not claimed as implemented here**: general `RouteSceneRegistration`/`RouteAttachment` migration; a note/sequence/local-scene discriminated dispatcher; private notes attached to arbitrary objects; a durable static-sequence authoring/viewing flow; mixed boundary/frontage interval editing; multi-entrance route remapping; or observation/state-transition authoring across unknown dates.

A future implementation must demonstrate overview route-only entry, correct-side approach, all three target types and exact return; localized wall/railing/detached-frontage edits; and same-site temporal revisions without nearest-year fallback. The proposed fields in DATA_MODEL must not be mistaken for the current JSON schema.

The current contract forbids reintroducing former mapping inspectors, trial-shop controls or permanent debug labels. Parallel character-calibration and World Labs handoff changes remain separate; this package changes no runtime parameters, authentication, generation request or deployment.

## Storage seam

The application currently reads static publication-cleared JSON. Replace the repository adapter behind the same `init/places/memories/loadScene` interface when a private archive is selected. Private record access must be enforced by an authenticated server and a scope-specific manifest. The browser never receives a private archive in this prototype; no login or remote write capability is claimed.

Registration revisions and the full session are pure application modules, not editable authoring UI or a production database. Local storage is only a disposable browsing convenience. Real recordings, draft capture, source-span editing, review workflows and durable backup/export are future work.

## GitHub images: concrete arrangement

For these few shared map assets, use this repository's `assets/maps/` directory. The manifest stores each exact URL, revision, SHA-256, dimensions, geometry/transform dependency and provenance. Runtime uses relative paths, so the same package works locally and when hosted. GitHub's image viewer is useful for review, but a GitHub `blob/...` page is an HTML page, not the URL to use as an image `src`.

If assets later warrant a separate public repository, preserve the same manifest contract and use either:

1. An immutable raw URL pinned to the asset commit, such as `https://raw.githubusercontent.com/OWNER/ASSET_REPO/COMMIT/maps/file.png`, for a small prototype; or
2. A hosted asset/release/object-store URL for larger traffic and image collections, with immutable revision names and hashes.

There is no need to create another repository for three candidates. Moving storage changes resource URLs, not place IDs, map registration, memory associations or hit testing. Keep bulk originals/private sources outside public Git. Large changing raster collections eventually belong in object storage rather than growing the code checkout indefinitely.

Official reference: [GitHub image rendering and visual diffs](https://docs.github.com/en/repositories/working-with-files/using-files/working-with-non-code-files).

## Current dual-scale sample

The three-tier overview remains unchanged in DM-0010. Street entry now uses a grounded volumetric child, neutral building volumes and an elevated camera. Click the sidewalk to walk, drag to orbit, or use arrow keys/WASD. Click the gate to approach and enter the existing imagined courtyard; return restores the same street state. All permanent controls remain in the closed menu.

The sample remains the same 140 m reference centerline. It does not establish exact historical sidewalk widths, facades or a real gate. Details and native-vs-browser evidence limits are in [STREET_PROTOTYPE](STREET_PROTOTYPE.md). Additional overview candidates are stored separately in `assets/candidates/overview-r1/`; they are not automatically placed on the map.

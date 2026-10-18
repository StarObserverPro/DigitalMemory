# Phase 1 runtime foundation

The application uses native ES modules, original illustrated PNGs and a small static public repository adapter. The close street view lazy-loads a locally pinned Three.js runtime (0.180.0); no package installation or CDN request is required to run it. It implements the basic contracts without choosing a private archive, authentication service or hosting provider.

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
| Overview and street | `src/explorer/` | Hand-drawn overview; enter a sidewalk scene of upright scenic flats, minimal ground and fog; near-door interaction, exact return and opt-in mapping inspector |
| Illustration mapping | `src/domain/illustration.js` | Real-node / drawing-node correspondence, stable route edge/progress, metre-based street movement; one ordered Xinhua chain |
| Resources and references | `content/public/manifest.json`, `assets/maps/` | Revision/checksum-pinned candidates and explicit provenance; exact transform for vector candidates; B raster alignment still reviewable |

The raster is not an identity store. The initial A/B/C boards were rejected as the primary visual experience; their assets remain as provenance/reference, not active choices. The new journal image and geographic map have independently authored coordinates linked by stable IDs. School names are not geocoders: old campus identities remain registered with `geometry: null` until the specific sites are researched. Correcting a place geometry never changes its ID or rewrites linked memory records.

## Current frame and uncertainty

The square is approximately 1.8 km across, covering 新华街, the adjacent southwest/west Fourth Ring section, 丰台大桥 and 丰台影剧院. 南开西里 remains a general neighborhood anchor. This is the visual canvas, not a newly asserted walked itinerary. Roads/rails come from a selected contemporary OSM extract; historical registration remains open. No private home position is recorded.

A date/life-stage selection currently filters synthetic memory relationships. It does not imply the orientation board existed in that form during the selected period. No historical `EnvironmentState` is supplied, so the resolver returns `no_supported_state`. The explorer labels this limitation at viewing time.

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

Use “走进新华街” on the illustrated overview. The close scene puts a person on the sidewalk; arrows/WASD or on-screen hold buttons walk and turn, and dragging turns the view. Approach the labeled courtyard gate to enter the synthetic courtyard/room fixture. “回到手绘图” preserves the updated geographic/art route location. The mapping inspector compares both locations explicitly.

The street sample spans 140 m of the contemporary reference centreline. Its facade strip repeats as economical theatrical scenery. The character is a static cutout with light motion sway; articulated walk-cycle animation is not implemented. No period-specific real facade package, measured sidewalk geometry, verified historical gate or production private archive is implied. See [mapping contract](ILLUSTRATION_MAPPING.md).

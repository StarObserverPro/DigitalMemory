# Current runtime and resource ownership

> Historical DM-0004 baseline: 16 shell modules, 24 frontage/door slots and a 1.4-unit character profile. Its inspection/shop controls and lower follow-camera description are not the current consumer contract. Later street behavior belongs in [STREET_PROTOTYPE](STREET_PROTOTYPE.md); overview/source deliveries and release evidence belong in [STATUS](STATUS.md).

The application uses native ES modules, original illustrated PNGs and a small static public repository adapter. The selected close street view lazy-loads a locally pinned Three.js runtime (0.180.0); no package installation or CDN request is required to run it. It implements the basic contracts without choosing a private archive, authentication service or hosting provider. [STATUS](STATUS.md) separates accepted main behavior from the current branch's implementation and validation evidence.

## Selected overview recovery — 2026-10-28

The actual homepage uses `overview-registration-travel-r7` and the manifest's selected `xinhua-travel-r7` rasters through the existing `layeredOverviewMarkup` consumer. Its 195 registered objects include the recovered block and four Qili frontage masses from the selected street frame. Source geometry and full inner rings are retained; exterior rings drive existing road clearance and image registration. The sparse travel-map appearance shares files across identical level keys and adds no character or direct attachment shortcut. Daoxiangcun's west-frontage orientation label is limited to the near tier. Public observation metadata is in `content/reference/xinhua-recovery-evidence.json`; raw images and comparison pages are not runtime inputs. This change does not replace the selected street/session/resource lifecycle below. [Repair verification](attention/tasks/DM-MAP-REPAIR-20261028.md) records actual homepage and return-flow evidence separately from source checks.

The recovered chimney landmark retains its own registration and explicit `window-2000` working-composite membership. Engine JavaScript and scene text sources use LF checkout endings through `.gitattributes`, matching the exact bytes pinned by the selected scene manifest; checksum checks remain strict and are not regenerated to accept Windows newline conversion.

## Accepted Xinhua/Sanli close-view integration — 2026-10-27

The normal supported overview→street entry now lazy-loads scenes/xinhua-sanli-outline via outline-stage.js instead of the legacy stage.js. It keeps the approved continuous outline walker, sparse motion, muted green ground, irregular menu/minimap/compass outlines and locally served ZCOOL KuaiLe. Existing schoolwear code/assets remain; its old browser smoke is not evidence for this new consumer.

Application session owns outline pose/path/camera; reload opens a usable map then restores the valid pose on street entry, while a changed overview route gets its own entry. Returning to map cancels targets and suspends the selected stage under the retention policy below; the overview still has no person. The public registration fixes data/art revisions and explicit working-composite periods. Final layout estimates remain in data; no historical year or new private content was certified. `npm run test:outline` checks the selected library; `npm test` includes session/registration/loading tests; `npm run build` includes selected scenes and verifies hashes.

## Entry presentation — DM-STREET-TRANSITION-20261028

The existing `enterStreet()` owner starts a cancellable journal overlay while the selected scene loads. It waits for the selected hand sprite, the local journal-font glyphs and the drawing prelude before revealing the scene. `entry-transition.js` owns one bounded canvas and one abortable frame chain, with continuous time-based redraws. A small deterministic irregular pose transform affects only the block and the hand; the hand pivots around its registered pen tip. Drawing and travel never share the pose-sampling cadence. The page-relative block uses pre-sampled rounded curves for both growing strokes and pencil contact, plus one flat paper fill. Its position derives from the fixed writing anchor and page margins, while the paper is one unframed wash. Three source frames use separately registered pen tips and a cached alpha mask that fades the short source wrist before its cut edge. The user rejected the earlier long procedural arm; that extension is removed. The sequence separates 650 ms arrival, 3200 ms drawing (including two 240 ms lifts), 650 ms pause, 1050 ms travel, 210 ms per glyph with 650 ms line changes, 600 ms withdrawal, 2100 ms reading and a 900 ms reveal. Writing time follows the chosen dated fragment's length; slow scene loading holds the final drawing without a spinning wait animation. Its modal blocks background pointer and keyboard interaction. Escape, cancellation, page hiding and superseding entry clean up the overlay and restore a usable map origin, including a freshly mounted stage cancelled before reveal; failed loads follow the existing map retry path.

The alternative `simple` mode renders a temporary 88-metre overhead camera, cloud cover and a descent to the valid final street camera. The selected renderer's `setEntryView()` bypasses navigation while allowing its existing frame loop to render; it hides street navigation UI until landing. The temporary camera is not included in session writes. The local session adapter persists only `entryTransition` (`journal` by default, `simple` when enabled). Reduced motion uses a 180 ms fade. Final reveal/cancellation clears the override, modal, observer and frame callback before restoring normal control. The selected scene manifest pins the changed runtime/style bytes without changing geographic or art revisions.

Exact tested revisions and visual acceptance remain in [the transition packet](attention/tasks/DM-STREET-TRANSITION-20261028.md).

## Bounded runtime resources — DM-RUNTIME-RESIDENCY-20261027

These are the implementation contracts of the current resource-management change. Its exact verification and PR state belong in the [task packet](attention/tasks/DM-RUNTIME-RESIDENCY-20261027.md) and [STATUS](STATUS.md); the description alone is not a measured performance result.

### Stage lifetime and frame scheduling

`src/explorer/outline-stage.js` owns one retained stage slot. Returning to the overview stops input and animation immediately and starts a **60-second** expiry. Re-entering the same compatible registration, source path, repository epoch, route and resolved environment before expiry reuses that stage and its navigation instance. Repeated overview refreshes do not extend its deadline. An incompatible entry, expiry or final page exit disposes the old stage; a later entry builds a fresh one. A browser back/forward-cache page suspension can retain the stage under the same policy. A retained stage is a reuse optimization, never the authoritative position store.

`src/engine/frame-loop.js` owns a cancellable animation-frame chain. Menu opening, hidden/inactive page state and stage suspension cancel scheduling; resume starts one chain with a fresh time origin. Cancellation generations prevent an already queued callback from clearing or duplicating a newer chain. The active street still animates the accepted character and sparse environment: this change does not introduce idle-only rendering or a new visual frame-rate policy.

The stage adapter creates navigation once and passes it into the renderer. Final disposal cancels the loop, aborts listeners, disconnects the resize observer, releases UI/drawing resources, disposes the renderer and releases its WebGL context. The adapter disposes its navigation instance; the standalone scene owns and disposes navigation only when it created it. Cleanup is idempotent. A suspended stage keeps its resources and guarded listeners until reuse or disposal, while those listeners cannot move the inactive scene.

### Spatial drawing residency

`scenes/xinhua-sanli-outline/spatial-drawing.mjs` registers lightweight bounds and build functions before the first frame. Ordinary objects share **64-metre** cells; a long road or pavement span has its own owner so it does not enlarge an unrelated building cell. Three.js objects are created when a chunk becomes active or is needed for a camera collision query. A spatial index narrows candidate bounds, followed by the actual camera frustum and object bounds.

The camera's original **380-metre far plane** is preserved. Filled surfaces use the existing fog, but the accepted ink materials do not; using the fog endpoint as a visibility cutoff would erase distant contours. Chunk selection therefore uses the full camera frustum, with conservative bounds for thick screen-space strokes. This change does not alter line widths, geographic geometry or visual LOD.

`src/engine/chunk-residency.js` distinguishes visible active chunks, temporarily pinned collision dependencies and inactive warm chunks. Warm chunks leave the scene graph and stop contributing to drawing updates. During active updates, **15 seconds** of inactivity or least-recently-used eviction enforces the warm policy of **8 chunks / an estimated 16 MiB**. The age check runs on updates, not a separate wall-clock timer: a paused stage can retain warm chunks until it resumes or its 60-second stage expiry disposes the whole scene. These caps apply to the warm cache only: the current frustum's active set and collision pins can exceed them. The registered object metadata, full scene data, base ground and shared resources also remain outside that warm budget. This is spatial GPU-resource residency, not a fixed total-memory ceiling.

Camera selection and static camera-dependent work reuse their previous result when the camera is unchanged. Visible collections drive silhouette, small-object occlusion, facade and environment-detail work; navigation and camera collision use spatial candidates instead of scanning all rendered meshes. Visible animated elements continue their existing updates.

### Resource owners and estimates

`src/engine/resource-scope.js` deduplicates each owner's geometries, material arrays, textures and instanced buffers. A chunk borrows scene-shared materials/resources and releases only its own allocations. The scene releases shared resources once after disposing chunks. Detached warm chunks remain owned and are still disposed at final scene teardown. A late font-ready callback checks its chunk lifetime before repainting a destroyed sign texture.

The byte counter estimates owned geometry buffers and texture storage; shared resources are excluded from each chunk's estimate to avoid double counting. It does not measure JavaScript heap, all shader/program costs, driver allocations or real GPU memory. Renderer geometry/texture counters and estimated bytes must be reported with those limits.

### Data loading and navigation

`PublicRepository` deduplicates in-flight reads and retains decoded public records in an LRU cache of at most **24 entries / 8 MiB of encoded JSON size**. Each caller receives its own clone. Cancelling one view detaches that consumer without aborting another consumer's shared fetch. Repository invalidation advances an epoch, aborts the underlying pending requests and clears reusable entries; stale responses cannot refill a newer epoch. The outline adapter checks source/revision/context compatibility before publishing session state or mounting a completed request.

The selected outline is still downloaded as **one complete JSON payload**, checked against its SHA-256 and data/art revisions. GPU chunk eviction does not unload portions of that JSON. Encoded JSON size is a cache accounting proxy, not decoded heap usage, and a mounted stage can retain its own data after a repository entry is evicted. Network chunk manifests, geographic data streaming and incremental parsing are future work.

`src/engine/navigation-grid.js` evaluates grid walkability on demand instead of pre-scanning the entire map. A spatial index supplies obstacle candidates, and A* is shared by the one scene navigation instance. Reusable caches are bounded at **32,768 cells / 16,384 edges** and released with navigation. A route expands at most **50,000 nodes**, and each nearest-walkable lookup checks at most **32,768 candidates**. Exhausting either work budget returns no route/result and exposes a diagnostic flag; normal route failure uses the existing “沿铺地换个方向走走” feedback. A long straight route's smoothing probes segments exponentially, then refines by binary search, instead of rechecking every growing prefix.

The per-search frontier, scores and predecessor records are temporary allocations, separate from reusable-cache accounting; the node expansion limit bounds work rather than defining an exact byte ceiling. Searches remain synchronous, so a pathological query can still occupy the main thread up to its budget. This is not a hierarchical street graph or a worker-based path service, and a budget-exhausted result is not proof that no physical route exists.

### Diagnostics and remaining scale limits

`digitalMemory.inspect()` and the mounted scene diagnostics expose loop state, completed frames, frame-interval p95, CPU update/submission timings, renderer calls/triangles/resource counts, residency and navigation/cache counters. GPU time is explicitly unavailable (`gpuMs: null`). A frame interval includes scheduling effects; CPU render submission is not GPU execution time. Hidden intervals are excluded by resetting the timing origin on resume.

Use identical data, camera, viewport and execution environment when comparing before/after results. Desktop/phone-size browser checks demonstrate the tested consumer and layout; SwiftShader measurements do not establish physical-device performance. This implementation leaves the full data payload, registered metadata, potentially large visible set, synchronous path search and continuously animated active street as remaining scale limits. It adds no automatic LOD, global road hierarchy or network streaming.

## Run and check

Requires Node.js 22 or later. No dependency installation is needed for these commands:

```sh
npm run dev
npm test
npm run test:outline
npm run build
```

Open `http://localhost:4173`. `npm run build` verifies map checksums and public package envelopes, then produces `dist/`. `node scripts/serve.mjs --dist` serves the built files. Relative asset URLs support hosting under a repository subpath as well as a domain root.

Optional browser checks use Playwright installed separately. The selected outline consumer is exercised by `node tests/schoolboy.browser.mjs` (the filename is retained from the earlier consumer); `PLAYWRIGHT_MODULE` can supply an installed module path. It starts a built-file server and records outline results/screenshots under ignored `local-evidence/`; preserve needed evidence outside the checkout and keep it out of commits. `CHROMIUM_CDP_URL` can reuse the existing shared Chromium/CDP session; set `CHROMIUM_EXECUTABLE` when supplying a local binary instead. The selected gate requires WebGL2, a non-black pixel and completed app frames, then covers real input, pause/re-entry, residency and stage expiry. The older `node scripts/browser-check.mjs` remains an overview/legacy walkthrough, not selected-street acceptance; that older runner supports `CODEX_PRIMARY_RUNTIME_NODE_MODULES` dependency lookup. SwiftShader execution does not establish hardware-device performance.

## Implemented ownership

| Concern | Owner | Current behavior |
| --- | --- | --- |
| Place identity and registration | `src/domain/spatial.js` | Stable IDs; separate versioned WGS84 geometry; shared local metric and pixel transform; optimistic revision conflict; point-window and metric corridor queries |
| Sparse time | `src/domain/temporal.js` | Five temporal relations; separate life stages and date windows; explicit unsupported environment; no nearest-year fallback |
| Session and portals | `src/application/session.js` | One place/period/camera/selection/scene owner; nested return snapshots; rejected stale loads |
| Data connection | `src/adapters/public-repository.js` | Manifest-directed public records; place-filtered memory chunks; bounded decoded-record reuse, in-flight deduplication and epoch invalidation; the selected outline remains one verified payload |
| Browsing persistence | `src/adapters/session-storage.js` | Best-effort local session preferences only; validation and usable map origin on restore |
| Overview and selected street | `src/explorer/`, `scenes/xinhua-sanli-outline/` | Raster overview without a person; perspective outline corridor with continuous figure, local navigation and a bounded retained stage; legacy graybox/GLB code is not the active entry |
| Engine resources | `src/engine/` | Frame scheduling, spatial candidates, bounded warm residency, resource ownership and lazy navigation-grid caches; no domain identity or historical authority |
| Illustration mapping | `src/domain/illustration.js` | Real-node / drawing-node correspondence, stable route edge/progress, metre-based street movement; one ordered Xinhua chain |
| Resources and references | `content/public/manifest.json`, `assets/maps/` | Revision/checksum-pinned candidates and explicit provenance; exact transform for vector candidates; B raster alignment still reviewable |

The raster is not an identity store. The initial A/B/C boards were rejected as the primary visual experience; their assets remain as provenance/reference, not active choices. The new journal image and geographic map have independently authored coordinates linked by stable IDs. School names are not geocoders: old campus identities remain registered with `geometry: null` until the specific sites are researched. Correcting a place geometry never changes its ID or rewrites linked memory records.

## Current frame and uncertainty

The square is approximately 1.8 km across, covering 新华街, the adjacent southwest/west Fourth Ring section, 丰台大桥 and 丰台影剧院. 南开西里 remains a general neighborhood anchor. This is the visual canvas, not a newly asserted walked itinerary. Roads/rails come from a selected contemporary OSM extract; historical registration remains open. No private home position is recorded.

The original prototype filtered synthetic memory relationships and could return `no_supported_state`. Later Xinhua artwork has explicitly selected approximate working-composite membership, recorded in STATUS and the source plan; it still does not prove the entire orientation board existed in every chosen period. Do not place historical development notices over the ordinary scene.

## New route-first contract: implementation gap register

The shared location/session, ordered Xinhua chain, selected outline integration and separate composition/time owners are foundations. The older imagined courtyard/near-gate prototype remains a historical fixture, not the current outline attachment dispatcher.

The following are **not claimed as implemented here**: general `RouteSceneRegistration`/`RouteAttachment` migration; a note/sequence/local-scene discriminated dispatcher; private notes attached to arbitrary objects; a durable static-sequence authoring/viewing flow; mixed boundary/frontage interval editing; multi-entrance route remapping; or observation/state-transition authoring across unknown dates.

A future implementation must demonstrate overview route-only entry, correct-side approach, all three target types and exact return; localized wall/railing/detached-frontage edits; and same-site temporal revisions without nearest-year fallback. The proposed fields in DATA_MODEL must not be mistaken for the current JSON schema.

The current contract forbids reintroducing former mapping inspectors, trial-shop controls or permanent debug labels. Resource diagnostics are developer evidence, not a new product HUD. Character-calibration and World Labs handoff targets remain separate; this resource change adds no authentication, generation request or deployment.

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

## Historical dual-scale sample — DM-0010

At that checkpoint, the three-tier overview remained unchanged and street entry used a grounded volumetric child, neutral building volumes and an elevated camera. Sidewalk click/drag and arrow keys/WASD controlled walking; a gate led to an imagined courtyard, with an exact return. Those controls and the menu-only layout describe the retained prototype. The selected outline consumer above has its own accepted compass/minimap exception and does not claim that old courtyard dispatcher.

The sample remains the same 140 m reference centerline. It does not establish exact historical sidewalk widths, facades or a real gate. Details and native-vs-browser evidence limits are in [STREET_PROTOTYPE](STREET_PROTOTYPE.md). Additional overview candidates are stored separately in `assets/candidates/overview-r1/`; they are not automatically placed on the map.

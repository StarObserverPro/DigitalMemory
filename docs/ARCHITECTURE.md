# Core architecture

Status: target architecture from 2026-10-19, current consumer/resource ownership reconciled 2026-10-27. [RUNTIME](RUNTIME.md) and [STATUS](STATUS.md) report implementation and delivery separately. Existing spatial/time/session, composition and illustration-mapping modules are retained. The general route-attachment dispatcher and street-edge/history contracts below remain requirements, not an implemented migration.

[INTERACTION](INTERACTION.md) owns the area → route → attachment journey; [DATA_MODEL](DATA_MODEL.md) owns record semantics; [LAYER_COMPOSITION](LAYER_COMPOSITION.md) owns independently replaceable street-facing structures. [MAP_ASSEMBLY](MAP_ASSEMBLY.md) and [HANDPAINTED_MAP_ART](HANDPAINTED_MAP_ART.md) retain geographic, projection and painting constraints.

## Shape of the system

Build one application with a coherent session and modular adapters, not a collection of content pages or independent microservices. The public code repository, private authoring archive, and any publication-cleared presentation are separate surfaces.

```text
Original private inputs / licensed references
                 |
       Ingest + evidence extraction
                 |
     Memory, spatial and asset registries
                 |
         Versioned review workbench
                 |
      Approved immutable release manifest
                 |
  Application session -> spatial/time queries
                 |
       Scene and memory presentation
       /         |             \
illustrated map  2.5D exteriors  image/photo interiors
```

The explorer consumes a selected release or an authorized private draft. The workbench edits records and proposals; it does not directly mutate an accepted running scene. Approval and publication are explicit steps. A future public viewer receives only a publication-cleared subset, never a browser download of the private database with CSS hiding sensitive fields.

## Ownership boundaries

These are module responsibilities, not a demand for separately deployed services.

| Owner | Sole responsibility | Must not do |
| --- | --- | --- |
| Spatial registry | Stable place IDs, geographic geometry revisions, coordinate transforms, route registration | Let an image generator move canonical roads or building footprints |
| Memory catalog | Fragments, evidence-backed statements, period associations, edited text and relationships | Infer unspoken autobiographical facts |
| Temporal resolver | Resolve current/other/unknown time relationships and admissible environment states | Silently select a nearest-year image as the current historical state |
| Application session | Current location, period, camera, selection, portal return stack, browsing mode | Duplicate these states in independent map and interior controllers |
| Scene resolver | Resolve a route scene, applicable attachments and one typed activation target; choose representation and lazy content dependencies | Expose every geographic object as an overview portal; invent facts or generate content while browsing |
| Asset registry | Provenance, immutable revisions, derivatives, approvals, source-use restrictions | Treat a reconstructed image as original photographic evidence |
| Authoring/review | Draft batches, compare revisions, approve wording/art/registration independently | Equate technical merge with personal or aesthetic approval |
| Release/export | Resolve approved manifests, verify privacy/use status, publish/export/revoke references | Publish drafts by default or use Git as the private archive |
| Presentation adapters | Render map, boxes, sprites, image scenes, accessible text and small controls | Become an alternative coordinate, chronology, or persistence authority |

A renderer may own implementation resources such as its frame loop and GPU lifecycle, but it does not own domain identity. Only the active scene's controller may receive navigation input; dormant interiors must not keep consuming input or continuing scene animation unintentionally.

## Runtime composition

The overview is a hand-drawn/cartoon/travel-journal illustration with a separate drawing-space layout. Stable node and edge IDs connect that layout to WGS84 source geometry. A route location is `{ edgeId, t, direction }`; geographic and illustration coordinates are derived views, not competing session positions. Do not force an artistic map into one global affine transform or infer a geographic address from an arbitrary illustration pixel.

Entering the selected street preserves its route context and puts the continuous outline figure in the registered Xinhua/Sanli corridor. The current close scene uses a perspective camera, source-backed building footprints with separately authored display masses, restrained flat colors and sparse motion. Existing GLB/graybox and orthographic fixtures are retained historical work, not the active overview→street consumer. The same application session owns position, heading, camera, active period, path and return context. Rendering does not make approximate ground extents or modern-source geometry into historical evidence. See [illustration mapping](ILLUSTRATION_MAPPING.md) and the [outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md).

Map illustrations, vectors, boxes, sprites, and portal images all reference the same scene manifest and transform revision. A pixel-to-world mapping cannot be independently re-created in the click handler. Foreground silhouettes and visual offsets must not alter the ground-space identity of a memory anchor.

`SessionState` contains the active period selection, world/place anchor, camera pose, current scene revision, selected memory, view mode, and return stack. View mode can later include walking, cycling, transit, or a deliberate jump; only walking is in Phase 1. Motion mode belongs to a route traversal/context, not permanently to the street itself.

Entering an attachment from an active route captures the origin and resolves the target on demand. A note, a static sequence and a local scene share this return contract. No normal overview interaction bypasses the route layer. Loading failures retain a usable origin; stale session/scene responses are discarded.

## Route registration and attachment resolution

The spatial registry retains all legitimate point/line/area records. The overview's navigable registration indexes are streets/routes and their supported entry ranges, not an independent list of every place's content destinations. A street graph describes possible supported connections; a remembered route describes a traversal over that graph. Neither implies that every nearby connection was walked.

A place keeps its ID independently of any one route. `RouteAttachment` binds an object or remembered position to the appropriate route edge, side and approach point/range. Several attachments may reference the same place or content target; a hospital with two entrances must not become two unrelated hospitals. Changing an edge geometry requires explicit attachment remapping, not nearest-road snapping or recalculation from painted pixels.

The activation resolver accepts attachment ID, active environment/period and session origin. It returns one of `note`, `sequence`, `scene`, or a non-activation result with no fabricated content. Note/sequence presentation consumes the same memory catalog; only a spatial scene needs a walk controller. A place's categorical label never dispatches its implementation by itself.

Resolve in this order: selected period/environment → supported route/walking edge → frontage and boundary states → nearby attachments → approved activation target and render policy. Scene loading is on demand. Prefetch small metadata or neighboring sequence pages only within a measured budget; do not load every interior or run generation at map opening.

## Session transitions and recovery

The map-to-street presentation in `src/explorer/entry-transition.js` owns only a temporary modal canvas and cancellable frame sequence. The application entry owner keeps its existing load-generation/AbortController boundary; the session owns the persisted `entryTransition` preference (`journal` or `simple`) and final map/street pose. The selected renderer accepts a transient entry-camera progress without writing it to session storage. During that presentation its one scene loop can render while navigation stays blocked; cancellation releases the overlay and camera override. A nested return preserves the current user preference.

Normal navigation is overview → route scene → attachment content. Capture the route ID/revision, edge/progress, side, local offset, heading, camera, active period, scene revision and selection before activation. A sequence also owns a page cursor and optional approved reading links; page order is not spatial connectivity.

Closing a note or sequence returns to exactly the same street context. A local scene can contain further attachments and return through the same stack. Preserve the origin while loading, pause the inactive walk controller, cancel stale loads and recover cleanly from unavailable content. Search can reveal/focus the relevant route and attachment; an intentionally resumed interior must restore a valid origin stack rather than inventing an overview-to-room portal.

An attachment may acquire more notes or change from note to sequence/local scene by a reviewed target revision. Its street anchor, place identity and unrelated neighboring objects do not change. A static picture group can remain the final representation indefinitely.

## Local invalidation, not city rebuilding

The dependency chain is route geometry → attachments/segment spans; frontage or boundary state → local masks/occlusion and affected assets; content target → the local note/sequence/scene manifest. A note edit never moves a gate or rebuilds the map. A wall/railing substitution changes only the affected segment's appearance, visibility and physical behavior. A shell replacement retains the site, but a demolished structure is not falsely kept as the same physical building.

Keep storage, authentication, releases, stale-load checks and privacy boundaries below. The new design does not require another engine, microservice fleet or speculative database vendor.

## Storage and query contract

The authoritative archive must be durable and exportable; browser cache is only a convenience. Start with a simple private archive/database and object storage adapter when implementation is authorized. Do not create distributed infrastructure merely because the logical model has several owners.

Spatial records support point, line and area intersection/proximity queries. Memory queries combine spatial extent or route corridor, period relation, visibility/release, and relevance. Results are paginated; visual clustering and progressive detail keep hundreds or thousands of fragments from becoming hundreds of overlapping labels. Search indexes are rebuildable derivatives, not the only copy of the words.

Separate spatial chunks from content batches. Geographic tile/chunk boundaries are performance choices; they must not become the persistent identity of a school, shop, or recollection. A fragment may reference several places and sources. Updating one small area invalidates only affected derivatives and manifests, not the entire town.

## Authority and data flow

Registration proposals are reviewed before becoming active geometry revisions. Text, art, factual-evidence, and publication approvals are distinct. A scene manifest points to exact geometry, asset and text revisions; it never means “use whatever is newest.” A new generator result is a draft replacement, not a silent upgrade.

The public repository contains contracts, application source, and synthetic or cleared fixtures. Source URLs alone do not establish reuse rights. Private originals are referenced with opaque IDs in public-facing technical records; do not embed private storage URLs, prompts, transcripts, coordinates, or EXIF in PRs.

## Failure and recovery

A missing temporal state yields an explicitly sparse background and discoverable other-time entrances, not a made-up current-period city. An unavailable asset uses a source-appropriate placeholder while preserving navigation. Rejected art/text stays out of active releases. Optimistic revision checks reject conflicting edits instead of letting the latest Agent overwrite another's work.

An export includes records, original/derived assets allowed by the selected privacy scope, manifests, transformation metadata, approvals, and checksums. Rebuildable caches are omitted. Restore must be tested into a clean instance; a successful ZIP download alone is not proof of recoverability. User-requested deletion and publication withdrawal override ordinary retention; preserve only permissible tombstone/audit metadata.

## Source layout: current owners and future surfaces

This map combines current source owners with future authoring/provider surfaces; it does not claim that every listed directory or capability is implemented:

```text
src/domain/             identities, time/geometry contracts, pure selectors
src/application/        session, commands, query orchestration
src/explorer/           map/scene/image adapters and minimal HUD
src/engine/             current rendering-lifetime and spatial-query utilities
src/workbench/          private ingestion and separate review controls
src/adapters/           storage, historical sources, generation providers
content/public/         explicitly cleared fixtures/manifests only
tests/                  domain, round-trip, privacy and visual evidence tests
```

Keep dependency direction toward domain contracts. Presentation must not import provider-specific generation logic; generation jobs must not own browsing session state. The engine utility directory now exists; workbench/provider entries remain future owners. Concrete dependency changes require an implementation packet and targeted verification.

## Selected outline integration

The Xinhua/Sanli selected close view is adapted by `src/explorer/outline-stage.js`. `PublicRepository` verifies its registration/data hash before mounting. Spatial `createLocalSceneFrame` converts registered WGS84/local metres; session outline-state owns revision, origin route, position, camera and path. `resolvePeriodState` selects explicit working-composite membership without historical interpolation. The renderer uses isolated Shadow DOM styles, abortable listeners and one cancellable loop. Existing portal snapshots include outline state. This implements the selected close-view seam, not the general attachment-schema migration above.

Corridor extension uses the existing outline registration and application session. Data-driven destinations include Xinhua east/west, Kandan Bridge and Qili west-facing Daoxiangcun forecourt. The stable scene ID is retained; registration revision invalidates stale poses. Three display masses are segmented above detached low shops while source footprints remain intact. Named shop frontage requires map POI and dated imagery; numerical ground extents remain approximate.

## Selected runtime resource ownership

The resource change has four separate lifetimes. Their budgets and validation limits are specified in [RUNTIME](RUNTIME.md#bounded-runtime-resources--dm-runtime-residency-20261027), with delivery evidence in the [task packet](attention/tasks/DM-RUNTIME-RESIDENCY-20261027.md).

| Owner | Keeps | Releases / invalidates |
| --- | --- | --- |
| Application session | Registered scene revision, route/environment context, pose, camera and path | Invalid states are rejected/remapped through existing registration/session rules; resource eviction never rewrites place identity |
| Public repository | Bounded reusable decoded records and shared in-flight public requests | LRU eviction removes cache references; epoch invalidation aborts requests and rejects late results |
| Outline stage slot | At most one compatible renderer/navigation pair for 60 seconds after returning to overview | An incompatible context, expiry or final page exit disposes it; suspended stages schedule no frames and accept no navigation input |
| Spatial drawing | Active/pinned chunk resources and a bounded inactive warm cache | Warm LRU/age eviction releases chunk-owned allocations; final drawing disposal also releases scene-shared resources once |

`src/engine/frame-loop.js`, `spatial-index.js`, `chunk-residency.js`, `resource-scope.js` and `navigation-grid.js` are implementation utilities. They own neither chronology nor coordinate authority. A chunk identifier is a disposable presentation/cache key; registered places, source footprints and destination IDs remain stable across eviction and reconstruction. Shared materials and textures have an explicit scene owner so releasing one chunk cannot invalidate another chunk's rendering.

The selected scene still downloads and validates one complete JSON payload. Drawing factories create spatial GPU resources on demand; navigation evaluates grid cells on demand with bounded reusable caches, explicit per-query work limits and one adapter-owned instance. A query that exhausts its work budget fails safely; it does not certify physical disconnection. These changes do not implement network chunk streaming, a globally bounded visible set, a hierarchical road graph or automatic LOD. The accepted full camera frustum remains the rendering boundary, including distant ink beyond the filled surfaces' fog range.

Asynchronous mount results are accepted only while their caller, repository epoch, source path and session context remain current. View cancellation can detach from a shared fetch; repository invalidation owns cancellation of that fetch. No completed stale request may replace a newer stage or publish old session state. Final cleanup remains separate from temporary suspension, and neither becomes a second persistence owner.

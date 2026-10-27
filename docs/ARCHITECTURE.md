# Core architecture

Status: integrated target architecture, 2026-10-19. [RUNTIME](RUNTIME.md) and [STATUS](STATUS.md) report implementation and delivery separately. Existing spatial/time/session, composition and illustration-mapping modules are retained. The new route-attachment dispatcher and street-edge/history contracts below are requirements, not an implemented migration.

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

Entering a modeled street preserves that route position and puts the character on its sidewalk. The current close scene uses an elevated orthographic camera, articulated volumetric placeholder character and short independently replaceable building volumes. This replaces the earlier paper cutout; illustrated scenic-flat surfaces can follow after proportion approval. Ground coordinates remain registered and camera/presentation compression is documented in STREET_PROTOTYPE. Fog and arrows terminate the visible sample. The renderer does not recreate a full city or promote painted buildings into historical evidence. The same session owns sidewalk offset, heading, active period and portal stack. See [illustration mapping](ILLUSTRATION_MAPPING.md).

Map illustrations, vectors, boxes, sprites, and portal images all reference the same scene manifest and transform revision. A pixel-to-world mapping cannot be independently re-created in the click handler. Foreground silhouettes and visual offsets must not alter the ground-space identity of a memory anchor.

`SessionState` contains the active period selection, world/place anchor, camera pose, current scene revision, selected memory, view mode, and return stack. View mode can later include walking, cycling, transit, or a deliberate jump; only walking is in Phase 1. Motion mode belongs to a route traversal/context, not permanently to the street itself.

Entering an attachment from an active route captures the origin and resolves the target on demand. A note, a static sequence and a local scene share this return contract. No normal overview interaction bypasses the route layer. Loading failures retain a usable origin; stale session/scene responses are discarded.

## Route registration and attachment resolution

The spatial registry retains all legitimate point/line/area records. The overview's navigable registration indexes are streets/routes and their supported entry ranges, not an independent list of every place's content destinations. A street graph describes possible supported connections; a remembered route describes a traversal over that graph. Neither implies that every nearby connection was walked.

A place keeps its ID independently of any one route. `RouteAttachment` binds an object or remembered position to the appropriate route edge, side and approach point/range. Several attachments may reference the same place or content target; a hospital with two entrances must not become two unrelated hospitals. Changing an edge geometry requires explicit attachment remapping, not nearest-road snapping or recalculation from painted pixels.

The activation resolver accepts attachment ID, active environment/period and session origin. It returns one of `note`, `sequence`, `scene`, or a non-activation result with no fabricated content. Note/sequence presentation consumes the same memory catalog; only a spatial scene needs a walk controller. A place's categorical label never dispatches its implementation by itself.

Resolve in this order: selected period/environment → supported route/walking edge → frontage and boundary states → nearby attachments → approved activation target and render policy. Scene loading is on demand. Prefetch small metadata or neighboring sequence pages only within a measured budget; do not load every interior or run generation at map opening.

## Session transitions and recovery

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

## Proposed source layout

This is a future directory map, not a statement that these files exist:

```text
src/domain/             identities, time/geometry contracts, pure selectors
src/application/        session, commands, query orchestration
src/explorer/           map/scene/image adapters and minimal HUD
src/workbench/          private ingestion and separate review controls
src/adapters/           storage, historical sources, generation providers
content/public/         explicitly cleared fixtures/manifests only
tests/                  domain, round-trip, privacy and visual evidence tests
```

Keep dependency direction toward domain contracts. Presentation must not import provider-specific generation logic; generation jobs must not own browsing session state. Concrete dependencies and version choices require an implementation packet and targeted verification, not a speculative lockfile in this documentation task.

## Selected outline integration

The Xinhua/Sanli selected close view is adapted by src/explorer/outline-stage.js. PublicRepository verifies its registration/data hash before mounting. Spatial createLocalSceneFrame converts registered WGS84/local metres; session outline-state owns revision, origin route, position, camera and path. resolvePeriodState selects explicit working-composite membership without historical interpolation. The renderer uses isolated Shadow DOM styles, abortable listeners and one cancellable loop; leaving disposes it. Existing portal snapshots include outline state. This implements the selected close-view seam, not the general attachment-schema migration above.

Corridor extension uses the existing outline registration and application session. Data-driven destinations include Xinhua east/west, Kandan Bridge and Qili west-facing Daoxiangcun forecourt. The stable scene ID is retained; registration revision invalidates stale poses. Three display masses are segmented above detached low shops while source footprints remain intact. Named shop frontage requires map POI and dated imagery; numerical ground extents remain approximate.

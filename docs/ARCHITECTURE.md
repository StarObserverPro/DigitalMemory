# Core architecture

> DM-0007 current target: [map assembly](MAP_ASSEMBLY.md) defines pale local context, solid roads/landmarks/memories, three overview tiers, independent road/bridge/wall structures, and local replacement. A pure planner is implemented; the current deployed renderer is not migrated. Overview has no character; street uses elevated chibi framing.

> DM-0004 update: road registration, building shells, frontage slots/occupants, entrances and character profiles are independently composed. Overview and close scene share the composition registry. See [layer composition](LAYER_COMPOSITION.md); this supersedes the monolithic-illustration and long-strip implementation descriptions below.

Status: v1 implementation contract; the initial planar subset (DM-0002) is superseded visually by illustrated overview and scenic-flat street prototype DM-0003. Private storage and hosting remain deferred. See [DECISIONS](DECISIONS.md).

Implementation update: the first planar explorer, shared registration transform, sparse-time/session modules, public adapter and candidate assets now exist; [RUNTIME](RUNTIME.md) records the implemented subset and explicit gaps. The original contract below remains the target, not a claim of complete capability.

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
| Scene resolver | Select a scene revision, level of detail, visible portals and memory entrances | Author new historical facts or generate assets during browsing |
| Asset registry | Provenance, immutable revisions, derivatives, approvals, source-use restrictions | Treat a reconstructed image as original photographic evidence |
| Authoring/review | Draft batches, compare revisions, approve wording/art/registration independently | Equate technical merge with personal or aesthetic approval |
| Release/export | Resolve approved manifests, verify privacy/use status, publish/export/revoke references | Publish drafts by default or use Git as the private archive |
| Presentation adapters | Render map, boxes, sprites, image scenes, accessible text and small controls | Become an alternative coordinate, chronology, or persistence authority |

A renderer may own implementation resources such as its frame loop and GPU lifecycle, but it does not own domain identity. Only the active scene's controller may receive navigation input; dormant interiors must not keep consuming input or continuing scene animation unintentionally.

## Runtime composition

The overview is a hand-drawn/cartoon/travel-journal illustration with a separate drawing-space layout. Stable node and edge IDs connect that layout to WGS84 source geometry. A route location is `{ edgeId, t, direction }`; geographic and illustration coordinates are derived views, not competing session positions. Do not force an artistic map into one global affine transform or infer a geographic address from an arbitrary illustration pixel.

Entering a modeled street preserves that route position and puts the character on its sidewalk. The close scene uses a perspective camera, upright textured facade planes (cinematic scenic flats), shallow returns and minimal ground geometry. Fog and arrows terminate the visible sample. The renderer does not recreate a full city or promote painted buildings into historical evidence. The same session owns sidewalk offset, heading, active period and portal stack. See [illustration mapping](ILLUSTRATION_MAPPING.md).

Map illustrations, vectors, boxes, sprites, and portal images all reference the same scene manifest and transform revision. A pixel-to-world mapping cannot be independently re-created in the click handler. Foreground silhouettes and visual offsets must not alter the ground-space identity of a memory anchor.

`SessionState` contains the active period selection, world/place anchor, camera pose, current scene revision, selected memory, view mode, and return stack. View mode can later include walking, cycling, transit, or a deliberate jump; only walking is in Phase 1. Motion mode belongs to a route traversal/context, not permanently to the street itself.

Entering a portal captures the origin state, performs a short transition, and loads the destination on demand. A destination can be a modest campus, a shallow corridor, or an image with hotspots. Returning restores the stored origin instead of resetting to the whole map. A destination load failure leaves a usable origin and retry/return control. Late asset responses must be discarded if their session/scene revision is no longer current.

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

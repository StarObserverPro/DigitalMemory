# Data model and registration contract

> DM-0004 adds implemented BuildingShell, FrontageSlot and Entrance attachments plus exact-period Occupancy resolution. Shells retain identity when a shop changes. See [layer composition](LAYER_COMPOSITION.md).

Status: logical schema v1; a public prototype implements a subset with contemporary orientation coordinates. A production/private database and historical registration are not supplied.

Implementation update: the first planar explorer, shared registration transform, sparse-time/session modules, public adapter and candidate assets now exist; [RUNTIME](RUNTIME.md) records the implemented subset and explicit gaps. The original contract below remains the target, not a claim of complete capability.

## Geography is the lookup skeleton, not a mutable primary-key string

Use coordinates and spatial indexes as the principal registration and retrieval mechanism. Give each persistent object an opaque stable ID as well. The ID is a technical safeguard, not an alternative content hierarchy: adjusting a school boundary or moving an imprecisely placed shop must not detach its recollections.

Do not use rounded latitude/longitude, a current school name, a tile filename, or a geohash as the object's unique identity. Several remembered objects can occupy the same position, and a single institution can occupy several sites over time.

A `Place` is a stable site/location identity. Its geometry can be a point, line, or polygon, with revisions. A portal is a relation between an origin anchor and a destination scene; it is not a fourth mutually exclusive geometry type. Indoor anchors may use local scene coordinates and a parent geographic place.

## Common envelope

Mutable records carry `id`, `schemaVersion`, `revision`, created/updated metadata, source/authority references, and privacy/access class. Changes that affect reviewed content create a new revision with a parent; they do not overwrite approved evidence. Revision checks prevent concurrent lost updates. IDs stay stable across export/import and do not expose residential addresses.

An unresolved value is null/unknown, never a fabricated coordinate, zero date, or default fact. Retain original date expressions and uncertainty. Examples in tests must be synthetic and marked as such; no precise real-world personal fixtures are supplied by this architecture.

## Core records

| Record | Required meaning and principal fields |
| --- | --- |
| `Place` | Stable ID, user label/aliases, kind, optional parent place, geometry revision references. Importance and familiarity are independent of map footprint. |
| `GeometryRevision` | Place ID, geometry or unresolved status, canonical CRS, original source CRS, transform revision, effective period if relevant, evidence references, registration precision/uncertainty and approval. |
| `Route` / `RouteRevision` | Stable route identity; ordered registered segments and anchors; traversal mode; associated periods. Unknown connectors are explicit gaps, not assumed straight or shortest paths. |
| `Institution` | School/organization identity independent of its buildings or contemporary address. |
| `Occupancy` | Institution ID, site/place ID, uncertain valid-time interval, evidence references and status. A change of tenant does not move the place. |
| `SourceRecord` | Original oral input, historical photo/map/imagery, external text, capture/date metadata, checksum, private asset reference, rights/access status. |
| `Statement` | A source-supported assertion, source span/crop, subject/place/period associations, modality and uncertainty. User recollection, external observation, and reconstruction inference are separate origins. |
| `MemoryFragment` | One coherent recollection, habit, impression, route description or event; one or many place/route links; uncertain time; original source spans; selected text revisions. |
| `TextRevision` | Fragment ID, editorial stage, text, supporting statement/span IDs, parent revision, wording approval. No added substantive claim. |
| `EnvironmentState` | Place/area and time applicability; assertions/parameters about its remembered or documented appearance; evidence and unresolved conflicts. Not an annual full-city snapshot. |
| `AssetRevision` | Kind, original/derived/generated provenance, source regions, geometry/style dependencies, prompt/job metadata, checksum, usage and art approval. |
| `SceneRevision` / `Portal` | Manifest of exact geometry/asset/text revisions; camera/hotspots; destination scene and return behavior. A destination may be only an image. |
| `Approval` / `ReleaseManifest` | Approval dimensions and exact revisions; selected publication scope and immutable content/asset closure. Approval of one dimension does not approve the others. |

## Coordinates and precision

The proposed canonical geographic interchange frame is WGS84 longitude/latitude, explicitly tagged, with a documented local metric transform for scene rendering and corridor distances. Preserve the coordinate system and processing history of every input; never assume a Chinese consumer-map coordinate, historical sheet, screenshot pixel, and satellite coordinate are interchangeable. The first registration task must verify the chosen transform and the relevant source terms.

Store geometry separately from display offsets, building height, stylization, and camera projection. Building height can be an approximate parameter with its own evidence; changing it must not silently change the footprint. Source positional uncertainty, reconstruction accuracy, and personal familiarity are independent fields. Satellite resolution is not a measure of personal importance.

Routes contain real ordered segments only where supported. A broad planning connection may be registered as an uncertain region or an unconnected pair of anchors. A user can later correct a path without changing its ID or rewriting the memories attached to it.

## Time is not one timestamp

For a memory or state, use a structure equivalent to:

```text
TimeAssociation
  originalExpression          e.g. a user-supplied life-stage phrase
  lifeStageId                 optional; stage dates remain separately uncertain
  earliestPossible / latestPossible
  knownStart / knownEnd       only when actually supported
  relation                    point-like | interval | recurring | uncertain
  evidenceRefs
  mappingRevision             changes to stage/date interpretation are versioned
```

Keep at least four meanings separate: **when something was experienced**, **when an environment is believed to have existed**, **when a source image was captured**, and **when the recollection was recorded**. Recalling a shop sometime in a range does not prove it opened and closed at that range's endpoints.

An interval may mean uncertain occurrence bounds or known duration; `relation` and the original expression must disambiguate them. Do not infer an exact school year or birthday from approximate decade references. Conflicting dating claims can coexist until resolved.

## Temporal query result

The temporal resolver returns `current`, `earlier`, `later`, `overlapping`, or `unknown` relation, with the evidence/revision that produced it. Color is a presentation of that result, not its storage representation. When bounds overlap or chronology is unclear, do not force an earlier/later label.

For a scene, return an explicit compatible environment revision or `no_supported_state`. A nearest source date can be offered for inspection but cannot silently become the active period. Other-time memories remain clickable entrance records; their historical buildings are not automatically inserted into the current world as physical obstacles.

## Fragment and source granularity

One recording may yield several fragments; each retains its source spans and the recording's ID. Several recordings may support a merged display fragment without deleting their differences. Potential duplicates are review candidates, not automatic deletions. A recurring habit is a single meaningful record with duration/frequency as actually stated, not thousands of synthetic events.

A photo can support a road edge, facade texture, window pattern, and background building simultaneously. Store crop/region annotations and source relations rather than duplicating an untraceable crop into each asset. A photo's capture position is not the location of every visible object. Distinguish camera position, viewing direction, visible subject region, and uncertain geolocation.

Original photograph, restored/edited photograph, composite, and reconstructed image are distinct provenance classes. Generated output can reference evidence but never becomes an independent source proving the scene. A user approving an overall likeness does not certify each window, sign, person, or color as factual.

## Revision and deletion rules

Registration, text, art, factual confirmation, and publication approval each bind to exact revisions. Replacing an approved image invalidates that image's art/publication selection until reviewed; unrelated fragments are unaffected. Common building/material templates are versioned and pinned, so a template update cannot globally alter accepted memories.

Preserve originals and history under normal editing. A correction adds a superseding statement or revision; a lawful/user-authorized deletion purges protected source content and affected derivatives as required. Tombstones must not retain the deleted personal content. Public Git history is unsuitable for storing material that may later require this treatment.

## Query and indexing requirements

Support spatial-window queries, route-plus-buffer queries in metric units, period filtering, aliases/full-text search, and source-to-derived-asset dependency lookup. Paginate both memories and review queues. Build screen-space clustering in presentation, not by deleting nearby records. Rebuild indexes from authoritative records. No monthly archive growth should require loading all recordings or all text into a browser session or an Agent prompt.

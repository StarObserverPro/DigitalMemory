# Data model and registration contract

Status: integrated logical contract, 2026-10-19. The prototype implements parts of registration, time, session, BuildingShell/FrontageSlot/Entrance composition and exact-period occupancy. The generalized route attachment, three-way activation and repeated-observation contracts below are targets, not a completed schema migration. [RUNTIME](RUNTIME.md) and [STATUS](STATUS.md) own implementation evidence.

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

## Route registration and uniform attachment contract

A route is a registered line used by the overview to enter a street scene. A `Place` remains an independently identified point, line or area; route-first navigation does not make its identity depend on a road, nor require the overview to render all its source geometry.

Conceptual additions (names can be adapted to existing modules without changing their meanings):

| Record | Required meaning |
| --- | --- |
| `RouteSceneRegistration` | Route ID/revision, supported entry edges/ranges, scene revision and period support. Does not assert that an entire source road is a remembered traversal. |
| `RouteAttachment` | Stable attachment ID; referenced place/object/position; route ID/revision; edge/progress or supported interval; side and approach anchor; optional activation-target reference; evidence and unresolved status. |
| `InteractionTarget` | Versioned discriminated union: `note` with memory references; `sequence` with sequence revision; `scene` with scene revision and return policy. No content means no reader-facing target, not an invented note. |
| `SceneSequence` | Ordered page IDs and optional explicit reading links; each page pins image/text/source/period references. Order can be thematic, editorial or temporal and must be declared. No inferred floor-plan connectivity. |
| `StreetEdgeSegment` | Stable locally editable interval on a route side; child boundary/gate/frontage/ground objects, independent lateral placement and period-specific states. |
| `Observation` | Source-supported observation of a place/object with the observed facts, observation time or relative-time relation, familiarity/visible-extent context and source spans. It does not certify the whole environment. |
| `StateTransition` | References to compatible before/after states, supported change kind and evidence; optional approximate time and causal statement only when supported. |

Minimal conceptual attachment:

```text
RouteAttachment
  id, revision, placeId
  routeId, routeRevision, edgeId
  anchor: progress OR unresolved range
  side: relative to canonical edge direction, not current camera/facing
  approach: walk-edge reference, local offset, elevation where relevant
  targetRef: InteractionTarget revision OR null
  periodSupport, evidenceRefs, registrationStatus
```

Exact progress and appearance dimensions remain nullable until supported. An uncertain interval is not an exact doorway and is not silently made walkable. An approved illustrative approach point may coexist with an uncertain historical location, with the roles explicitly distinguished. Nearby is not equivalent to reachable: side, crossing, wall and level relations must be validated.

Several route attachments may reference one place or target; several memories may reference the same attachment. Correcting a door, splitting an edge or reorienting a canonical edge requires an explicit mapping revision, including side/progress updates. Coordinate/name corrections do not rewrite memory IDs. A route-relative location is navigation context, not a replacement for the spatial registry.

## Representation, experience and interaction are separate axes

Store explicit source/geometry uncertainty, date support, remembered exterior/interior familiarity, observed visible extent and memory relevance without collapsing them into one confidence number. A render policy then chooses overview visibility, gate/icon/frontage/mass representation, per-tier detail and street depiction. An independent target chooses what activation does.

A precise modern boundary may stay hidden behind a symbolic gate. A high-detail exterior may have no interior target. A stack of pictures may carry many memories without requiring movement. Geographic ground footprint, painted silhouette, interaction hit area and physical navigation/collision geometry are separate records or fields; enlarging one never silently enlarges the others.

## Street edge and physical identity

Boundary appearance is not a compulsory closed parcel polygon. A segment can specify brick wall, iron railing, masonry-plus-railing, a locally mixed sequence, an opening or unresolved treatment, with independently supported length, height and visual permeability. Physical access is separate from visual permeability: a railing can reveal the rear scene while remaining impassable.

A frontage host is explicit: attached to a supported building, a detached shell, a boundary-facing structure or a ground installation. An adjacent residential block is not a mandatory owner. Preserve the existing rule that slots lie within their actual host, but never fabricate a host relation just to pass that check. Commercial use and low interaction are compatible.

`EnvironmentState` references independently versioned shell, boundary, ground/installation, use and occupant states. Repainting or tenancy can reuse a shell. Demolition/rebuilding replaces the shell reference while retaining the site. Conversion to a shelter or damage to a roof is not merely an occupancy/sign swap.

## Coordinates and precision

The implemented geographic interchange frame is WGS84 longitude/latitude, explicitly tagged, with a documented local metric transform for scene rendering and corridor distances. Preserve the coordinate system and permitted coordinate transform of every input; never assume a Chinese consumer-map coordinate, historical sheet, screenshot pixel, and satellite coordinate are interchangeable. Each acquisition/registration task must verify its transform and relevant source terms; [the geographic runbook](GEO_DATA_RUNBOOK.md) records that procedure.

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

## Repeated observations and same-place recurrence

Retain the four time meanings above and allow additional supported relations such as before/after/overlap/same-era between observations or states. A known order does not imply known durations, and an observation gap is not proof that a condition persisted unchanged. Contradictory ordering remains a review conflict; do not manufacture a total timeline.

Synthetic example, not a public autobiographical record:

```text
site-A: state-A1 (small commercial frontage)
     → state-A2 (shelter use)
     → state-A3 (roof damaged)
     → [unobserved interval]
     → state-A4 (commercial frontage seen again)
```

All four states refer to `site-A`; each has its own evidence and identity. A4 is not automatically the same shell, occupant, doorway count or exact appearance as A1. The example establishes no year, named site, cause or residence association. A later observation may resemble an earlier state without merging their revisions.

An event belongs in the record only when supplied; a sequence of ordinary observations is also meaningful. Do not add periodic weather, business cycles or annual tree growth simulation because the user described recurrence. Sparse recorded states are enough.

A release can deliberately select a compatible approximate-period composite with explicit memberships, or an authored remembered phase. It cannot silently combine mutually exclusive states or interpret the nearest dated image as historical truth. Reading a note/sequence and changing the active environment are separate commands.

## Temporal query result

The temporal resolver returns `current`, `earlier`, `later`, `overlapping`, or `unknown` relation, with the evidence/revision that produced it. Color is a presentation of that result, not its storage representation. When bounds overlap or chronology is unclear, do not force an earlier/later label.

For a scene, return an explicit compatible environment revision or `no_supported_state`. A nearest source date can be offered for inspection but cannot silently become the active period. Other-time memories remain reachable through route-context attachments or a deliberate local time/history view; their historical buildings are not automatically inserted as physical obstacles or direct overview portals.

## Fragment and source granularity

One recording may yield several fragments; each retains its source spans and the recording's ID. Several recordings may support a merged display fragment without deleting their differences. Potential duplicates are review candidates, not automatic deletions. A recurring habit is a single meaningful record with duration/frequency as actually stated, not thousands of synthetic events.

A photo can support a road edge, facade texture, window pattern, and background building simultaneously. Store crop/region annotations and source relations rather than duplicating an untraceable crop into each asset. A photo's capture position is not the location of every visible object. Distinguish camera position, viewing direction, visible subject region, and uncertain geolocation.

Original photograph, restored/edited photograph, composite, and reconstructed image are distinct provenance classes. Generated output can reference evidence but never becomes an independent source proving the scene. A user approving an overall likeness does not certify each window, sign, person, or color as factual.

## Revision and deletion rules

Registration, text, art, factual confirmation, and publication approval each bind to exact revisions. Replacing an approved image invalidates that image's art/publication selection until reviewed; unrelated fragments are unaffected. Common building/material templates are versioned and pinned, so a template update cannot globally alter accepted memories.

Preserve originals and history under normal editing. A correction adds a superseding statement or revision; a lawful/user-authorized deletion purges protected source content and affected derivatives as required. Tombstones must not retain the deleted personal content. Public Git history is unsuitable for storing material that may later require this treatment.

## Query and indexing requirements

Support spatial-window queries, route-plus-buffer queries in metric units, period filtering, aliases/full-text search, and source-to-derived-asset dependency lookup. Paginate both memories and review queues. Build screen-space clustering in presentation, not by deleting nearby records. Rebuild indexes from authoritative records. No monthly archive growth should require loading all recordings or all text into a browser session or an Agent prompt.

## Selected outline session state

The implemented Xinhua/Sanli close-view seam stores `session.outline`: registration revision, originRoute key, environmentId, local-metre position, yaw/distance/pitch camera, continuous path, destination, visited waypoint IDs and travelled distance. Application `outline-state` validates finite/ranged values and clones updates; nested portal snapshots preserve it. Restore drops pending paths/destination and invalid poses, opens a usable overview, and revalidates revision/entry and collision before the next street mount. This field is a concrete selected-scene adapter, not the proposed general RouteAttachment migration. `outline-registration.json` binds the stable place IDs, registered local frame, scene bytes/art revisions and explicit working-composite period members.

### Selected street presentation overrides — Yunbai–Kandan

The selected outline scene keeps `buildings` source IDs, `originalRing`, stored height and storeys separate from `buildingPresentation`. Each presentation record references `sourceBuildingId` and can provide an evidenced `displayHeight`/`displayKind` or an `openUpper` drawing band. Existing `residentialDisplayVolumes` remain footprint-only presentation overrides. Neither record changes spatial identity or the collision footprint. The local scene frame and public registration remain authoritative; no sandbox coordinate transform is loaded at runtime. The working-composite temporal membership is unchanged and does not certify a historic year.

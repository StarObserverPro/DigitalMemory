# Map, image and scene asset pipeline

> **2026-10-27 current consumers:** The overview keeps its hand-painted rasters; the selected Xinhua/Sanli close view uses the accepted [outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md). The GLB student is a retained legacy asset. [WORLDLABS_HANDOFF](WORLDLABS_HANDOFF.md) remains documentation only, with no World Labs generation/output/importer.

> DM-0015 correction: [hand-painted map art](HANDPAINTED_MAP_ART.md) owns visible medium, contextual generation, tower identity and projection/scale acceptance. SVG is planning only, never map art or a runtime art fallback. The older ≤1.5 native/display ratio is a recorded r4 experiment, not a universal requirement; it must not erase paint or tower storeys. Never repair raised art with unrestricted affine fitting.

> [Scale-budgeted workflow](ASSET_WORKFLOW_VALIDATION.md) retains source, crop, anchor and assembly checks. Its older isolated-atlas and SVG-fallback choices are superseded by the DM-0015 correction.

> DM-0007: follow [MAP_ASSEMBLY](MAP_ASSEMBLY.md) for three overview tiers, independently replaceable pale context, compound children, and road-only bridge/retaining-wall parts. The same style must hold across scales. Accepted general style is not approval of a specific asset, location or chronology.

> Historical DM-0004 used original independent paper, apartment overview/front, single-shop and child cutouts in `assets/modules/`. Its module evidence is retained; those characters and facade strips do not define the selected outline consumer. See [photo observations](LOCAL_VISUAL_REFERENCES.md) and [composition/storage contract](LAYER_COMPOSITION.md).

Status: production contract, with current Xinhua R6 overview paintings and the selected outline street reported in [STATUS](STATUS.md)/[RUNTIME](RUNTIME.md). Historical trials below retain their own provenance and verdicts. Contract text alone does not establish runtime completion or historical acceptance.

## Two products, not one flattened picture

The selected 2026-10-28 journal entry direction combines a generated Haring-inspired raster hand, a generic line-drawn box and casual dated handwriting in a transient canvas over the existing raster map. The user rejected the first procedural hand, realistic sketch and generic instruction phrases. The replacement hand uses three pen-tip-registered poses with bold rounded contours and flat fill; [the transition package](../assets/transitions/README.md) records its hashes, provenance and local Long Cang-derived font license. Five fictional decorative street observations are chosen at runtime; no images or personal memories are generated while browsing. The simple alternative uses the actual registered street camera and procedural cloud cover. These layers do not substitute overview map art or alter source footprints or scene art/data revisions.

Maintain a **registration package** and a **presentation package**. The first contains evidence, source dates, geometry, transforms, classified regions and uncertainty. The second contains illustrated ground tiles, textures, simple volumes, sprites, interior images and labels. Both share stable spatial IDs and explicit transform versions.

The historical map/satellite layer is a workbench reference, not the default viewer surface. The illustrative surface may simplify detail while preserving the relationships that make the walking route recognizable. Do not mistake a visually seamless image for a geographically registered map.

> For Xinhua/Sanli, **source coordinates precede painting**. Read the [measured geographic source chain](GEO_DATA_LINEAGE.md) and [acquisition/QA runbook](GEO_DATA_RUNBOOK.md) before positioning buildings or making new imagery. The [R6 implementation record](research/XINHUA_SPATIAL_PIPELINE.md) owns the later reviewed source-selection-to-render transition.

## Choose the minimum useful representation before researching depth

The 2026-10-27 selected Xinhua junction close-scene and its [reusable outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md) retain the accepted spatial/contour process, sparse retracting motion and ink-occlusion rules. The junction library remains a reusable source; the accepted Sanli extension is now integrated at the main street entry, while overview raster art remains unchanged. Omit overhead wires by default in this near-scene family: their uncertain time-dependent layout adds research/rendering work without improving the selected memory representation. Retain sparse simplified lamps; reopen wire depiction only for an explicitly selected memory-relevant object. The scene manifest pins the selected version; technical parameters remain local calibration values.

First identify the route attachment and its memory role; then select overview/street depiction and activation independently. A gate/name plus short wall can be the final asset for a pass-by landmark. A few still images can be the final interior representation. Only a spatial memory that benefits from movement calls for a local scene.

| Selected outcome | Required production inputs | Not required by default |
| --- | --- | --- |
| Gate/frontage landmark | Supported street side and position/range, recognizable type, shared projection/scale and compatible boundary | Complete parcel perimeter, exact rear-building inventory or explorable rooms |
| Note | Approved text revision, object/route binding and period/source associations | New art or geometry merely because text was added |
| Illustrated sequence | Finite page plan, pinned images/text, provenance labels, explicit reading order and return origin | Accurate hospital floor plan, 3D corridors, dialogue engine or implied physical links |
| Local scene | Bounded walkable geometry, meaningful landmarks, attachments, period state, camera and collision checks | An entire campus or surrounding city |

Research remains necessary for an actual claim being made. Stop deep rear-layout/year research when it cannot change the chosen representation, route relationship or meaning. Modern source data may remain reference-only. A correct source date does not date the user's recollection. Material/type completion is reconstruction and never becomes a new source.

Do not promote a sequence to a scene simply because many images can be generated. Likewise, do not require exact campus extent before placing a supported gate at its street-facing anchor. Existing source provenance, coordinate conversion and permission requirements still apply to every data source actually used.

## Reference intake

Record source identity, actual capture/publication date or range, coverage, resolution where known, original coordinate system, processing history, access conditions, and reuse/publication status. A catalog listing is not a downloaded source; a satellite's nominal capability is not proof of Phase 1 coverage.

Research around 2000–2005 first. Candidate 1990/1995/2000/2005/2010 buckets are search windows, not required exact acquisition dates. Prior conversational leads are unverified leads until a task inspects the actual source and records its coverage. Public display, derived art use, and private reference use may need different treatment; record the decision rather than assuming all online images are unrestricted.

Preserve the source file without replacing it with a reconstruction. Registration uses control points or another explicit transformation with a revision and error notes. Record unverified school addresses and uncertain road segments rather than filling them from current geography.

## From registration to a stylized base

1. Establish a shared geographic extent, local metric frame, north/orientation convention, and pixel-to-world transform.
2. Draw or extract the meaningful road graph, footprints, parcels and known landmarks. Mark region classes such as dense low-rise housing, repeated slab housing, school/compound, open land and railway edge. Treat height as a separate approximate parameter.
3. Build one small style reference sheet and one representative tile pair for user review. Palette, line weight, ground treatment, building silhouettes and text treatment are versioned choices.
4. Export content masks and line/edge references from the registered skeleton. Generate illustration from those constraints and the selected style, not from an unconstrained request to imagine a neighborhood.
5. Inspect output against the skeleton before it is used as a map. Restore functional roads/labels from controlled layers or reject/rework a tile that moved meaningful structures.

Avoid double perspective: if raised buildings will be real boxes/sprites, the ground tile must not already contain another incompatible oblique building projection. Separate flat ground art, building surfaces and overlays. Labels are preferably rendered from registered text data instead of being permanently generated into image pixels.

## Tiling and seams

Every tile recipe declares its core world extent, a larger padded extent, output dimensions, style revision, transform revision, geometry/mask hashes and source references. Neighboring tiles share world coordinates and references across their overlap. An initial overlap of roughly 10–20% is a tunable experiment, not a guaranteed seam solution or required production value.

Generate in padded extents. Compare overlaps in the same registered frame. Lock reliable overlapping landmarks and road edges; blend low-information texture areas and, when necessary, repair a narrow joint using both neighbors as constraints. A shared prompt or seed does not guarantee identical buildings, lines or colors.

Crop to non-overlapping core extents only after the join is accepted. Store seam dependencies so replacing one tile invalidates the appropriate boundary checks, not the entire map. Tile boundaries must not determine where a road stops or where a memory ID changes.

Test the joined pair at the expected camera view and at multiple scales: road continuity, roof/ground boundaries, repeated patterns, color transitions, no duplicated buildings, and hit-target registration. Keep diagnostic overlays in the workbench. The user sees a coherent map, not a visible production grid.

## Raised street-edge assets

Use footprint width/length and approximate height for simple boxes or slab-building variants. Apply representative facade/roof materials derived from permitted photographs or generated drafts. A small set of compatible templates can cover much of the background without exact window-by-window reconstruction.

The actual footprint, entrance and street-side relationship remain separate from decorative facade detail. Important local buildings can override a template. Generic visual completion is allowed as reconstruction; invented named shops, readable historical slogans, or new personal claims must not masquerade as evidence.

Repeated templates use pinned revisions. Improve a template through a preview batch; do not change every accepted street automatically. Performance/detail changes must preserve scene identity and the same spatial hit targets.

## Interior images, sequences and shallow spaces

Build a finite `SceneSequence` when internal geometry is not the memory object. Pages may show a corridor, waiting area, room or store impression, each with independent evidence and reconstruction labels. Store explicit reading order and optional selected links; adjacent pages do not establish adjacent physical rooms. The viewer is image/text browsing, not simulated walking through an invented plan.

A local explorable scene is a separate choice for a familiar yard, meaningful school area or small corner. It may use shallow geometry and still-image destinations; no complete mesh or exact furniture arrangement is compulsory. Its only default entry is a route/local-scene attachment, and its return origin is session-owned.

A target manifest records exact asset/text revisions, source type, approximate period, optional hotspots and return behavior. Generate assets during authorized authoring only, cache/pin them, and load on demand. No browse-time World Labs or other generation request is implied.

## One photograph, many useful derivatives

Preserve the original and annotate regions: facade, roof, street surface, boundary wall, background building, window pattern, or color/material reference. Each derived crop/material/model parameter points back to the original region. Keep camera location distinct from the location of visible subjects.

A newer photo can inform a plausible material or unchanged shape, but cannot establish that the same object existed in an earlier period without supporting evidence. Record that use as inference. A generated derivative must never become a new independent historical source in subsequent rounds.

## Generation and approval contract

A generation request includes the intended place/scene, period, view, source regions, spatial masks, desired style revision, permitted inference, forbidden new factual details, target format, resource envelope, and acceptance consumer. Keep private prompts/references in the private archive.

Use a generation adapter when the capability is available and authorized. When unavailable, record the gap and deliver a clearly marked draft or specification rather than calling a procedural placeholder the approved image-generated result. Do not invent tool execution, asset delivery, licensing or visual acceptance.

Review **registration**, **appearance**, **text**, and **publication** separately. Pin accepted assets by checksum/revision in an immutable manifest. Opening a memory never regenerates its image. Corrections create a local proposed replacement, with before/after views at the same camera and period.

## Publication package

Publish only selected revisions and the required derivatives, with source-type labels and usage metadata appropriate to the audience. Keep trial paintings, visual examples, contact sheets, unused generations, intermediate masks, batch prompt dumps and one-off example scripts outside the repository. Commit only selected production assets and concise necessary provenance; see [repository storage](HANDPAINTED_MAP_ART.md#repository-storage). The package must be replaceable/withdrawable without losing the private author's archive, subject to authorized deletion requirements.

## Historical dual-scale illustration assets — DM-0003

The overview is an original hand-drawn map with deliberately simplified proportions. It is not the street renderer's ground texture. Store node/edge correspondences in a separately revised mapping file. Place/door footprints and clickable regions remain structured records.

For the close scene, prepare front-elevation PNGs with real alpha and a shared ground baseline. Stand them upright along a metric sidewalk, with shallow returns only where the view needs them. Character feet and occlusion are renderer concerns. Do not bake the controllable person into the map or bake a second incompatible perspective into facade planes. Fog and direction signs bound unfinished areas.

That batch's cinema, houses, shopfronts and gate are generic candidates, not observed historical facades. Reference artists were linked for visual research; their artwork is not redistributed in the app. Original generated assets and provenance are in `assets/scenes/README.md` and `assets/maps/generation-journal-r1.json`.

## Historical DM-0010 candidate batch

Two original transparent sheets and fifteen cropped small-scale compound/building motifs are retained in `assets/candidates/overview-r1/`. Their catalog has no geographic registration and does not replace active overview assets. The new street prototype uses original procedural geometry to settle scale and movement first; these overview sprites are not used as street people or facade strips.

## Selected Sanli intake

The accepted sanli-outline-r5 runtime/data/font is production-selected and integrated through the existing street entry. Retain exact source IDs, original geometry, dependency/font licences and immutable hashes. Do not intake sandbox snapshots, rejected images, raw reference photos or one-off builders that depend on private local paths. Geographic corrections belong in final scene data unless they expose a reusable acquisition/filtering/validation lesson; the [outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md) owns those lessons.

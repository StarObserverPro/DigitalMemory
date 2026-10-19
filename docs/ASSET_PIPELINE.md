# Map, image and scene asset pipeline

> World Labs / Marble 2 is a proposed street-generation experiment, not an implemented adapter or a replacement for the hand-painted overview. [Setup and handoff](WORLDLABS_HANDOFF.md) records local CLI setup, account/output unknowns, the orthographic-to-pinhole camera mismatch and the bounded sample proposal. No generation has been submitted by that handoff.

> DM-0015 correction: [hand-painted map art](HANDPAINTED_MAP_ART.md) owns visible medium, contextual generation, tower identity and projection/scale acceptance. SVG is planning only, never map art or a runtime art fallback. The older ≤1.5 native/display ratio is a recorded r4 experiment, not a universal requirement; it must not erase paint or tower storeys. Never repair raised art with unrestricted affine fitting.

> [Scale-budgeted workflow](ASSET_WORKFLOW_VALIDATION.md) retains source, crop, anchor and assembly checks. Its older isolated-atlas and SVG-fallback choices are superseded by the DM-0015 correction.

> DM-0007: follow [MAP_ASSEMBLY](MAP_ASSEMBLY.md) for three overview tiers, independently replaceable pale context, compound children, and road-only bridge/retaining-wall parts. The same style must hold across scales. Accepted general style is not approval of a specific asset, location or chronology.

> DM-0004 uses original independent paper, apartment overview/front, single-shop and child cutouts in `assets/modules/`. The prior all-in-one illustration and long street strip are superseded. See [photo observations](LOCAL_VISUAL_REFERENCES.md) and [composition/storage contract](LAYER_COMPOSITION.md).

Status: production contract; DM-0002 adds a contemporary OSM orientation extract, two vector map candidates and one generated style candidate. Historical imagery and accepted production tiles remain open.

Implementation update: the first planar explorer, shared registration transform, sparse-time/session modules, public adapter and candidate assets now exist; [RUNTIME](RUNTIME.md) records the implemented subset and explicit gaps. The original contract below remains the target, not a claim of complete capability.

## Two products, not one flattened picture

Maintain a **registration package** and a **presentation package**. The first contains evidence, source dates, geometry, transforms, classified regions and uncertainty. The second contains illustrated ground tiles, textures, simple volumes, sprites, interior images and labels. Both share stable spatial IDs and explicit transform versions.

The historical map/satellite layer is a workbench reference, not the default viewer surface. The illustrative surface may simplify detail while preserving the relationships that make the walking route recognizable. Do not mistake a visually seamless image for a geographically registered map.

> For Xinhua/Sanli, **source coordinates precede painting**. Read the [measured geographic source chain](GEO_DATA_LINEAGE.md) and [acquisition/QA runbook](GEO_DATA_RUNBOOK.md) before positioning buildings or making new imagery. The [R6 implementation record](research/XINHUA_SPATIAL_PIPELINE.md) owns the later reviewed source-selection-to-render transition.

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

## Interior images and shallow spaces

Campus/corridor geometry is optional and purpose-driven. A classroom can be a single generated reconstruction from the doorway, an original photograph, or a composition of both with explicit provenance labels. No requirement exists to produce a complete room mesh, physically exact furniture arrangement, or free movement.

A scene records its viewpoint, subject place, period association, image revision, hotspots, associated memories, and return portal. Original image, restoration/edit, composite, and generated reconstruction remain distinguishable. The source label accompanies viewing; it is not hidden only in metadata.

## One photograph, many useful derivatives

Preserve the original and annotate regions: facade, roof, street surface, boundary wall, background building, window pattern, or color/material reference. Each derived crop/material/model parameter points back to the original region. Keep camera location distinct from the location of visible subjects.

A newer photo can inform a plausible material or unchanged shape, but cannot establish that the same object existed in an earlier period without supporting evidence. Record that use as inference. A generated derivative must never become a new independent historical source in subsequent rounds.

## Generation and approval contract

A generation request includes the intended place/scene, period, view, source regions, spatial masks, desired style revision, permitted inference, forbidden new factual details, target format, resource envelope, and acceptance consumer. Keep private prompts/references in the private archive.

Use a generation adapter when the capability is available and authorized. When unavailable, record the gap and deliver a clearly marked draft or specification rather than calling a procedural placeholder the approved image-generated result. Do not invent tool execution, asset delivery, licensing or visual acceptance.

Review **registration**, **appearance**, **text**, and **publication** separately. Pin accepted assets by checksum/revision in an immutable manifest. Opening a memory never regenerates its image. Corrections create a local proposed replacement, with before/after views at the same camera and period.

## Publication package

Publish only selected revisions and the required derivatives, with source-type labels and usage metadata appropriate to the audience. Keep trial paintings, visual examples, contact sheets, unused generations, intermediate masks, batch prompt dumps and one-off example scripts outside the repository. Commit only selected production assets and concise necessary provenance; see [repository storage](HANDPAINTED_MAP_ART.md#repository-storage). The package must be replaceable/withdrawable without losing the private author's archive, subject to authorized deletion requirements.

## Dual-scale illustration assets — DM-0003 correction

The overview is an original hand-drawn map with deliberately simplified proportions. It is not the street renderer's ground texture. Store node/edge correspondences in a separately revised mapping file. Place/door footprints and clickable regions remain structured records.

For the close scene, prepare front-elevation PNGs with real alpha and a shared ground baseline. Stand them upright along a metric sidewalk, with shallow returns only where the view needs them. Character feet and occlusion are renderer concerns. Do not bake the controllable person into the map or bake a second incompatible perspective into facade planes. Fog and direction signs bound unfinished areas.

Current art is a candidate: the cinema, houses, shopfronts and gate are generic reconstructions, not observed historical facades. Reference artists are linked for visual research; their artwork is not redistributed in the app. Original generated assets and provenance are in `assets/scenes/README.md` and `assets/maps/generation-journal-r1.json`.

## DM-0010 candidate batch

Two original transparent sheets and fifteen cropped small-scale compound/building motifs are retained in `assets/candidates/overview-r1/`. Their catalog has no geographic registration and does not replace active overview assets. The new street prototype uses original procedural geometry to settle scale and movement first; these overview sprites are not used as street people or facade strips.

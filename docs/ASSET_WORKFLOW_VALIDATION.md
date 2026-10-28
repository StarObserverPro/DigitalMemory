# Historical scale-budgeted map asset validation

> **Superseded trial rules:** [Hand-painted map art](HANDPAINTED_MAP_ART.md) and [ASSET_PIPELINE](ASSET_PIPELINE.md) own current overview production. They supersede the tiny-isolated-subject strategy, fixed 0.8–1.5 ratio gate, few-window tower treatment and visible SVG fallback described below. Preserve the old measurements as historical evidence. The later DM-0016 overview migration removed the active vector fallback; this page's r4 implementation notes are not current runtime status.

DM-0013, 2026-10-18. This was a validation-only batch followed by DM-0014's independent-part implementation. It rejected DM-0012's whole-illustration affine fitting and whole-image road masking. Its source/crop/anchor/assembly lessons remain useful under the current owners; its old production limits and fallback choices do not apply to new batches.

## Outcome of the validation

Three approximate compound layouts were rendered at three actual display scales: Qili, Wuli-west and Liuli, nine samples per atlas. Source geometry is retained from the r2/r3 satellite/OSM study; Liuli remains a roof trace with unresolved ground displacement. No new building identities or floor counts were established.

Attempt 1 passed seven size gates and returned two near samples for framing/aspect issues. It also added fine windows to very small subjects. Attempt 2 retained more atlas margin and removed those small facade grids; nine size gates passed. Its source-subject width/height were approximately 1.11–1.24 times the planned display dimensions. This is much closer than a 1000px subject reduced to 200px.

**This is a size/layout workflow pass, not geometric or aesthetic acceptance.** In `assembly-review.webp`, independent ground probes visibly diverge from some generated building bases even though the overall size is acceptable. Therefore the nine generated whole-compound images remain candidates and do not pass the production ground-registration gate. The new workflow successfully distinguishes an acceptable pixel budget from an incorrectly registered image. It must not silently convert size success into map acceptance.

Native evidence:
- `assets/candidates/pipeline-validation-r1/size-review.webp`: final-size comparison and measured native dimensions.
- `assembly-review.webp`: ground footprints and probes, independent road below, standing art above, uniform scaling only.
- `measurement.json`, `geometry-review.json`: status and limitations.
- `attempt-1/`: first layout, native atlas, crops and failure report.
- `prompts.json`: exact built-in image_gen prompts for both attempts.

The road in the assembly fixture is a deliberately schematic occlusion probe, not a new surveyed road inside any compound. The rectangles are reference-envelope diagnostics, not legally verified parcel boundaries.

## Node 1 — source ground definition

Input: satellite crop with its actual returned extent/CRS, source date or unknown date, and neighborhood/property evidence. Output: a source package with a crop-to-world transform, compound identity, candidate ground boundary, building footprints, gates and source uncertainty.

A satellite request bbox is not necessarily its returned image extent. Preserve the latter, image dimensions, aspect and processing history. Convert crop pixels through the source transform; never estimate metres from a screenshot with unknown zoom. Keep WGS84 and GCJ02 distinct. Tall-roof displacement remains uncertain until a ground footprint or other reference supports the correction. Source imagery informs geometry and typology; it is not redistributed with cleared original illustrations.

A compound's size comes from its ground extent or declared drawing reservation, not from a loose crop, transparent image margin, roof height, label or automatic alpha bbox. Shared walls and uncertainty may warrant a smaller subpatch. Four/Six, Five-east/Five-west and Seven retain separate identities even when drawn in one batch.

Return here for conflicting boundaries, unsupported ground/roof matching, wrong CRS or source aspect. Do not send an unresolved precise boundary to generation as established fact.

## Node 2 — display and projection budget

Input: ground geometry and the application's shared spatial transform, a named viewport and tier. Output: ground width/depth in metres; on-map ground width/depth in pixels; a fixed view convention; approximate displayed building heights; visual bounds and required overscan.

Budget conversion is:

`ground metres × spatial image units/metre × mapMetrics screen pixels/image unit`.

The validation uses a 1200×900 viewport, side=900 and the existing three stops 1/1.8/2.7. The resulting visual budgets below include the chosen illustrative heights; these are not physical building height measurements.

| Compound | Far visual W×H px | Medium visual W×H px | Near visual W×H px |
| --- | --- | --- | --- |
| Qili | 51×91 | 91×164 | 137×246 |
| Wuli-west | 100×72 | 180×130 | 270×195 |
| Liuli | 113×94 | 203×169 | 305×253 |

Ground bounds and visual bounds must be separate fields. A vertical tower extends upward in the image without expanding its ground reservation. The same camera/projection must be used to construct ground and raised forms. A sheet may translate/pack a view, but may not squeeze it into a cell. At different viewports choose the suitable asset tier or recalculate the stated scale range; do not claim one pixel budget covers every screen and arbitrary zoom.

## Node 3 — SVG planning contract (never production artwork)

Before generation, render the controlled SVG at the final-use dimensions in the intended map context. Review street width, setbacks, tower/slab orientation, spacing and external overlaps. The source plane may be projected once before drawing; an already raised illustration must never be sheared afterwards to match that plane.

This guide is not a visible production layer. Generated raster paint owns visible buildings, yards, plants and objects. SVG masks may retain the planning geometry but cannot supply painted faces or decorative paths. Converting such vectors to PNG is not a hand-painted replacement.

Keep these independent:
- Ground/yard wash: source plane, bounded/feathered as appropriate.
- Standing architecture: transparent cutout, explicit ground origin/baseline, crisp painted silhouette, visual overscan.
- Gates, fences, detached shops: short replaceable units with their own ground attachment and front/back relation.
- Text and interaction geometry: controlled data, outside generated pixels.

Whole-compound images are permissible for distant silhouette groups whose internal mismatch is below the declared final-size tolerance. For medium/near views, visible ground probes or independent foreground overlap can require splitting the group into rows or individual building components. A merged raster does not contain hidden facades: cropping cannot recover them. Return to component/SVG planning when this happens.

## Node 4 — atlas plan and image generation

Record the final display W/H before the call. Pack same-family, different-detail versions into a shared atlas with known cells, target subject bounds and reserved transparent margin. The subjects occupy their intended small areas inside the larger image. A 1200px sheet containing several 100–300px subjects is valid; a 1200px subject later shrunk to 200px is not.

Historical operating gates for this trial, superseded where noted above:
- Target source-to-display ratio near 1–1.25 per axis; hard upper bound 1.5 per axis. Below 0.8 returns for insufficient resolution. These are project operating limits, not universal graphics standards.
- Native **subject** size is measured on the actual returned image. Requested output size, full sheet dimensions and transparent padding cannot stand in for it.
- Any object touching its crop safety border returns for re-layout; expand the cell/sheet or split the object. Preserve image resolution and object budgets while repacking.
- Far: silhouette and one/two broad marks. Medium: limited grouped bands. Near: selected identifying marks. These are independently drawn detail tiers, not three exports of the same detailed image.

The built-in tool does not expose an exact output-size parameter here, so the SVG/prompt cannot guarantee native dimensions. Inspect the returned canvas, map the planned cells to it, then measure. If the native ratio exceeds the gate, repack more useful components, split a large group or regenerate with a smaller occupied region. Cropping blank margin alone does not reduce the subject's excessive detail. Do not meet the rule by upscaling a file first or discarding metadata.

## Node 5 — crop, scale and geometry checks

Store native sheet size/hash, cell rect, trim offset, alpha threshold, source subject W/H, final budget, uniform scale, ground anchor and visual bounds. Preserve alpha. Crop before deriving the anchor relative to the exported asset; account for both cell offset and trim offset. A crop does not change the object's world position.

Use **one uniform scale** for the raised artwork. If width and height cannot both fit within the agreed tolerance, return to geometry/component planning or generation. No unrestricted affine or `preserveAspectRatio="none"` repair of an illustrated compound. A lower residual after shearing an image does not mean its geometry was correct.

Check independent ground probes, not just an alpha envelope or control points fitted from the same image. At least three well-spread non-collinear ground locations and an extra withheld check are useful for a rigid group; probes must belong to identifiable visible ground corners, not roof corners or transparent canvas corners. Keep matching uncertainty separate from fit residual. Exclude a hidden probe rather than pretending its position was observed.

Working final-size tolerance for the next grounded batch: max(2px, 2% of compound ground width), subject to source uncertainty. This tolerance is a declared proposal, not a retroactive pass for this batch. If the source itself is less certain, report that wider uncertainty separately. Internal probes that diverge after uniform placement require subdivision or a new render, not free image deformation.

Return paths:

| Failure | Return node / remedy |
| --- | --- |
| Subject 1000px for a 200px display | Node 4: smaller occupied region, denser sheet packing or component split |
| Border clipping | Node 4: enlarge safety margin/cell, preserve subject budget |
| Aspect mismatch or individual feet drift | Nodes 1–3: check source/projection; split rigid groups |
| Far view covered in tiny windows | Node 4: simplify marks and redraw this tier |
| Ghost rim or pale box | Nodes 3–4: separate ground wash and standing art; check alpha over map paper |
| Road cuts building facade/roof | Node 6: remove whole-image road mask; correct front/back relation |
| New shop needs hidden wall | Node 3: generate a replaceable module with required visible sides |

## Node 6 — assembly and edge acceptance

Ground wash may blend into the city's common paper and vegetation layer. Building walls and roofs retain painted boundaries; do not feather the whole compound into a ghost image. Bake neither a rectangular paper tile nor the main road into a building component. Inspect actual alpha over light and dark review backgrounds, at final size.

Draw ground art and road surface in their plane, then standing architecture according to ground depth, with explicit exceptions for bridge decks, near/far walls and other raised structures. Standing buildings may visually cover a road behind them; their ground footprints may not occupy a protected walking corridor. Apply a road-exclusion mask to ground filling where necessary, not to the whole raised-building image. If one compound needs to interleave with external objects, split it into appropriate groups.

Review at named far/medium/near fixtures and a representative phone fixture, with neighboring compounds and normal label budgets. A correct native diagnostic is not a browser walkthrough. This validation checks atlas sizes and provides ground/occlusion diagnostics; it does not deliver a new production renderer or establish a complete mobile walkthrough.

## Historical reproduction and completion states

Run from repository root with Pillow, NumPy and the existing runtime Node sharp:

```
python scripts/validate-asset-workflow.py
python scripts/validate-asset-workflow.py /absolute/path/to/generated-atlas.png
python scripts/render-workflow-assembly.py
```

The guide preparation uses retained r3 layout/source metadata and does not need to distribute original satellite pixels. First-attempt files are retained separately because changing atlas dimensions changes all cell coordinates. The current script recreates the second-attempt plan. The generated native WebP copies retain returned resolution and alpha; PNGs remain tool originals.

Per batch record these independently: source adequacy, final-size budget, crop integrity, ground correspondence, edge/occlusion review, aesthetic approval, consumer integration and publication. Passing early nodes never activates later release states automatically. DM-0013 ends with nine size passes and **ground correspondence requiring rework**, no automatic production replacement.

## Historical DM-0014 implementation — projection, small marks and lived-in ground

The requested map upgrade now implements independent building/short-row placement for Qili, Wuli-west and Liuli. Atlas r4 contains medium/near variants; 37 meet the native/display limit and one medium segment uses the controlled source sketch. At other viewport scales the renderer checks the current pixel ratio and uses the sketch when necessary. Far silhouettes use a few window dots, not a detailed raster shrunk several times.

The projection convention is north-up cartographic oblique: source ground x/y plus a single screen-up illustrated height direction. This is coordinated axonometric presentation, not strict equal-axis isometric projection. All parts are prepared in that convention before generation; each image is uniformly scaled and positioned from its own source ground origin. Boundary/roof uncertainty in the retained source remains recorded. The previous whole-compound affine and its 3-corner canvas controls are no longer the runtime placement method.

Ground and standing objects now have distinct drawing passes. Ground excludes buildings and public road corridors; source-height standing art is depth-sorted above the ground/road layer with small yard trees. The gray line in the DM-0013 assembly review was a schematic road-occlusion probe, not source geography and not part of the released map.

The compound ground brief is roughly balanced patchy grass and worn hardscape in the gaps between buildings/paths. Use muted irregular grass, missing patches and a few small clutter marks; avoid a manicured continuous lawn. Roadside large trees are omitted. A few small, thin-trunk tree suggestions can sit inside yards. These are ambience details and remain separate from registered remembered places. Tree positions avoid footprints and source road corridors.

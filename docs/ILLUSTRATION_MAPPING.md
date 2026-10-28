# Illustrated overview ↔ sidewalk scene

> View/compositing requirements: [MAP_ASSEMBLY](MAP_ASSEMBLY.md). The overview has three tiers and no person; the selected Xinhua/Sanli close view uses an elevated perspective camera and the continuous outline figure. The retained 140 m sample below is historical implementation evidence, not proof that the generalized route-attachment contract has been migrated.

> DM-0009 supersedes the overview's displaced building proxies. `overview-registration.json` stores public source anchors and parcel associations; all overview anchors use the same transform as roads. The theatre no longer uses the old eastward display offset. Street fixtures remain separate. See [layer composition](LAYER_COMPOSITION.md).

The overview and close view are two presentations of one registered location: a hand-drawn/cartoon/travel-journal overview leads into the selected outline street, where the person walks on supported ground. Painted scenic flats remain a historical implementation/reference rather than a required replacement for the accepted close view. Normal selection follows area → route → roadside attachment; an overview place silhouette is not a direct content portal.

## Correspondence, not an image-wide GPS warp

| Record | Geographic meaning | Drawing / scene meaning |
| --- | --- | --- |
| Place ID | Stable identity, independently revised WGS84 geometry | Optional illustrated landmark/label; enlargement does not create an overview content hit target |
| Node ID | Street endpoint or shape control from a referenced road | Authored point in the 1200 × 1200 artboard |
| Edge ID | Geographic polyline and its endpoints | Drawn path connecting the same nodes |
| `{edgeId, t, direction}` | Current route location, interpolated from real geometry | Street-entry anchor on the overview (no map person); character feet in the entered street |
| Street offset + heading | Sidewalk-local motion in metres | Grounded character and close follow camera |
| Route attachment / target | Place/object relation; historical entrance may be uncertain; valid approach belongs to a route side | Painted gate/object and local activation range; note, sequence or local scene shares a saved street origin |

An illustrated building can be larger than its physical footprint. A curved road can be simplified. Topological identity, point order, declared connections and the entrance's owning edge must remain explicit. A coordinate correction does not change place identity. A new drawing revision does not reset where the person has walked.

There is intentionally **no global inverse from every image pixel to a geographic location**. Only registered nodes, edges and anchors have correspondence. Clicking the illustrated street snaps to its authored edge; empty paper and decorative buildings are not geocoders. A separate authoring/QA surface may show both coordinate systems; there is no mapping inspector in the consumer experience.

## Overview registration and the retained 140 m fixture

`content/public/illustration-mapping.json` owns the illustration registration. It links the 11 shape/end nodes and 10 edges of contemporary OSM way `176437964` (新华街). Those are not 11 confirmed intersections, historical walking waypoints or doorways. This sample is one ordered chain; branching routing is not yet implemented. The data preserves explicit `from`/`to` IDs so verified branches can be added later.

The legacy close scene covers distances 360–500 m along that reference centreline. It uses the same local metric transform as geographic registration and keeps the person on a 4.65–7.05 m prototype sidewalk offset. Width, pavement, facades and the courtyard are art geometry, not measured historical dimensions. The door fixture is at `xinhua-edge-4, t=0.82`; its real historical entrance is `null`. These values do not bound the later outline corridor.

At initial position `xinhua-edge-4, t=0.70`, the source coordinate is approximately `(116.28452728, 39.84203692)` and the artwork position is `(763.2, 832.3)` on the 1200-unit artboard. These are a public street reference, not a private residence or an assertion about the user's actual walk.

In that retained fixture, entering the street preserves this pair. Moving updates route progress and derives both positions again. Entering the synthetic courtyard/room captures route, sidewalk offset, heading, period, selection and view. Return restores the snapshot. Its evidence is not an outline-scene portal walkthrough.

## Selected outline consumer

The active Xinhua entry uses `outline-registration.json` and `createLocalSceneFrame` to map the chosen overview route into the local-metre scene. `session.outline` retains the registration revision and origin route plus position, camera, path and visited destinations. Re-entry validates the saved pose against that revision/entry and supported navigation; a new route or incompatible revision receives a valid new entry. The overview correspondence remains the route-entry authority, while the selected scene supplies local walking geometry. [DATA_MODEL](DATA_MODEL.md#selected-outline-session-state) owns the implemented state fields; [RUNTIME](RUNTIME.md) owns loading and resource lifecycle.

## Asset and registration ownership

- `src/domain/spatial.js`: authoritative WGS84 / metric frame and place geometry.
- `src/domain/illustration.js`: authored correspondence validation and route motion.
- `src/application/session.js`: sole current route / street / period / portal owner.
- `src/explorer/main.js`: overview consumer; the former correspondence inspector is not part of the ordinary UI.
- `src/explorer/outline-stage.js` and `scenes/xinhua-sanli-outline/runtime.mjs`: selected registered street adapter and rendering/input; no historical record ownership.
- `src/explorer/stage.js`: retained legacy street renderer; its former camera and courtyard evidence are historical.

The map and facade textures are separate assets. Do not reuse a perspective map as an upright facade or add another roof projection on top of painted buildings. Source artists' examples inform the category, not app-distributed copies.

## Attachment mapping and symbolic bounds

Keep route ID/revision, canonical edge direction, progress/range and side explicit. Multiple entries may point to the same place without duplicating its identity. Nearest-line snapping cannot establish a valid pedestrian entrance across a wall, carriageway or level change.

Source footprint, illustration silhouette, runtime collision and attachment hit area are independent. Enlarging a gate to improve recognition may cover vague rear context, but must not move its street anchor or hide a meaningful neighboring route. At overview scale it remains orientation artwork; activation is resolved only in the entered route context.

Existing ordered-chain/progress logic is a foundation, not a claim that arbitrary multi-route attachment remapping has been implemented.

## Registration review still required

The real geometry is contemporary orientation. The artistically displaced coordinates and landmark drawings are a candidate. Check each place anchor, intended street side, doorway, path continuity and source period before accepting a release. The two old school sites remain unplaced. Aesthetic approval does not certify historical accuracy. Roads not in the mapped walking chain cannot silently become traversable connections.

## Visual references consulted

- [Leslie Fehling — watercolor Bruges map](https://www.lesliefehling.com/newwwww/): selective streets, recognizable building sketches and travel-journal composition.
- [Ya-Ling Huang — Maps: From Anna to Zane](https://www.pickledink.com/blog/maps-from-anna-to-zane-illustrated-by-ya-ling-huang): hand-drawn streets and playful building scale.
- [Tom Woolley — illustrated London map](https://tomwoolley.com/illustrated-map-of-london/): selected landmark icons with legible geographic relationships.

Reference images were inspected for visual research only; they are not bundled in this repository.

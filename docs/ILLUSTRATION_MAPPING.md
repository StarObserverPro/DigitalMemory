# Illustrated overview ↔ sidewalk scene

> Current view hierarchy and compositing rules: [MAP_ASSEMBLY](MAP_ASSEMBLY.md). The overview has three tiers and no person; street entry uses moderately elevated chibi framing. The bounded implementation described below is not yet migrated.

> DM-0009 supersedes the overview's displaced building proxies. `overview-registration.json` stores public source anchors and parcel associations; all overview anchors use the same transform as roads. The theatre no longer uses the old eastward display offset. Street fixtures remain separate. See [layer composition](LAYER_COMPOSITION.md).

This is the current user-directed visual contract: a hand-drawn/cartoon/travel-journal overview; enter a street to put a person on its sidewalk; stand painted facades up as cinematic scenic flats. Distant/unbuilt areas fade into fog and directional cues. The overview and close view are two presentations of one location.

## Correspondence, not an image-wide GPS warp

| Record | Geographic meaning | Drawing / scene meaning |
| --- | --- | --- |
| Place ID | Stable identity, independently revised WGS84 geometry | Illustrated landmark anchor, label/hit region; can be enlarged |
| Node ID | Street endpoint or shape control from a referenced road | Authored point in the 1200 × 1200 artboard |
| Edge ID | Geographic polyline and its endpoints | Drawn path connecting the same nodes |
| `{edgeId, t, direction}` | Current route location, interpolated from real geometry | Street-entry anchor on the overview (no map person); character feet in the entered street |
| Street offset + heading | Sidewalk-local motion in metres | Grounded character and close follow camera |
| Portal ID | Place relation; historical entrance may be unknown | Painted door and proximity range; session snapshot on entry |

An illustrated building can be larger than its physical footprint. A curved road can be simplified. Topological identity, point order, declared connections and the entrance's owning edge must remain explicit. A coordinate correction does not change place identity. A new drawing revision does not reset where the person has walked.

There is intentionally **no global inverse from every image pixel to a geographic location**. Only registered nodes, edges and anchors have correspondence. Clicking the illustrated street snaps to its authored edge; empty paper and decorative buildings are not geocoders. A separate authoring/QA surface may show both coordinate systems; there is no mapping inspector in the consumer experience.

## Current bounded implementation

`content/public/illustration-mapping.json` owns the illustration registration. It links the 11 shape/end nodes and 10 edges of contemporary OSM way `176437964` (新华街). Those are not 11 confirmed intersections, historical walking waypoints or doorways. This sample is one ordered chain; branching routing is not yet implemented. The data preserves explicit `from`/`to` IDs so verified branches can be added later.

The close scene covers distances 360–500 m along that reference centreline. It uses the same local metric transform as geographic registration and keeps the person on a 4.65–7.05 m prototype sidewalk offset. Width, pavement, facades and the courtyard are art geometry, not measured historical dimensions. The door fixture is at `xinhua-edge-4, t=0.82`; its real historical entrance is `null`.

At initial position `xinhua-edge-4, t=0.70`, the source coordinate is approximately `(116.28452728, 39.84203692)` and the artwork position is `(763.2, 832.3)` on the 1200-unit artboard. These are a public street reference, not a private residence or an assertion about the user's actual walk.

Entering the street preserves this pair. Moving updates route progress and derives both positions again. Entering the synthetic courtyard/room captures route, sidewalk offset, heading, period, selection and view. Return restores the snapshot. Returning to the overview retains the updated route position.

## Asset and registration ownership

- `src/domain/spatial.js`: authoritative WGS84 / metric frame and place geometry.
- `src/domain/illustration.js`: authored correspondence validation and route motion.
- `src/application/session.js`: sole current route / street / period / portal owner.
- `src/explorer/main.js`: illustrated map and opt-in correspondence inspector.
- `src/explorer/stage.js`: local Three.js scenic planes, minimal ground, fog, avatar and input; no historical record ownership.

The map and facade textures are separate assets. Do not reuse a perspective map as an upright facade or add another roof projection on top of painted buildings. Source artists' examples inform the category, not app-distributed copies.

## Registration review still required

The real geometry is contemporary orientation. The artistically displaced coordinates and landmark drawings are a candidate. Check each place anchor, intended street side, doorway, path continuity and source period before accepting a release. The two old school sites remain unplaced. Aesthetic approval does not certify historical accuracy. Roads not in the mapped walking chain cannot silently become traversable connections.

## Visual references consulted

- [Leslie Fehling — watercolor Bruges map](https://www.lesliefehling.com/newwwww/): selective streets, recognizable building sketches and travel-journal composition.
- [Ya-Ling Huang — Maps: From Anna to Zane](https://www.pickledink.com/blog/maps-from-anna-to-zane-illustrated-by-ya-ling-huang): hand-drawn streets and playful building scale.
- [Tom Woolley — illustrated London map](https://tomwoolley.com/illustrated-map-of-london/): selected landmark icons with legible geographic relationships.

Reference images were inspected for visual research only; they are not bundled in this repository.

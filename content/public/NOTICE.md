# Public data notice

`orientation.json` is a selected extract from the OpenStreetMap API, retrieved 2026-10-18 UTC. Original endpoint:

https://api.openstreetmap.org/api/0.6/map?bbox=116.27,39.833,116.304,39.862

Only selected road/rail geometry, seven named public neighborhood polygons, 92 unnamed representative building footprints, and four general public anchor positions are retained. The application frame is the smaller approximate square described by `bounds`. Ways that cross the frame may extend outside it and are clipped by the renderer. Unrelated POIs, building occupants, private unit numbers and contributor personal information are omitted. OSM element IDs are retained for provenance. The street anchor is a display point on a public road, not a route or a remembered entrance.

© OpenStreetMap contributors. Geographic database content is available under the [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Maps made from this extract must retain attribution. This database license is separate from the repository MIT license.

This is contemporary geographic reference. No exact capture date, historical equivalence, completeness or survey-grade precision is asserted. It is not an acquired historical satellite or map-tile package. WGS84 is explicit; no GCJ-02/BD-09 coordinates were merged into it.

`demo-*.json` contains expressly synthetic fixtures. It is not user-authored memory content and is hidden until the viewer chooses to try the demonstration.

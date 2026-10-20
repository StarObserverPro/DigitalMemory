# Fengtai Four Ring underpass: evidence boundary

Research date: 2026-10-18. Purpose: constrain the road assembly, not reconstruct an exact surveyed cross section.

Historical bridge generations, alias conflicts, old-bridge demolition uncertainty and the separate 2020 railway arch are indexed in [Fengtai bridges and Zhengyang Street public research](FENGTAI_BRIDGES_ZHENGYANG.md). This underpass note remains limited to road-profile evidence.

| Observation | Source and status | Consequence |
| --- | --- | --- |
| The newer bridge complex includes separate road and railway bridges; Four Ring passes under the railway bridge. The road bridge connects Zhengyang Street across Four Ring. | Fengtai Times, 2025-02-28, citing local gazetteers: [article](https://www.bjft.gov.cn/fengtaishibao/html/2025-02/28/content_9506_18302103.htm). Read in full. | Preserve separate crossing identities and explicit upper/lower relationships. Do not draw the railway below the road. |
| North road bridge / south railway bridge are key orientation anchors. | User-specified topology, consistent with the earlier imagery inspection; exact part geometry is not registered here. | Independent bridge assemblies and camera occlusion; no combined generic bridge sticker. |
| The recalled underpass has a visually prominent tall concrete wall, roughly 7–10 m. | User description; no measured dimension or exact side/run has been verified. | Road-owned retaining-wall type and variable height profile. Store the range as recalled, not as survey data. |
| A newer six-track steel arch crosses above the existing Four Ring railway frame bridge. | Railway project report, supplied by People’s Railway and published 2020-04-10: [report](https://www.thepaper.cn/newsDetail_forward_6902647), read in full. | Modern bridge imagery must be date-filtered before use for a mid-2000s scene. |
| Current service-road configurations may differ from historical ones. | A 2024 report describes a roughly 240 m widening on the outer service road near Fengtai No.5 Primary School: [report](https://finance.sina.com.cn/jjxw/2024-04-22/doc-inastanv3148907.shtml). Context only; not a 2005 profile. | No automatic transfer of contemporary lane counts/widths to the historical map. |

The 2025 gazetteer account gives bridge-hole clearance, not the height of the remembered retaining wall. These quantities cannot be substituted. Older and newer reports also use different dimensions/bridge scopes; this change deliberately does not adopt a precise bridge width/length as a construction measurement.

## Map/street-view attempt

- Baidu Maps loaded its map interface, but the `丰台大桥` search did not return bridge-area results; the viewport remained at national scale.
- Amap located the search interface in Beijing but presented a login/human-verification slider; satellite/3D also reported unavailable in the browser. No verification challenge was attempted.
- Therefore **the tall wall has not been visually verified in Amap/Baidu street view in this task**. No unseen image or failed query is recorded as evidence.

## Required observations before actual drawing

Inspect the approach, bridge hole and exit for each accessible walking/service path; capture view direction and image date. Identify which wall face belongs to which road, its start/end and top/bottom ground levels, the bridge/deck above it, railings, openings and any pedestrian separation. Match road and railway crossings without conflating the later steel arch. Keep uncertain spans unresolved rather than giving them decorative symmetry.

Wall materials and upper ground are road components. Adjacent buildings are separate identities with independent ground reservations. Occlusion order must keep the depression readable in the oblique map and in the street; do not solve a hidden road by moving a building into the sidewalk.

Synthetic profile values in `tests/fixtures/map-assembly.mjs` only prove that the software can represent different main/service/walk elevations. They are not measurements or a proposed final drawing of this bridge.

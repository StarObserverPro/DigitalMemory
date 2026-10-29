# Geographic result contract

Geographic investigation is performed outside the repository. Only permitted conclusions, their uncertainty and minimal mandatory dataset attribution enter public files. The absolute boundary in [CONTENT_PIPELINE](CONTENT_PIPELINE.md#地理资料的绝对公开边界) applies to every export and metadata field.

## Scope and consumers

This page defines the permitted spatial result contract within [the four-layer architecture](ARCHITECTURE.md#layer-scopes). [MAP_ASSEMBLY](MAP_ASSEMBLY.md#map-geography-scope) owns the geography/presentation boundary; [GEO_DATA_RUNBOOK](GEO_DATA_RUNBOOK.md) owns engineering integration discipline.

| Result | Authority | Consumer boundary |
| --- | --- | --- |
| Place, node and edge identity | Spatial registry | Menus, image groups, cache chunks and content revisions retain these identities rather than replacing them. |
| Geometry, frame and registration revision | Spatial registry / illustration mapping | UI hit tests and visual adapters consume the registered transform; no independent pixel-to-geography inference. |
| Height, valid period and uncertainty | Separate spatial/time fields | Display height, omitted contours and visual emphasis cannot revise physical height or certify an earlier state. Temporal selection stays with the resolver. |
| Ground and route/entrance relationships | Registered spatial records | Navigation derives access under the approved interaction policy; destination arrival and memory activation remain distinct operations. |

Source polygons, projected local geometry, display rings, image-alpha bounds and hit regions must remain distinguishable. Keep the revision connecting these derivatives to their source result. Revisions and hashes support engineering consistency; they carry no investigation narrative and are not historical proof. A result whose entrance or period is unknown stays unknown even when usable artwork exists.

## Selected spatial data

- The selected overview plan contains 195 objects. Full geographic polygons remain distinct from exterior display rings; group envelopes organize artwork and labels, not cadastral boundaries.
- Position, height and historical validity are independent. Height estimates and approximate geometry remain marked; contemporary geometry does not establish an earlier state.
- The source plan, spatial registry, time resolver and selected scene retain their existing ownership. Data IDs required to join production geometry are technical identifiers, not investigation records.
- The historic school records remain unresolved; no entrance or parcel is registered by this documentation.
- [Spatial/render contract](research/XINHUA_SPATIAL_PIPELINE.md), [result rules](GEO_DATA_RUNBOOK.md) and [verification](VERIFICATION.md) govern integration.

## Minimal dataset attribution

OpenStreetMap contributors: ODbL, https://www.openstreetmap.org/copyright . Overture Maps buildings: ODbL, https://docs.overturemaps.org/attribution/ . East Asia building polygon dataset: CC BY 4.0, DOI 10.5281/zenodo.8174931. These credits do not authorize redistribution of photographs or proprietary map imagery. The repository MIT licence does not replace third-party terms.

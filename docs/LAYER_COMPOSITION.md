# Roads, shells, occupants and people

The r3 implementation replaces the monolithic map and repeated full-street strip. `scene-composition.json` is read through `createComposition`; overview and close street are render adapters of this registry.

| Layer / owner | Stable identity | What can change independently |
| --- | --- | --- |
| Road registration / spatial registry | source road ID + geometry revision; node/edge IDs | A road revision or drawing-space node layout. Existing route progress remains `{edgeId,t}`. |
| Building shell / composition | building ID, route anchor, side, setback, dimensions, shell revision | Building asset or future shell state; shops do not own or move it. |
| Frontage slot / composition | slot ID, building ID, offset, width, height | A tenant or image can be inserted without re-cutting adjacent buildings. |
| Occupancy / time resolver | occupancy ID, slot ID, explicitly supported period IDs | Shop name, frontage asset and sign. Unknown periods return no occupant, never nearest-year substitution. |
| Entrance / composition + session | entrance ID, slot ID, route parameter, scene ID | Destination scene and content. Return restores the originating session snapshot. |
| Character / session | profile ID, same route and sidewalk offset | Child/youth scale, sprite and camera eye height. Age is not guessed from calendar windows. |
| Paper / presentation | texture revision | Surface texture without geometry changes. |

## Concrete sizing and placement

The prototype is a 140 m route slice. North-side facade sections are 12 m wide, with two 4.3 m storefront slots. South-side service sections are 10 m, with one 5 m slot. The independent entry module is 5 m. An unknown block may reuse a type, but every instance has its own ID. These are authored typology proxies, not surveyed addresses.

Road width is 8.2 m, sidewalk navigation is bounded by the existing walk contract, and shells are set behind the sidewalk. Slot extents must lie inside their building. Entrance route progress must equal the shell's route progress plus its slot offset. Invalid placements fail the build.

The overview uses grouped representations to keep its density low. Each group lists the close-scene building IDs it represents; group ground reservations are separate from elevated image height. The theatre's drawing vignette is offset east of its registered point and outside the road corridor. No road moves to fit a generated building. Tests check segment/rectangle crossings, including crossings whose endpoints lie outside the rectangle.

## Rendering and time

Roads draw first; building groups sort by ground depth; frontages attach to their parent building. In the street, the facade plane, two shallow returns and a shop plane supply depth. Fog limits the sample. No whole-city model is created.

A period or preview change updates occupant signage through the resolver. It does not reload road geometry, move a building or reset the route. The “试放一家店” control offers two explicitly synthetic occupants in the same slot. It is a temporary composition demonstration, not a durable registration backend and not historical evidence. There are currently no accepted historical occupants; changing period therefore retains typology proxies with unknown actual occupants.

The child is physically 1.4 m high. The close follow camera and target height derive from the profile. This is a generic visual setting; no personal dates, growth history or home locations are published.

## Public image repository use

The current public modules are versioned beside code under `assets/modules/`; the release manifest pins filenames, revisions and SHA-256. The app loads the deployed same-origin assets. GitHub stores the sources and review history; mutable `main` raw URLs are not the runtime asset registry.

A separate image repository can later export the same immutable asset manifest. `assetId` and revision remain the interface: changing storage location updates the manifest/base URL, not building identity or route data. Large original photos belong in permission-appropriate storage; only cleared derivatives go into public Git. No private-photo upload or extra asset repository is required for this prototype.

## Consumer presentation correction (DM-0005)

The composition contracts remain internal. Their previous layer switches, sample storefront controls and geographic mapping inspector are removed from the consumer UI. `map-context.json` supplies display-only roads, district washes and building-symbol centroids from the retained OSM extract; it cannot register places or resolve historical occupants. `scripts/build-context.py` reproduces it from that source, whose checksum is recorded. Street secondary-row flats are subdued contextual scenery, not newly asserted historical buildings. The one closed menu owns all explicit controls; the visible map or street contains only the scene.

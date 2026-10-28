# Routes, street edges, attachments and local state

Target contract integrated 2026-10-19. [DATA_MODEL](DATA_MODEL.md) owns identity/time semantics; [INTERACTION](INTERACTION.md) owns activation. The historical r3 dimensions and implementation notes retained below are not a mandate to reproduce their original all-slots-on-buildings design. [MAP_ASSEMBLY](MAP_ASSEMBLY.md) and [HANDPAINTED_MAP_ART](HANDPAINTED_MAP_ART.md) own current painting/projection rules.

| Component | Stable identity | Independently replaceable content |
| --- | --- | --- |
| Road / walk-edge registration | Road, route, node and edge IDs with geometry revisions | Registered alignment/profile/illustration mapping, with explicit attachment remapping |
| Street-edge segment | Segment ID and a supported range on one canonical route side | Boundary pieces, openings, frontage hosts, setback ground and local masks |
| Boundary | Boundary-object ID | Brick wall, railing, mixed treatment, height, opacity/permeability and damage/repair state |
| Building or detached shell | Shell ID distinct from site ID | Appearance/state; demolition can replace the shell without replacing the site |
| Frontage slot / installation | Slot/installation ID and explicit physical host relation | Office, small company, intermediary, shop or non-commercial use; signage and local structure |
| Occupancy / use | Occupancy/use-state ID and valid-time support | Tenant and use without moving the host; structural changes remain separate |
| Route attachment | Attachment ID and place/object reference | Target revision: note, static sequence, local scene or no reader-facing target |
| Character / session | Profile ID and active route position | Approved visual/animation profile; no overview character and no inferred age chronology |
| Ground / paper | Pinned material/patch revision | Locally compatible ground treatment without changing road/site identity |

## Segmenting the street-facing fabric

Split at a remembered or supported change in boundary, entrance, detached frontage, setback or structure. Do not subdivide by arbitrary image tiles or a guessed equal grid. A long uncertain run can remain a coarse segment until further recollection allows a local split. Child IDs and memory references survive the split through explicit remapping.

Wall and railing are different visible/physical objects. An opaque wall blocks the rear view; iron railings reveal an appropriately simplified background but do not necessarily permit walking. A detached frontage room may stand in front of a boundary and occupy real depth. Do not render an uninterrupted front-row railing through the office door or infer that the boundary disappears behind it. Ground occupation, background exclusion, occlusion and attachment hit area remain separate.

A short independent row of offices/companies/intermediaries can be commercially used but largely non-interactive. It is not automatically apartment ground-floor retail, and it does not require elaborate windows, named occupants or interiors without support. Gate, sign and note access can be enough.

## Xinhua calibration: tentative, local and revisable

Drawing instruction from the 2026-10-19 discussion: the eastern part is broadly remembered as more brick-wall-dominant, the western part as more iron-railing-dominant. This is not an absolute division, not a numeric split point and not a dated inventory. Do not generate a fixed halfway boundary or apply one type to an entire compound.

The Wuli/Qili streetward area needs allowance for detached frontage rooms associated with offices, small companies or intermediaries, rather than assuming a continuous exposed fence or attached retail strip. Exact addresses, occupants, extents, epochs and frontage counts remain unresolved. Keep the calibration as a mutable drawing premise with exceptions, not a source-verified historical claim.

For each edit, identify the segment and remembered period/phase; revise only its boundary/frontage recipe and affected visibility/collision reservations. Show the same camera before/after. Newly remembered railing does not justify moving neighboring buildings or regenerating the full road.

## Same-place physical change

Occupancy, use, shell, roof/installation and boundary changes are different operations. Closing an office, converting a structure, damaging a shelter roof and reopening a later frontage cannot all be represented by changing a shop sign. Use `EnvironmentState`/`Observation`/`StateTransition` as defined in DATA_MODEL. Preserve site and route attachments where still valid; review entrance changes rather than assuming the old door always remains reachable.

## Historical prototype details (not universal defaults)

The r3 implementation reads `scene-composition.json` through `createComposition`. Its fixed widths, common shell assumptions and synthetic occupants describe that fixture only. They do not implement the generalized segment/attachment contracts above.

## Historical fixture sizing and placement

The prototype is a 140 m route slice. North-side facade sections are 12 m wide, with two 4.3 m storefront slots. South-side service sections are 10 m, with one 5 m slot. The independent entry module is 5 m. An unknown block may reuse a type, but every instance has its own ID. These are authored typology proxies, not surveyed addresses.

Road width is 8.2 m, sidewalk navigation is bounded by the existing walk contract, and shells are set behind the sidewalk. In this fixture, slot extents lie inside their shell and entrance progress derives from the shell plus its slot offset. For the generalized contract, validate each slot against its explicit actual host and each attachment against its registered walk-side approach; do not force detached frontages to become part of a residential building.

The overview uses grouped representations to keep its density low. Each group lists the close-scene building IDs it represents; group ground reservations are separate from elevated image height. The historical theatre-offset experiment is superseded: current overview anchors follow the shared source registration. Artwork cannot move a route or establish a different geographic point. No road moves to fit a generated building. Tests check segment/rectangle crossings, including crossings whose endpoints lie outside the rectangle.

## Historical rendering and time

In the historical fixture, roads draw first and building groups sort by ground depth. The target uses explicit hosts and occlusion relations: a detached frontage is not reparented to the nearest apartment, and a foreground fence/bridge need not follow a universal road-first paint order. In the street, the facade plane, two shallow returns and a shop plane supply depth. Fog limits the sample. No whole-city model is created.

A period or preview change updates occupant signage through the resolver. It does not reload road geometry, move a building or reset the route. The former “试放一家店” control was a synthetic composition demonstration and was removed from the ordinary UI; it is not a present consumer feature, durable registration backend or historical evidence. There are currently no accepted historical occupants; changing period therefore retains typology proxies with unknown actual occupants.

The old child fixture used a 1.4 m profile, with its close follow camera and target derived from that profile. These are legacy settings, not the selected outline figure's dimensions or camera. No personal dates, growth history or home locations are published.

## Public image repository use

The current public modules are versioned beside code under `assets/modules/`; the release manifest pins filenames, revisions and SHA-256. The app loads the deployed same-origin assets. GitHub stores the sources and review history; mutable `main` raw URLs are not the runtime asset registry.

A separate image repository can later export the same immutable asset manifest. `assetId` and revision remain the interface: changing storage location updates the manifest/base URL, not building identity or route data. Large original photos belong in permission-appropriate storage; only cleared derivatives go into public Git. No private-photo upload or extra asset repository is required for this prototype.

## Historical consumer presentation correction — DM-0005

The composition contracts remain internal. Their previous layer switches, sample storefront controls and geographic mapping inspector are removed from the consumer UI. `map-context.json` supplies display-only roads, district washes and building-symbol centroids from the retained OSM extract; it cannot register places or resolve historical occupants. `scripts/build-context.py` reproduces it from that source, whose checksum is recorded. Street secondary-row flats are subdued contextual scenery, not newly asserted historical buildings. The one closed menu owns all explicit controls; the visible map or street contains only the scene.

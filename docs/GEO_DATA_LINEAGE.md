# Geographic data lineage: Xinhua Street / Sanli

**2026-10-28 consumer correction:** inspected main `ed2cc85` retained the rejected R6 overview at `6a9c212` while PR #25's outline corridor was a different consumer. The user subsequently requested recovery into the actual local overview. Selected R7 restores the local Sili/Liuli membership and height-family correction, retains all 161 baseline physical polygons, recovers 30 reviewed source-linked masses and converts four selected Qili street frontage rings through the pinned scene frame. Runtime registration retains complete `sourceGeometry` separately from its exterior-ring projection. The [spatial pipeline](research/XINHUA_SPATIAL_PIPELINE.md) and [repair record](attention/tasks/DM-MAP-REPAIR-20261028.md) record the transition. The dated counts below remain their original source snapshots; neither old tests nor recovered artwork certify every estate boundary, building identity, height or historical year.

**Status:** source/data audit and production lineage, checked against repository `main` on 2026-10-19.  
**Consumers:** source QA, [Sanli importer](../scripts/ingest-sanli-overture.py), [Xinhua spatial plan](../content/reference/xinhua-spatial-plan.json), [R6 art compiler](../scripts/build-xinhua-art.py).  
**Operator procedure:** [Geographic acquisition and QA runbook](GEO_DATA_RUNBOOK.md).  
**Geographic scope:** public street/building data only; no personal residence, private source photographs, or historical school-location inference.

This page records **what was actually acquired, transformed, inspected, and promoted**, rather than treating a visible map application's 3D scene as an exportable data source. A polygon is useful evidence for horizontal geometry; it is **not** a surveyed ground footprint, a verified building identity, a height, an historical state, or a reusable commercial 3D mesh by itself.

## 1. Lineage graph and ownership

```text
PUBLIC GEOGRAPHIC EVIDENCE
  OSM 2026-10-18  ──> orientation.json (WGS84 roads, estate parcels)
       │                   └──> map-context.json (projected OSM roads)
       │                                  └── inverse project *missing road arms*
       ├──> overview-registration.json (Sanli parcel / place identity)
       │
  Overture Maps building + building_part data
       ├── small Sanli bbox, 2026-10-19 CLI/STAC fetch
       │     └── temporary raw GeoJSON, SHA-256 recorded
       │          └── ingest-sanli-overture.py
       │               ├── sanli-open-geometry.geojson (249 building outlines + 4 road lines)
       │               └── sanli-open-audit.json (counts, source hashes, flags)
       │
       └── corridor bbox, release recorded as 2026-09-23.1
             └── xinhua-open-geometry.geojson (774 building candidates)
                    └── imagery/source review & manual reconciliation
                          └── xinhua-spatial-plan.json (161 selected masses, 11 groups)
                                 │    └── independent estimated Z / evidence roles
  ESRI imagery + permitted on-the-ground photographs ──> REVIEW ONLY
                                 │
                                 v
                          build-xinhua-art.py
                                 ├── production packed raster atlases
                                 └── generated overview-registration.json references
                                         └── actual three-tier illustrated map
```

The source-oriented `content/reference/*` artifacts are not proof that every candidate should be rendered. Only the selected spatial plan governs R6 XY, with `heightEvidence` governing estimated Z. Stable `Place` IDs and period resolution remain owned by the application's existing spatial/time contracts. Images, projection masks and paint offsets cannot rewrite source geometry.

## 2. Source register: rights, coordinates, dates

| Source / function | Actual local artifact | Origin, date, and limitations |
| --- | --- | --- |
| OpenStreetMap roads and parcels | [orientation.json](../content/public/orientation.json), [map-context.json](../content/public/map-context.json), [overview-registration.json](../content/public/overview-registration.json) | Small contemporary extract acquired 2026-10-18 from `api.openstreetmap.org/api/0.6/map?bbox=116.27,39.833,116.304,39.862`. Stored in WGS84 then projected for illustration. ODbL; not an historical street survey. |
| Overture small Sanli extraction | [sanli-open-geometry.geojson](../content/reference/sanli-open-geometry.geojson), [sanli-open-audit.json](../content/reference/sanli-open-audit.json) | Bbox `[116.28335,39.84175,116.28935,39.84615]` (west, south, east, north), retrieved 2026-10-19. The CLI resolved its **then-current** STAC release; the literal stored `latest-STAC-as-of-2026-10-19` is a descriptive tag, **not an immutable release ID**. |
| Overture corridor acquisition | [xinhua-open-geometry.geojson](../content/reference/xinhua-open-geometry.geojson) | Bbox `[116.279,39.8392,116.2912,39.846]`. Output identifies release `2026-09-23.1`, 774 candidate polygons, ODbL. Its one-off acquisition/reconciliation was not captured as the Sanli reusable CLI workflow: use the retained source data and spatial plan, not an imagined all-automatic tool. |
| Sanli administrative limits | [Xinhua building survey](research/XINHUA_BUILDING_SURVEY.md) | District-government community description says north 建国街, east 东兴里, south 新华街, west 新华街五里. Confirms broad estate location, **not** each roof/building number. |
| Esri World Imagery | [survey note](research/XINHUA_BUILDING_SURVEY.md), [R6 research note](research/XINHUA_SPATIAL_PIPELINE.md) | Referenced with export extent/date-of-access when known; capture date unknown. Reference imagery is not bundled, and its roof-centres may be displaced from ground contact. |
| User-supplied photos and other ground-level reference | Not present in public repository | Used only for qualitative tower/slab forms, orientation and height-family clues where allowed. Never publish original personal materials or convert an undated photo into a dated historical assertion. |

**License chain.** Overture's buildings theme is licensed under ODbL. The Sanli snapshot's per-record `sources[].dataset` provenance is predominantly the East Asia building polygon release (`doi:10.5281/zenodo.8174931`, 243 records), with six OSM-sourced features. The East Asia dataset is credited by Overture under **CC BY 4.0**; preserve its academic credit together with Overture/OSM attribution, not just the enclosing database label. Attribution, derivative-database and redistribution duties require review before any external publication beyond the repository. See [Overture attribution](https://docs.overturemaps.org/attribution/) and [building reference](https://docs.overturemaps.org/guides/buildings/). The repository's MIT license never overrides these third-party conditions.

**Commercial basemap separation.** Amap, Baidu and other China-map apps may offer 3D buildings or panoramas for viewing. This pipeline **did not download their proprietary meshes or street-level textures**; a publicly visible view does not prove machine-export or redistribution permission. Any permitted third-party API must be evaluated against its own license and coordinate reference system first.

## 3. Sanli importer: exact implemented operations

The [workflow](../.github/workflows/sanli-open-geometry.yml) installs Python 3.11, `overturemaps==1.0.2` and `shapely==2.1.2`. It uses the official `overturemaps download --bbox=... -f geojson --type=building` and `--type=building_part` commands, then passes temporary inputs to [`ingest-sanli-overture.py`](../scripts/ingest-sanli-overture.py). Successful acquisition and importer runs are recorded in [GitHub Actions run 39221009102](https://github.com/StarObserverPro/DigitalMemory/actions/runs/39221009102). GitHub stored the derived artifacts; the raw input payloads were temporary, while their SHA-256 values were retained in both the GeoJSON metadata and audit.

Importer behavior, including important **non-claims**:

1. **Read & validate.** Require GeoJSON FeatureCollection, valid nonempty Polygon/MultiPolygon, ROI intersection, at least 4 m² approximate planar area, source ID present and no duplicates within a feature kind. Keep original feature coordinates and IDs; **the geometry is not clipped to the bbox or parcel**.
2. **Classify spatial overlap.** Transform Sanli OSM parcel `osm-way-897762350` and candidate polygons to a local metre approximation. Inside-area / polygon-area >0.8 gets `mostly-within-sanli`; >0.01 gets `sanli-boundary`; otherwise `nearby-only`. This is a **geometric fraction, not an address-matching algorithm**.
3. **Recover both local street arms.** Read named WGS84 roads from `orientation.json`. Where the reduced orientation subset omits 韩庄路 or 东兴里, invert the saved local equirectangular `map-context.json` drawing transform back to WGS84. That context itself derives from the earlier OSM extract, **not from hand-painted images or a second independent survey**.
4. **Flag suspicious proximity.** Buffer each retained road **centreline by 4 m** in the same local approximation, and flag intersecting source polygons. This is a deliberately coarse screening heuristic, **not a measured road carriageway width** and not an automatic remove/move rule.
5. **Copy metadata without inventing Z.** Preserve `building_id`, `height`, `num_floors`, `min_height`, `has_parts`, `sources[].dataset` when available; write `null` for missing height/storey. Keep `geometryRole=footprint-or-roofprint-unresolved`, `identityStatus=unmatched-to-address`, `periodStatus=modern-reference-not-confirmed-historical`.
6. **Produce dual outputs.** `sanli-open-geometry.geojson` carries spatial records and license/source fields; `sanli-open-audit.json` records raw vs retained counts, height coverage, inside counts, roadmap cross-check, source download hashes, and road flags. This stage never edits the runtime map.

The metric approximation uses `CENTER` at bbox midpoint with `kx≈111195.08·cos(latitude)` and `ky≈111195.08` metres/degree. The inverse drawing projection uses the repository's existing `orientation.json.bounds`, `1044` effective units and centre `(600,600)`; this is for local overlap tests, not an exact national geodetic transformation.

## 4. Measured 2026-10-19 Sanli snapshot

| Observable | Recorded result | Correct interpretation |
| --- | ---: | --- |
| Raw Overture `building` features | 250 | Count of returned building features, not a dwelling inventory. |
| Invalid/outside filtered | 1 | One rejected by importer geometry/ROI gate. |
| Retained building features | **249** | Real source polygons, possibly roofprints. |
| Retained `building_part` features | **0** | The CLI completed successfully and returned zero rows for this area. Not proof other services have no 3D scene. |
| Road centreline features | **4** | 建国街、新华街、韩庄路、东兴里 (source OSM). |
| Source polygons mostly within Sanli parcel | **34** | Spatial overlap classification, not 34 confirmed residential buildings. |
| Above or equal to 300 m² among those 34 | **14** | Coarse size filter, not 14 verified multi-storey buildings. |
| Source-provided height / floors | **0 / 0** | No automatically verified Z. |
| Polygons near 4 m road-centreline buffer | **4** | All four are `nearby-only` in this audit; manual QA flags, not evidence that four buildings occupy a street. |

Stored raw-input hashes from the second, completed acquisition:

- `building` SHA-256: `e1ca39a7ce25ce2c05a400f580e4dc15af5d6c9a98992d405dce6538fb095aae`
- `building_part` SHA-256: `b282fe0a1b482f0f5cfe8e199a8f84ad3b03117f83f1369a7a2ed021e7473d15`

The audit is **not an exact building-count certification**. The Xinhua building survey's roughly ten principal Sanli buildings is a typology/identity-level working inventory; 34 source polygons cannot be divided into that inventory without overlay inspection, segmentation review and explicit ID matching.

## 5. Corridor promotion: 2D source → evidence-tagged 2.5D

The later R6 work does not promote all 249 Sanli polygons or 774 corridor candidates wholesale. It selects and reconciles **161** independent masses across **11** corridor groups in [`xinhua-spatial-plan.json`](../content/reference/xinhua-spatial-plan.json), with known edits and exclusions explained in [Xinhua spatial pipeline](research/XINHUA_SPATIAL_PIPELINE.md) and [DM-0018](attention/tasks/DM-0018.md).

For each selected object the spatial plan records: `id`, `compoundId`, WGS84 `geometry`, `sourceIds[]`, `geometryStatus`, `geometryUncertaintyMetres`, `kind`, `appearanceFamily`, `storeys`, `heightMetres`, and `heightEvidence` (status, `storeyRange`, sources and whether an individual count was verified). Two Wuli-east curved perimeter pieces were traced/generalized, some source segmentation deduplicated, and unresolved street-edge candidates omitted instead of shoved away from the road. **No source-native floor heights were available** in either collection. Approximate Z is explicitly an inference from permitted references, building families and photographs, not from Overture's absent height fields.

[`build-xinhua-art.py`](../scripts/build-xinhua-art.py) projects the selected spatial plan through the existing shared world/image transform, applies selected original raster pencil/wax materials, and composes registered far/medium/near artwork and manifest references. Production images are **downstream visual representations**, never geometric evidence. Current renders and automated QA are documented in [DM-0018](attention/tasks/DM-0018.md); a native-render check is not a browser journey or historical approval.

## 6. Reproducibility and truthful confidence

- **Pinned code, not pinned raw STAC data:** the Sanli CI pins client/library versions, but its `overturemaps download` uses the then-latest STAC release. `--release` in the importer only writes a string into output metadata and **does not pin the upstream download**. Historical raw bytes can be verified against the stored SHA-256 **only if those exact raw bytes are available**. A fresh run may legitimately return a different count/hash.
- **The corridor file is source evidence, not a complete executable acquisition log.** Its release and source hash are recorded, but the spatial selection contains visual/manual decisions, so rebuilding the 161-object plan from a different raw download is not an automatic or bitwise-reproducible operation.
- **Four independent decisions:** source licensing, source-coordinate validity, physical/historical interpretation, and user-facing visual approval. Passing one cannot imply another.
- **Dates:** source dataset publication/update, retrieval time, image acquisition time and the memory's represented period are distinct. Neither the 2026 snapshot nor current imagery proves a 2000–2005 building existed in that precise form.
- **Coordinate integrity:** canonical spatial storage is WGS84 longitude–latitude; Chinese app/POI coordinates may use GCJ-02 and Baidu BD-09. Never numerically overlay those systems, never infer a real coordinate from an uncalibrated screenshot, and never correct a misregistered building by distorting its drawn pixels.
- **Privacy:** only public geographic outlines, references and source IDs belong in Git; private images, address/unit associations and sensitive personal memories remain elsewhere.

**Current integration state:** the Sanli evidence has been merged into `main` (PR 15). R6 subsequently consumed the corridor geometry and spatial plan (DM-0018). Data acquisition, candidate-footprint audit, inferred Z, generated art, UI integration, user review and deployment are separate events; consult [current status](STATUS.md) rather than an earlier task packet's initial “review branch” wording.

## Named frontage registration

Named shops must be checked against an actual map POI, registered building side and dated street imagery before labeling. A postal address or map viewport center cannot establish an entrance. Daoxiangcun Kandanqiao is on Qili west frontage facing Fourth Ring: Baidu POI 905d861757ac875e4107c15e, panorama 09002200122003141220538666G (2020-03), viewed facing east from the auxiliary road. The south-facing Xinhua shop bands carry no Daoxiangcun label. Shop dimensions and forecourt boundary remain reconstruction estimates.

# Geographic data acquisition and QA runbook

**Purpose.** Reuse the Xinhua/Sanli data pipeline **without** repeating the previous failure: generating a visually attractive map before checking the streets and actual building outlines. Use this guide for a bounded, public geographic scene; read the [measured lineage and limitations](GEO_DATA_LINEAGE.md) before extending beyond Sanli. This is a working acquisition/verification procedure, not a generic 3D map scraping recipe.

## A. Decide the output before downloading

| Intended output | Minimum input | What is *not* implied |
| --- | --- | --- |
| Geographic base | Named area, WGS84 bounds, licensed roads/parcel polygons and building candidates | Complete building inventory; valid historical year |
| Reviewed building plan | Candidate polygons + independent overhead/ground checks + source IDs + uncertainty | Verified building number, entrance, ownership, ground vs roof footprint |
| Illustrated overview | Reviewed plan + independently sourced height classes + approved artistic style | Reusable photorealistic 3D mesh or surveyed model |
| Walkable street view | Registered road/sidewalk geometry + view permissions + scene interaction testing | A street-view photograph's rights to reproduction; verified private recollection |

The user's instruction to “take the 3D data from a public Chinese map” is not evidence that a specific provider exposes downloadable reusable mesh assets. Search its documented API, permitted output type, licensing and coordinate system; if the API only offers render tiles, street panoramas or view-only scenes, use it as a permitted *reference* where terms allow, not as repository geometry. A real Overture polygon + separately supported height is a viable 2.5D foundation but not that provider's 3D dataset.

## B. Initial registration and source decision

1. Define a **small ROI** around the street intersection and a **separate named parcel**. For this sample, Sanli ROI is `west=116.28335 south=39.84175 east=116.28935 north=39.84615` in WGS84, and the estate polygon is `osm-way-897762350` in [overview-registration.json](../content/public/overview-registration.json).
2. Retrieve streets from an authoritative/open GIS source (OSM extraction in this case), record its actual source version/license, and compare administrative boundary descriptions. Do **not** use a label or a point of interest as the parcel boundary. Side-streets missing in reduced extracts must be queried/recovered explicitly.
3. Make a source register containing: provider, theme/type, release/edition, actual retrieval UTC, reported capture time **or unknown**, source and response CRS, bbox, raw checksum, local transformation version, permitted uses, and rejected alternatives.
4. Establish the target historical window **independently**. An undated current satellite reference is an orientation source; do not mislabel it as a 2000-era image.
5. Lock down the repository public/private boundary before downloading photos or street views. Do not insert private addresses, personal residence links, restricted photos, or source images into commits or publicly visible CI artifacts.

### 具体地点落图前的核验顺序

用户提到商店、广场、校门或其他具名地点，即触发与任务目的相称的定位核验。执行者负责查图，不把常规检索工作交回给用户。先确认街段、小区、路侧与朝向，再结合用户指认、实际地图POI和对应建筑，用卫星图与有拍摄日期、视向的街景交叉核对。旧地址只提供检索线索；查到楼号不等于确认商铺位于该楼哪一面。

临街视觉样例的重点是前排门脸、后排楼、遮挡、重要空隙和大致退界。用户已指认且认可的大致门脸范围可直接作为绘制底稿；不要求逐店米级坐标、精确门宽，或查清画面不可见的建筑连接。只有位置矛盾会改变辨识、前后关系或行走入口时才继续收紧。来源记录仍区分用户指认、图像观察和绘制估计，实际通行与跨街、桥上下层关系另行核对。表现取舍见[轮廓流程](research/XINHUA_OUTLINE_WORKFLOW.md#按行走视线选择前后轮廓--2026-10-28)。

- 先展示或保留真实证据：地图提供方、POI ID/链接、所见楼栋与路侧、街景ID/拍摄期/视向、参考截图和场景修订。地图视口中心、搜索结果摘要、地址文字不能冒充门店坐标；坐标换算必须注明CRS。
- 将确认的地点身份与朝向、近似的进深/退界/广场范围分别记录。地图图钉可能是楼栋代表点；街景未见清晰店招或入口时，不能写成“入口已核实”。店房和广场分别核验，不能从店名推造广场边界。
- 缺少足以确定街段/路侧的证据且没有用户明确指认时，保留无商号的概括体量或待定位记录，不在任意门脸上挂真实商号。访问失败、只看到地址或只看过周边卫星图，要如实说明核验范围；已认可的大致门脸不因缺少米级尺寸而重新归入待定位。
- 用户明确纠正地点后，立即撤销错误身份绑定及依赖它的目的地、广场标注和“已核实”结论；重新核对后再落图。不得用“可能是旧址”解释冲突，除非确有迁址证据；用户没有给出的具体落点不能归到用户名下。
- 对位置敏感的修改，交付地图参照和修正后的实际consumer画面，说明核实到哪一级。原始参考、截图留在库外；公开文档只保留可复用规则、公开来源与必要结论，不记录私人居住经历。

### Actual input sources in this repository

- [OSM orientation](../content/public/orientation.json): WGS84 named streets and district boundaries, acquired 2026-10-18.
- [OSM context](../content/public/map-context.json): the same OSM features already represented in project drawing coordinates; road arms can be inverse-transformed, but this **is not independent corroboration**.
- [Sanli source](../content/reference/sanli-open-geometry.geojson) and [audit](../content/reference/sanli-open-audit.json): bounded Overture 2026-10-19 example.
- [Corridor source](../content/reference/xinhua-open-geometry.geojson) and [selected plan](../content/reference/xinhua-spatial-plan.json): later R6 corridor extension with source IDs and explicitly inferred height metadata.
- [Xinhua building survey](research/XINHUA_BUILDING_SURVEY.md): source inventory, photo typology and named-place uncertainties.

## C. Reproduce the small-area Sanli acquisition

From a clean checkout of `StarObserverPro/DigitalMemory`, run in the repository root. Python **3.11** and connectivity to the Overture open-data host are required. The version numbers below reproduce the **software environment** used in the successful 2026-10-19 workflow, **not the exact STAC dataset release**.

```bash
python -m pip install "overturemaps==1.0.2" "shapely==2.1.2"
WORK_DIR="${TMPDIR:-/tmp}/digitalmemory-sanli-geodata"
mkdir -p "$WORK_DIR"

overturemaps download \
  --bbox=116.28335,39.84175,116.28935,39.84615 \
  -f geojson --type=building \
  -o "$WORK_DIR/buildings.geojson"

overturemaps download \
  --bbox=116.28335,39.84175,116.28935,39.84615 \
  -f geojson --type=building_part \
  -o "$WORK_DIR/parts.geojson"

python scripts/ingest-sanli-overture.py \
  --buildings "$WORK_DIR/buildings.geojson" \
  --parts "$WORK_DIR/parts.geojson" \
  --release "latest-STAC-at-download-time (descriptive; NOT a pinned release)" \
  --output "$WORK_DIR/sanli-open-geometry.geojson" \
  --report "$WORK_DIR/sanli-open-audit.json"

python -m json.tool "$WORK_DIR/sanli-open-geometry.geojson" > /dev/null
python -m json.tool "$WORK_DIR/sanli-open-audit.json" > /dev/null
sha256sum "$WORK_DIR/buildings.geojson" "$WORK_DIR/parts.geojson"
```

The importer reads registered parcels/roads from repo paths. Do not run it from an arbitrary directory and assume it will find those files; changing `--registration` or `--orientation` must point to a compatible version. Temporary outputs above deliberately avoid replacing selected source snapshots already in Git.

**Zero parts vs download failure:** The historical successful run downloaded 250 `building` and **zero** `building_part` records, confirmed in the job log. The [existing CI workflow](../.github/workflows/sanli-open-geometry.yml) has a fallback that creates an empty parts collection if the second download command *fails*. Consequently, its `building_part=0` audit **alone is insufficient** to prove that the upstream query succeeded. Inspect the download step logs; distinguish “completed, zero records” from “failed and substituted empty file.” In local reproduction above, let a download failure stop the operation rather than replacing it with fabricated no-data output.

**No hidden release pin:** `overturemaps download` in this workflow resolves the current STAC release, and `--release` belongs to the *local importer* as a provenance label. To reproduce original data byte-for-byte, locate the exact source release/objects and check raw SHA-256 values from the archived audit. If old raw data are unavailable, the retained Git snapshot is the evidence. The later corridor source separately records edition `2026-09-23.1`; do not infer the Sanli CLI necessarily used that same edition solely from its access date.

### Inspect before adoption

```bash
python - "$WORK_DIR/sanli-open-audit.json" <<'PY'
import json, sys
a = json.load(open(sys.argv[1], encoding="utf-8"))
print("retained by kind:", a["selectedCounts"])
print("road names:", a["sourceRoadNames"])
print("mostly inside Sanli:", a["sanliSourceFootprintsMostlyInside"])
print("large candidates:", a["sanliLargeFootprintCandidatesArea300SqM"])
print("native height coverage:", a["sourceBuildingsWithHeight"])
print("native storey coverage:", a["sourceBuildingsWithFloorCount"])
print("near-centreline flags:", a["roadNearFlags"])
assert a["selectedCounts"].get("building", 0) > 0
assert {"新华街","建国街","韩庄路","东兴里"}.issubset(a["sourceRoadNames"])
assert a["rawFeatureCounts"]["building"] >= a["selectedCounts"]["building"]
assert a["status"] == "reference-only-not-promoted"
PY
```

These are structural checks only. At the 2026-10-19 reference snapshot, the numbers are **250 raw / 249 retained**, 34 mainly within the parcel, 14 over 300 m², zero native height/floors and four road proximity flags. A changed current download is not automatically wrong; a changed count, source mix, street coverage or checksum is a **review trigger**. Never write tests forcing the historical 249 count to remain constant forever.

### GitHub Actions entry point

The retained [`sanli-open-geometry.yml`](../.github/workflows/sanli-open-geometry.yml) is a record of the original acquisition run. It pins software versions, has a push trigger for the historical `agent/dm-0017-sanli-open-geometry` branch and offers manual dispatch. Its commit step writes output to the checked-out branch with `contents: write` permissions. **Do not manually dispatch it against `main` as a mere QA check:** it can write regenerated data there. For a fresh acquisition, create a new `agent/<task>` review branch and adapt its trigger/commit target or run the local commands above; keep source snapshots unpromoted until reviewed. Inspect [the successful run](https://github.com/StarObserverPro/DigitalMemory/actions/runs/39221009102) for expected CLI and importer log shape, not for perpetual numerical equality.

## D. Geometric audit: compare sources, not pictures

### Keep three separate coordinate systems

- **Source geography:** GeoJSON/WGS84 `[longitude,latitude]` (`EPSG:4326`). OSM and Overture operate here for this workflow.
- **Project plane:** local metric approximation and `src/domain/spatial.js`'s documented art-coordinate transform. The importer inverts the already stored `map-context.art` plane **only to recover the source OSM centreline coordinates**; this is not a universal geo-to-screen transform for screenshots.
- **Provider/client display:** Baidu BD-09, Amap/other GCJ-02, camera perspective, raster pixels or vendor tile coordinates may all differ. Use a legitimate documented conversion and verify known control points before aligning; never assume a numeric longitude/latitude pair from a China-map app is already WGS84.

For orthophotos or angled aerial imagery, preserve **returned** image extent and CRS (not just requested bbox), image dimensions, capture timestamp/unknown, control points, and rectification error. A tall roof's apparent horizontal shift is not a ground-building translation to be copied into the registry.

### Audit operators and their limits

| Gate | How to check | Reject / return condition |
| --- | --- | --- |
| S0 — source permission | Record license, attribution and allowed derivative/distribution uses. | Terms absent/unclear, data obtainable only through extraction of proprietary tile geometry. |
| S1 — reference frame | Reproject all inputs to WGS84 consistently; check control road junctions and parcel edges. | GCJ-02/BD-09, frame/axis swap, missing transform or implausible control offsets. |
| S2 — semantic footprint | Overlay candidate outlines with georeferenced overhead imagery; distinguish roofprint, building footprint, compound and detached shops. | Roof/parallax offset mistaken for building base, segmentation across one building, invented missing block. |
| S3 — streets and setbacks | Compare **actual road surfaces/edges where available**; use the 4 m **centreline** flags for triage only. | Claiming clearance from a buffer or moving a building solely to make a warning disappear. |
| S4 — identity and height | Match address/building number separately; record evidence and uncertainty range for each chosen tower/slab. | Treating an Overture ID as local building number; inferring exact storeys from a roof polygon. |
| S5 — historical layer | Check periods, demolition, facade/renovation differences, frontage and old school sites. | Promoting a current polygon into 1995/2000 without evidence or treating a current school address as an old campus. |
| S6 — project promotion | Source-linked spatial plan, explicit excluded/modified segments, user-reviewed projection/massing, cross-level source and geometry tests. | Generated art driving building XY; unrelated structures touching the road; source IDs missing. |
| S7 — visual and release | Native consumer far/medium/near/mobile views; separate browser walk test, owner aesthetic acceptance, merge and deployment record. | Tests-only claimed as visual success or merge claimed as publication. |

**No “draw around the road” fallback.** If geometry is ambiguous, mark it unresolved or omit it provisionally with an explicit `excludedSourceSegments.reason`. Do not regenerate a neighborhood until its source positions, major building families and perpendicular/slab directions can be inspected on one geographic overlay.

### Distinguish counts from identities

- The 34 “mostly-within-Sanli” count is generated by an **area-overlap threshold** of 80%, not a recognized list of numbered apartment blocks.
- The 14 “large” count applies an **area threshold of 300 m²** to those 34 only. It is not a building count or a tower discriminator.
- Smaller roofs may be garages or segmented parts; one long slab may be split into multiple provider polygons. Conversely some buildings may be absent. Use geometry and independent references to reconcile source IDs before producing a finished layout.
- The four Sanli road warnings are **outside** the classified estate; check them in context rather than telling the user the four Sanli residences are on the street.

## E. Promotion into the project's R6 spatial/render pipeline

For a **new user-authorized area** (not for each rerun of the Sanli importer), follow the established R6 ownership:

1. **Retain source data** in `content/reference/` with bounds, edition, licensing, source IDs, native Z coverage and source/checksum fields. Do not silently overwrite the 2026-10-19 snapshots.
2. **Create or revise a reviewed selection** analogous to [`xinhua-spatial-plan.json`](../content/reference/xinhua-spatial-plan.json). One object carries `sourceIds[]`, WGS84 geometry, independent `geometryUncertaintyMetres`, group ID, kind, and `heightEvidence` with status/range. Record generated/traced/excluded exceptions explicitly. **No fresh source download is allowed to automatically mutate the accepted spatial plan.**
3. **Estimate height as a separate evidentiary layer** only where necessary for 2.5D display. Use published property listings or referenced photos with source IDs, uncertainty and group-level vs individual-level distinction. `storeys`/metres of an illustrative renderer are not source-native measurements.
4. **Produce image assets from the plan**, not vice versa. The R6 compiler [`scripts/build-xinhua-art.py`](../scripts/build-xinhua-art.py) requires Python Pillow, numpy and Shapely 2.1; it consumes registered XY, height evidence and the original selected [wax material atlas](../assets/materials/xinhua-wax-r1.webp), and updates generated raster assets/registration. Run it **only** in a reviewed work branch and only when an artwork revision is authorized.
5. **Validate exactly affected consumers:** `npm test`, `npm run build`, then view far, medium, near Sanli/west-east contexts and phone layout. Collision rules must include context-road continuations and building-to-building reservations; a registered structure cannot be “fixed” by hiding a collision warning.
6. **Preserve output distinctions:** data acquisition/QA, geography approval, style approval, integration and actual site deployment are independent milestones. Original satellite/ground photographs, test overlays and rejected generations stay outside public Git history; public source vectors and selected licensed outputs retain full provenance.

See [R6 research](research/XINHUA_SPATIAL_PIPELINE.md), [map assembly contract](MAP_ASSEMBLY.md), [asset pipeline](ASSET_PIPELINE.md), [verification requirements](VERIFICATION.md) and [DM-0018 delivery record](attention/tasks/DM-0018.md). The project remains an illustrated memory site, not an open-data 3D tile mirror.

## F. Failures and changes that require another investigation

| Symptom | Interpretation / exact next check |
| --- | --- |
| `building_part = 0` | Check CLI exit status and query log for “0 rows”; an empty fallback file from failed download is **not a valid empty-source conclusion**. Never invent 3D parts. |
| No height/floor values | Source has no verified Z; use an explicitly separate inference only after matching the candidate to a building family. |
| 34 source polygons versus about 10 principal buildings | Compare actual outlines and segmentation; inspect annexes, sheds, courtyards, and provider roof tracing. Counts describe different entity levels. |
| Buildings appear inside a street | Check WGS84 vs GCJ-02 first; then OSM road source completeness/width, roof-to-ground offset and source trace quality. A 4 m centreline buffer is not a definitive road polygon. |
| Different numbers after redownload | Check exact Overture release and upstream hashes. The CLI version is pinned; STAC latest dataset is **not**. Do not silently replace the repository snapshot. |
| Building outline matches overhead but fails side-angle photo | The photo may show perspective compression, roof lean, occlusion or a different date. Record the discrepancy instead of affine-warping the building. |
| Old school moved because current POI changed | Return to institution/site/occupancy distinction; historical school location is an independently researched object. |
| Image art looks good but source layout is wrong | Reject geometry promotion; visual polish is not a geographic check. Restore source-bound XY and repeat the relevant consumer preview. |

## G. Handoff and audit record template

For each acquisition, record this compact block in the task packet (not a giant source dump):

```text
Area / named parcel IDs:
WGS84 bbox and source provider, layer/type, exact version if available:
Acquisition UTC / imagery capture date or unknown:
Upstream input checksums / output revision:
CRS and original-to-canonical transformation:
License and attribution / publication restriction:
Raw, retained and rejected source counts:
Within-parcel vs matched-real-building counts:
Height/floor coverage and evidence classification:
Road/footprint flags, exceptions and unresolved mismatches:
Consumer changed (reference, spatial plan, render, street, or none):
Tests and actual visual evidence:
User geography/art approval, merge, deploy — each separately:
Exact next action:
```

This template is for traceability and future corrections, **not** an automatic approval. The Sanli example stops at source acquisition; the later R6 plan and visual assembly are separately documented.

# Data model and registration contract

Status: logical contract, with layer boundaries reconciled on 2026-10-29. The prototype implements parts of registration, time, session, BuildingShell/FrontageSlot/Entrance composition and exact-period occupancy. The generalized route attachment, three-way activation and repeated-observation contracts below are targets, not a completed schema migration. [RUNTIME](RUNTIME.md) and [STATUS](STATUS.md) own implementation evidence.

<a id="memory-attachment-contract"></a>

## 记忆挂载层：身份、入口与内容的边界

本层负责把获准使用的记忆内容绑定到既有地点和路线语境，定义入口打开什么、采用哪个内容版本，以及关闭后返回哪里。[四层总表](ARCHITECTURE.md#layer-scopes)统一各层职责；本节拥有挂载记录的语义，[CONTENT_PIPELINE](CONTENT_PIPELINE.md#memory-attachment-discipline)拥有内容整理、审核与发布纪律。

| 对象 | 所有权与输入输出 | 修改边界 |
| --- | --- | --- |
| `Place` / `Route` | 地图地理层提供稳定 ID、登记版本、位置及有效时期 | 内容改稿不能新建替代 ID、移动地点或重画路线 |
| `RouteAttachment`（目标契约） | 引用已登记的入口/路线位置及版本，再关联内容目标；空间锚点由地图地理层维护，目标关联由记忆挂载层维护 | 改门、改边、改侧向须显式重映射；加一条记忆不改变原入口 |
| `InteractionTarget`（目标契约） | 返回获准使用的 `note`、`sequence`、`scene` 之一，或无可用内容 | 地点类别、面积、模型精度和已有图片均不能自行决定交互深度 |
| `MemoryFragment` / `TextRevision` | 保存记忆身份、原意、时间不确定性与所选文字版本；向 UI 提供可展示内容及时间关系 | 原文、外部背景、推断和装饰文案保持各自身份；不补写未经提供的经历 |
| 激活与返回上下文 | 接收当前路线、时期和入口；由 application session 保存位置、镜头及返回栈 | 内容页面与场景各自不能再维护一份权威位置或持久化栈 |

文字、图片顺序或内容目标变化只使相应内容及清单失效；地理登记和无关场景继续复用。把 note 改为 sequence/scene 是显式目标版本变更，须保留入口身份与返回语境，并同步交互、加载/销毁和验收说明。读取其他时期的记忆不会自动改变当前环境。

### 当前实现与待实现接口

当前 [`PublicRepository.memories()`](../src/adapters/public-repository.js)按 `manifest.memoryChunks` 和 `placeIds` 读取公开记录，以 `relateTime` 计算时间关系，默认过滤合成示例。当前 [`main.js`](../src/explorer/main.js)的地点卡显示这些记录，`portalId` 交给 `loadScene()`；[`createPortalController()`](../src/application/session.js)在加载成功后写入 session，并拒绝已取消或过期的响应。

当前公开记忆清单仅登记合成示例，演示场景目标是 `demo-courtyard` / `demo-room`。主应用的 `includeDemo` 为 false，选定轮廓场景不开放旧 courtyard 门入口；这些演示代码/fixtures 不等于默认界面可用的记忆内容。这条地点卡与 demo portal 路径尚未实现通用 `RouteAttachment`、独立 sequence 阅读器或三类目标的统一分发；选定轮廓街景的目的地直达也只是到达地面位置。后续接入真实内容须按上述契约完成实现和验证，不能直接把 demo 路径或转场日记当成已有的记忆系统。

最小验收覆盖：同一地点多入口、同一入口多片段；登记修正后显式重映射而记忆 ID 不变；未知时期保持未知；无内容/加载失败/取消后仍可返回原上下文；文字改稿不影响地理与场景资源。当前尚未实现的接口保留为验收要求，不记为已通过。

## Geography is the lookup skeleton, not a mutable primary-key string

Use coordinates and spatial indexes as the principal registration and retrieval mechanism. Give each persistent object an opaque stable ID as well. The ID is a technical safeguard, not an alternative content hierarchy: adjusting a school boundary or moving an imprecisely placed shop must not detach its recollections.

Do not use rounded latitude/longitude, a current school name, a tile filename, or a geohash as the object's unique identity. Several remembered objects can occupy the same position, and a single institution can occupy several sites over time.

A `Place` is a stable site/location identity. Its geometry can be a point, line, or polygon, with revisions. A portal is a relation between an origin anchor and a destination scene; it is not a fourth mutually exclusive geometry type. Indoor anchors may use local scene coordinates and a parent geographic place.

## Common envelope

Mutable records carry `id`, `schemaVersion`, `revision`, created/updated metadata, source/authority references, and privacy/access class. Changes that affect reviewed content create a new revision with a parent; they do not overwrite approved evidence. Revision checks prevent concurrent lost updates. IDs stay stable across export/import and do not expose residential addresses.

These are logical authoring fields, not a public payload whitelist. Original inputs, source spans and review links belong to authorized private authoring records. Public data is a separately cleared projection. Geographic records expose permitted conclusions, uncertainty and operational registration metadata only; source/evidence fields must not publish investigation records or links to them. [The absolute publication boundary](CONTENT_PIPELINE.md#地理资料的绝对公开边界) applies to every record and derivative, including opaque metadata that would reveal a prohibited association.

An unresolved value is null/unknown, never a fabricated coordinate, zero date, or default fact. Retain original date expressions and uncertainty. Examples in tests must be synthetic and marked as such; no precise real-world personal fixtures are supplied by this architecture.

## Core records

| Record | Required meaning and principal fields |
| --- | --- |
| `Place` | Stable ID, user label/aliases, kind, optional parent place, geometry revision references. Importance and familiarity are independent of map footprint. |
| `GeometryRevision` | Place ID, geometry or unresolved status, canonical CRS, permitted input CRS and transform revision, effective period if relevant, registration precision/uncertainty and approval. Public records contain geographic results only. |
| `Route` / `RouteRevision` | Stable route identity; ordered registered segments and anchors; traversal mode; associated periods. Unknown connectors are explicit gaps, not assumed straight or shortest paths. |
| `Institution` | School/organization identity independent of its buildings or contemporary address. |
| `Occupancy` | Institution ID, site/place ID, uncertain valid-time interval, evidence references and status. A change of tenant does not move the place. |
| `SourceRecord` | Private authoring record for original input or permitted supporting media: capture/date metadata, checksum, private asset reference and rights/access status. It is not a public geographic investigation index. |
| `Statement` | A source-supported assertion, source span/crop, subject/place/period associations, modality and uncertainty. User recollection, external observation, and reconstruction inference are separate origins. |
| `MemoryFragment` | One coherent recollection, habit, impression, route description or event; one or many place/route links; uncertain time; original source spans; selected text revisions. |
| `TextRevision` | Fragment ID, editorial stage, text, supporting statement/span IDs, parent revision, wording approval. No added substantive claim. |
| `EnvironmentState` | Place/area and time applicability; assertions/parameters about its remembered or documented appearance; evidence and unresolved conflicts. Not an annual full-city snapshot. |
| `AssetRevision` | Kind, original/derived/generated provenance, source regions, geometry/style dependencies, prompt/job metadata, checksum, usage and art approval. |
| `SceneRevision` / `Portal` | Manifest of exact geometry/asset/text revisions; camera/hotspots; destination scene and return behavior. A destination may be only an image. |
| `Approval` / `ReleaseManifest` | Approval dimensions and exact revisions; selected publication scope and immutable content/asset closure. Approval of one dimension does not approve the others. |

## Route registration and uniform attachment contract

A route is a registered line used by the overview to enter a street scene. A `Place` remains an independently identified point, line or area; route-first navigation does not make its identity depend on a road, nor require the overview to render all its source geometry.

Conceptual additions (names can be adapted to existing modules without changing their meanings):

| Record | Required meaning |
| --- | --- |
| `RouteSceneRegistration` | Route ID/revision, supported entry edges/ranges, scene revision and period support. Does not assert that an entire source road is a remembered traversal. |
| `RouteAttachment` | Stable attachment ID; referenced place/object/position; route ID/revision; edge/progress or supported interval; side and approach anchor; optional activation-target reference; evidence and unresolved status. |
| `InteractionTarget` | Versioned discriminated union: `note` with memory references; `sequence` with sequence revision; `scene` with scene revision and return policy. No content means no reader-facing target, not an invented note. |
| `SceneSequence` | Ordered page IDs and optional explicit reading links; each page pins image/text/source/period references. Order can be thematic, editorial or temporal and must be declared. No inferred floor-plan connectivity. |
| `StreetEdgeSegment` | Stable locally editable interval on a route side; child boundary/gate/frontage/ground objects, independent lateral placement and period-specific states. |
| `Observation` | Source-supported observation of a place/object with the observed facts, observation time or relative-time relation, familiarity/visible-extent context and source spans. It does not certify the whole environment. |
| `StateTransition` | References to compatible before/after states, supported change kind and evidence; optional approximate time and causal statement only when supported. |

Minimal conceptual attachment:

```text
RouteAttachment
  id, revision, placeId
  routeId, routeRevision, edgeId
  anchor: progress OR unresolved range
  side: relative to canonical edge direction, not current camera/facing
  approach: walk-edge reference, local offset, elevation where relevant
  targetRef: InteractionTarget revision OR null
  periodSupport, evidenceRefs, registrationStatus
```

Exact progress and appearance dimensions remain nullable until supported. An uncertain interval is not an exact doorway and is not silently made walkable. An approved illustrative approach point may coexist with an uncertain historical location, with the roles explicitly distinguished. Nearby is not equivalent to reachable: side, crossing, wall and level relations must be validated.

Several route attachments may reference one place or target; several memories may reference the same attachment. Correcting a door, splitting an edge or reorienting a canonical edge requires an explicit mapping revision, including side/progress updates. Coordinate/name corrections do not rewrite memory IDs. A route-relative location is navigation context, not a replacement for the spatial registry.

## Representation, experience and interaction are separate axes

Store explicit source/geometry uncertainty, date support, remembered exterior/interior familiarity, observed visible extent and memory relevance without collapsing them into one confidence number. A render policy then chooses overview visibility, gate/icon/frontage/mass representation, per-tier detail and street depiction. An independent target chooses what activation does.

A precise modern boundary may stay hidden behind a symbolic gate. A high-detail exterior may have no interior target. A stack of pictures may carry many memories without requiring movement. Geographic ground footprint, painted silhouette, interaction hit area and physical navigation/collision geometry are separate records or fields; enlarging one never silently enlarges the others.

## Street edge and physical identity

Boundary appearance is not a compulsory closed parcel polygon. A segment can specify brick wall, iron railing, masonry-plus-railing, a locally mixed sequence, an opening or unresolved treatment, with independently supported length, height and visual permeability. Physical access is separate from visual permeability: a railing can reveal the rear scene while remaining impassable.

A frontage host is explicit: attached to a supported building, a detached shell, a boundary-facing structure or a ground installation. An adjacent residential block is not a mandatory owner. Preserve the existing rule that slots lie within their actual host, but never fabricate a host relation just to pass that check. Commercial use and low interaction are compatible.

`EnvironmentState` references independently versioned shell, boundary, ground/installation, use and occupant states. Repainting or tenancy can reuse a shell. Demolition/rebuilding replaces the shell reference while retaining the site. Conversion to a shelter or damage to a roof is not merely an occupancy/sign swap.

## Coordinates and precision

The selected outline registration pins `bridgeFrame` and `bridgePeriodIds`. The loader verifies the model's exact frame before mounting. Its local coordinates transform into the existing Xinhua metric frame; illustrations do not supply this transform. The temporal owner removes unsupported extension data/anchors before navigation and rendering. The new registration revision invalidates older saved outline poses through the existing revision check; stable place and destination IDs remain independent.

The implemented geographic interchange frame is WGS84 longitude/latitude, explicitly tagged, with a documented local metric transform for scene rendering and corridor distances. Preserve each permitted coordinate frame and transform revision; map-provider coordinates, image pixels and geographic coordinates are not interchangeable. Verify geographic conclusions outside the repository, then record only the accepted result, uncertainty and runtime transform contract permitted by [the geographic result rules](GEO_DATA_RUNBOOK.md).

Store geometry separately from display offsets, building height, stylization, and camera projection. Building height can be an approximate parameter with its own evidence; changing it must not silently change the footprint. Source positional uncertainty, reconstruction accuracy, and personal familiarity are independent fields. Satellite resolution is not a measure of personal importance.

Routes contain real ordered segments only where supported. A broad planning connection may be registered as an uncertain region or an unconnected pair of anchors. A user can later correct a path without changing its ID or rewriting the memories attached to it.

## Time is not one timestamp

For a memory or state, use a structure equivalent to:

```text
TimeAssociation
  originalExpression          e.g. a user-supplied life-stage phrase
  lifeStageId                 optional; stage dates remain separately uncertain
  earliestPossible / latestPossible
  knownStart / knownEnd       only when actually supported
  relation                    point-like | interval | recurring | uncertain
  evidenceRefs
  mappingRevision             changes to stage/date interpretation are versioned
```

Keep at least four meanings separate: **when something was experienced**, **when an environment is believed to have existed**, **when a source image was captured**, and **when the recollection was recorded**. Recalling a shop sometime in a range does not prove it opened and closed at that range's endpoints.

An interval may mean uncertain occurrence bounds or known duration; `relation` and the original expression must disambiguate them. Do not infer an exact school year or birthday from approximate decade references. Conflicting dating claims can coexist until resolved.

## Repeated observations and same-place recurrence

Retain the four time meanings above and allow additional supported relations such as before/after/overlap/same-era between observations or states. A known order does not imply known durations, and an observation gap is not proof that a condition persisted unchanged. Contradictory ordering remains a review conflict; do not manufacture a total timeline.

Synthetic example, not a public autobiographical record:

```text
site-A: state-A1 (small commercial frontage)
     → state-A2 (shelter use)
     → state-A3 (roof damaged)
     → [unobserved interval]
     → state-A4 (commercial frontage seen again)
```

All four states refer to `site-A`; each has its own evidence and identity. A4 is not automatically the same shell, occupant, doorway count or exact appearance as A1. The example establishes no year, named site, cause or residence association. A later observation may resemble an earlier state without merging their revisions.

An event belongs in the record only when supplied; a sequence of ordinary observations is also meaningful. Do not add periodic weather, business cycles or annual tree growth simulation because the user described recurrence. Sparse recorded states are enough.

A release can deliberately select a compatible approximate-period composite with explicit memberships, or an authored remembered phase. It cannot silently combine mutually exclusive states or interpret the nearest dated image as historical truth. Reading a note/sequence and changing the active environment are separate commands.

## Temporal query result

The implemented `relateTime()` returns a `current`, `earlier`, `later`, `overlapping`, or `unknown` relation string. A future query envelope should also identify the selected record revisions without exposing private authoring evidence. Color is a presentation of the relation, not its storage representation. When bounds overlap or chronology is unclear, do not force an earlier/later label.

For a scene, return an explicit compatible environment revision or `no_supported_state`. A nearest source date can be offered for inspection but cannot silently become the active period. Other-time memories remain reachable through route-context attachments or a deliberate local time/history view; their historical buildings are not automatically inserted as physical obstacles or direct overview portals.

## Fragment and source granularity

One recording may yield several fragments; each retains its source spans and the recording's ID. Several recordings may support a merged display fragment without deleting their differences. Potential duplicates are review candidates, not automatic deletions. A recurring habit is a single meaningful record with duration/frequency as actually stated, not thousands of synthetic events.

A permitted photo can support several private authoring records. Keep any source spans or region annotations in that private boundary and publish only cleared derivatives. Capture position and subject location are distinct; a photograph does not give every visible object the camera's coordinates. Geographic result publication remains subject to the conclusion-only rule above.

Original photograph, restored/edited photograph, composite, and reconstructed image are distinct provenance classes. Generated output can reference evidence but never becomes an independent source proving the scene. A user approving an overall likeness does not certify each window, sign, person, or color as factual.

## Revision and deletion rules

Registration, text, art, factual confirmation, and publication approval each bind to exact revisions. Replacing an approved image invalidates that image's art/publication selection until reviewed; unrelated fragments are unaffected. Common building/material templates are versioned and pinned, so a template update cannot globally alter accepted memories.

Preserve originals and history under normal editing. A correction adds a superseding statement or revision; a lawful/user-authorized deletion purges protected source content and affected derivatives as required. Tombstones must not retain the deleted personal content. Public Git history is unsuitable for storing material that may later require this treatment.

## Query and indexing requirements

Support spatial-window queries, route-plus-buffer queries in metric units, period filtering, aliases/full-text search, and source-to-derived-asset dependency lookup. Paginate both memories and review queues. Build screen-space clustering in presentation, not by deleting nearby records. Rebuild indexes from authoritative records. No monthly archive growth should require loading all recordings or all text into a browser session or an Agent prompt.

## Selected outline session state

The implemented Xinhua/Sanli close-view seam stores `session.outline`: registration revision, originRoute key, environmentId, local-metre position, yaw/distance/pitch camera, continuous path, destination, visited waypoint IDs and travelled distance. Application `outline-state` validates finite/ranged values and clones updates; nested portal snapshots preserve it. Restore drops pending paths/destination and invalid poses, opens a usable overview, and revalidates revision/entry and collision before the next street mount. This field is a concrete selected-scene adapter, not the proposed general RouteAttachment migration. `outline-registration.json` binds the stable place IDs, registered local frame, scene bytes/art revisions and explicit working-composite period members.

### Selected street presentation overrides — Yunbai–Kandan

The selected outline scene keeps `buildings` source IDs, `originalRing`, stored height and storeys separate from `buildingPresentation`. Each presentation record references `sourceBuildingId` and can provide an evidenced `displayHeight`/`displayKind` or an `openUpper` drawing band. Existing `residentialDisplayVolumes` remain footprint-only presentation overrides. Neither record changes spatial identity or the collision footprint. The local scene frame and public registration remain authoritative; no sandbox coordinate transform is loaded at runtime. The working-composite temporal membership is unchanged and does not certify a historic year.

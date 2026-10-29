# Core architecture: four layers and shared state

Status: layer boundaries reconciled against main on 2026-10-29. [RUNTIME](RUNTIME.md) and [STATUS](STATUS.md) report implementation and delivery separately. Existing spatial/time/session, composition and illustration-mapping modules are retained. The general route-attachment dispatcher, private authoring/release service and street-edge/history contracts below remain requirements, not an implemented migration.

[INTERACTION](INTERACTION.md) owns the area → route → attachment journey; [DATA_MODEL](DATA_MODEL.md) owns record semantics; [LAYER_COMPOSITION](LAYER_COMPOSITION.md) owns independently replaceable street-facing structures. [MAP_ASSEMBLY](MAP_ASSEMBLY.md) and [HANDPAINTED_MAP_ART](HANDPAINTED_MAP_ART.md) retain geographic, projection and painting constraints.

<a id="layer-scopes"></a>

## 四层 scope

四层按责任和数据所有权划分；目录位置不决定权限，也不要求拆成四套应用。当前 `src/explorer/main.js` 同时承担 UI 绑定和应用编排，仍须遵守下表。每项工作先确定主层，再列出确实需要修改的相邻层；修改一个层不能顺便重设其他层的事实或产品规则。

| 层 | 负责什么 | 输入 → 输出 | 修改纪律 | 规范所有者 |
| --- | --- | --- | --- | --- |
| **UI** | 菜单、分组搜索、控件、阅读界面、状态反馈、两类转场的交互节奏、键盘/触摸/减少动态效果 | 已解析的地点/内容摘要、session 状态、用户操作 → 浏览命令与界面反馈 | 不另存一份位置/年代/返回栈；菜单不编造坐标、可达性或记忆；开发状态不进入读者界面 | [INTERACTION](INTERACTION.md) |
| **视觉引擎** | 投影、相机实现、轮廓/材质/遮挡、人物运动表现、命中与导航算法、帧循环、加载/驻留/销毁 | 已注册几何、已解析时期、固定资产版本、session 姿态及批准的交互规则 → 画面、命中/可行走计算结果、受控状态回调 | 不用画稿反推真实地理；显示高度/裁切/LOD 不反写源数据；优化不擅改过街和直达规则；资源缓存不取得持久状态所有权 | [RUNTIME](RUNTIME.md)、[ASSET_PIPELINE](ASSET_PIPELINE.md)、[MAP_ASSEMBLY](MAP_ASSEMBLY.md) 的绘制契约 |
| **地图地理** | 地点/道路稳定身份、源 footprint/高度、坐标框架与注册、空间关系、时期适用范围和确定程度；挂载的空间锚点 | 允许发布的地理结论及版本 → 可供绘制、导航、目的地和挂载引用的空间记录 | 源几何与显示表达分离；未知保留未知；坐标或拓扑改动显式迁移依赖；地理挖掘、检索、论证、溯源过程绝不入库 | [DATA_MODEL](DATA_MODEL.md)、[GEO_DATA_RUNBOOK](GEO_DATA_RUNBOOK.md)、[GEO_DATA_LINEAGE](GEO_DATA_LINEAGE.md) |
| **记忆挂载** | 记忆片段、原意与编辑版本、时间关联、发布范围；空间锚点到 note / sequence / scene 内容目标的绑定 | 已注册锚点、获准使用的文字/素材、时期关系 → 有类型和版本的内容目标及加载请求 | 不凭地点类别决定内容深度；不补造个人经历；不以图片页序代替空间连接；文字修订不移动地点或重建街景；私人原文不进入公开仓库 | [CONTENT_PIPELINE](CONTENT_PIPELINE.md)、[DATA_MODEL](DATA_MODEL.md) |

### 共同状态与调用边界

- **应用 session 是唯一浏览状态所有者**：位置、时期、相机、选择、步行路径、浏览偏好和返回栈由现有 application/session 边界管理。UI 可保有搜索词、菜单展开状态；转场和渲染器可保有临时动画进度。这些局部状态不能成为第二套持久世界状态。
- **空间与时间分别解析**：地图地理提供注册记录；temporal resolver 判断记录与当前时期的关系。显示风格、内容数量、资源可用性都不能改写这两个判断。
- **UI 发命令，应用编排，渲染器执行受控变化**：地点选择由现有目的地解析得到有效街景落点；应用协调加载、取消和覆盖时机；stage 经 session 写入接口提交落地。纸飞机、手账画布和地图像素本身都不拥有位置写入权。
- **到达与打开内容是两个动作**：目的地直达保持街景/路线语境。记忆入口再解析内容目标并保存返回来源。`RouteAttachment` 的空间部分归地图地理，目标内容、版本和发布范围归记忆挂载；两者使用稳定 ID 衔接。
- **所有者不随缓存改变**：chunk、GPU 对象、解码缓存和临时 stage 都可被淘汰重建。它们不能改变 place / route / attachment / content 的持久身份，也不能让取消或晚到响应覆盖新 session。

### 已实现与目标契约

当前主入口已有三档手绘总览、选定轮廓街景、分区目的地菜单、直达与自由步行、手账入街和纸飞机直达转场；资源管理和 session 接缝也已接入。已有地点卡、公开 memory 查询和返回快照的代码接缝；合成记忆与嵌套 portal 保留为演示代码和 fixtures，默认入口不展示。**通用 RouteAttachment 分发器、完整图文序列阅读/编辑、私有档案及审核发布后台仍是目标契约。** 新规范不自动激活这些实现，示例入口也不能被当成任意真实记忆均可挂载的证明。

<a id="cross-layer-changes"></a>

## 跨层修改与局部更新

| 改动 | 主层及需要同步的边界 | 应保留的约束 / 验收重点 |
| --- | --- | --- |
| 菜单层级、标签、搜索、阅读排版 | UI；内容含义有变化时同步记忆挂载 | 现有 ID/目标、键盘触摸操作、手机布局和返回来源 |
| 手账或纸飞机转场、相机表现 | UI + 视觉引擎；应用 session 接缝 | 两类转场保持区别；覆盖时提交、取消/失败/重入、减少动态效果、临时资源释放 |
| 线条、材质、显示高度、开放上部轮廓、驻留优化 | 视觉引擎；涉及派生注册时同步地图地理 | 源 footprint/高度不变；相同相机的可视结果、命中/遮挡/导航、资源所有权 |
| 地点位置、道路连接、注册变换、有效时期 | 地图地理 + 所有受影响消费者 | 列清总览绘制与命中、近景、导航、目的地、挂载锚点、保存姿态的失效或迁移；只重建受影响派生物 |
| 新增或编辑一段记忆、增补图片页 | 记忆挂载；有必要时同步 UI | 原意、时期/未知、发布范围、目标版本及加载/返回；不自动扩展地理或生成场景 |
| note / sequence 改为可走的局部 scene | 记忆挂载 + UI + 视觉引擎；新增锚点时同步地图地理 | 先有获准的交互范围；保留地点身份和返回栈；明确几何、导航、资源及内容验收 |

任务包和 PR 至少写明 **主层、触及层、读取的权威输入、允许修改的输出、跨层影响、明确排除项、实际消费者与验证方式**。纯 UI、样式或文案任务不得把顺手重画地图、改年代、换身份或补写记忆列为实现细节。确需跨层时，在原任务范围内同步所有者与验证；超出已授权目标的扩展另行界定，常规同契约修复无需反复确认。

## Shape of the system

Build one application with a coherent session and modular adapters. The public code repository, private authoring archive, and publication-cleared presentation have separate content boundaries. Public geography contains permitted results and uncertainty only; [the absolute publication rule](CONTENT_PIPELINE.md#地理资料的绝对公开边界) overrides older source-ledger instructions throughout the repository.

The explorer consumes pinned public records today. A future private workbench edits versioned proposals and reviews wording, art, registration and publication separately; it must not directly mutate an accepted running scene. A future public viewer receives only a publication-cleared subset, never the private database with sensitive fields hidden by CSS. These authoring/release surfaces are not existing services.

## Ownership boundaries

These are module responsibilities, not a demand for separately deployed services.

| Owner | Sole responsibility | Must not do |
| --- | --- | --- |
| Spatial registry | Stable place IDs, geographic geometry revisions, coordinate transforms, route registration | Let an image generator move canonical roads or building footprints |
| Memory catalog | Fragments, meaning-preserving statements, period associations, edited text and relationships; private originals stay in their authorized archive | Infer unspoken autobiographical facts or publish private source material |
| Temporal resolver | Resolve current/other/unknown time relationships and admissible environment states | Silently select a nearest-year image as the current historical state |
| Application session | Current location, period, camera, selection, portal return stack, browsing mode | Duplicate these states in independent map and interior controllers |
| Scene resolver | Resolve a route scene, applicable attachments and one typed activation target; choose representation and lazy content dependencies | Expose every geographic object as an overview portal; invent facts or generate content while browsing |
| Asset registry | Provenance, immutable revisions, derivatives, approvals, source-use restrictions | Treat a reconstructed image as original photographic evidence |
| Authoring/review | Draft batches, compare revisions, approve wording/art/registration independently | Equate technical merge with personal or aesthetic approval |
| Release/export | Resolve approved manifests, verify privacy/use status, publish/export/revoke references | Publish drafts by default or use Git as the private archive |
| Presentation adapters | Render map, boxes, sprites, image scenes, accessible text and small controls | Become an alternative coordinate, chronology, or persistence authority |

A renderer may own implementation resources such as its frame loop and GPU lifecycle, but it does not own domain identity. Only the active scene's controller may receive navigation input; dormant interiors must not keep consuming input or continuing scene animation unintentionally.

## Runtime composition

The overview is a hand-drawn/cartoon/travel-journal illustration with a separate drawing-space layout. Stable node and edge IDs connect that layout to WGS84 source geometry. A route location is `{ edgeId, t, direction }`; geographic and illustration coordinates are derived views, not competing session positions. Do not force an artistic map into one global affine transform or infer a geographic address from an arbitrary illustration pixel.

Entering the selected street preserves its route context and puts the continuous outline figure in the registered Xinhua/Sanli corridor. The current close scene uses a perspective camera, source-backed building footprints with separately authored display masses, restrained flat colors and sparse motion. Existing GLB/graybox and orthographic fixtures are retained historical work, not the active overview→street consumer. The same application session owns position, heading, camera, active period, path and return context. Rendering does not make approximate ground extents or modern-source geometry into historical evidence. See [illustration mapping](ILLUSTRATION_MAPPING.md) and the [outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md).

Map illustrations, vectors, boxes, sprites, and portal images all reference the same scene manifest and transform revision. A pixel-to-world mapping cannot be independently re-created in the click handler. Foreground silhouettes and visual offsets must not alter the ground-space identity of a memory anchor.

`SessionState` contains the active period selection, world/place anchor, camera pose, current scene revision, selected memory, view mode, and return stack. Phase 1 supports walking plus deliberate destination travel. `travelMode` (`walk` or `jump`) controls ground clicks and persists as a browsing preference; named destinations always use direct travel. Keyboard movement remains walking. A motion preference belongs to browsing context, not permanently to the street itself.

Entering an attachment from an active route captures the origin and resolves the target on demand. A note, a static sequence and a local scene share this return contract. No normal overview interaction bypasses the route layer. Loading failures retain a usable origin; stale session/scene responses are discarded.

## Route registration and attachment resolution

The spatial registry retains all legitimate point/line/area records. The overview's navigable registration indexes are streets/routes and their supported entry ranges, not an independent list of every place's content destinations. A street graph describes possible supported connections; a remembered route describes a traversal over that graph. Neither implies that every nearby connection was walked.

A place keeps its ID independently of any one route. `RouteAttachment` binds an object or remembered position to the appropriate route edge, side and approach point/range. Several attachments may reference the same place or content target; a hospital with two entrances must not become two unrelated hospitals. Changing an edge geometry requires explicit attachment remapping, not nearest-road snapping or recalculation from painted pixels.

The activation resolver accepts attachment ID, active environment/period and session origin. It returns one of `note`, `sequence`, `scene`, or a non-activation result with no fabricated content. Note/sequence presentation consumes the same memory catalog; only a spatial scene needs a walk controller. A place's categorical label never dispatches its implementation by itself.

Resolve in this order: selected period/environment → supported route/walking edge → frontage and boundary states → nearby attachments → approved activation target and render policy. Scene loading is on demand. Prefetch small metadata or neighboring sequence pages only within a measured budget; do not load every interior or run generation at map opening.

## Session transitions and recovery

The application entry owner also coordinates direct travel through `travel-transition.js`, reusing its load generation and AbortController. `destinations.js` groups existing anchors and resolves nearby valid landing ground without A*. The renderer's `arrive()` commits a valid position and clears paths through the same session write seam, preserves camera parameters and requests a covered camera snap. The paper-plane overlay and `travel-drawing.js` own only transient screen-space animation/presentation; they cannot move the person or persist state. One bounded DPR-capped canvas draws the plane/trail while a solid paper layer provides the opaque landing seam; an overlay ResizeObserver redraws the current frame and is disconnected with the abortable animation on cleanup. Travelling to a registered street position does not activate an interior or note. The existing scene slot, period resolver, route registration and resource disposal owners remain authoritative.

The map-to-street presentation in src/explorer/entry-transition.js owns only a temporary modal canvas and cancellable frame sequence. Its journal catalog pairs fictional text with selected doodle art; journal-drawing.js supplies image-derived ink reveal, layout and sparse accents. These modules have no memory-catalog, geographic-registration or persistence authority. The application entry owner keeps its existing load-generation/AbortController boundary; the session owns the persisted `entryTransition` preference (`journal` or `simple`) and final map/street pose. The selected renderer accepts a transient entry-camera progress without writing it to session storage. During that presentation its one scene loop can render while navigation stays blocked; cancellation releases the overlay and camera override. A nested return preserves the current user preference.

Normal navigation is overview → route scene → attachment content. Capture the route ID/revision, edge/progress, side, local offset, heading, camera, active period, scene revision and selection before activation. A sequence also owns a page cursor and optional approved reading links; page order is not spatial connectivity.

Closing a note or sequence returns to exactly the same street context. A local scene can contain further attachments and return through the same stack. Preserve the origin while loading, pause the inactive walk controller, cancel stale loads and recover cleanly from unavailable content. Search can reveal/focus the relevant route and attachment; an intentionally resumed interior must restore a valid origin stack rather than inventing an overview-to-room portal.

An attachment may acquire more notes or change from note to sequence/local scene by a reviewed target revision. Its street anchor, place identity and unrelated neighboring objects do not change. A static picture group can remain the final representation indefinitely.

## Local invalidation, not city rebuilding

The dependency chain is route geometry → attachments/segment spans; frontage or boundary state → local masks/occlusion and affected assets; content target → the local note/sequence/scene manifest. A note edit never moves a gate or rebuilds the map. A wall/railing substitution changes only the affected segment's appearance, visibility and physical behavior. A shell replacement retains the site, but a demolished structure is not falsely kept as the same physical building.

Keep storage, authentication, releases, stale-load checks and privacy boundaries below. The new design does not require another engine, microservice fleet or speculative database vendor.

## Storage and query contract

The authoritative archive must be durable and exportable; browser cache is only a convenience. Start with a simple private archive/database and object storage adapter when implementation is authorized. Do not create distributed infrastructure merely because the logical model has several owners.

Spatial records support point, line and area intersection/proximity queries. Memory queries combine spatial extent or route corridor, period relation, visibility/release, and relevance. Results are paginated; visual clustering and progressive detail keep hundreds or thousands of fragments from becoming hundreds of overlapping labels. Search indexes are rebuildable derivatives, not the only copy of the words.

Separate spatial chunks from content batches. Geographic tile/chunk boundaries are performance choices; they must not become the persistent identity of a school, shop, or recollection. A fragment may reference several places and sources. Updating one small area invalidates only affected derivatives and manifests, not the entire town.

## Authority and data flow

Registration proposals are reviewed before becoming active geometry revisions. Text, art, factual-evidence, and publication approvals are distinct. A scene manifest points to exact geometry, asset and text revisions; it never means “use whatever is newest.” A new generator result is a draft replacement, not a silent upgrade.

The public repository contains contracts, application source, and synthetic or cleared fixtures. Source URLs alone do not establish reuse rights. Private originals and their associations remain in authorized private storage. Public technical records contain only explicitly cleared references and IDs necessary for product data joins; opaque identifiers must not reveal prohibited associations. Do not embed private storage URLs, prompts, transcripts, coordinates or EXIF in PRs.

## Failure and recovery

A missing temporal state yields an explicitly sparse background and discoverable other-time entrances, not a made-up current-period city. An unavailable asset uses a source-appropriate placeholder while preserving navigation. Rejected art/text stays out of active releases. Optimistic revision checks reject conflicting edits instead of letting the latest Agent overwrite another's work.

An export includes records, original/derived assets allowed by the selected privacy scope, manifests, transformation metadata, approvals, and checksums. Rebuildable caches are omitted. Restore must be tested into a clean instance; a successful ZIP download alone is not proof of recoverability. User-requested deletion and publication withdrawal override ordinary retention; preserve only permissible tombstone/audit metadata.

## Source layout: current owners and future surfaces

This map combines current source owners with future authoring/provider surfaces; it does not claim that every listed directory or capability is implemented:

```text
src/domain/             identities, time/geometry contracts, pure selectors
src/application/        session, commands, query orchestration
src/explorer/           map/scene/image adapters and minimal HUD
src/engine/             current rendering-lifetime and spatial-query utilities
src/workbench/          private ingestion and separate review controls
src/adapters/           storage, historical sources, generation providers
content/public/         explicitly cleared fixtures/manifests only
tests/                  domain, round-trip, privacy and visual evidence tests
```

Keep dependency direction toward domain contracts. Presentation must not import provider-specific generation logic; generation jobs must not own browsing session state. The engine utility directory now exists; workbench/provider entries remain future owners. Concrete dependency changes require an implementation packet and targeted verification.

## Selected outline integration

The Xinhua/Sanli selected close view is adapted by `src/explorer/outline-stage.js`. `PublicRepository` verifies its registration/data hash before mounting. Spatial `createLocalSceneFrame` converts registered WGS84/local metres; session outline-state owns revision, origin route, position, camera and path. `resolvePeriodState` selects explicit working-composite membership without historical interpolation. The renderer uses isolated Shadow DOM styles, abortable listeners and one cancellable loop. Existing portal snapshots include outline state. This implements the selected close-view seam, not the general attachment-schema migration above.

Corridor extension uses the existing outline registration and application session. Data-driven destinations include Xinhua east/west, Kandan Bridge and Qili west-facing Daoxiangcun forecourt. The stable scene ID is retained; registration revision invalidates stale poses. Three display masses are segmented above detached low shops while source footprints remain intact. Named frontage uses permitted registered conclusions and explicit uncertainty; numerical ground extents remain approximate.

## Selected runtime resource ownership

The resource change has four separate lifetimes. Their budgets and validation limits are specified in [RUNTIME](RUNTIME.md#bounded-runtime-resources--dm-runtime-residency-20261027), with delivery evidence in the [task packet](attention/tasks/DM-RUNTIME-RESIDENCY-20261027.md).

| Owner | Keeps | Releases / invalidates |
| --- | --- | --- |
| Application session | Registered scene revision, route/environment context, pose, camera and path | Invalid states are rejected/remapped through existing registration/session rules; resource eviction never rewrites place identity |
| Public repository | Bounded reusable decoded records and shared in-flight public requests | LRU eviction removes cache references; epoch invalidation aborts requests and rejects late results |
| Outline stage slot | At most one compatible renderer/navigation pair for 60 seconds after returning to overview | An incompatible context, expiry or final page exit disposes it; suspended stages schedule no frames and accept no navigation input |
| Spatial drawing | Active/pinned chunk resources and a bounded inactive warm cache | Warm LRU/age eviction releases chunk-owned allocations; final drawing disposal also releases scene-shared resources once |

`src/engine/frame-loop.js`, `spatial-index.js`, `chunk-residency.js`, `resource-scope.js` and `navigation-grid.js` are implementation utilities. They own neither chronology nor coordinate authority. A chunk identifier is a disposable presentation/cache key; registered places, source footprints and destination IDs remain stable across eviction and reconstruction. Shared materials and textures have an explicit scene owner so releasing one chunk cannot invalidate another chunk's rendering.

The selected scene still downloads and validates one complete JSON payload. Drawing factories create spatial GPU resources on demand; navigation evaluates grid cells on demand with bounded reusable caches, explicit per-query work limits and one adapter-owned instance. A query that exhausts its work budget fails safely; it does not certify physical disconnection. These changes do not implement network chunk streaming, a globally bounded visible set, a hierarchical road graph or automatic LOD. The accepted full camera frustum remains the rendering boundary, including distant ink beyond the filled surfaces' fog range.

Asynchronous mount results are accepted only while their caller, repository epoch, source path and session context remain current. View cancellation can detach from a shared fetch; repository invalidation owns cancellation of that fetch. No completed stale request may replace a newer stage or publish old session state. Final cleanup remains separate from temporary suspension, and neither becomes a second persistence owner.

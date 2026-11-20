# Data model and registration contract

本页定义身份、地理/时间和挂载语义。现有公开数据、通用目标模型与新私有读取 v1 必须区分；字段定义不等于已经有编辑器或街景消费者。实际范围见 [RUNTIME](RUNTIME.md)。

<a id="memory-attachment-contract"></a>
## 记忆挂载层：身份、入口与内容的边界

Place/Route 的稳定身份和几何修订属于地图地理层；挂载负责把获准内容关联到入口。改文字不挪门，改门须显式重映射。关闭 note/sequence/scene 后，application session 恢复原位置/时期/镜头；内容不能另建返回栈。读取其他时期的片段不等于切换当前环境。

当前 `PublicRepository.memories()` 按 public manifest 的 placeIds/chunks 读取并用 `relateTime` 标出时间关系；公开 demo 仅合成数据，默认隐藏。旧 `portalId`/courtyard 不代表选定街景已支持通用挂载。新私有 v1 提供 route attachments、note 和展示图片的读取契约；独立 sequence/scene 分发、任意街物激活和作者工具仍待实现。

## Geography is the lookup skeleton, not a mutable primary-key string

坐标和空间索引用于配准/查询，opaque stable ID 用于持久关联。地名、经纬度字符串、tile 文件名、geohash、Drive 文件名/ID 均不是地点或记忆的永久主键。学校机构、历史校址及占用时期分开；同名迁址不覆盖旧地点。同一位置可有多个对象，一个片段可关联多个位置。

## Common envelope

记录包含 id、schemaVersion、revision、来源/批准/隐私范围等适用元数据。字段不是公共导出白名单：私人原文跨度、裁切、审核关系、具体个人锚点只能留在私有作者边界。公开数据只给获准结果和必要运行时元数据；opaque ID 也不能成为可公开个人关联的借口。未知值为 null/unknown，不填零日期、现代替代校址或推定坐标。

## Core records

| 对象 | 含义 |
| --- | --- |
| Place / GeometryRevision | 稳定地点身份；独立的点/线/面几何、CRS、变换版本、有效时期和精度 |
| Route / RouteRevision | 已登记有序路段/入口；未确定连接保持缺口，不自动最短路补齐 |
| Institution / Occupancy | 机构身份独立于场地；带不确定时间的占用关系 |
| SourceRecord / Statement | 私有原始输入及其支持的陈述；回忆、外部观察、重建推断身份不同 |
| MemoryFragment / TextRevision | 原意、一个或多个关联、未知/重复时期、原文跨度及所选文字版本 |
| EnvironmentState | 场所/区域的时段适用与外观状态，不是虚构逐年城市快照 |
| AssetRevision / SceneRevision | 原始/派生/生成身份、权限与选定几何/素材/文字版本 |
| Approval / ReleaseManifest | 分维度批准、受众范围及不可变依赖闭包；代码合并不构成内容批准 |

## Route registration and uniform attachment contract

目标模型中的 `RouteSceneRegistration` 声明路线/路段支持哪些场景与时期；`RouteAttachment` 引用地点/对象/位置、route revision、edge/progress 或未决区间、side、approach、target 与登记状态。side 相对于规范路段方向，不相对于相机朝向。位于附近不代表可通行，墙体、过街、层级和正确侧向仍需验证。

`InteractionTarget` 是 note / 有限 SceneSequence / 独立 scene 的显式版本选择。有限序列的顺序可为主题、编辑或时间顺序，不能推断为室内连通或自动年代。一个地点可有多入口；一个入口可有多片段；改名/坐标不改记忆身份。路线拆段、反向或门口修正要求明确迁移。

## Representation, experience and interaction are separate axes

分别保存来源精度、时间支持、熟悉程度、可见范围、内容相关性与交互深度。现代轮廓精确不要求完整绘制；少量熟悉的门与建筑可代表大院。地理 footprint、画出的 silhouette、点击范围、碰撞/通行范围独立。大楼不能因图标化变成事实上的矮楼。

## Street edge and physical identity

砖墙、铁栏、混合边界、门、独立临街小屋和地面设施是可局部编辑的对象。商业门面不必依附住宅首层；能看透不代表能穿行。涂漆/换租户可复用实体，拆建改 shell revision 而保留场地 ID。观察、损坏、修复、再使用用 Observation/StateTransition 表达，不能把事件简化为贴图变化。

## Coordinates and precision

地理互换坐标为显式 WGS84 [longitude, latitude]；GCJ-02/BD-09、画面像素和本地场景坐标不混用。公共登记提供已知的 local metric frame、transformRevision；私有锚点通过同一变换投影，不写回公开登记。bridgeFrame、bridgePeriodIds、scene/data/art 哈希继续由现行 loader 核验。显示高度、绘画偏移和相机投影不反写 footprint。

不确定区间不是精确门口；示意可达点与历史位置可并存但角色必须标清。私人空间补充在锁定时卸载，未经授权不泄露有多少热点或哪处有个人关联。

## Time is not one timestamp

区分经历时间、环境有效时期、源图片拍摄时间和记录时间。保留原始表达、学龄阶段、可能范围、已知起止、重复/点状/区间关系与解释修订。知道“先后”不代表知道持续时间；记得某年出现不证明开闭业日期。未知阶段不能自动换算出生年/学校年级，不以最近年度环境代替缺失状态。

## Repeated observations and same-place recurrence

同址反复观察保留源陈述和相容/矛盾关系。复用、毁损、修复、再次使用不创建新 Place；实体和环境版本分别修订。推断不是个人回忆，生成图不是历史照片。来源与审核只在授权作者端可见。

<a id="private-release-v1"></a>
## Private release v1：可执行读取子集

机器数据为 raw JSON，不是直接从 Google Doc 正文猜字段。`server/private-content.mjs` 负责验证与白名单投影；存储实际 ID 只在服务端可见。

| 文件/对象 | v1 必填字段及约束 |
| --- | --- |
| release.json | schemaVersion=1, kind=`digitalmemory.private-release`, privacy=`private`, status=`approved`, releaseId, revision（字符串）, geometryRevision, transformRevision, attachments, memories[], media[] |
| attachments 引用 | fileId、64 位小写 SHA-256；文件必须直属 registry 目录 |
| memories[] | id、fileId、sha256；JSON 文件必须直属 memoirs 目录；ID 唯一 |
| media[] | id、fileId、sha256、role=`display`、mimeType（image/png、image/jpeg 或 image/webp）；直属 display 目录 |
| attachments.json | schemaVersion=1, privacy=`private`, records[]；最多 10,000 条 |
| attachment record | id、revision、routeId、placeId（可 null）、geometryRevision、transformRevision、anchor、time、target={type:`note`,memoryId}；目标必须纳入同一 release |
| note JSON | schemaVersion=1, privacy=`private`, id、revision、title、text、time、images[]；每项图片仅 assetId、alt、caption |

v1 anchor 接受 `route-progress`（edgeId、0..1 progress、side=left/right/unspecified）、`wgs84`（坐标）或 `unresolved`。scene-local frame、区间锚点、多目标与独立 sequence/scene 是通用模型的后续实现，不得伪称 v1 已支持。wgs84 只提供位置，不自行生成可通行到达点。

v1 time 接受 unknown、stage(stageId)、window(start,end)，并保留 originalExpression；没有强制学龄换算。后端只做 routeId 分页，时期关系仍应由既有时间 owner 在实际消费者中解析，不能把这里说成已完成空间/时序数据库。

release 的 geography/transform 修订必须与公共地图一致，否则客户端拒绝挂载。后续请求带 `X-DigitalMemory-Revision: releaseId:revision`，不一致返回 409。发布先上传精确依赖再切换清单；直接覆盖依赖导致 SHA 不符时拒绝服务，不用新 hash 静默接受变更。Drive 仍可原位修改文件，版本不可变性是发布纪律加校验，不是提供者的保证。

客户端 manifest 仅含版本/兼容性和能力，不含 Drive ID、作者来源、授权列表或未授权对象。服务端每个对象都从当前受众可读 release 中查找；不能凭用户递交文件 ID 下载原件。目录 ID 和服务账号属于私有运维配置，参见 [runbook](PRIVATE_CONTENT_RUNBOOK.md)。

## Query and indexing requirements

目标能力包括空间窗口、路线缓冲、时期/别名/全文、来源到派生资源依赖查询与分页。聚类属于显示层，不删除相邻记录；索引可由权威数据重建。v1 的包大小/条数上限必须诚实记录，不能把“前端分页”声称为 Drive 原生空间查询。

## Selected outline session state

session.outline 在内存中含登记版本、originRoute、environmentId、本地位置、yaw/distance/pitch、路径/目的地/访问点及步行距离。`session-projection.js` 只持久化选定公共姿态/偏好，丢弃私有选择、正文、授权、返回栈、待行路径、visited 与 destination；复原仍以可用总览为起点，并由 outline-stage 再验证登记、环境和碰撞。私有锚点不能借 public pose 字段写入 localStorage。

### Selected street presentation overrides — Yunbai–Kandan

保留 sourceBuildingId、originalRing、height/storeys 与独立 buildingPresentation；displayHeight/displayKind/openUpper 和 footprint-only 展示块不改变源身份/碰撞。当前公共 local frame 与时期成员关系仍有效，本次没有修改场景或历史年份。

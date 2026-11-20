# Core architecture: four layers, one session, two content sources

本页拥有层级边界与跨层接口；数据字段归 [DATA_MODEL](DATA_MODEL.md)，内容审核归 [CONTENT_PIPELINE](CONTENT_PIPELINE.md)，实际消费者与缺口归 [RUNTIME](RUNTIME.md)。代码存在、测试通过、合并和生产启用不是同一状态。

<a id="layer-scopes"></a>
## 四层 scope

| 层 | 拥有什么 | 不得越界做什么 |
| --- | --- | --- |
| UI | 菜单、控件、阅读、临时转场；向 application 发命令 | 私建位置/时期/返回栈；从显示名称生成地理事实或记忆 |
| 视觉引擎 | 绘制、相机、命中、导航计算、资源生命周期 | 把显示偏移/高度带写回源几何；自行改年代、记忆含义或权限 |
| 地图地理 | 稳定 Place/Route 身份、几何修订、坐标变换、时期适用、空间锚点 | 依据图像像素改地理；把个人关联或查证过程写入公共登记 |
| 记忆挂载 | 原意、文字/图片版本、入口与 note/sequence/scene 的关联、受众 | 因学校/医院类别自动建室内；把内容审核当作公开授权 |

授权、存储、发布清单属于跨层基础边界，不另造第五套产品状态。公有与私有记录遵循同一坐标/时间契约，但不能因为同源合成显示就合并访问权限。

### 共同状态与调用边界

`application/session` 唯一拥有位置、时期、镜头、选择与返回栈。地图与室内不各存一份权威状态。私有阅读器只借用返回语境；关闭或失败恢复原入口，不自动切换时期。浏览状态持久化由安全字段投影负责；私有资料和授权状态不进入完整 session 存储。

公共地图初始化不依赖私有服务。目的地直达只落到已注册、可达街景地面；到达不等于打开回忆。普通体验仍是 **面 → 街/路线 → 沿街挂载**，不是大地图上每个建筑都直接点进全文。

### 已实现与目标契约

当前静态消费者是 R7 总览、选定 Xinhua/Sanli 轮廓街景、分区直达、手账入街与纸飞机转场。旧 GLB 人物/灰盒/courtyard 保留但不是选定消费者。双源客户端与受控服务端现在有可测试模块；私有街景阅读 UI、生产登录和真实 Drive 连接仍未启用，见 [RUNTIME](RUNTIME.md#storage-seam)。

<a id="cross-layer-changes"></a>
## 跨层修改与局部更新

| 改动 | 同步的所有者与检查 |
| --- | --- |
| 菜单/视觉样式 | INTERACTION、实际消费者；不得顺手改地点、年代或记忆 |
| 道路、入口、坐标变换 | DATA_MODEL、登记修订、地图/导航命中、挂载显式重映射与保存状态失效 |
| 文字、图片、阅读顺序 | CONTENT_PIPELINE、内容版本与清单、原上下文恢复；不重建地图 |
| note 升级为 sequence/scene | 数据目标版本、UI 分发、加载/销毁、返回与验证 |
| 私有数据提供者或身份方案 | 本页访问边界、DATA_MODEL 的发布契约、运行时/运维检查；不改空间身份 |
| 缓存/资源策略 | RUNTIME、实际资源所有权与失效测试；不能改变可见事实或内容范围 |

任务包与 PR 写明主层、触及层、权威输入、允许输出、排除项、实际消费者与检查。文件同目录不等于可跨层改动。

<a id="dual-source-mount"></a>
## 双重挂载：公开世界 + 私有内容层

```text
GitHub public source ── tracked public build ── PublicRepository ── map/street
                                                               │ shared IDs/frame
Private Drive release ── authenticated server projection ── PrivateRepository
                                                               │
                                                  optional content mount/reader
```

GitHub 保存程序、通用美术、获准公开的地图结果、数据契约和合成测试。Drive 保存正文、个人图片、精确私人位置及内容到地点/路线的关系。即使地点本身公开，“这段个人经历挂在这里”的关系仍然私有。公开清单不能提前列出私人热点、标题、数量或不可逆散列形式的个人关联。

私有注册可以引用已公开的稳定 ID，也可以保存不公开的 WGS84 锚点或未定位状态；使用同一已登记变换，由私有层投影显示。它不覆盖公共 Place/Route 记录，不以坐标字符串、地名或 Drive 文件名充当永久身份。公共路线拆分、方向反转或 frame 变化，必须发布明确迁移；版本不兼容先拒绝挂载，不能最近点/最近年份自动补齐。

### 两道权限，不是一道密码遮罩

**网站访客授权**决定某个会话可看哪个 release；**Drive 服务身份**只允许后端读取专用资料。ChatGPT 的 Drive 连接不授权生产网站。服务账号能读文件也不等于任意访客能看文件。

服务端先验证会话，再读取指定 release 并检查受众范围；只有清单纳入的正文/展示图片可查询。浏览器只得到白名单字段投影和不暴露存储 ID 的资源接口。不得实现任意 `fileId` 下载代理；原件、审核来源、账户信息与 Drive URL 不发送到阅读端。

代码与内容在**部署后运行时**结合，绝不在构建时把私有档案塞进公开 `dist`。密码/登录 UI 不是数据访问边界。未配置、未授权、版本冲突、文件失败时关闭私有层，公共地图继续可用。API、图片、错误响应均不得进入公共 CDN 或 service-worker 缓存。

### 所有权与接口

| 所有者 | 实际职责 |
| --- | --- |
| `PublicRepository` | 原有公开地图/场景读取、校验和有界缓存，不放宽 `privacy: public` 检查 |
| `PrivateRepository` | 同源认证接口、发布版本绑定、过期/取消、防旧响应、临时图片释放；不存 OAuth token |
| `createContentMount` | 授权后显式挂载，锁定时通知阅读器清除；借用公共 repository 而不接管其生命周期 |
| `createPrivateApi` | 每次验证访客，按 release 授权，白名单投影、只读查询、无缓存响应；默认关闭 |
| `DriveContentStore` | 服务端文件读取、专用目录/MIME/大小/哈希约束；不提供网站登录 |
| 身份服务/部署 | 验证与撤销会话、登录限流、密钥和只读 Google token provider；本次没有伪造可用身份服务 |

## Runtime composition

应用 session、空间登记、时间解析、场景解析、内容目录、素材登记、审核/发布与展示适配器各有单一责任。它们是模块边界，不要求微服务集群。空间/时间提供事实和不确定性；生成图片与渲染缓存不是事实来源。API/存储不拥有相机、移动或历史解释。

## Route registration and attachment resolution

大地图选择受支持路线进入街景；多个入口可关联同一地点和内容，一个入口可关联多个片段。目标按内容选择 note、有限图文 sequence 或独立 scene，名称、地块大小、照片多少不决定深度。显示区域、地理 footprint、命中区域与通行区域分开。读别的时期的内容不自动重绘环境。

## Session transitions and recovery

异步加载使用取消信号与 generation；旧请求不得覆盖新位置或复活已退出的私人内容。场景成功加载后才提交进入状态；取消/失败保留原位置。普通返回恢复位置/时期/镜头，入口和转场的临时相机不进入持久化。锁定通知必须清除 DOM、私有选择、图片对象及跨标签/页面恢复可能带回的资料；服务端注销另行撤销会话。

## Local invalidation, not city rebuilding

改文字只更新文字和发布清单；改小段门面只影响该段外观/通行；改坐标只迁移依赖该登记的锚点。地点身份跨拆建与住户变化保留，实体形态有独立版本。资料量增长采用分片/分页/可重建索引，不以空间 chunk 名或内容批次替代稳定 ID。

## Storage and query contract

Drive 是当前选定的私有权威存储；浏览器缓存不是档案。v1 的发布 JSON 是有大小上限的版本闭包，后端按路线过滤分页；不是已实现的空间数据库或全文搜索。更大规模再加路线分片/索引，保持提供者可替换。内容源、派生图、审核关系与备份必须可导出并验证恢复。

## Authority and data flow

原文、编辑、地理登记、视觉与受众审核分别进行。获准清单绑定精确修订与哈希；不能使用“最新文件”隐式升级已审核内容。公开地理只存结论、确定程度与最小许可署名；调查、检索、论证、溯源过程在所有仓库表面绝对禁止。详情见 [CONTENT_PIPELINE](CONTENT_PIPELINE.md#地理资料的绝对公开边界)。

## Failure and recovery

无时间依据保持 unknown，无真实位置保持 unresolved，无获准内容不造入口。存储故障不能退回公开直链或降级公开私有目录。用户授权撤回/删除有独立清理路径，包含派生资源、索引和可控缓存；不声称普通删除提交可以清除 Git 历史或他人副本。

## Source layout: current owners and future surfaces

`src/domain` 管纯空间/时间契约；`src/application` 管 session 与挂载编排；`src/explorer` 管当前界面；`src/engine` 管资源/查询；`src/adapters` 管浏览器读取；`server` 管私有数据边界且不进入静态包。`content/public`/`content/reference` 仅公开资料，私人正文/配置不在仓库任何目录中。未来 workbench 仍是待实现的私有编辑面。

## Selected outline integration

保留现行 outline-stage 接口、登记 frame、原地返回、显式时期与资源驻留。私有挂载不改变选定人物、美术、碰撞或已注册目的地。World Labs/Marble 2 没有因本次架构落地而生成环境。

## Selected runtime resource ownership

共享资源只由一个 owner 释放；保留舞台和缓存不产生第二份 session。具体 60 秒舞台保留、64 米绘制块、warm-cache 和导航预算由 [RUNTIME](RUNTIME.md)维护，不从本次存储改造推导新的帧率/内存承诺。

# Current runtime and resource ownership

本页只描述实际模块、消费者和已知缺口。验收/合并/部署分别记录在 [STATUS](STATUS.md) 与对应任务包；设计要求不自动成为已实现功能。

## Visual-engine scope and change discipline

现行应用为原生 ES modules、R7 手绘总览与本地固定 Three.js 0.180.0 的 Xinhua/Sanli 轮廓街景，无需 npm 依赖安装或 CDN。`main.js`、`outline-stage.js`、`scenes/xinhua-sanli-outline/runtime.mjs` 是现行路径；旧 `stage.js`、GLB 学生和 courtyard 是保留的历史模块。

视觉引擎消费地理/时期/素材/session，不拥有事实与身份。相机、轮廓、遮挡、命中、导航与资源变更不能改源 footprint、历史年份、记忆关联。导航 `arrive()` 在 session 边界提交可达落点；转场不能绕过地面验证。诊断只给工程检查，不恢复被拒绝的常驻调试 HUD。

## Selected overview recovery — 2026-10-28

`overview-registration-travel-r7-periods-r1` 使用同一 R7 图片和空间 frame。六个菜单时期有显式近似方向参照成员关系，个别住宅阶段仍有限定；艺术、标签和标签障碍共用选择器。街景扩展的 `window-2000` 成员关系不随总览改变，近似参照不能被描述为每栋建筑当年存在的证明。

R7 通过 `layeredOverviewMarkup` 消费已选注册与图片，保留原 geometry/inner rings、地理/图面分离、近/中/远层级和无总览人物。入街仍走同一登记路线。引擎/场景文本以 LF 保持固定哈希，不能为接受错误换行而更新素材哈希。

## Accepted Xinhua/Sanli close-view integration — 2026-10-27

选定入口按需加载 outline-stage 而非旧灰盒。保留连续轮廓人物、稀疏动作、低饱和地面和获准的折叠小地图/罗盘；旧人物 smoke 不能证明新消费者。session 统一拥有姿态与返回；重新进入前核对登记、route、environment、碰撞。近景整体 JSON 与数据/美术版本按清单校验。

<a id="fourth-ring-extension"></a>
### Fourth Ring extension

Fourth Ring bridge/corridor 模块属于现行原生街景，以已登记 frame/period、地面目的地和既有导航/session 接入，不是独立 viewer。不得从本次私有内容改造推导新的桥梁位置、年份或通行事实。

<a id="entry-presentation--dm-street-transition-20261028"></a>
## Entry and travel presentation

普通地图入街使用手账绘制；地点直达使用独立纸飞机过场。38 条用户审核的虚构装饰文案和 30 个涂鸦属于展示层，**不是私有回忆数据库**。简化模式用临时俯瞰/云层/下降镜头；reduced-motion 采用短淡入，跳过手/涂鸦/字体加载。转场临时相机不持久化。

直达菜单折叠分区、搜索已有地面锚点；点地面可选 walk/jump，键盘仍步行。无遮挡横穿不强制绕指定过街节点；碰撞/非通行区域保留。跳转在完全遮挡时提交，保留 yaw/distance/pitch 与累计步行距离，不横穿街区插值。纸飞机常规 cover/hold/reveal 为 650/160/760 ms，reduced-motion 为 90/1/90 ms；加载可延长静态遮挡阶段。

取消、Escape、页面隐藏、替代请求和失败均释放 overlay/frame/camera override；落点提交前取消保留原位，提交后取消保留新位置。手账与纸飞机详细验收保留在 [手账任务](attention/tasks/DM-JOURNAL-DOODLES-20261028.md)、[直达展示任务](attention/tasks/DM-TRAVEL-PRESENTATION-20261029.md)和 [INTERACTION](INTERACTION.md)。

## Bounded runtime resources — DM-RUNTIME-RESIDENCY-20261027

### Stage lifetime and frame scheduling

`outline-stage.js` 保留一个兼容舞台，回总览立刻停止输入/动画，**60 秒**后释放。重复 map render 不延长过期。兼容性涵盖 source path、repository epoch、登记/route/environment；不兼容、最终退出或过期清理 renderer、listeners、observer、导航和 WebGL context。

`frame-loop.js` 只有一条可取消链；菜单/隐藏/非激活/暂停停止调度，恢复重置时间基准。generation 阻止旧回调干扰新链。舞台复用不另存位置；这不是已实现的静止按需绘制策略。

### Spatial drawing residency

轻量 metadata/factory 先登记，按 **64 米** cell 与独立长路 owner 构造可见资源。保留 **380 米** far plane；墨线不使用地面同款雾，不能拿雾终点截断远处轮廓。active、collision-pinned 与 warm 分开；warm 由 **15 秒**更新内未用或 LRU 控制在 **8 chunks / 估算 16 MiB**。暂停时不另起年龄计时器，60 秒舞台到期才整体释放。

warm 预算不包含全部 active、pins、metadata、整体场景 JSON、地面和共享资源，绝非总显存上限。相机不变复用选择/静态结果；动画对象仍更新。

### Resource owners and estimates

`resource-scope.js` 去重释放 geometry/material/texture/instance buffer；借用资源由其 owner 释放一次。迟到字体回调检查存活；detached warm chunk 仍归场景负责。估算字节不是 JS heap、driver 显存或实测 GPU 内存。

### Data loading and navigation

PublicRepository 去重请求、克隆返回记录，LRU **24 entries / 8 MiB encoded JSON**。单一消费者取消不破坏共享请求；invalidate 增 epoch、abort 和清缓存，旧响应不能填回。近景仍整体 JSON 下载/哈希校验，GPU chunk 淘汰不代表网络资料分片卸载。

导航按需网格使用空间索引，缓存限 **32,768 cells / 16,384 edges**；A* 扩展最多 **50,000 nodes**，最近落点查询最多 **32,768 candidates**。预算耗尽返回诊断失败，不证明物理上不存在路径。搜索仍同步，无 worker/分层道路网络承诺。

### Diagnostics and remaining scale limits

`digitalMemory.inspect()`/舞台诊断报告实际消费者、CPU/帧间隔、draw calls、资源/驻留/导航计数；GPU 时间不可用。公开诊断不得随着后续私有 UI 接入而包含正文、锚点、对象目录、受众或授权。真实设备性能需单独测量，本次没有新 FPS/视觉验收。

## Run and implementation seams

Node.js 22+；`npm run dev`、`npm test`、`npm run test:outline`、`npm run build`。生产静态目录为 `dist`。构建维持既有几何/素材哈希，改用 `scripts/public-export.mjs` 的**已跟踪路径白名单**：index/src、公开 content/public/reference、允许的 assets/scenes 文件类型；排除 private/server/tests/evidence/candidates、隐藏路径、symlink、未跟踪文件，并检查 JSON 隐私/凭据字段。它不是免审公开 Git 的安全证明；任何真实私人资料仍禁止提交到任何目录。

新运行时源文件要先纳入 Git index 才进入 build。server 和私有配置不会进入静态包。此构建不抓 Drive，不需要生产密钥；现行地理、图片和街景 manifest 字节未改。

`session-storage.js` 使用 `session-projection.js` 只保存公共偏好、route/camera/街景姿态，丢弃 selectedMemoryId、scene/returnStack、授权、正文、任意额外字段及路径/访问历史。旧全量 session 尝试立即重写为投影，存储失败仍可浏览。内存中的 session 继续完整负责正常返回；私有 reader state 必须保持在独立临时 owner 内。

## New route-first contract: implementation gap register

尚未完整实现通用 RouteSceneRegistration/RouteAttachment 的场景 migration、note/sequence/scene 分发、任意街物激活、静态序列作者工具、临街间隔编辑、多入口迁移或不确定年代观察编辑。旧 demo portal 不证明这些能力；目的地直达只是落地。

## Storage seam

**保留 PublicRepository，增加可撤卸 PrivateRepository，不用后者替换公开世界。** 当前 `main.js` 仍只接公开资料；私有基础模块存在但没有挂接默认界面，也没有伪密码按钮。

| 模块 | 已实现的范围 |
| --- | --- |
| `src/adapters/private-repository.js` | 同源 `/api/private/`，读取已验证会话/安全 manifest，地图版本检查、release revision 请求、no-store、迟到请求拒绝、过期锁定、临时图片释放 |
| `src/application/content-mount.js` | 显式 mount/unmount、锁定清理通知、私有失败与公开 repository 生命周期分离 |
| `server/private-api.mjs` | Web Request/Response handler，默认 503 关闭；逐请求调用可信 authorize，按 release 授权，route 分页、note/图片成员检查和白名单响应 |
| `server/drive-store.mjs` | 注入服务器 token provider；精确 Drive 文件 ID、直属目录/MIME/大小/哈希验证；不递归扫描、不代理任意客户端 fileId |
| `server/private-content.mjs` | 可执行 private release/note/attachment 子集及严格投影；不把作者记录 spread 给浏览器 |

**未实现/未验证**：实际 Google token provider、网站密码/OIDC 登录与撤销、生产 API 部署、选定街景的私有入口和阅读 UI、跨标签/后退缓存端到端注销、真实档案读取、原文编辑/录音/备份恢复。`lock()` 只是客户端卸载，不是服务端 logout。完整上线须满足 [PRIVATE_CONTENT_RUNBOOK](PRIVATE_CONTENT_RUNBOOK.md) 的门槛。当前 Drive 的空 draft 登记不是生产内容。

<a id="github-images-concrete-arrangement"></a>
## Public image packages and immutable URLs

公开通用地图/转场资源继续用固定相对 URL、修订、SHA、尺寸和许可信息。GitHub blob 页不是 image src；需要迁移时用固定版本资源地址/CDN，不改地点身份/配准。个人原图与回忆插画留在受保护 Drive，不随公开资产迁移。公共素材是否可公开须独立审，不把全部“图片”归入同一个权限域。

## Historical dual-scale sample — DM-0010

旧灰盒/GLB 学生、140 米参考中心线、假想 courtyard 和先前相机仅为历史原型；不构成现行消费者/授权证据。详见 [STREET_PROTOTYPE](STREET_PROTOTYPE.md)、[STREET_VISUAL_CALIBRATION](STREET_VISUAL_CALIBRATION.md)与历史任务包；本次不改人物、美术、地理或 World Labs 状态。

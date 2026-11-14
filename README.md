# DigitalMemory

地理挂载、稀疏时间切片的数字回忆录。手绘总览帮助辨认地方，进入一段街或路线，再从沿街门口、物件和记得的位置打开内容。目标是保留人在环境中的印象，不是测绘城市、文章网站或需要反复赶路的网游。

## 两个来源，一套空间语境

**GitHub 保存公开程序与地图；Google Drive 保存私人正文、图片及其空间挂载关系。** 私有内容经生产服务端验证访客后，在运行时按获准 release 读取，绝不在构建时混入公开站点。公共世界无需登录即可独立载入；登录失败或私有库离线不破坏地图。

同一公共地点可有许多私人回忆，但“谁在何处有何回忆”的关系本身也是私有内容。实际 Drive 文件/目录 ID、账号、凭据、原件和个人锚点不能出现在 Git、PR、CI、构建包或公共清单里。

## 先读哪份文档

| 问题 | 规范所有者 |
| --- | --- |
| 产品目的、第一阶段范围 | [PRODUCT](docs/PRODUCT.md)、[PHASE_1](docs/PHASE_1.md) |
| UI/引擎/地理/挂载四层，以及双源边界 | [ARCHITECTURE](docs/ARCHITECTURE.md) |
| 地点、路线、时间、入口与私有发布字段 | [DATA_MODEL](docs/DATA_MODEL.md) |
| 原文如何整理、分维度审核、按受众发布 | [CONTENT_PIPELINE](docs/CONTENT_PIPELINE.md) |
| 当前实际代码、资源策略和未接通项 | [RUNTIME](docs/RUNTIME.md) |
| Drive 的目录/只读身份/生产启用和恢复 | [PRIVATE_CONTENT_RUNBOOK](docs/PRIVATE_CONTENT_RUNBOOK.md) |
| 界面、绘画、地图装配与其它专题 | [文档导航](docs/README.md) |
| 工作纪律、验证与历史交付 | [AGENTS](AGENTS.md)、[VERIFICATION](docs/VERIFICATION.md)、[STATUS](docs/STATUS.md) |

## 当前可运行的部分

R7 手绘总览、选定 Xinhua/Sanli 轮廓街景、连续轮廓人物、分区目的地直达、可直接横穿的街道、手账入街与纸飞机过场。总览没有人物，旧 GLB 学生/灰盒场景只作历史保留。原有 scope 和美术不因内容存储改造而变化。

本源码树新增可测试的私有客户端、挂载生命周期、授权 API 核心和 Drive 只读适配器，并收紧公共构建及浏览状态存储。**`main.js` 尚未接入私有阅读器；没有已部署的私有 API、网站登录或真实 Drive 会话。** 私有目录与空 draft 登记仅是初始化，不是已经可在生产浏览个人回忆。具体接口、上线门槛与缺口集中在 RUNTIME/runbook，不把计划写成完成状态。

## 本地运行与检查

Node.js 22+。`npm run dev` 启动原有公开原型，`npm test` 测应用和私有边界模块，`npm run test:outline` 测选定街景，`npm run check` 合并测试与构建。没有新增浏览器依赖或 Google 密钥要求。

`npm run build` 验证既有 manifest/hash 后，只导出允许的已跟踪生产文件到 `dist/`。新源文件需先纳入 Git index；未跟踪资料、server、私有配置、测试和取证目录不导出。生产只服务 `dist`，不把源码根目录当私有 API。真实秘密和档案始终不能提交，白名单/ignore 也不能替代公开差异审查。

## 内容、许可与工程纪律

原文、时间/地理、视觉、使用权、受众批准互相独立。现有 MIT 许可不赋予第三方图片再用权，也不授权公开个人资料。地理记录只能留许可允许的结论、确定程度与最小署名；**查证/检索/论证/溯源过程在所有仓库表面绝对禁止**。

施工前留有任务 scope，即使在沙盒；每次 PR 推送前读规范、同步相关文档，再进行验证/CI。报告确切的已实现、已验证、已合并、已部署状态。当前双源改动的范围与交付记录见 [任务包](docs/attention/tasks/DM-PRIVATE-CONTENT-MOUNT.md)；无关 PR 不自动合并。

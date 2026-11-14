# Documentation map: one contract per responsibility

先看问题属于哪层，再读该层所有者，不按旧任务编号或历史方案逐页加载。当前核心链为 **目的/范围 → 四层边界 → 数据语义 → 内容审核 → 实际运行 → 验证/运维**。双源不是另一套引擎或状态系统。

## 核心阅读顺序

| 文档 | 唯一职责 | 不承担什么 |
| --- | --- | --- |
| [PRODUCT](PRODUCT.md) / [PHASE_1](PHASE_1.md) | 体验目的与当前地理/生活阶段范围 | 不宣称未来功能已经完成 |
| [ARCHITECTURE](ARCHITECTURE.md) | 四层 scope、统一 session、公开/私有来源与授权边界 | 不复制字段全集或部署身份 |
| [DATA_MODEL](DATA_MODEL.md) | 地点/路线/时间/挂载身份，明确可执行 private v1 与通用目标模型 | 不保存真实私人注册资料 |
| [CONTENT_PIPELINE](CONTENT_PIPELINE.md) | 原意、整理、审核、受众、保留/撤回 | 不把代码合并当内容发布 |
| [INTERACTION](INTERACTION.md) | 控件、进入/退出、步行/直达与阅读体验 | 不创建地理或历史事实 |
| [RUNTIME](RUNTIME.md) | 实际消费者、资源所有权、接口实现与缺口 | 不借旧测试认证新界面 |
| [PRIVATE_CONTENT_RUNBOOK](PRIVATE_CONTENT_RUNBOOK.md) | Drive 结构、部署条件、启用/撤销/恢复操作 | 不包含实际目录 ID、账户或凭据 |
| [VERIFICATION](VERIFICATION.md) / [STATUS](STATUS.md) | 验收口径与有日期/提交绑定的交付记录 | 不作为第二份设计规范 |
| [DECISIONS](DECISIONS.md) | 决策及其 supersession | 不继续激活已交付或延后任务 |

代码/目录存在、单元测试通过、主界面接线、生产授权和实际部署必须分别说明。当前私有模块没有接入 `main.js`，Drive 空 draft 登记不能读作“用户现在已经可以登录看回忆”。

## Four-layer reading route

| 改动主层 | 先读 | 配合核对 |
| --- | --- | --- |
| UI | INTERACTION | RUNTIME 的实际命令/取消/清理；内容语义查 CONTENT_PIPELINE |
| 视觉引擎 | RUNTIME、[ASSET_PIPELINE](ASSET_PIPELINE.md) | [MAP_ASSEMBLY](MAP_ASSEMBLY.md) 的源数据/显示分离 |
| 地图地理 | DATA_MODEL、[GEO_DATA_RUNBOOK](GEO_DATA_RUNBOOK.md) | [GEO_DATA_LINEAGE](GEO_DATA_LINEAGE.md) 的许可结果；影响挂载须显式迁移 |
| 记忆挂载 | CONTENT_PIPELINE、DATA_MODEL | ARCHITECTURE 的授权边界；RUNTIME/runbook 的已实现范围 |

公私空间记录共用已登记 frame，但私有锚点/关联不写回公共世界。授权和存储是跨层约束，不改变四层所有权。

## 专题与历史资料

地图装配与绘画：[HANDPAINTED_MAP_ART](HANDPAINTED_MAP_ART.md)、[ILLUSTRATION_MAPPING](ILLUSTRATION_MAPPING.md)、[LAYER_COMPOSITION](LAYER_COMPOSITION.md)。总览只用选定 raster 美术；近景轮廓走独立已批准的引擎表达。

现行近景：[Xinhua outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md)、[Sanli 集成入口](../scenes/xinhua-sanli-outline/README.md)、[Fourth Ring 模块](../scenes/fengtai-bridges/README.md)。人物原型与历史比例检查在 [STREET_PROTOTYPE](STREET_PROTOTYPE.md)、[STREET_VISUAL_CALIBRATION](STREET_VISUAL_CALIBRATION.md)。[WORLDLABS_HANDOFF](WORLDLABS_HANDOFF.md) 仍是未来交接，不是生成结果。

地理专题仅保留可公开结论/不确定性：[旧校址](research/FENGTAI_PRIMARY_OLD_SITE.md)、[桥梁](research/FENGTAI_BRIDGES_ZHENGYANG.md)、[下穿](research/FENGTAI_UNDERPASS.md)、[空间结果](research/XINHUA_SPATIAL_PIPELINE.md)、[楼体结果](research/XINHUA_BUILDING_SURVEY.md)。不得因专题标题带 research 就恢复调查档案。

历史工程试片/参考：[ASSET_WORKFLOW_VALIDATION](ASSET_WORKFLOW_VALIDATION.md)、[LOCAL_VISUAL_REFERENCES](LOCAL_VISUAL_REFERENCES.md)、[STATUS](STATUS.md) 的 dated checkpoints。它们保留当时的范围与判定，不覆盖当前批准的表现或提供新的执行授权。

## Construction and PR sequence

[AGENTS](../AGENTS.md) 与 [attention](attention/README.md) 是工程入口。先有 scope，再施工；读 owner、同步文档、审完整差异后才测试/构建/CI。只在 [current.json](attention/current.json) 登记实际正在执行的任务，旧 packet 的 next action 不是自动任务。

涉及双源改动的工程包为 [DM-PRIVATE-CONTENT-MOUNT](attention/tasks/DM-PRIVATE-CONTENT-MOUNT.md)。公开记录只留工程状态，私有安装详情在 Drive operations，不交叉链接到公共 PR。

## 文档修正的完成标准

既有文档修正持续授权不变：在授权范围内定位规范所有者、同步事实/链接/状态，完成适用检查并按 AGENTS 执行。混合代码任务、内容公开和部署仍分别按对应授权处理，不能借“整理文档”扩大副作用。

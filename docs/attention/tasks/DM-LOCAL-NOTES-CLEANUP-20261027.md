# DM-LOCAL-NOTES-CLEANUP-20261027 — 清理旧试改与整理过程记录

## Intent and authority

用户明确放弃旧地图试改，要求将暂存过程文档与main比较，有用的整理进现有记录，重复和过时内容清除。按AGENTS的文档修正持续授权完成提交、PR、适用检查及main合并；不修改运行时、美术资产或部署。

基线：`514a27d2cce805599571dea05e87b5a567719b07`，分支 `agent/reconcile-local-process-notes`。开始前工作区干净，开放PR为空。输入为本地stash `e7845552bcffe5f2281869942e3ebd7cc9c2931c`，共19个文件。

## Scope and disposition

| 暂存内容 | 处理 |
| --- | --- |
| 6张旧立面WebP、manifest、overview-registration、spatial-plan、绘图脚本、STATUS试改段落、旧pipeline补充，共12个文件 | 放弃候选，不恢复、不提交；保留main的资产、脚本与数据。 |
| DM-MAP-20261026 | 不恢复试改任务和旧后续计划；仅在STATUS保留用户已放弃候选的结论。 |
| DM-SANLI-20261027、DM-SANLI-DETAIL-20261027、DM-SANLI-NAV-20261027、DM-SANLI-PROPS-20261027、DM-SANLI-UI-20261027 | 不新增五份阶段流水账；唯一仍有用的来源限制和估计边界整理到现有三里集成记录。已有轮廓流程、字体许可、导航和几何实现不重复。 |
| DM-XINHUA-CORRIDOR-20261027 | 以main的r4集成与合并证据为准；补充旧r3商铺定位已被否定，不恢复旧执行状态与服务地址。 |

文档所有者：[文档路由](../../README.md)、[STATUS](../../STATUS.md)、[轮廓流程](../../research/XINHUA_OUTLINE_WORKFLOW.md)及现有三里/走廊任务包。私有路径、个人叙述、图片、试画和一次性验证脚本均不入库。最终场景数据保持原样；旧版测试数字不冒充当前测试结果。

## Acceptance

- A1：分支diff只有整理后的Markdown，不包含被放弃资产、数据或代码。
- A2：保留照片缺口、估计边界、r3定位被后续核验取代的事实；不恢复旧执行计划，不重复现行规范。
- A3：检查受影响文档链接、diff及相对main范围；核对适用CI后合并。确认有用信息已落库后删除指定stash，保留其他stash。

## Current state

- Lifecycle: delivered / documentation reconciled; active route removed.
- Reviewed inputs: stash七份过程文档、main规范/任务记录、当前选定场景说明；未重新运行旧浏览器或地理核验。
- Result: 有用的来源缺口和估计边界已并入三里集成记录，走廊记录补齐r3定位被r4取代的范围，STATUS记录旧试改放弃；七份旧过程稿不恢复。美术、代码、登记和场景数据均保持基线。
- Validation after documentation review: 四份变更Markdown的40个本地链接/锚点通过；`git diff --check`通过。已核对工作流路径：本次纯docs变更不匹配现有PR工作流；不为文档清理启动运行时或地理采集任务。PR实际head及合并结果以GitHub记录为准。
- Cleanup: 有用记录提交后删除上述指定本地stash，不删除其他暂存记录；不把丢弃的候选复制到其他分支。仓库中保留的是整理后的记录。
- Next action: 按已授权流程提交PR并核对最终head与适用检查后合并；交付后无自动后续任务。回退文档可revert本PR，用户放弃的本地候选不作为回退产物保留。未部署。

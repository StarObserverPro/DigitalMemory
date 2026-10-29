# DM-CORE-LAYER-SCOPES-20261029 — 核心文档的四层边界

## Intent and authority

- 用户要求：根据近期执行重新梳理核心文档，明确 UI、视觉引擎、地图地理、记忆挂载的 scope 与纪律。
- 目标：用现有规范所有者说明四层职责、输入输出、跨层接口、修改边界与验收；区分当前实现和既定但尚未实现的契约。
- 授权：文档修改、提交、PR 与适用检查通过后的 main 合并，沿用仓库记录的文档修正持续授权。运行时代码、美术与数据变更、部署不在本任务范围。
- 仓库：`StarObserverPro/DigitalMemory`；分支：`agent/core-layer-scopes-20261029`；精确基线：`68df5f3ba5d97e6b5e5cc9ee7ac43ba83d96eda0`。

## Scope and context

- 主层/触及层：四层公共契约的文档整理，覆盖 UI、视觉引擎、地图地理、记忆挂载；不变更任何运行时输出。
- 权威输入为当前源码、现行规范和已合入工程结果；允许输出为同步后的文档、任务及 PR 模板。
- 主任务：核心文档整理。架构总表、各层规范、入口、PR/任务模板与验证规则同步；保留近期已合入的交互与资源管理约束。
- 主规范：ARCHITECTURE、INTERACTION、RUNTIME、DATA_MODEL、CONTENT_PIPELINE、MAP_ASSEMBLY、GEO_DATA_RUNBOOK；入口与验收由 AGENTS、docs/README、VERIFICATION、STATUS 衔接。
- 只读核对当前源代码与已合入工程结果。地理调查过程、个人关联及原始资料不进入文档、提交或 PR。
- 交付：同一文档 PR；临时审查和校验文件留在仓库外。
- 当前路由为空；本任务不激活其他历史任务。

## Acceptance

| ID | Required observable outcome | Consumer / fixture / view | Evidence or gap |
| --- | --- | --- | --- |
| L01 | 四层各有唯一职责、数据所有者、输入输出、禁止越界和验收入口 | 架构表及各层规范 | 源码/契约对照已完成；完整文档差异已复核 |
| L02 | 跨层改动可由任务/PR明确申报，不把建议或设计写成已实现 | 任务模板、PR模板、RUNTIME、STATUS | 源码/契约对照已完成；完整文档差异已复核 |
| L03 | 保留现行交互、美术、资源生命周期、空间与内容隐私约束 | 当前 main 源码及规范 | 源码/契约对照已完成；完整文档差异已复核 |
| L04 | 修改范围只含文档；链接、标题锚点和完整差异通过检查 | 提议树与基线比较 | 19 份 Markdown；260 个本地链接（含 41 个锚点）通过；无运行时/数据/资产变更 |

## Current state — keep this concise and read last

- Lifecycle / phase: delivered / documentation reviewed。
- 架构表、各层规范、入口、任务/PR 模板和按层验收已对齐。默认入口不展示合成记忆/旧 portal；通用挂载及私有 authoring 能力继续标为目标。
- 当前源码所有权已分项核对；完整 diff/文档一致性复核先于本地文档检查。19 份 Markdown 的本地目标、41 个标题锚点、任务路由及空白检查通过；主分支基线未漂移。
- 验证范围为文档与源码映射。本轮没有新运行时实现或本地运行时/视觉测试；现有 GitHub workflows 因场景 README 路径适用，其实际 head 结果及合并信息由交付 PR 记录，不借用旧结果。
- 本轮不改变生产部署、素材认可或私人内容发布范围。当前任务路由已关闭，未激活后续实现。
- 交付载体：本文件所在的四层文档 PR；按既有文档授权完成适用检查后合入 main。回退该文档 PR 可恢复先前表述，不涉及数据迁移。

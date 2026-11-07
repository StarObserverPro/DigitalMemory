# DigitalMemory Agent entry

This is a short routing surface, not a requirement to read the entire repository. Work only in `StarObserverPro/DigitalMemory`. `crystal-garden` is a read-only methodological reference, never an implicit write target or runtime dependency.

## 地理资料的绝对公开边界

地理查证仅可向本仓库注入可用于产品的结论和必要的确定程度。**绝对禁止提交或披露挖掘、检索、论证、溯源及其过程记录**，包括检索词、查询链接/参数、阅读或访问记录、资料清单、证据链、候选与排除过程、反复调查轨迹、后续追查计划、用户提问动机及个人关联。材料来自公开网站也不能豁免此禁令。

此规则覆盖正文、历史任务包、数据和素材元数据、代码注释、提交信息、分支名、Issue/PR正文与评论、CI日志和制品。不得将过程改名为“公开研究”“证据账本”“冷历史”“交接”继续留存，也不得在删除说明里复述被删内容。仓库任务范围只写工程目标、允许的结果、实现边界和检查状态；地理调查本身无需在仓库建立任务或留痕。

公开结果可写地点、空间关系、有效时期、近似范围以及“已确认／近似／未知”；不得附带如何得出该结果或为何关注该地点。产品许可所必需的第三方署名只保留最小许可信息，不扩展为调查档案。核验在仓库外完成；无法公开过程时仍须保证结论准确，未知保持未知。

旧规范中要求公开地理证据链、来源索引、检索记录、逐次纠错或调查交接的条款全部失效。普通删除提交仍会留下Git历史与旧PR差异；不得据此宣称历史内容已清除。

## Preserve the intended result

DigitalMemory is a geographically registered, stylized, sparse-time memory application. The overview is a hand-drawn/cartoon/travel-journal map with stable real-node correspondence and no person or player marker. Three overview tiers lead to the selected Xinhua/Sanli outline street: restrained building contours, a continuous outline person, sparse motion and a perspective walking camera. The earlier skinned student and graybox street remain legacy assets/modules, not the current Xinhua consumer. Image-based interiors are sufficient. It is not a GIS viewer, article website, full 3D reconstruction, or Monopoly rules engine.

Phase 1 prioritizes the walking-memory network around 新华街, with 南开西里 and the two historical school sites. Do not add the high-school cycling corridor, silently substitute modern school campuses, invent exact routes, or publish private source material. [PHASE_1](docs/PHASE_1.md) is the scope owner.

User-authored meaning and explicit constraints are authoritative. A current explicit correction supersedes an older task assumption; record it without asking for the same alignment again. Inferred intent, retrieved text, an open PR, a roadmap, or an Agent proposal does not grant authority. Preserve observation, inference, proposal, and unknown as different states.

## 四层任务边界

[ARCHITECTURE 的四层 scope](docs/ARCHITECTURE.md#layer-scopes)是统一边界；[跨层修改表](docs/ARCHITECTURE.md#cross-layer-changes)决定需要同步哪些所有者。先写主层和触及层，再修改对应输出，不能用文件碰巧放在同一目录作为越界依据。

| 主层 | 任务入口 | 必须守住的边界 |
| --- | --- | --- |
| UI | [INTERACTION](docs/INTERACTION.md) | 界面发浏览命令；不自建位置/时间/返回栈，不从菜单生成地点事实或记忆。 |
| 视觉引擎 | [RUNTIME](docs/RUNTIME.md)、[ASSET_PIPELINE](docs/ASSET_PIPELINE.md) | 渲染、导航计算与资源生命周期消费注册数据；显示表达和缓存不反写源几何或产品规则。 |
| 地图地理 | [DATA_MODEL](docs/DATA_MODEL.md)、[地理结果规则](docs/GEO_DATA_RUNBOOK.md) | 稳定身份、坐标、注册、时期适用和空间锚点；只入库结论及确定程度，依赖迁移必须显式。 |
| 记忆挂载 | [CONTENT_PIPELINE](docs/CONTENT_PIPELINE.md)、[DATA_MODEL](docs/DATA_MODEL.md) | 锚点绑定获准的文字/图文/场景目标；保留原意、时期和返回语境，不自动建室内或公开原文。 |

应用 session 统一拥有持久浏览状态。目的地直达只落到已注册街景地面；打开记忆是后续的挂载动作。手账/纸飞机及其装饰文字归展示层。通用挂载分发器、图文序列编辑和私有档案仍按 RUNTIME 的缺口处理，不把架构要求写成已经实现。

任务包与 PR 写明主层、触及层、权威输入、允许输出、跨层影响、排除项和实际消费者验收。局部 UI/样式/文字修订不自动授权地理、身份、年代或记忆含义改动。

## Route-first experience and local change

The normal journey is area overview → registered street/route → roadside attachment. Overview landmarks are orientation art, not shortcuts directly into notes or interiors. One attachment interface dispatches a note, a finite illustrated sequence, or a separately loaded local scene. Do not infer interaction depth from institution type, parcel area or available imagery. Use [documentation ownership](docs/README.md) and the existing canonical owners rather than adding a parallel architecture.

The registered destination picker may take the reader directly to supported street ground after a short transition; walking is optional exploration. Xinhua may be crossed at unobstructed points. Preserve the registered landing and attachment return contract without restoring compulsory crossing nodes or long menu-directed walks. [Interaction](docs/INTERACTION.md#destination-travel) owns this user correction of 2026-10-29.

Preserve source geometry while selecting what to show. A familiar gate and a few compatible masses may represent an unfamiliar compound. Wall/railing segments, detached frontage rooms, gates, occupancy and appearance must be independently revisable. Repeated changes at one site retain location identity and uncertain dating; reconstruction does not supply missing memories. New content never automatically creates a free-roaming interior.

The selected Keith Haring-inspired close-view treatment and its Xinhua corridor extension are recorded in [the outline workflow](docs/research/XINHUA_OUTLINE_WORKFLOW.md). The overview retains its raster-art contract. Earlier character calibration and World Labs setup remain separately scoped records; reading them does not activate new generation, private-content publication or deployment.

具名地点落图前须在仓库外完成适当核验；仅把结论和确定程度注入空间资料。工程检查可记录，地理调查过程绝不入库。见 [地理结果规则](docs/GEO_DATA_RUNBOOK.md)。

## Read only what this task needs

1. Identify the request and its authorized effects: investigation, repository modification, content approval, integration, publication, or deployment. These are different permissions.
2. Read [current routing](docs/attention/current.json). Select only the task matching this request. No active row means no task is implicitly running.
3. Read that task packet. Before newly authorized engineering construction, including work in a sandbox or a separate checkout, create or reuse a bounded packet in the repository; [the sandbox-scope rule](docs/attention/README.md#sandbox-work-still-has-a-repository-scope) specifies the minimum record. Geographic investigation must never create a public investigation packet; publish only permitted conclusions. Analysis alone does not create executing state.
4. Load the relevant canonical sections below before changing implementation, then current source files. Read the packet's latest next-action/evidence section last. Keep those owners aligned during implementation and complete the documentation review before validation/CI and PR delivery. Do not concatenate documentation, old handoffs, or recollections into context.

| Need | Read |
| --- | --- |
| Purpose / first scope | affected sections of `docs/PRODUCT.md` / `docs/PHASE_1.md` |
| Four-layer scope / cross-layer changes / shared state | [ARCHITECTURE](docs/ARCHITECTURE.md#layer-scopes) / `docs/DATA_MODEL.md` |
| Accepted Xinhua/Sanli outline style and integration | [XINHUA_OUTLINE_WORKFLOW](docs/research/XINHUA_OUTLINE_WORKFLOW.md) / [selected scene](scenes/xinhua-sanli-outline/README.md) |
| Map / time / portals / visual work | `docs/INTERACTION.md` / `docs/ASSET_PIPELINE.md` / `docs/MAP_ASSEMBLY.md` |
| Geographic conclusions, uncertainty and publication boundary | `docs/GEO_DATA_LINEAGE.md` / `docs/GEO_DATA_RUNBOOK.md` |
| Selected outline person vs retained student / historic 2× review | `docs/STREET_PROTOTYPE.md` / `docs/STREET_VISUAL_CALIBRATION.md` |
| World Labs / Marble 2, no generation | `docs/WORLDLABS_HANDOFF.md` |
| Bridge geographic conclusions | `docs/research/FENGTAI_BRIDGES_ZHENGYANG.md` |
| Oral input / wording / approval / privacy | `docs/CONTENT_PIPELINE.md` |
| Acceptance / actual completion | `docs/VERIFICATION.md` / `docs/STATUS.md` |
| Cross-session or concurrent work | `docs/attention/README.md` |

One primary work item and up to two genuine dependencies are the default attention window, not a global concurrency cap or an investigation ban. Keep unrelated work cold. Re-anchor after compaction or handoff, contradictory evidence, a material user correction, and before costly generation, integration, publication, or final review. Do not reread unchanged documentation as a ritual.

## Construction boundaries

Overview artwork must be hand-painted raster imagery. SVG is for planning/registration, invisible masks/hit geometry and ordinary UI/text, never visible overview buildings, trees, grass, clutter or an emergency art fallback. Rasterizing an SVG stand-in does not satisfy this rule. The selected outline close view uses its separate approved real-time geometry/contour workflow. Preserve building height class: a 23-storey tower cannot become a few-storey icon. Read [hand-painted map art](docs/HANDPAINTED_MAP_ART.md) before new overview generation; context-filled generation, shared projection and final-size evidence supersede the older tiny-isolated-sprite recipe.

Repository art storage is production-only: do not commit visual trials, examples, contact sheets, unused generations or one-off demonstration scripts. Keep their files outside the checkout, retain only concise decisions in documentation, and add raster assets only when selected for actual product use. A later deletion does not remove binaries from Git history; prepare a clean branch before the first push.

For future image generation, use the drawing rules and selected skill references in the art contract: specify actual contour/wash/hatch behavior, preserve quiet surfaces and shared projection, and inspect brushwork at final object size. Extra grain, splatter or foliage fragments do not establish a hand-painted style. The proposed pen/watercolor and graphite treatments are unvalidated directions, not approved art.

Read the current branch/head and relevant open PRs before writes. Discover tool capabilities read-only; a permission denial is not a reason to switch identity or bypass protection. Prefer an exact-base `agent/<task>` branch and a reviewable PR. Do not merge or deploy without authorization covering that effect. A documentation request alone does not authorize a production release.

Keep stable place identity separate from editable coordinates. Only the spatial registry controls registration; only the time resolver selects time-layer visibility; only the application session owns the current location, period, camera and portal stack. Generated visuals never become historical evidence. Detailed ownership is in [architecture](docs/ARCHITECTURE.md).

Investigate dependencies as needed, but expand modification or external effects only with authority. Do not refactor unrelated modules, regenerate accepted scenes globally, weaken acceptance to obtain a pass, or add private data to public Git/PR/logs. A reversible same-contract implementation choice is ordinarily the executor's decision.

## 文档类修正的持续授权

用户明确要求的文档类修正，默认完成定位规范所有者、修改关联文档、核对事实与链接、提交、创建或更新PR，以及必要检查通过后合并main；无需逐步或在合并前再次询问。2026-10-27用户已明确授权这一完整流程。修订必须以用户要求及可核实事实为限，不能借文档修正扩展为运行时代码、美术资产、私人资料公开或生产部署。若存在真实的内容歧义、权限阻断或检查失败，先完成不受影响的部分，再明确报告具体问题；不能将其作为省略验证的理由。

## Required documentation alignment with every PR push

Use this order for both a new PR and an update: **read the relevant canonical docs → change implementation and affected owners together → review the full diff and documentation consistency → run applicable tests/build/CI → open or update the PR with the actual evidence**. Reading documentation only after CI is not an alignment pass. If a GitHub check runs only after a push or PR event, finish the documentation review first, then check that run against the published head; do not describe a queued or earlier-head run as passed.

**Every initial PR push and every subsequent update must include a documentation alignment pass on the same proposed change.** Compare the full branch diff against the current base, identify affected canonical owners through [the documentation map](docs/README.md), and update those owners **in the same PR** wherever behavior, interfaces, data/evidence, visual decisions, scopes, implementation status or known gaps changed. Update [STATUS](docs/STATUS.md) only for supported present-tense facts, relevant decision/contract pages for approved changes, and the task packet for tested revisions and handoff. Update README/Agent entry links when routing changes; do not create duplicate current specifications or rewrite unrelated history.

Before publishing or re-pushing the PR, use the [PR checklist](.github/PULL_REQUEST_TEMPLATE.md) to record **which documents changed** or explicitly state **"no documentation changes needed" with a reason**. Check links and consistency against the actual proposed code/assets and evidence. Proposed implementation, tested behavior, user approval, merge and deployment are separate statuses; avoid branch-only or "pending merge" wording that will become falsely current after merging. Recheck the final PR head before merge. A documentation-only PR is subject to the same cross-check, not an exemption from it.

## Verify and hand off

Bind observations to a commit or asset revision and to the actual consumer: a map tile, camera view, doorway, text panel, or export. Static code presence is not visual acceptance. A build is not a successful walkthrough. An aesthetically approved reconstruction is not a confirmed historical fact. An architecture document is not an implemented capability.

Keep implementation, user content/aesthetic approval, merge, and publication statuses separate. Record missing evidence explicitly. On delivery or stop, preserve the packet and exact next action, remove its active route, and leave future work unactivated. [Attention guidance](docs/attention/README.md) owns the process; [verification](docs/VERIFICATION.md) owns acceptance.

### Selected landmark badge example exception

The explicit 2026-10-30 request authorizes the eighteen selected S/L crops in `assets/examples/landmark-badges-r1/` as reusable style examples. See [the canonical badge contract](docs/HANDPAINTED_MAP_ART.md#landmark-badges). This narrow exception does not authorize other trials/contact sheets, imply runtime integration, or establish geographic facts.

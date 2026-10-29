# Recollection intake, editing, review and publication

Status: authoring contract, layer boundaries reconciled on 2026-10-29; no personal-content archive is connected or implemented. The repository retains public synthetic memory/portal fixtures; the default selected entry does not display these demonstrations. The private intake, review and release workflow below remains a required design, not a running service.

## 地理资料的绝对公开边界

地理查证仅可向本仓库注入可用于产品的结论和必要的确定程度。**绝对禁止提交或披露挖掘、检索、论证、溯源及其过程记录**，包括检索词、查询链接/参数、阅读或访问记录、资料清单、证据链、候选与排除过程、反复调查轨迹、后续追查计划、用户提问动机及个人关联。材料来自公开网站也不能豁免此禁令。

此规则覆盖正文、历史任务包、数据和素材元数据、代码注释、提交信息、分支名、Issue/PR正文与评论、CI日志和制品。不得将过程改名为“公开研究”“证据账本”“冷历史”“交接”继续留存，也不得在删除说明里复述被删内容。仓库任务范围只写工程目标、允许的结果、实现边界和检查状态；地理调查本身无需在仓库建立任务或留痕。

公开结果可写地点、空间关系、有效时期、近似范围以及“已确认／近似／未知”；不得附带如何得出该结果或为何关注该地点。产品许可所必需的第三方署名只保留最小许可信息，不扩展为调查档案。核验在仓库外完成；无法公开过程时仍须保证结论准确，未知保持未知。

旧规范中要求公开地理证据链、来源索引、检索记录、逐次纠错或调查交接的条款全部失效。普通删除提交仍会留下Git历史与旧PR差异；不得据此宣称历史内容已清除。

<a id="memory-attachment-discipline"></a>

## 记忆挂载层的 scope 与交付纪律

本层接收获准处理的记忆原文、选定图片和既有地点/路线登记，整理为有稳定身份、时间边界和使用范围的内容版本，再经登记入口交给 UI 阅读。记录语义由 [DATA_MODEL](DATA_MODEL.md#memory-attachment-contract)维护；跨层职责以 [ARCHITECTURE](ARCHITECTURE.md#layer-scopes)为准。

- **内容原意由输入决定。** 地点卡、照片、生成画面或顺手写出的台词不能补齐未提供的经历、人物、情绪或日期。外部背景与记忆正文分开，未知信息保留未知。
- **地理锚点由地图地理层提供。** 本层引用地点/入口及登记版本；有位置疑问时留下待确认关联，不自行吸附到最近道路、换一个现代地址或修改门的位置。
- **展示深度按内容选择。** 一段 note、一组有限图片或一个 local scene 共用挂载契约；新增片段首先更新内容引用。只有明确选定更深交互时才增加场景，学校、商店等名称不自动创建室内世界。
- **直达与打开内容是两个动作。** 目的地菜单先到达受支持的街面位置；纸飞机、日记和涂鸦属于转场展示。`journal-catalog.js` 中经审阅的虚构短句不能写入记忆目录、绑定为用户经历或充当地理事实。
- **返回与状态由 application session 管。** 内容加载应保留入口和原来的位置/时期/镜头；关闭、失败或取消交回同一语境。记忆页面不能私建另一套位置、时期或返回栈。
- **文字、外观与公开范围分别审核。** 技术合并、接受画风、允许私下挂载内容各自有明确含义；公开清单只包含对相应受众获准使用的具体版本。原文、源图片及私人审核关系不随之进入 Git、日志或构建包。

改稿只更新相关片段和内容版本，保留地点、入口及无关内容；note/sequence/scene 的类型变化须同时对齐交互与运行时加载/清理说明。若确需改空间登记，按独立的地理变更列出受影响入口和显式重映射，不能夹带在内容文案修改里。

交付至少检查原意与不确定性、入口与内容引用、时期关系、版本与受众、原上下文恢复和公开包内容。采用合成数据验证工程接口；真实内容的审核仍针对其获准版本。通用挂载分发、有限 sequence 阅读器和私有持久写入尚待实现，现有 demo 入口不构成这些能力的完成证明。

## Preserve input before interpretation

The intended private intake accepts free-form text, audio and photographs in batches and saves the original privately with source ID, checksum and recording metadata. Attach the current location, period and view as suggestions, not unquestionable truth: the user may describe a different place or jump between decades during one input. Until that durable intake exists, do not describe a browser selection or a documentation update as a saved memory.

Extract coherent fragments and source-supported statements. Keep source spans/crops inside the authorized private authoring boundary so a reviewer can compare a proposed edit with its input. These private content records do not authorize publishing geographic investigation material. An extraction model's confidence is neither historical verification nor the user's approval.

Unresolved place/date associations enter a private review queue. Repeated inputs can be related or merged for display after review, without discarding their distinct originals. Contradictions and corrections remain visible in authoring history. The system must not require the user to complete a metadata form before a recollection can be retained.

## Three textual layers

**Original:** the user's words or faithful transcript, with any transcription uncertainty preserved.

**Organized record:** concise statements, associations and optional summaries supported by source spans. Structure can be rearranged; substantive meaning cannot be expanded.

**Display passage:** an edited, readable version attached to a place, route or scene. It may improve rhythm, remove repetition, and combine equivalent phrases, but each substantive claim must remain supported by the original or be explicitly labeled external context, never written as the user's recollection.

Editorial illustration only, not a real memory record:

> Input: 我经常从那儿过，买一样的烧饼。
> Permitted edit: 我常从这里经过，买同样的烧饼。

Do not add “放学后”, “每天”, “热乎乎”, a friendly shopkeeper, a price, an emotion, or a smell unless the user actually supplied it. Do not convert “好像”, “大概”, or a life-stage phrase into a definite fact or exact date. Even a plausible detail is a new substantive claim.

A reconstruction can use generic visual completion such as a representative room layout; the image must be marked reconstructed, and that completion must not migrate into the display passage as remembered fact.

## Attach a note before expanding a world

The current route, object or doorway is an association suggestion. The author can add a few words to a named gate even when it has no interior scene. Resolve the exact place and route side only as far as supported; keep uncertain location ranges or area associations rather than inventing a point. A real private write still requires the durable authoring boundary—an architecture document or browser cache is not proof the note was archived.

One attachment can accumulate several notes and selected images. Present them as a finite sequence only when that organization serves reading. A familiar, spatially meaningful subset can later gain a local scene. Preserve source spans and attachment/place identity through all these revisions. Do not turn every recollection into a request for expensive geometry.

## Repeated observation is first-class content

Extract separately: what was seen at a place; what physical/use change is described; when it was observed; and what relation to earlier/later observations is actually stated. Preserve “later”, “again”, “roughly”, “perhaps” and gaps in visits. Seeing renewed commercial use is not evidence that the old tenant or shell returned unchanged. A damage observation does not independently establish repair date or cause.

Allow multiple observations of an ordinary wall, shopfront, yard or tree without forcing a dramatic event or merging them as duplicates. Link observations to versioned environment states where useful. Keep the distinction between temporal ordering, editorial picture order and physical adjacency.

Narrative/artistic examples mentioned in conversation can clarify the feeling of repeatedly encountering one place. They do not automatically become named style mandates, story templates, borrowed characters or a requirement to reproduce a book/game. Uncertain titles and transcribed place labels are not silently corrected into authoritative entities.

Public technical documentation may use synthetic examples of reuse/damage/reappearance. Do not publish the user's family names, exact anecdote, transcript, residence connection or an unresolved named-site mapping as part of a general architecture task.

## A batch is the unit of conversation, not a monolithic content object

One user session can create many fragments. A batch manifest groups the proposed place/period associations, edited text revisions and visual proposals so they can be reviewed together. Individual fragments and assets retain their own IDs and revision histories.

Use paginated queues, aliases, route-based retrieval, source links and duplicate suggestions for the expected volume of hundreds of fragments per month. An Agent loads only the current batch, affected places/periods and necessary evidence; it does not reread every previous transcript. Multiple batches can proceed independently when their revision/asset dependencies do not conflict.

## Review dimensions

| Dimension | Question | Consequence |
| --- | --- | --- |
| Wording | Does this preserve what was said, including uncertainty? | Allows the selected text revision to be displayed privately |
| Registration | Is this the intended place, entrance, route side, and period association? | Allows that spatial/time association to become active |
| Appearance | Does this visual version serve the remembered atmosphere? | Allows the selected scene/asset revision |
| Evidence | Which individual assertions are supported, inferred, disputed, or unknown? | Updates claim metadata; not implied by overall likeness |
| Publication | Which audience may see this exact content and these derivatives? | Allows only the selected public/shared/private release scope |

Approval may be per item or an explicitly defined batch. Do not equate “this looks right” with confirmation of every detail. Do not interpret approval to attach content in a private project as authorization to expose it on a public site or in Git history.

## Proposed lifecycle

`captured → organized → draft → in_review → approved_for_selected_use → included_in_release`

Alternative transitions include `needs_revision`, `rejected`, `superseded`, and `withdrawn`. These are content states, not code/PR states. A code merge cannot automatically advance them. A new visual or textual revision is a new review subject; previously approved unrelated revisions remain usable.

The proposed workbench must show before/after text and images with originals reachable only within the authorized private boundary. Once implemented, a release builder can attach the confirmed revisions of a scoped batch to the chosen scene and audience. No automatic publication from a generator output directory or ingestion job is allowed.

## Private archive and public repository

The repository is public. Do not commit raw transcripts, recordings, private photos, precise residential locations, third-party identifiers, private object URLs, or unreviewed generated content into repository files, issues, PR bodies, CI artifacts or logs. Ignore rules are a convenience, not enforcement. Review staged content and export payloads explicitly.

Keep a durable private store for originals and derivatives. Public manifests use only cleared data and opaque references that cannot retrieve private assets without authorization. Signed/private URLs are not stored in public fixtures. A source being online is not equivalent to reusable or publication-cleared.

When a runtime is implemented, private-workbench authorization must be enforced at the actual data boundary, not just by hiding navigation controls. A public build must not ship the entire private archive as a downloadable client bundle. Disable automatic personal-content telemetry and redact diagnostic logs.

## Durability and corrections

Ordinary editorial correction preserves the original and adds a revision. Backups and exports contain the selected records, assets, provenance, approvals, transforms and checksums; test restoration into a clean environment. Browser storage is not the only archive.

User-authorized deletion requires a separate purge path covering originals, derived assets, indexes, caches and published manifests under the operator's control. Keep only permissible minimal tombstones. Do not promise to erase third-party copies beyond that control. This is another reason not to place personal originals in public Git history.

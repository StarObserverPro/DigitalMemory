# Documentation map: four layers, one application

**Current routing, 2026-10-29:** Start from [the four-layer scope](ARCHITECTURE.md#layer-scopes), then read the owner for the intended change. The current application combines the R7 hand-painted overview, selected Xinhua/Sanli outline corridor, resource residency, grouped direct travel, journal entry and paper-plane destination passage. The retained GLB student, 2× study and graybox camera are legacy references. [STATUS](STATUS.md) separates the current baseline from dated delivery records; [RUNTIME](RUNTIME.md) identifies actual owners and implementation gaps.

The [absolute geographic publication boundary](CONTENT_PIPELINE.md#地理资料的绝对公开边界) applies to all repository surfaces. Only conclusions and uncertainty may be published; investigation records are excluded.

## Four-layer reading route

| 本次要改什么 | 先读的规范 | 配合核对 |
| --- | --- | --- |
| UI：菜单、控件、阅读和转场体验 | [INTERACTION](INTERACTION.md) | [RUNTIME](RUNTIME.md) 的实际命令/取消入口；文字含义变化查 CONTENT_PIPELINE |
| 视觉引擎：绘制、相机、导航计算、资源 | [RUNTIME](RUNTIME.md)、[ASSET_PIPELINE](ASSET_PIPELINE.md) | MAP_ASSEMBLY 的源数据/显示表达分离；选定近景与总览各自美术契约 |
| 地图地理：稳定 ID、坐标、注册、时期适用 | [DATA_MODEL](DATA_MODEL.md)、[GEO_DATA_RUNBOOK](GEO_DATA_RUNBOOK.md) | [GEO_DATA_LINEAGE](GEO_DATA_LINEAGE.md) 的可用结果；按依赖检查地图命中、近景、导航、目的地和挂载 |
| 记忆挂载：原意、编辑版本、目标绑定 | [CONTENT_PIPELINE](CONTENT_PIPELINE.md)、[DATA_MODEL](DATA_MODEL.md) | INTERACTION 的激活/返回契约；RUNTIME 的原型能力与未实现部分 |

层级边界和跨层规则只由 ARCHITECTURE 维护；本页负责导航，各层文档负责细节。PRODUCT/PHASE_1 管目标范围，VERIFICATION 管验收，STATUS 管已观察状态，任务包管本次执行。新任务更新这些既有所有者，不另建一套并列现行规范。

## Read by question, not by historical task number

| Question | Canonical owner | Supporting record |
| --- | --- | --- |
| What experience are we preserving? | [PRODUCT](PRODUCT.md) | [PHASE_1](PHASE_1.md) owns geographic scope. |
| What can be entered from each view? | [INTERACTION](INTERACTION.md) | [ILLUSTRATION_MAPPING](ILLUSTRATION_MAPPING.md) owns overview/street correspondence. |
| Who owns the four layers, shared state and cross-layer changes? | [ARCHITECTURE](ARCHITECTURE.md#layer-scopes) | [RUNTIME](RUNTIME.md) reports the implementation seams. |
| Which street/person is active vs the retained GLB and older 2× test? | [STREET_PROTOTYPE](STREET_PROTOTYPE.md) | [STREET_VISUAL_CALIBRATION](STREET_VISUAL_CALIBRATION.md) is historical visual evidence. |
| Which historical school-site conclusions are available? | [Site conclusions](research/FENGTAI_PRIMARY_OLD_SITE.md) | Historical boundaries and entrances remain unresolved; [PHASE_1](PHASE_1.md) owns scope. |
| What is the World Labs/Marble 2 status? | [WORLDLABS_HANDOFF](WORLDLABS_HANDOFF.md) | Future handoff only; no generated environment. |
| Which geographic conclusions describe Fengtai bridges? | [FENGTAI_BRIDGES_ZHENGYANG](research/FENGTAI_BRIDGES_ZHENGYANG.md) | [FENGTAI_UNDERPASS](research/FENGTAI_UNDERPASS.md) owns profile detail. |
| How do routes, attachments, images and repeated changes retain identity? | [DATA_MODEL](DATA_MODEL.md) | [LAYER_COMPOSITION](LAYER_COMPOSITION.md) owns street-edge assembly. |
| What is drawn, omitted, symbolized or walkable? | [MAP_ASSEMBLY](MAP_ASSEMBLY.md) | [HANDPAINTED_MAP_ART](HANDPAINTED_MAP_ART.md) owns the medium, projection and final-size checks. |
| Which inputs and assets are needed for one accepted representation? | [ASSET_PIPELINE](ASSET_PIPELINE.md) | [GEO_DATA_LINEAGE](GEO_DATA_LINEAGE.md), [GEO_DATA_RUNBOOK](GEO_DATA_RUNBOOK.md) define permitted spatial results; [ASSET_WORKFLOW_VALIDATION](ASSET_WORKFLOW_VALIDATION.md) retains superseded engineering trial measurements. |
| Which current geographic results support map assembly? | [Xinhua spatial results](research/XINHUA_SPATIAL_PIPELINE.md), [Xinhua building results](research/XINHUA_BUILDING_SURVEY.md) | [MAP_ASSEMBLY](MAP_ASSEMBLY.md) owns assembly; [LOCAL_VISUAL_REFERENCES](LOCAL_VISUAL_REFERENCES.md) retains generic drawing constraints only. |
| How do we reuse the accepted Xinhua close-street outline process? | [Xinhua outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md) | [Selected runnable scene](../scenes/xinhua-junction-outline/README.md); [Integrated Sanli close view](../scenes/xinhua-sanli-outline/README.md), reached through the main street entry; overview raster art remains unchanged. |
| Which bridge modules join the native street? | [Runtime](RUNTIME.md#fourth-ring-extension) | [Fourth Ring extension](../scenes/fengtai-bridges/README.md), using the existing session, renderer and registered frame. |
| How do new observations become notes, sequences and environment revisions? | [CONTENT_PIPELINE](CONTENT_PIPELINE.md) | Original/private material stays outside public Git. |
| What is accepted, tested, merged or released? | [VERIFICATION](VERIFICATION.md), [STATUS](STATUS.md) | Task packets identify exact observations, not new requirements. |
| Why is a decision settled? | [DECISIONS](DECISIONS.md) | Current explicit corrections supersede conflicting older assumptions. |
| How does an Agent work without losing the purpose? | [Agent entry](../AGENTS.md), [attention routing](attention/README.md) | Plans and delivered packets stay cold. |

## The integrated experience

The overview gives area-level orientation through three detail tiers, without a person. Its normal navigation target is a registered street or route segment. The grouped destination picker can also take the reader directly to supported street ground, with free walking retained. Arriving does not itself open a note or interior. Gates, doors, street objects and remembered positions supply the route-context anchors for content activation.

At a roadside attachment, the same activation contract opens a note, a finite illustrated sequence, or a separately loaded local scene. These are content choices, not categories dictated by whether the institution is a school, hospital or shop. A recognizable gate can be sufficient; a large parcel need not be fully modeled. A small familiar corner may deserve more spatial interaction than a large hospital.

Spatial registration still retains places, source footprints and area associations. Route-first navigation does not delete those records or turn every institution into a child whose identity depends on one road. A place can have several valid entrances/route attachments. Search and resumed sessions preserve a meaningful route context rather than silently bypassing it.

## Independent decisions

Keep source certainty, date support, exterior/interior familiarity, memory relevance, visual detail, physical access and click behavior separate. Availability of a precise modern footprint does not require displaying it. An icon can simplify a deep compound, but it cannot move the road, imply a false opening, or turn a decorative silhouette into a collision mesh.

The street-facing fabric is locally replaceable: brick walls, iron railings, mixed boundaries, gates, detached frontage rooms and open setbacks are separate structures. Commercial use does not imply an attached ground-floor shop, and a visible office does not require an interactive interior.

A stable location supports successive observations and alternative environment states. Reuse, damage, repair and renewed use can recur without producing a new place ID each time. Calendar dates may remain unknown while a partial ordering is known. A picture sequence is a reading order, not automatically a walkable floor plan or a historical timeline.

## Targets, current consumers and historical evidence

PRODUCT, PHASE_1, ARCHITECTURE, DATA_MODEL, INTERACTION and the production contracts describe required behavior. RUNTIME and STATUS identify the implemented subset and the selected consumer. A requirement for a note/sequence/local-scene dispatcher, editable frontage intervals or a private archive does not establish that those capabilities exist.

STREET_VISUAL_CALIBRATION, ASSET_WORKFLOW_VALIDATION, LOCAL_VISUAL_REFERENCES and dated sections in STATUS retain their original fixtures and verdicts. World Labs camera/CLI guidance retains its checked date and must be revalidated before any future authorized submission. Geographic pages retain only permitted conclusions and uncertainty. Do not silently convert an older trial's counts, camera, completion state or permission into the present contract.

Engineering task packets preserve exact scope, implementation base, checks and handoff. Geographic investigation is excluded from packets. Only [current.json](attention/current.json) identifies actively executing work; an old “next action” is not an autonomous task. Reading and reconciling documentation does not change source geometry, content approval or deployment state.

## Construction and PR sequence

Record or reuse the repository task scope before construction, including sandbox work. Its minimum record is purpose, baseline, boundaries, acceptance, output destination and status; selected deliverables may enter production paths, while trial artifacts stay outside Git. [Attention guidance](attention/README.md#sandbox-work-still-has-a-repository-scope) owns the details.

Read the relevant owners before implementation, keep them aligned with the change, and review the full diff/documentation **before tests/build/CI**. Then open or update the PR with actual evidence and explicit remaining gaps. Event-triggered GitHub checks are reported for the head that ran them. This is a completion sequence within the existing task, not a new per-step approval process.

## 文档修正的完成标准

明确提出的文档类修正按 [AGENTS 的持续授权](../AGENTS.md#文档类修正的持续授权)直接完成至main合并。先在本表定位规范所有者，同步受影响说明并检查事实、链接和状态一致性，再提交PR、完成适用检查与合并；交付时报告真实的合并结果。无需为同一已授权文档修正重复征求确认。运行时改动、素材公开和部署仍按各自授权范围执行。

地标 badge 的定义、S/L 风格与显示限制统一见 [美术契约](HANDPAINTED_MAP_ART.md#landmark-badges)；[已选裁切范例](../assets/examples/landmark-badges-r1/README.md)供后续制作使用，尚未接入地图。

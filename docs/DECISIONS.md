# Architecture decision register

本页只保留决策和取代关系，字段/运行细节交给规范所有者。现行近景是已批准的 Xinhua/Sanli 轮廓街景，R7 总览 raster 美术独立；GLB/2×/灰盒为历史保留，Marble 2 没有生成输出。公开地理仅结论与不确定性，不保留调查过程。

## Current dual-source decisions

| ID | 决策 | 依据与影响 |
| --- | --- | --- |
| ADR-019 | GitHub 公共程序/地图 + Drive 私有正文/图片/空间挂载；在生产运行时经授权结合，不在 build 合并 | 用户明确要求落实；具体化 ADR-009/012，取代“私有提供者仍未选定” |
| ADR-020 | 网站会话授权与 Drive 服务凭据分离；后端每次按获准 release 检查和投影；默认关闭 | [ARCHITECTURE](ARCHITECTURE.md#dual-source-mount)；不把 ChatGPT 的连接当生产授权 |
| ADR-021 | 保留 PublicRepository，私有层可独立挂载/卸载；内容更新不改地理/代码 | [DATA_MODEL](DATA_MODEL.md#private-release-v1)、[RUNTIME](RUNTIME.md#storage-seam)；取代旧“直接替换公共适配器”表述 |
| ADR-022 | 公共构建使用已跟踪路径白名单；浏览状态保存字段投影，不保存完整 session | [RUNTIME](RUNTIME.md)；不能替代禁止提交私人资料的公开边界 |

本次交付为模块、空私有登记、测试及文档；没有选择并部署具体网站身份服务，没有私有街景 UI 接线或生产启用。精确交付状态在 [任务包](attention/tasks/DM-PRIVATE-CONTENT-MOUNT.md)，不得把技术选择当作已上线。

## Baseline decisions

| ID | Decision | Owner |
| --- | --- | --- |
| ADR-001 | Geography is registration/query skeleton; stable opaque IDs survive coordinate corrections. | DATA_MODEL |
| ADR-002 | Institutions, sites and time-bounded occupancy are separate. | DATA_MODEL / PHASE_1 |
| ADR-003 | Active sparse period and discoverable other-time content; route timeline is independent. | INTERACTION |
| ADR-004 | Stylized registered ground and selective volumes; interiors may be images, not full geometry. | ASSET_PIPELINE |
| ADR-005 | One application session owns location/time/view/return stack. | ARCHITECTURE |
| ADR-006 | Original, organized statements and display text are separate; no added autobiographical meaning. | CONTENT_PIPELINE |
| ADR-007 | Registration, wording, appearance, use rights and publication approvals are distinct and revision-bound. | CONTENT_PIPELINE |
| ADR-008 | Accepted scenes pin exact asset revisions; generation is authoring, not browse-time mutation. | ASSET_PIPELINE |
| ADR-009 | Public code and private archive are separate; publication is an additional authorized effect. | ARCHITECTURE / CONTENT_PIPELINE; specified by ADR-019/020 |
| ADR-010 | Phase 1 is a compact walking network prioritizing Xinhua; no high-school cycling extension. | PHASE_1 |
| ADR-011 | Small task router/intent/evidence packet, not another project's whole governance system. | AGENTS / attention |
| ADR-012 | Logical modules first; technology choices resolved by bounded implementation tasks. | ARCHITECTURE; Drive choice now ADR-019 |
| ADR-013 | Area → registered street/route → roadside attachment; overview landmarks are not content portals. | INTERACTION |
| ADR-014 | Common note/finite sequence/local-scene target contract; category/parcel size do not dictate depth. | DATA_MODEL; complete dispatcher still pending |
| ADR-015 | Certainty, dating, familiarity, visual detail, collision and click behavior remain independent. | MAP_ASSEMBLY / HANDPAINTED_MAP_ART |
| ADR-016 | Mixed boundaries, gates, detached frontage hosts, ground installations and uses are locally revisable. | LAYER_COMPOSITION |
| ADR-017 | Stable places support repeated observations and separately versioned shape/use/appearance; chronology gaps remain. | DATA_MODEL / CONTENT_PIPELINE |
| ADR-018 | Consolidate canonical owners; runtime status and historical engineering packets are separate tracks. | docs/README / STATUS; no public geographic process archive |

## First runtime decisions — DM-0002

Historical: native ES modules/Node built-ins, shared transform and small fixed-revision image packages were selected to keep the prototype install-free. Old A/C vector and B imagegen trials are not current art or geographic authority. Deferring the private provider at that checkpoint has now been superseded by ADR-019; no decision here makes the old scene the active consumer.

## Explicitly deferred

Exact unsupported geography/entrances/dates, complete historical base-map coverage, life-stage/year mapping, unrequested visual revisions, production identity/deployment, private reader/authoring integration, measured device performance, later cycling/transit and unapproved public-content release. Drive as the storage provider is **not** still deferred. Unknowns do not license invented values or block unrelated authorized work.

## Reference reviewed for Agent construction

`StarObserverPro/crystal-garden` at `d60044a8bbe5682573bb518841baa3418d9d6efa` remains a read-only methodology reference for outcome/authority separation, bounded attention and evidence. It is not a dependency or write target; do not import its renderer, economy, task bureaucracy or deploy permissions.

## D-010 — Illustrated overview, scenic-flat street, shared route identity (2026-10-17)

The overview/close view share registered route identity with separate art/geography coordinates. The original scenic-flat camera example was superseded by the selected outline close view; it did not authorize art to move real nodes or supply historical evidence.

## DM-0004 — composited places and independent frontages

Roads, building shells, frontages, shops, entrances and people remain independently reusable. Occupancy does not own the building or road; a commercial frontage need not be apartment ground-floor retail. PR3's historical merge/deploy permission was scoped to that correction, not all future changes.

## 2026-10-27 — accepted Sanli outline and controlled integration

Preserve sparse continuous contours, quiet surfaces, restrained motion, outline person, muted green ground, irregular navigation controls and local font. Approved compass/minimap are scoped additions. Corridor integration through PR #25 is historical delivery; it does not grant automatic merge/deploy authority to unrelated mixed work.

## 2026-10-27 — bounded runtime resources and documented sandbox scope

Resource work preserves geometry/art/ownership while separating active, retained and disposed resources, with explicit budgets and measured evidence. Sandbox work needs a repository scope before construction. Read canonical docs and align changes before checks/CI/PR; do not add per-step approval bureaucracy or a parallel task system.

# Verification and acceptance

> Read [STATUS](STATUS.md) and the selected task's evidence first. Old DM-0004 counts, legacy GLB smoke and standalone outline screenshots remain bound to their own consumer/revision; none automatically verifies the current built entry or a later runtime change.

Status: acceptance contract. The current built Xinhua entry is the selected outline corridor; [RUNTIME](RUNTIME.md) separates implemented behavior from broader targets. The scenarios below require recorded observations before they may be called passed. Earlier runtime and rejected visual records remain historical evidence.

## Evidence levels

Keep document consistency, domain tests, build results, runtime observations, visual observations, user approval, merge, and deployment separate. Each claim names its consumer, tested revision, fixture/state, observation and evidence location. A plan is not an observation. A successful build does not establish camera, seam, source-label or portal behavior.

Private evidence must stay private. Public PR summaries can identify the test and result without attaching personal originals, private URLs or exact residential coordinates.

## Every-PR documentation check

Read the relevant canonical docs before implementation. Keep them aligned during the change, then check the **entire diff vs the current base** and complete documentation consistency/link review **before tests/build/CI**. Open or update the PR with those actual results. A GitHub job requiring a push/PR event is checked after that event against its actual head; a queued or earlier-head result is not current evidence.

The PR description identifies: (1) the task scope recorded before construction, including sandbox work; (2) the canonical docs updated, or a specific reason **none** need changes; (3) their correspondence to implemented, tested, proposed and unresolved behavior; and (4) documentation and validation observations. A sandbox scope records purpose, base, boundaries, acceptance, output destination and status in the existing matching packet. Trial files remain outside Git. Repeat the full documentation check on the **final head before any authorized merge**, especially after rebases, merges from main or scope changes.

Do not say a branch-only feature is already on main, conflate browser tests with aesthetic acceptance, or leave a historical "pending integration" claim as the new present tense. Prefer stable, evidence-bound descriptions that remain accurate once a PR merges, with exact PR/commit provenance in the delivery statement. This requirement does **not** force unrelated documentation churn, private information into public files, or publication/deployment. The [pull-request template](../.github/PULL_REQUEST_TEMPLATE.md) records the result.

## Historical architecture-document baseline — DM-0001

These IDs describe the initial documentation-only task. Its D07 exclusion is not a ban on later user-authorized runtime work; each current task records its own observable acceptance.

| ID | Acceptance |
| --- | --- |
| D01 | The product, spatial/time/scene/content ownership, and Phase 1 contract are present and navigable from README. |
| D02 | 新华街 is the highest-priority walking corridor; 南开西里 and the two historical school sites are included; the high-school cycling extension is excluded. No exact route or school address is invented. |
| D03 | Current and other-time entrances, collapsed HUD, separate route timeline, selective 2.5D and image-based interiors are explicit. |
| D04 | Wording fidelity, separate approvals, generated-image provenance, privacy and recoverable originals are explicit. |
| D05 | The attention entry is short, tasks are scoped, histories are cold, and handoff removes active routing without claiming acceptance/merge. |
| D06 | Markdown local targets, JSON syntax/routing references, intended file diff and unchanged LICENSE are checked against the actual delivered files. |
| D07 | No app, imagery acquisition, generated art, deployment or runtime acceptance is claimed; roadmap entries do not self-activate. |

Semantic review of D01–D05/D07 is an author review against the current user request. Do not describe it as independent or user acceptance. D06 is a reproducible mechanical check whose exact tested head belongs in delivery evidence.

## Cross-cutting executable scenarios

| ID | Scenario and required observation |
| --- | --- |
| G01 | Correct a place coordinate/geometry revision; its memories and school occupancy relations retain stable identity. |
| G02 | Resolve a moved school by historical occupancy; current campus search does not replace the old site. |
| G03 | Select a registered street/route buffer; results are spatially correct, paginated and period-aware. An unresolved connector is not silently made into a walked route. |
| T01 | Current, earlier, later and uncertain memories remain distinguishable in route context. Reading does not change the active environment; an explicit environment/period selection does, preserving the anchor where possible. |
| T02 | Enter an area lacking a compatible period state; no silent nearest-year fallback occurs. Other-time content remains discoverable. |
| T03 | Approximate date and life-stage language survives extraction, display and export; missing intervals are not interpolated into historical claims. |
| U01 | Default desktop and narrow-screen views remain map/scene-dominant with collapsed corner controls, readable text and usable targets. No development dashboard leaks into explorer. |
| U02 | A small memory shop can outrank a large background compound without losing its actual side-of-road registration. |
| U03 | Route timeline is explicitly opened and closed; closing restores the prior view. Dense memories cluster without disappearing from retrieval. |
| S01 | Enter overview → street/route → roadside attachment → note/sequence/local scene and return. Original route, side/offset, heading, period, camera, selection and origin scene restore. Test nested returns, reduced motion, failed load and back navigation. |
| S02 | A late response for an abandoned scene cannot replace the current scene; a dormant scene no longer receives navigation input. |
| A01 | Adjacent illustrated tiles join without shifted roads, duplicated structures or click misregistration at the intended view and zooms. Include a diagnostic overlay and normal-view evidence. |
| A02 | Reopening an accepted scene uses the same pinned assets; updating a shared template does not change accepted scenes automatically. |
| A03 | An original photo, edited photo, composite and reconstruction are labeled at viewing time; reconstructed details do not become source evidence. |
| C01 | A rambling input produces readable text with no added substantive claims and with source spans traceable. User wording and uncertainty survive. |
| C02 | One photo supports several derived components, all linked to the original regions; camera location is not assigned to every depicted object. |
| C03 | Art approval does not approve text/facts/publication; replacing a revision reopens only affected review dimensions. |
| P01 | Public export and logs contain no private originals, coordinates, object URLs or unapproved derivatives. Workbench/data access is actually protected. |
| P02 | Export restores IDs, revisions, portals, sources and approvals into a clean instance; deletion/withdrawal removes the relevant reachable derivatives. |
| L01 | A synthetic large archive matching the anticipated ingestion volume remains paginated and browsable; initial scene does not download every memory or source. |

Select scenarios according to the changed behavior and relevant consumer. Keep gates bounded to actual risks rather than running an unrelated project-wide matrix. Resource caps are declared implementation policies; physical-device performance and supported-device targets require measurements, not assumed outcomes from those caps.

## Route-first and local-change acceptance additions

These are target requirements. A retained prototype may cover part of one scenario; only explicit current-consumer evidence establishes the complete result.

| ID | Required observation |
| --- | --- |
| R01 | Across all overview tiers, a school/hospital/gate landmark cannot directly open interior content. The supported route is the normal navigation target. No overview avatar appears. |
| R02 | The same attachment shape can dispatch a note, static sequence or local scene. Updating a target preserves place/route identity and does not repaint unrelated objects. |
| R03 | Two entrances on different valid routes can reach one place without duplicate identity. Wrong-side, different-level and wall-crossing activation is rejected. |
| R04 | Sequence page turns do not start a walk controller or imply adjacent rooms. Closing restores the exact street origin; stale image loads cannot replace the active scene. |
| R05 | A name-only gate remains valid without invented interior content. Authorized note capture does not depend on complete campus geometry. Public builds contain no private drafts. |
| F01 | Replace one boundary interval from brick to railing and back at the same camera. Only the local appearance/visibility/blocking/masks change; route and neighboring accepted objects stay fixed. |
| F02 | A detached office/frontage room occupies its own supported host/depth. No forced apartment-ground-floor attachment and no fence drawn through its door. Commercial use does not force a shop interaction. |
| F03 | Split a formerly coarse segment as memory improves. Existing notes/attachments retain stable identity through an explicit remapping revision. |
| H01 | A synthetic site changes use, gains damage, has an unobserved gap and later resembles an earlier use. Site identity survives; shell/occupant identity and dates are not fabricated. |
| H02 | Partial ordering and uncertain dates survive input, query, reading and export. Unknown intervals are not interpolated, and contradictory observations remain reviewable. |
| V01 | An unfamiliar compound stays intentionally sparse at high zoom. A gate/icon uses coherent projection and does not hide meaningful routes or turn extra painted pixels into a larger physical/click footprint. |
| V02 | Opaque walls, rails and detached frontages show correct local occlusion in the actual consumer. Increasing zoom does not invent rear details. |
| Q01 | Notes, sequences and local scenes are fetched lazily from pinned revisions. Initial overview does not download all interiors, and reopening content makes no generation request. |

Documentation acceptance also checks that ownership links agree, outdated direct-map-to-room and compulsory building-host rules are removed from current requirements, and Phase 1 is not enlarged by hospital examples. Keep local patch-tool verification separate from a full repository application, app tests and browser/visual evidence.

## Visual review discipline

Use the same registered segment, period, camera and viewport for before/after evidence. Inspect the actual composition: scene occupies the intended area, words are legible, doors are recognizable, temporal entrances are understandable, and foreground buildings do not hide the route. Source/geometry overlays diagnose problems but are not the final aesthetic view.

When browser or generation capability is unavailable, record exactly which observations are missing. Static source checks cannot stand in for a screenshot or walkthrough. A user can accept a scoped result with an explicit gap; the gap remains in the handoff rather than being relabeled passed.

## Delivery statement

Every delivery states: files/assets changed, exact branch/head, acceptance evidence, known gaps, approvals not yet obtained, whether main changed, and whether anything was published/deployed. This is an outcome record, not a promise of autonomous future work.

## Selected outline integration gates

Check scene registration/hash and privacy before mount, local-frame round trips, session return/reload, explicit time membership and invalid saved-state rejection. Check all continuous routes, gates/fences/non-road masks, fixture collision and screen-mask budget. Then use the actual built main entry for pointer/keyboard walk, camera/compass, minimap collapse, menu pause, map exit/re-entry, reload and failed-load recovery. Standalone r5 screenshots prove the approved look, not main integration. Keep browser captures outside Git and bind compact observations to the selected manifest and tested commit.

For outline figure visibility, bind foot/head projection and actual screenshot to the same pose/yaw, then retrace the point before changing camera or masking. Screen-in-bounds diagnostics do not replace visible figure review.

## Runtime lifecycle and residency checks

For map-to-street transitions, observe the lower-right box → upper-left writing → fade sequence, five dated street-journal variants and subtle object-level Haring hand/block instability at actual desktop/phone size. Observe a complete moving entry: continuous stroke growth and pen travel, lifted stroke/line changes, the distinct pause and 2.1-second reading hold; screenshots alone cannot establish pacing or motion. Check the unframed page layout, the block's position below/right of the unchanged writing, absence of thin page/button borders, the block's rounded contour/face joins and pencil contact along the curved drawing path, pen-tip alignment between raster poses, a short softly faded wrist with no hard crop edge or long arm obscuring the page, font glyph coverage and readable final handwriting; rejection of earlier art/text remains separate from passing behavior checks. Exercise the menu switch and reload persistence, the actual overhead/cloud/descent alternative and reduced motion. During both presentations verify navigation is blocked and the saved map/street camera stays unchanged. Cancel before loading, during drawing and during reveal; test delayed/failed scene load, page hiding, repeated entry and return. Cleanup must leave no modal, camera override or extra frame chain, and a retry must still work. See [TR01–TR05](attention/tasks/DM-STREET-TRANSITION-20261028.md).

`tests/entry-transition.browser.mjs` runs against the built application; it records cadence/beat observations and writes screenshots/results to `ENTRY_EVIDENCE_DIR` or a system temporary directory. The existing browser CI job runs it after the selected-street smoke and retains captures as short-lived workflow artifacts. Its failure fixtures are separate from normal-flow console-error checks; Windows local checks may use a supplied Playwright module and Chromium executable.

Use the actual main outline entry, plus focused tests for its shared runtime modules. Record these outcomes independently:

| Concern | Required observation |
| --- | --- |
| Frame ownership | Menu, inactive scene and hidden page stop scheduled work; resume has one frame chain; final disposal is idempotent and removes listeners/observers. |
| Retention and expiry | A return within the retained-stage window reuses one stage/navigation owner with the same valid session pose; expiry or incompatible registration disposes it and later creates a fresh valid stage. |
| Spatial residency | Camera-selected chunks activate; inactive retained chunks receive no dynamic updates; warm-count, estimated-byte and idle-age limits cause deterministic eviction during updates. A paused scene does not run an independent 15-second eviction timer; test its separate retained-stage expiry. Report active and warm populations separately. |
| Resource ownership | Unique resources release once; a chunk cannot dispose a material/geometry owned by a still-live scene or another chunk. Final cleanup covers line meshes, textures, scopes and renderer resources actually used. |
| Late results | Scene/module/font or other async completion cannot remount or mutate a disposed/replaced scene; cleanup cannot cancel a newer owner. |
| Navigation | Build the navigation owner once for the loaded scene, preserve registered collision and every current destination, and bound reusable caches. Exercise the separate 50,000-node search and 32,768-candidate nearest-query limits; exhaustion must fail safely with a diagnostic flag. Cache size is distinct from temporary search storage. |
| Appearance | Same selected data, camera/pose and viewport preserve visible silhouettes, contour width, depth/ink occlusion and the grounded person on desktop and phone. A shorter residency radius must not erase visible distant ink. |

Keep render counters, geometry/texture counts and estimated resource bytes distinct from measured GPU memory. A bounded cache and a successful SwiftShader walkthrough establish lifecycle behavior in that environment, not hardware frame-time improvement. Capture actual frame cadence or GPU timing separately before claiming a performance gain; neither CPU submission time nor a passing test is a GPU benchmark.

Corridor extension uses the existing outline registration and application session. Data-driven destinations include Xinhua east/west, Kandan Bridge and Qili west-facing Daoxiangcun forecourt. The stable scene ID is retained; registration revision invalidates stale poses. Three display masses are segmented above detached low shops while source footprints remain intact. Named shop frontage requires map POI and dated imagery; numerical ground extents remain approximate.

## 具名地点的地理验收与工程验收

位置相关改动必须分别给出以下结果，不以同一个“通过”概括：

| 验收项 | 可支持结论的证据 |
| --- | --- |
| 地点身份、所在楼栋、街侧与朝向 | 实际地图POI与建筑对应、带日期和视向的街景；逐项标明已核实或仍未知 |
| 轮廓、进深、退界和广场范围 | 卫星/街景交叉观察与注册底稿；绘制估计明确标出 |
| 实际呈现与导航 | 当前修订在主体入口中的画面、目的地行走、返回和恢复 |
| 工程一致性 | 源数据保留、哈希、测试、构建与最终提交CI |
| 集成与合并 | 实际消费入口、PR状态、远端main提交；部署另列 |

连通测试只能证明能走到设定的坐标，不能证明坐标属于所标商店；构建与CI通过不能证明地点正确。生成图、示意图和场景截图也不能用作自身地理准确性的来源。代码中写了来源名称，不能替代实际查看来源。

用户问“是否已合并main”时，实时核对远端main和PR合并状态，分别报告独立预览、已接主体、已开PR、已合并和已部署的实际状态。修复后合并的授权允许在必要检查通过后继续合并；不得将未完成的位置核验包装为已完成以满足合并条件。

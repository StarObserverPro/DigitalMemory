# Documentation map: area → route → roadside attachment

**Current routing, 2026-10-27:** The supported Xinhua entry uses the selected Sanli outline scene and corridor extension, merged through [PR #25](https://github.com/StarObserverPro/DigitalMemory/pull/25). The continuous outline person, restrained motion and navigation UI are the active close-view treatment. Overview raster art remains separate; the retained GLB student, 2× study and graybox camera are historical/legacy references. Read [STATUS](STATUS.md) for exact implementation and evidence, [RUNTIME](RUNTIME.md) for current lifecycle and known gaps.

The area → route → attachment target was integrated on 2026-10-19. This page routes readers to existing owners; it is not a second schema or evidence that every target contract has been implemented. Marble 2 remains a future handoff with no actual generation, and bridge research retains its public-source boundaries.

## Read by question, not by historical task number

| Question | Canonical owner | Supporting record |
| --- | --- | --- |
| What experience are we preserving? | [PRODUCT](PRODUCT.md) | [PHASE_1](PHASE_1.md) owns geographic scope. |
| What can be entered from each view? | [INTERACTION](INTERACTION.md) | [ILLUSTRATION_MAPPING](ILLUSTRATION_MAPPING.md) owns overview/street correspondence. |
| Who resolves location, interaction and scene loading? | [ARCHITECTURE](ARCHITECTURE.md) | [RUNTIME](RUNTIME.md) reports the implementation seams. |
| Which street/person is active vs the retained GLB and older 2× test? | [STREET_PROTOTYPE](STREET_PROTOTYPE.md) | [STREET_VISUAL_CALIBRATION](STREET_VISUAL_CALIBRATION.md) is historical visual evidence. |
| What is the World Labs/Marble 2 status? | [WORLDLABS_HANDOFF](WORLDLABS_HANDOFF.md) | Future handoff only; no generated environment. |
| Where is the 1990s former primary-school site, and which entrances remain unlocated? | [Former-primary-school research](research/FENGTAI_PRIMARY_OLD_SITE.md) | [PHASE_1](PHASE_1.md) owns scope; 1993 gazetteer snippets support the old address/adjacency; later imagery is archived separately, and gate/lane/factory remain unresolved. |
| What public sources describe Fengtai bridges? | [FENGTAI_BRIDGES_ZHENGYANG](research/FENGTAI_BRIDGES_ZHENGYANG.md) | [FENGTAI_UNDERPASS](research/FENGTAI_UNDERPASS.md) owns profile detail. |
| How do routes, attachments, images and repeated changes retain identity? | [DATA_MODEL](DATA_MODEL.md) | [LAYER_COMPOSITION](LAYER_COMPOSITION.md) owns street-edge assembly. |
| What is drawn, omitted, symbolized or walkable? | [MAP_ASSEMBLY](MAP_ASSEMBLY.md) | [HANDPAINTED_MAP_ART](HANDPAINTED_MAP_ART.md) owns the medium, projection and final-size checks. |
| What must be researched or generated for one accepted representation? | [ASSET_PIPELINE](ASSET_PIPELINE.md) | [GEO_DATA_LINEAGE](GEO_DATA_LINEAGE.md), [GEO_DATA_RUNBOOK](GEO_DATA_RUNBOOK.md) preserve source provenance; [ASSET_WORKFLOW_VALIDATION](ASSET_WORKFLOW_VALIDATION.md) retains superseded trial measurements. |
| Which source plan, overview recovery and older studies matter? | [Xinhua spatial pipeline](research/XINHUA_SPATIAL_PIPELINE.md), [Xinhua building survey](research/XINHUA_BUILDING_SURVEY.md) | The pipeline owns selected R7 recovery and historical R6 assembly. [LOCAL_VISUAL_REFERENCES](LOCAL_VISUAL_REFERENCES.md) and `research/xinhua-image-observations.json` retain dated observations, not current placement instructions. |
| How do we reuse the accepted Xinhua close-street outline process? | [Xinhua outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md) | [Selected runnable scene](../scenes/xinhua-junction-outline/README.md); [Integrated Sanli close view](../scenes/xinhua-sanli-outline/README.md), reached through the main street entry; overview raster art remains unchanged. |
| How do new observations become notes, sequences and environment revisions? | [CONTENT_PIPELINE](CONTENT_PIPELINE.md) | Original/private material stays outside public Git. |
| What is accepted, tested, merged or released? | [VERIFICATION](VERIFICATION.md), [STATUS](STATUS.md) | Task packets identify exact observations, not new requirements. |
| Why is a decision settled? | [DECISIONS](DECISIONS.md) | Current explicit corrections supersede conflicting older assumptions. |
| How does an Agent work without losing the purpose? | [Agent entry](../AGENTS.md), [attention routing](attention/README.md) | Plans and delivered packets stay cold. |

## The integrated experience

The overview gives area-level orientation through three detail tiers, without a person. Its normal navigation target is a registered street or route segment. Entering that line creates the grounded street experience. Gates, doors, street objects and remembered positions are attachments encountered along that route; they are not an independent field of overview shortcuts.

At a roadside attachment, the same activation contract opens a note, a finite illustrated sequence, or a separately loaded local scene. These are content choices, not categories dictated by whether the institution is a school, hospital or shop. A recognizable gate can be sufficient; a large parcel need not be fully modeled. A small familiar corner may deserve more spatial interaction than a large hospital.

Spatial registration still retains places, source footprints and area associations. Route-first navigation does not delete those records or turn every institution into a child whose identity depends on one road. A place can have several valid entrances/route attachments. Search and resumed sessions preserve a meaningful route context rather than silently bypassing it.

## Independent decisions

Keep source certainty, date support, exterior/interior familiarity, memory relevance, visual detail, physical access and click behavior separate. Availability of a precise modern footprint does not require displaying it. An icon can simplify a deep compound, but it cannot move the road, imply a false opening, or turn a decorative silhouette into a collision mesh.

The street-facing fabric is locally replaceable: brick walls, iron railings, mixed boundaries, gates, detached frontage rooms and open setbacks are separate structures. Commercial use does not imply an attached ground-floor shop, and a visible office does not require an interactive interior.

A stable location supports successive observations and alternative environment states. Reuse, damage, repair and renewed use can recur without producing a new place ID each time. Calendar dates may remain unknown while a partial ordering is known. A picture sequence is a reading order, not automatically a walkable floor plan or a historical timeline.

## Targets, current consumers and historical evidence

PRODUCT, PHASE_1, ARCHITECTURE, DATA_MODEL, INTERACTION and the production contracts describe required behavior. RUNTIME and STATUS identify the implemented subset and the selected consumer. A requirement for a note/sequence/local-scene dispatcher, editable frontage intervals or a private archive does not establish that those capabilities exist.

STREET_VISUAL_CALIBRATION, ASSET_WORKFLOW_VALIDATION, LOCAL_VISUAL_REFERENCES and dated sections in STATUS retain their original fixtures and verdicts. World Labs camera/CLI guidance retains its checked date and must be revalidated before any future authorized submission. Public geographic research retains its source dates, approximate dimensions and unresolved identities. Do not silently convert an older trial's counts, camera, completion state or permission into the present contract.

Task packets preserve exact scope, source base, observations and handoff. Only [current.json](attention/current.json) identifies actively executing work; an old “next action” is not an autonomous task. Reading and reconciling documentation does not change source geometry, content approval or deployment state.

## Construction and PR sequence

Record or reuse the repository task scope before construction, including sandbox work. Its minimum record is purpose, baseline, boundaries, acceptance, output destination and status; selected deliverables may enter production paths, while trial artifacts stay outside Git. [Attention guidance](attention/README.md#sandbox-work-still-has-a-repository-scope) owns the details.

Read the relevant owners before implementation, keep them aligned with the change, and review the full diff/documentation **before tests/build/CI**. Then open or update the PR with actual evidence and explicit remaining gaps. Event-triggered GitHub checks are reported for the head that ran them. This is a completion sequence within the existing task, not a new per-step approval process.

## 文档修正的完成标准

明确提出的文档类修正按 [AGENTS 的持续授权](../AGENTS.md#文档类修正的持续授权)直接完成至main合并。先在本表定位规范所有者，同步受影响说明并检查事实、链接和状态一致性，再提交PR、完成适用检查与合并；交付时报告真实的合并结果。无需为同一已授权文档修正重复征求确认。运行时改动、素材公开和部署仍按各自授权范围执行。

# Documentation map: area → route → roadside attachment

Contract revision: 2026-10-19. This page routes readers to the owners below; it is not another schema or a claim that the new behavior is implemented. The proposal package was prepared against main `2b2bd01b52934cd28be57e050a90b250b3455c6a`.

## Read by question, not by historical task number

| Question | Canonical owner | Supporting record |
| --- | --- | --- |
| What experience are we preserving? | [PRODUCT](PRODUCT.md) | [PHASE_1](PHASE_1.md) owns geographic scope. |
| What can be entered from each view? | [INTERACTION](INTERACTION.md) | [ILLUSTRATION_MAPPING](ILLUSTRATION_MAPPING.md) owns overview/street correspondence. |
| Who resolves location, interaction and scene loading? | [ARCHITECTURE](ARCHITECTURE.md) | [RUNTIME](RUNTIME.md) reports the implementation seams. |
| How do routes, attachments, images and repeated changes retain identity? | [DATA_MODEL](DATA_MODEL.md) | [LAYER_COMPOSITION](LAYER_COMPOSITION.md) owns street-edge assembly. |
| What is drawn, omitted, symbolized or walkable? | [MAP_ASSEMBLY](MAP_ASSEMBLY.md) | [HANDPAINTED_MAP_ART](HANDPAINTED_MAP_ART.md) owns the medium, projection and final-size checks. |
| What must be researched or generated for one accepted representation? | [ASSET_PIPELINE](ASSET_PIPELINE.md) | [GEO_DATA_LINEAGE](GEO_DATA_LINEAGE.md), [GEO_DATA_RUNBOOK](GEO_DATA_RUNBOOK.md) preserve source provenance. |
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

## What this revision changes—and does not

This revision integrates navigation, representation, street-edge editing and sparse local chronology into the existing owners. It does not acquire imagery, replace the 161-mass Xinhua reference plan, generate assets, implement private note storage, call World Labs, alter the avatar or deploy the application.

At the inspected baseline, open PR #18 documents World Labs/Codex handoff and PR #19 records the selected 2× apparent street-character scale. Preserve both tracks when integrating these edits. The scale selection concerns street presentation, not doubling physical building/person dimensions; there is still no overview avatar. Their branch-specific documents remain their owners and must not be overwritten by this reorganization.

Historical task packets, research notes and superseded trial specifications remain traceable. They are not parallel live contracts. Runtime history belongs in STATUS/task records; do not infer present capability from an old paragraph headed “current”.

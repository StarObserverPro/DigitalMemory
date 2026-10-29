# Product contract

Status: integrated product contract, 2026-10-19; requirements and intended behavior, not an implementation claim. Read [documentation ownership](README.md) for the current contract map.

## Purpose

Preserve the remembered interaction between a person and a geographic environment. A street, shop, school gate, corridor, or view can hold familiar atmosphere without an exceptional event. The value of a place comes from personal significance and repeated use, not city-scale importance or the amount of available documentation.

Geographic registration provides the skeleton. Sparse recollections and life stages supply time. Stylized cartography, modest building volumes, original photographs, reconstructed images, and edited words provide different ways to encounter the same memory. Uncertainty and gaps are legitimate content states.

## Established requirements

**Area → line → point.** The overview organizes an area; a registered street or route is the normal entry into the lived environment. Roadside gates, objects and remembered positions are reached inside that route scene. Showing a school symbol on the overview does not make its interior directly clickable. Search/resume must retain an explicit route context.

**Movement serves recollection.** Walking is optional exploration. A chosen supported destination can be reached directly after a short transition, including from the overview, while retaining its registered street context. Xinhua carriageways can be crossed at any unobstructed point. Geographic relationships remain recognizable without requiring a traffic crossing, physical route connection or minutes of walking before revisiting a memory. Destination travel lands on the street; attachment content keeps its own activation/return contract.

**Geographic identity, selective depiction.** Source geometry provides a stable skeleton; remembered relevance and the historically visible street interface determine what is drawn. Side-of-road, entrance, turn, crossing, setback and sightline relationships matter more than exhaustive parcel detail. A source-accurate rear campus can remain omitted, while a familiar gate is recognizable. Do not trade recognizability for a falsely complete city model.

**One attachment, several content depths.** A roadside attachment may expose a short note, a finite picture-and-text sequence, or a separately loaded local scene. An unused door may simply remain part of the scenery. Institutions do not receive mandatory templates: one school may be only a gate, another may lead to a familiar courtyard. Several notes do not automatically justify free movement; spatial interaction must serve an actual recollection.

**Street-facing fabric is editable.** Walls, iron railings, mixed boundaries, gates, detached frontage rooms and setbacks are replaceable short segments. A commercial office outside an apartment block is not automatically ground-floor retail. Rendering, physical blocking and note access are independent choices.

**Same place, repeated observations.** Preserve changes in use, shell, enclosure, signage, damage and repair at the same location. Support before/after relations, approximate life stages and unresolved intervals without fabricating annual snapshots. Repeated looking is content even without a singular dramatic event. A visual recurrence is not proof that the same structure or business returned unchanged.

**App, not content website.** A map or the previous valid scene dominates the screen; one menu starts closed. Notes and image sequences open intentionally and return to their origin. No persistent marker carpet, article sidebar, construction dashboard or compulsory timeline. A static sequence is a scene viewer, not an obligation to build a dialogue engine, RPG or branching narrative game.

**Coherent illustrated world.** The overview uses the established hand-painted raster language and shared map projection. The selected Xinhua/Sanli close view uses the approved sparse contour language and continuous outline person; [the outline workflow](research/XINHUA_OUTLINE_WORKFLOW.md) owns that scoped treatment. All overview tiers omit the avatar. Board-game references concern legibility, proportions and movement, never dice, property economics or an equal-cell street. Symbolic enlargement changes representation bounds, not source geometry or collision.

**Meaning-preserving, incremental authoring.** Keep originals, extracted claims and edited text separate; do not invent autobiographical meaning. Generic visual completion remains identified as reconstruction. Hundreds of short recollections can accumulate through local revisions and paginated retrieval without republishing the private archive or repainting the entire street.

## Quality priorities

1. Preserve the user's meaning, privacy, and recoverable original material.
2. Preserve the recognizability and navigability of meaningful routes and entrances.
3. Make the current period and other-period entrances legible without clutter.
4. Keep a consistent, inviting visual language and a restrained interface.
5. Increase local precision only where it improves the remembered experience.

These priorities do not require survey-grade accuracy. They do prevent visually attractive output from silently moving a shop across the road or replacing the historical school with its current namesake.

## Non-goals

No complete historical Beijing; no annual reconstruction with invented intermediate states; no compulsory full 3D interiors; no automatic publication of private recollections; no social network; no generalized historical-truth engine; no live image generation every time a scene opens; no import of Crystal Garden game mechanics or deployment machinery.

Do not turn atmospheric recollections into a biography focused on other people. People may appear where the user mentioned them, including as an observed group or part of the environment. Their identities and personal stories are not automatically collected.

## Decision authority

The user owns remembered meaning, aesthetic acceptance, scope extensions, and publication. Agents may organize and implement within agreed bounds. Public historical evidence may correct a reconstruction parameter without erasing the user's original description. Contradictory versions remain traceable; neither a generated image nor an Agent summary can overrule the original by becoming the next iteration's source.

[Phase 1](PHASE_1.md) owns current geography and temporal priorities. [Interaction](INTERACTION.md) owns visible behavior. [Content pipeline](CONTENT_PIPELINE.md) owns wording and approval.

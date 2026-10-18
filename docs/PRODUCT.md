# Product contract

Status: architecture baseline v1; requirements and intended behavior, not an implementation claim.

## Purpose

Preserve the remembered interaction between a person and a geographic environment. A street, shop, school gate, corridor, or view can hold familiar atmosphere without an exceptional event. The value of a place comes from personal significance and repeated use, not city-scale importance or the amount of available documentation.

Geographic registration provides the skeleton. Sparse recollections and life stages supply time. Stylized cartography, modest building volumes, original photographs, reconstructed images, and edited words provide different ways to encounter the same memory. Uncertainty and gaps are legitimate content states.

## Established requirements

**Geography first.** Coordinate-based spatial lookup and registration organize points, routes, areas, and entrances. Frequently walked streets deserve stronger continuity than rarely visited backgrounds. Approximate dimensions are acceptable; meaningful street-side, turn, crossing, entrance, and sightline relationships take priority. A feature being unclear in a satellite image does not by itself prove that it is unimportant to the user.

**Time as fragments.** The browsing session has a current life stage or approximate period, not a continuously simulated day. Other-time memories remain discoverable at the same place through restrained grayscale, pale, or outline treatment. A street/route memory timeline is an optional dedicated view, not a permanent full-width HUD.

**App, not content website.** Open into a large map or the previous scene. Keep two or three small corner controls collapsed. Visible words should be memories or necessary orientation, source labels, and accessible controls. Development status, ingestion queues, confidence diagnostics, and production tooling belong in a separate workbench.

**Stylized map, not satellite display.** Historical imagery is a registration/reference input. The default surface is a coherent illustrated map with a 1990s/early-2000s memory-book sensibility. A fixed or tightly controlled oblique view, planar ground, and selectively raised buildings are appropriate. The board-game reference concerns legibility and spatial presentation only: no equal-sized cells, dice, property economy, or arbitrary displacement of actual streets.

**Selective depth.** A school can be a modest exterior volume with a portal. A short zoom or forward transition may open a separately loaded campus/corridor. A classroom can be an image viewed from its doorway with linked photos and words. Full interior geometry and free movement are not required.

**Meaning-preserving editing.** Store the original input, extracted statements, and edited presentation separately. Remove repetition and improve order or rhythm, but add no new substantive person, object, action, frequency, time, sensory detail, emotion, or causal claim. Keep uncertainty and the user's point of view. Image completion can contain acknowledged visual inference; it must not become a first-person assertion.

**Incremental accumulation.** Expect hundreds of short inputs per month. One input can describe several places or periods; one photograph can inform multiple assets. Stable identities, retrieval, batch review, local revisions, and durable export matter from the start. Do not rely on a single growing prompt, a giant runtime JSON, or a monolithic map repaint.

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

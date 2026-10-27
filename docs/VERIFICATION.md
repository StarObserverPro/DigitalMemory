# Verification and acceptance

> Historical DM-0004 observations: 17 domain tests and 14 browser checks were recorded for that revision. They do not verify the new route-first contract or the current release. Read [STATUS](STATUS.md) and [evidence](../evidence/README.md) for revision-bound results.

Status: acceptance contract. DM-0003 implements the corrected illustrated-map/scenic-flat subset; DM-0002 is earlier rejected visual history; see [runtime delivery](STATUS.md) and [evidence](../evidence/README.md). Unexercised scenarios below remain future requirements.

## Evidence levels

Keep document consistency, domain tests, build results, runtime observations, visual observations, user approval, merge, and deployment separate. Each claim names its consumer, tested revision, fixture/state, observation and evidence location. A plan is not an observation. A successful build does not establish camera, seam, source-label or portal behavior.

Private evidence must stay private. Public PR summaries can identify the test and result without attaching personal originals, private URLs or exact residential coordinates.

## Every-PR documentation check

At each initial PR submission or update, check the **entire diff vs the current base** and align affected canonical files before pushing. The PR description should identify: (1) which product/architecture/data/art/runbook/status/task documents were updated (or a specific reason **none** needed changes); (2) their correspondence to what is actually implemented, tested, proposed or unresolved; and (3) any link or wording checks. Repeat the check on the **final head before merge**, especially after rebases, merges from main, or changed implementation scope.

Do not say a branch-only feature is already on main, conflate browser tests with aesthetic acceptance, or leave a historical "pending integration" claim as the new present tense. Prefer stable, evidence-bound descriptions that remain accurate once a PR merges, with exact PR/commit provenance in the delivery statement. This requirement does **not** force unrelated documentation churn, private information into public files, or publication/deployment. The [pull-request template](../.github/PULL_REQUEST_TEMPLATE.md) records the result.

## Documentation acceptance for this task

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

## Future executable scenarios

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

Select scenarios according to the changed behavior; do not build a project-wide gate maze before there is a runtime. Numerical performance budgets and supported devices are to be measured and set during the first implementation packet, not fabricated here.

## Route-first and local-change acceptance additions

These are future executable requirements, not passed tests in this documentation delivery.

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

Corridor extension uses the existing outline registration and application session. Data-driven destinations include Xinhua east/west, Kandan Bridge and Qili west-facing Daoxiangcun forecourt. The stable scene ID is retained; registration revision invalidates stale poses. Three display masses are segmented above detached low shops while source footprints remain intact. Named shop frontage requires map POI and dated imagery; numerical ground extents remain approximate.

# Verification and acceptance

Status: acceptance contract. DM-0003 implements the corrected illustrated-map/scenic-flat subset; DM-0002 is earlier rejected visual history; see [runtime delivery](STATUS.md) and [evidence](../evidence/README.md). Unexercised scenarios below remain future requirements.

## Evidence levels

Keep document consistency, domain tests, build results, runtime observations, visual observations, user approval, merge, and deployment separate. Each claim names its consumer, tested revision, fixture/state, observation and evidence location. A plan is not an observation. A successful build does not establish camera, seam, source-label or portal behavior.

Private evidence must stay private. Public PR summaries can identify the test and result without attaching personal originals, private URLs or exact residential coordinates.

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
| T01 | Current, earlier, later and uncertain entrances have distinguishable presentation. Selecting one deliberately changes period and preserves the anchor where possible. |
| T02 | Enter an area lacking a compatible period state; no silent nearest-year fallback occurs. Other-time content remains discoverable. |
| T03 | Approximate date and life-stage language survives extraction, display and export; missing intervals are not interpolated into historical claims. |
| U01 | Default desktop and narrow-screen views remain map/scene-dominant with collapsed corner controls, readable text and usable targets. No development dashboard leaks into explorer. |
| U02 | A small memory shop can outrank a large background compound without losing its actual side-of-road registration. |
| U03 | Route timeline is explicitly opened and closed; closing restores the prior view. Dense memories cluster without disappearing from retrieval. |
| S01 | Enter map → school → corridor → image and return; original period, camera, selection and place restore. Test reduced motion, failed load and back navigation. |
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

## Visual review discipline

Use the same registered segment, period, camera and viewport for before/after evidence. Inspect the actual composition: scene occupies the intended area, words are legible, doors are recognizable, temporal entrances are understandable, and foreground buildings do not hide the route. Source/geometry overlays diagnose problems but are not the final aesthetic view.

When browser or generation capability is unavailable, record exactly which observations are missing. Static source checks cannot stand in for a screenshot or walkthrough. A user can accept a scoped result with an explicit gap; the gap remains in the handoff rather than being relabeled passed.

## Delivery statement

Every delivery states: files/assets changed, exact branch/head, acceptance evidence, known gaps, approvals not yet obtained, whether main changed, and whether anything was published/deployed. This is an outcome record, not a promise of autonomous future work.

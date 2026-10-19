# DigitalMemory

A geographically registered, time-layered memory application: a stylized map becomes a walkable 2.5D memory landscape, with branches into schools, corridors, images, photographs, and carefully edited recollections.

The purpose is to preserve impressions of living in an environment, not to produce a survey-grade reconstruction, a conventional content website, or a complete 3D city. Historical maps and satellite images support registration behind the scenes; they are not the default visual surface.

## Run the Phase 1 prototype

Requires Node.js 22+. Run `npm run dev` and open `http://localhost:4173`. No dependency installation is required. `npm test` checks the domain seams; `npm run build` produces the static application in `dist/`.

The prototype opens a hand-drawn overview. Enter the modeled Xinhua segment to walk, orbit, approach a courtyard gate and return to the same map position. The current close scene uses an articulated volumetric child and independent building volumes, superseding the earlier paper person and facade-only sample; see [street prototype and evidence limits](docs/STREET_PROTOTYPE.md). Historical school sites remain unplaced. See [runtime and asset storage](docs/RUNTIME.md) and [node mapping](docs/ILLUSTRATION_MAPPING.md).

The “图层与拼装” control lets you inspect roads, buildings, frontages and the child separately, then try two synthetic shop occupants in a single slot. Building form now follows [local photo observations](docs/LOCAL_VISUAL_REFERENCES.md); [layer composition](docs/LAYER_COMPOSITION.md) explains short modules and independent time layers.

## Start here

| Question | Canonical document |
| --- | --- |
| What are we making, and what must not drift? | [Product contract](docs/PRODUCT.md) |
| What is actually implemented or still unknown? | [Repository status](docs/STATUS.md) |
| What is the first geographic and experiential scope? | [Phase 1](docs/PHASE_1.md) |
| How do modules and sources of truth fit together? | [Core architecture](docs/ARCHITECTURE.md) |
| How are location, time, evidence, and memory represented? | [Data model](docs/DATA_MODEL.md) |
| How does the application feel and behave? | [Interaction contract](docs/INTERACTION.md) |
| How are maps, generated images, and scene assets produced? | [Asset pipeline](docs/ASSET_PIPELINE.md) |
| Where did Xinhua/Sanli building geometry actually come from, and what is verified? | [Geographic source chain](docs/GEO_DATA_LINEAGE.md) |
| How does an Agent acquire and audit the next map area without guessing buildings? | [Geodata acquisition / QA runbook](docs/GEO_DATA_RUNBOOK.md) |
| How does local Codex set up World Labs and resume the proposed street experiment? | [Marble 2 setup and handoff](docs/WORLDLABS_HANDOFF.md) |
| How do new recollections become reviewed content? | [Content pipeline](docs/CONTENT_PIPELINE.md) |
| What demonstrates that work actually succeeded? | [Verification](docs/VERIFICATION.md) |
| Which architecture choices are settled or deferred? | [Decision register](docs/DECISIONS.md) |
| How does an Agent start and hand off work? | [AGENTS.md](AGENTS.md), then [attention routing](docs/attention/README.md) |

## Initial emphasis

Phase 1 is a compact **walking-memory network**, prioritizing **新华街**, with **南开西里**, **丰台一小旧址**, and **十二中初中旧址** as the other named anchors. These are not a verified sequence of waypoints. Exact historical campuses and walked segments remain to be registered. The high-school cycling extension toward 丰益桥 is outside Phase 1.

Use approximately 2000–2005 as the first base-map reference period. Other periods are separate evidence and memory layers, not fictitious annual snapshots. The project must support sustained ingestion of hundreds of short recollections per month without making Agents or the browsing interface load the entire archive.

## Repository and personal archive

This repository is public. Keep implementation, architecture, synthetic test fixtures, and publication-cleared manifests here. Do not commit original personal recordings, transcripts, private photos, precise residential coordinates, secrets, or restricted imagery. The private archive and any selected public presentation are separate authorization boundaries; see [content and publication](docs/CONTENT_PIPELINE.md).

The existing [MIT license](LICENSE) is retained unchanged. It does not establish rights to third-party imagery or permission to expose personal material. Each future asset needs its own provenance, usage status, and publication decision.

This branch adds a runnable illustrated overview and a 140 m scenic-flat sidewalk sample. The previous flat board candidates were rejected as the main experience. The current layered revision is tracked through PR3 and the configured Sites deployment; exact release state is in the status ledger. No private archive/auth service, accepted historical scenes or user-approved memory content is claimed. Consult [status](docs/STATUS.md) for observed verification and review state.

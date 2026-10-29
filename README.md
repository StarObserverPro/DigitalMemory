# DigitalMemory

A geographically registered, sparse-time memory application. Browse an illustrated area, enter a street or route, and encounter roadside gates, objects and remembered positions. The same attachment can open a note, an illustrated sequence, or a small explorable scene; complete buildings and interiors are not the default unit of production.

The purpose is to preserve impressions of living in an environment, not to produce a survey-grade reconstruction, a conventional content website, or a complete 3D city. Historical maps and satellite images support registration behind the scenes; they are not the default visual surface.

## Run the Phase 1 prototype

Requires Node.js 22+. Run `npm run dev` and open `http://localhost:4173`. No dependency installation is required. `npm test` checks the domain/application seams, `npm run test:outline` checks the selected street scene, and `npm run build` produces the static application in `dist/`.

The runtime has a three-tier illustrated overview and the selected Xinhua/Sanli outline street, including the continuous outline person, restrained motion and the corridor to Qili's west frontage. Enter through a supported Xinhua segment or “到街上走走”, or choose an existing destination through the grouped “想去哪儿” picker for a short direct arrival. Xinhua can be crossed directly, and ground clicks can switch between walking and direct travel. The street adds an approved collapsible minimap and compass to its closed-menu interface; the overview has no avatar. The former GLB student, schoolwear palettes and graybox renderer remain retained modules, with their evidence separated from the current consumer in [STREET_PROTOTYPE](docs/STREET_PROTOTYPE.md). [RUNTIME](docs/RUNTIME.md) and [STATUS](docs/STATUS.md) describe current behavior and its limits.

The current design follows **area → street/route → roadside attachment**. All three overview tiers remain orientation views without an avatar. Route entry precedes normal place activation; notes, static image sequences and local exploration use one attachment contract. This documentation revision does not claim that the complete new dispatcher, street-edge editor or private note archive exists.

## Start here

| Question | Canonical document |
| --- | --- |
| How should these documents be read together? | [Documentation and ownership map](docs/README.md) |
| What are we making, and what must not drift? | [Product contract](docs/PRODUCT.md) |
| What is actually implemented or still unknown? | [Repository status](docs/STATUS.md) |
| What is the first geographic and experiential scope? | [Phase 1](docs/PHASE_1.md) |
| How do modules and sources of truth fit together? | [Core architecture](docs/ARCHITECTURE.md) |
| How are location, time, evidence, and memory represented? | [Data model](docs/DATA_MODEL.md) |
| How does the application feel and behave? | [Interaction contract](docs/INTERACTION.md) |
| How are maps, generated images, and scene assets produced? | [Asset pipeline](docs/ASSET_PIPELINE.md) |
| Where did Xinhua/Sanli building geometry actually come from, and what is verified? | [Geographic source chain](docs/GEO_DATA_LINEAGE.md) |
| How does an Agent acquire and audit the next map area without guessing buildings? | [Geodata acquisition / QA runbook](docs/GEO_DATA_RUNBOOK.md) |
| Which street scene/person is running, and which character studies are historical? | [Selected street and legacy prototypes](docs/STREET_PROTOTYPE.md), [historical scale review](docs/STREET_VISUAL_CALIBRATION.md) and [outline workflow](docs/research/XINHUA_OUTLINE_WORKFLOW.md) |
| Where is the future World Labs handoff? | [Marble 2 documentation — no generation](docs/WORLDLABS_HANDOFF.md) |
| Where is bridge/Zhengyang public research? | [Fengtai bridge research](docs/research/FENGTAI_BRIDGES_ZHENGYANG.md) |
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

The street remains a bounded working reconstruction, with source and dimensional uncertainty recorded separately from visual approval. It is not a complete historical route or a private content archive. Current implementation, exact verification, merge and deployment provenance belong in [STATUS](docs/STATUS.md). Selected scene operation and licences are in [the scene README](scenes/xinhua-sanli-outline/README.md).

For construction, record or reuse a repository task scope even when working in a sandbox. Read the relevant docs before implementation, align them before validation/CI, and report the actual results with each PR; [AGENTS](AGENTS.md) and [attention guidance](docs/attention/README.md) own that workflow. Trial artifacts remain outside Git.

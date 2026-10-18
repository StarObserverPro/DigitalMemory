# DigitalMemory

A geographically registered, time-layered memory application: a stylized map becomes a walkable 2.5D memory landscape, with branches into schools, corridors, images, photographs, and carefully edited recollections.

The purpose is to preserve impressions of living in an environment, not to produce a survey-grade reconstruction, a conventional content website, or a complete 3D city. Historical maps and satellite images support registration behind the scenes; they are not the default visual surface.

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

There is no deployed application, implemented renderer, acquired historical base-map package, or activated implementation task in this architecture deliverable. Consult [status](docs/STATUS.md) rather than inferring implementation from specification detail.

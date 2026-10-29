# Attention and long-running Agent construction

This is a small routing system for keeping intent intact across many chats, tasks and content batches. It is not a simulation of a model's internal attention and not an always-running scheduler.

## Three layers

**Stable direction:** [AGENTS](../../AGENTS.md) plus the canonical contract relevant to the decision. These tell an executor what the project is and who owns a seam. They are a map, not an instruction to load all documents.

**One live packet:** [current.json](current.json) routes an explicitly activated task to its packet. The packet preserves purpose, scope, baseline, period/place/batch context, acceptance and the exact next action. Its implementation route may evolve within authority.

**Cold engineering detail:** previous implementation tasks and roadmap ideas. Geographic investigation details are prohibited in the repository and are never a cold archive. Load an exact cited portion only when it answers the current question. Past work does not consume attention simply because its PR is still open.

## Activation and lifecycle

A current explicit user request can activate a bounded task. A roadmap, branch, old capsule, recurring topic, or Agent suggestion does not activate follow-up implementation, image generation, content publication, merge, or deployment.

A lightweight task lifecycle is `executing`, `delivered`, `parked`, `cancelled`, or `superseded`. Only executing tasks belong in `current.json`. Implementation phase may be `planning`, `authoring`, `verification`, or `blocked` while executing. Keep review, user approval and integration status as separate facts: delivered does not mean approved or merged.

For geographic investigation, do not create a public task packet or investigation handoff; only permitted conclusions may enter product documentation. During authorized engineering construction, create a missing packet from [TASK.template.md](TASK.template.md) rather than asking for an already-granted alignment again. For an analysis-only request, use the relevant documents without manufacturing execution state.

On delivery or stop, update the existing packet with tested revision, observations/gaps and next action; remove its active row in the closure change. The retained packet becomes cold history. Do not create an active successor merely to keep a queue occupied. A later user request may activate a new packet referencing the old one.

### Sandbox work still has a repository scope

An authorized sandbox study, temporary implementation or separate-checkout experiment still starts with a scope record in this repository. Reuse the matching task packet and its active route; create a new packet only when the work is a genuinely separate authorized task. A local folder name or a chat-only plan is insufficient handoff.

Before construction, record at least: intended result, exact repository/base and carrier, allowed changes and exclusions, observable acceptance, deliverable/evidence destination, and current status/next action. State which production paths may eventually receive selected work and that trial files remain outside Git. Keep private paths, source material and credentials out of the public packet.

This record preserves the task across sandboxes and sessions; it is not a request for permission at every step. Update it when scope, baseline, a material decision or delivery status changes. Routine attempts stay within the existing packet. Trial images, screenshots, raw references and one-off demonstrations continue to live outside the checkout under the production-only storage rule.

### PR-time documentation alignment

The working sequence is **read the relevant canonical owners → implement and update those owners → inspect the complete diff and documentation → validate/test/build/CI → open or update the PR**. Complete the documentation pass before validation, rather than adding a status paragraph after tests have already run. A check that requires a GitHub push/PR event is inspected after that event against its actual head; record it separately from local results.

For **every new PR and every push to an existing PR**, reconcile the complete proposed diff with its canonical docs **in that PR branch**, rather than postponing a documentation sweep until later. Update the affected contract, [STATUS](../STATUS.md) for observed state, source/evidence and task handoff as applicable; preserve uncertain or incomplete outcomes without claiming a merge, release or visual approval. Check links and stale references on the final PR head. The [repository PR template](../../.github/PULL_REQUEST_TEMPLATE.md) requires a short list of updated docs, or an explicit explanation why no document should change. A code-only fix is allowed when its existing documentation remains accurate and that reasoning is stated; bulk touching unrelated documents is not required.

Before the merge decision, compare against the latest base and ensure the new change does not restore an outdated description from a concurrent branch. This is a delivery discipline, not an automatic new work item or a requirement to start deferred tasks.

## Default attention window

Use one primary work item and up to two dependencies that affect its acceptance or a shared contract. This is a default local working set, not a hard global concurrency ceiling. Prefer a small number of relevant document sections and source files over entire directories. Expand investigation when evidence calls for it, without confusing a wider read with authorization to modify everything read.

The hot packet should be concise enough to reread after compaction; roughly one to two pages is a useful starting target, not a machine gate. Keep detailed attempts and long source material outside it. A large oral batch must be partitioned into source-linked fragments; do not make every subsequent task inherit the whole recording transcript.

Read the latest next-action/evidence summary last so the work resumes from current observations rather than the original plan. Re-anchor after context compaction/handoff, contradiction, material user correction, or before high-cost generation, merge/publication and final review. Phase labels alone do not justify repetitive rereading.

## What a packet must preserve

Keep the accepted engineering outcome; explicit exclusions; authorization source and allowed external effects; exact repository/carrier/base; affected geographic anchors, period/scene/batch revisions; relevant contract owners; acceptance IDs and observable results; known facts versus assumptions; unresolved contradictions; resource envelope; and one executable next action.

For an image task, the acceptance target includes view, place, period, style revision and source/material references. For a text task, include the source spans and the allowed editorial transformation. For shared-geometry or time-resolver work, identify impacted consumers rather than merely listing filenames.

Latest explicit user corrections supersede stale packet assumptions. Preserve permitted engineering results only; never retain geographic investigation history. Never let a compressed summary turn proposed work into completed work, an inference into a recollection, or a visual approval into a historical fact.

## Concurrent work and ownership

Use the [four-layer scope and cross-layer change table](../ARCHITECTURE.md#layer-scopes) before assigning edits. Each packet declares one primary layer, every touched layer, authoritative inputs, permitted outputs, shared-state owner and affected consumers. UI/visual work does not silently acquire geography or memory-authoring scope; editing an attachment target does not acquire coordinate authority. File ownership coordinates concurrent edits, while domain ownership determines which contracts must change together.

Independent tiles, scenes or content batches may proceed concurrently when their geometry/style/template/release dependencies do not conflict. Keep each task's place/period/source/revision ownership explicit. A geographic tile boundary alone is not a safe edit boundary if both tasks modify the same underlying road or approved material template.

Use expected revisions for content updates and fresh branch/head comparisons for Git. Classify collisions by shared data/contract/acceptance, not just adjacent filenames. Compatible leaf work may adapt to a new base; coordinate-system, identity, schema, chronology or publication-boundary changes require a dedicated reviewable change. Do not let an old packet freeze unrelated progress.

## Authority and evidence

Investigation, modification, user content approval, merge, deployment and publication are separate effects. An executor can choose compatible methods within the task without repeated permission requests. A new effect, forbidden boundary, meaningful product change or destructive operation needs appropriate authorization. Tool access alone grants none of these.

Bind checks to the consumer and exact tested commit/asset revision. Record a cheap discriminating observation when a hypothesis fails, and change the hypothesis before repeating a failed attempt. Do not loop generation or CI without new evidence; cap the particular task's attempts/cost in its packet and reserve capacity for review and handoff. No universal retry count is asserted for every kind of work.

When acceptance is unavailable, say what was and was not observed. A text-only change can be verified through text and source mapping; a visual change needs the relevant rendered view. Static assertions never prove a usable doorway, readable memory panel or seamless map.

## Minimal machinery now

`current.json` is a small active-task index. Packets are Markdown files under `tasks/`. The repository's canonical documents act as the topic router; no duplicate policy database is needed. The current JSON is data, not an enforced scheduler or CI lock. No automatic runs are installed.

Only add machine-enforced gates after a real repeated failure warrants one. Separate durable product invariants from temporary tool/model compensations; retire compensations that no longer help. Do not import a mature game's entire governance history into a new memory application.

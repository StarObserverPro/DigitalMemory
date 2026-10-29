# World Labs / Marble 2 handoff

> **2026-10-26 integration:** This is a future setup/handoff reference only. The user confirms that **no World Labs / Marble 2 scene was generated, uploaded, exported or integrated**. This check has not established actual CLI installation, login or available account task entitlements. The commands below must not be treated as an active assignment; recheck current vendor documentation if later authorized. The student GLB is an independent existing asset, not Marble output.

Vendor guidance checked 2026-10-19; local consumer references reconciled 2026-10-27. This is a bounded future handoff, not an installed integration or an approved production pipeline. Recheck vendor commands/schemas before any later authorized setup or submission. Read [AGENTS](../AGENTS.md), then only the needed sections. [DM-0020](attention/tasks/DM-0020.md) records the original documentation delivery.

## Start with setup, preserve the project

The user has a World Labs test account and chose to configure the CLI on the Codex side. If later activated, the first candidate step is installation, private authentication, and a capability/status report. No World Labs request, upload, generated asset, export or runtime integration has been executed by this Work thread. Account balance, beta entitlements and actual export availability remain unknown.

Use `StarObserverPro/DigitalMemory`. Start from current main, inspect local changes and open PRs, and preserve other work. Do not use Crystal Garden as an implementation target. The source review for this handoff used main `2b2bd01b52934cd28be57e050a90b250b3455c6a`; fetch again before implementation rather than treating this SHA as a permanently current head.

## Read narrowly: existing project knowledge

| Need | Current owner / observed state |
| --- | --- |
| Purpose, geography and sparse time | [PRODUCT](PRODUCT.md), [PHASE_1](PHASE_1.md): Xinhua walking-memory network first; Nankai Xili and two historical school sites are other anchors, not a confirmed itinerary. No exact decade is inferred from repeated walking. |
| Latest overview and its evidence | [STATUS](STATUS.md), [R6 pipeline](research/XINHUA_SPATIAL_PIPELINE.md): 161 selected masses across eleven groups from a 774-polygon corridor acquisition, with separately estimated floors. This is overview work, not an already built World Labs street. |
| Geographic results and uncertainty | [GEO_DATA_LINEAGE](GEO_DATA_LINEAGE.md), [GEO_DATA_RUNBOOK](GEO_DATA_RUNBOOK.md). Source IDs, roof/footprint ambiguity and floor ranges remain explicit. Current polygons do not establish historical construction dates. |
| Actual close-view consumer | [STREET_PROTOTYPE](STREET_PROTOTYPE.md): selected Xinhua/Sanli outline street, continuous outline person, elevated perspective camera and local walking/navigation. The retained GLB/orthographic prototype is historical. No World Labs renderer is active. |
| Code ownership | `src/explorer/outline-stage.js`, `scenes/xinhua-sanli-outline/runtime.mjs`, and `src/application/session.js`; [RUNTIME](RUNTIME.md) owns the current lifecycle. Spatial registry and temporal resolver retain geography/time authority; see [ARCHITECTURE](ARCHITECTURE.md). |
| Spatial input | `content/reference/xinhua-spatial-plan.json` is the reviewed overview plan, not a street-ready model or verified gate layout. Check units/transforms before reusing it. |
| Art / storage | [ASSET_PIPELINE](ASSET_PIPELINE.md), [HANDPAINTED_MAP_ART](HANDPAINTED_MAP_ART.md): painted overview stays its own product. Only selected production assets enter Git; trials, QA images and raw references stay outside the checkout. |

A later historical-date audit must distinguish low-rise fabric, demolition, vacant land and completed new buildings. A modern tower cannot be inserted into an earlier life stage solely because it exists in today's source data. Unknown construction/demolition dates stay unknown; do not fabricate a one-to-two-year transition for every parcel.

## Local operator sequence

Run on the user's persistent machine, in a terminal the user can actually operate. Installing in Work does not install on that machine. Windows instructions in the vendor CLI guide use Command Prompt.

```text
node --version
npm install -g @worldlabsai/cli
worldlabs skills install --client codex
worldlabs auth login
worldlabs auth status
worldlabs tasks list
```

Node must be 24+. The user enters the World Labs API key in the hidden terminal prompt; never request it in chat or read/print the saved credential file. If the agent terminal cannot be privately operated, have the user run the login command in their own terminal, then continue verification. Read the installed `SKILL.md`; vendor guidance says to start a new agent session to load it automatically. Re-read this handoff after that restart.

Record Node/CLI version, OS, successful/failed status and task names, with sensitive output removed. `tasks list` is a CLI-supported task list; successful `auth status` verifies asset access. Neither establishes that every task is entitled or that splat/GLB creation is available. Keep those checks separate. Source: [official CLI guide](https://atlas-beta.worldlabs.ai/docs/cli).

Do not automatically submit the quickstart's example during setup. The user has deferred generation while configuring the environment. If a later request includes a smoke test, use one cleared non-personal input and report its actual task/output, rather than calling a posing response a completed 3D environment. See [quickstart](https://atlas-beta.worldlabs.ai/docs/quickstart) and [image posing](https://atlas-beta.worldlabs.ai/docs/images-to-posed-images).

## Proposed first useful experiment — not yet production acceptance

The planning discussion proposes one short, complete local streetscape: a gate or corner, nearby building masses, sidewalk/road, opposite-side volumes and enough context to inspect a turn. This is a candidate testing unit, not a vendor size limit or a user-approved exact location. Single buildings can supplement it; an entire estate should not be the first request.

1. Choose an evidence-backed Xinhua segment and one time slice. If no historical gate is established, use a clearly synthetic test gate, never relabel it as observed.
2. Build/check common geometry: road width, setbacks, heights, opening and ground level; inspect the walk/orbit/portal path before paid appearance generation.
3. Generate appearance from the same geometry/camera package. Photographs describe permitted facade/material detail; they do not override the spatial registry or mix incompatible periods.
4. Compare outputs from forward, lateral and turned views. Generated unseen surfaces are reconstruction, never new historical evidence. Do not independently invent multiple pictures and present them as calibrated views of the same place.
5. Determine the actual available output and renderer route before writing an importer. Posed RGBD is not automatically a splat or a clean game mesh. `splats2Mesh` needs an existing splat; its presence does not prove a splat-generation task is available. Spark/GLB are conditional integration candidates, not installed dependencies. See [How to use Atlas](https://atlas-beta.worldlabs.ai/docs/how-to-use-atlas).

Keep the character, movable gates, readable signs and occlusion-sensitive foreground buildings independent where the interaction requires it. Generated surroundings must preserve usable entrances. Geometry continues to own navigation/collision; generated appearance must not create a second location, time or portal state owner. Load by local scene, not the entire neighborhood at once.

## Camera compatibility still requires an explicit adapter

The selected outline consumer is perspective (`PerspectiveCamera` in its runtime). The earlier graybox consumer was orthographic at 44 degrees above ground with presentation compression; those values remain legacy evidence. The checked Marble 2 guidance uses pinhole cameras. A perspective consumer still needs a validated export of its actual pose, field of view, pixel intrinsics, scale and matching depth; an ordinary screenshot is not such an export. Never describe orthographic depth with invented perspective intrinsics. Any future adapter must compare its camera/depth pairs with the selected consumer, without changing the accepted game camera just to fit the API.

Keep camera-to-world poses, XYZW quaternions, coordinate basis and distance units consistent. Preserve the distinction between geographic metres, local geometry and the existing presentation scale. RGB/depth/intrinsics must refer to the same pixel grid; a grayscale screenshot of a depth display is not calibrated depth. See [camera guide](https://atlas-beta.worldlabs.ai/docs/cameras-and-posed-images).

For `atlasChisel`, the checked depth guide requires 1280 x 720 pinhole targets and matching depth frames in target order when depth is supplied. Depth-only context, optional posed RGB `sourceFrames` and target cameras have distinct schemas. Returned depth requires translated camera centres, not just several rotations around one optical centre. Use the live schema rather than copying older Marble 1 Chisel GLB-upload instructions into Marble 2. Source: [depth-guided generation](https://atlas-beta.worldlabs.ai/docs/depth-guided-generation).

## Cost and durable task handoff

World Labs charges the API key's owning account and attributes usage to its project/key. Different installations or keys do not create extra capacity. Check the account's actual credits, current task rate card and spend limits; beta prices and quotas may change. No account balance or free allocation was observed here. Sources: [billing](https://atlas-beta.worldlabs.ai/docs/billing), [rate limits](https://atlas-beta.worldlabs.ai/docs/rate-limits).

World Labs usage is separate from the OpenAI assistant doing the work. With the same ChatGPT subscription identity, Work/Codex share assistant usage; OpenAI API-key authentication bills the assistant separately. Installing World Labs twice does not itself submit a generation task. Source: [OpenAI pricing](https://learn.chatgpt.com/docs/pricing).

For every future submission preserve a durable, private record containing: logical job ID, submitting host, task/schema version, input hashes and source/period/scene revision, camera/depth revision, redacted request path, idempotency key, operation ID, status, output IDs/checksums and observed cost where available. Keep secrets and private/signed asset URLs out of public Git. Public documentation needs only concise sanitized conclusions.

A wait timeout is not server cancellation. Resume the same operation; for uncertain submission retry with the original idempotency key. Never have Work and Codex re-submit the same logical job independently. Honor server backoff. Do not invent commands for credit inspection or entitlement discovery; use documented CLI help/platform controls and record what was actually observed.

## Completion evidence for the later sample

| Gate | Required observation |
| --- | --- |
| Place/time | Road, sides, massing and gate agree with registered inputs for the chosen slice; uncertainty retained. |
| Camera | Roofs, side walls and gaps hold throughout the permitted elevated/orbit views; pinhole input is calibrated separately. |
| Walk/portal | Grounded character, sensible obstruction/dissolve behavior, passable gate and exact return state. |
| Output validity | Actual downloaded format, scale, orientation and usable surfaces verified; no inference from task names alone. |
| Cost/repair | Measured asset size, load/performance on target devices, visible defects, repair effort and generation cost. |

Only after this bounded comparison should the project choose a primary World Labs route, a background-only use, or continued modular geometry. No sample, production acceptance, browser walkthrough, merge or deployment is claimed by this handoff.

## Optional future local-Codex handoff — not activated

> Work only in StarObserverPro/DigitalMemory. Read AGENTS.md and docs/WORLDLABS_HANDOFF.md, then inspect current main/local changes. Recheck vendor requirements before setting up the World Labs CLI and bundled Codex skill on this machine. Let me enter the World Labs key privately in my terminal; do not ask for it in chat. Verify auth and list CLI tasks, and report actual status versus unverified task entitlements/export access. This step is environment setup only; do not upload or submit a generation yet. Preserve the selected outline street and the separate hand-painted overview.

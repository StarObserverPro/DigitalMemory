# DM-OVERVIEW-PERIODS-20261106 — preserve overview context across period changes

## Intent and authority

- Authorized result: repair period selection clearing the entire registered overview building layer. Retain approximate/unknown construction chronology without inventing school-stage dates or individual completion years.
- Repository/base: `StarObserverPro/DigitalMemory`, `agent/overview-period-visibility`, `3f0c41ae1d480d6e646d816a01a79761cd4896fb`.
- Authorized effects: bounded implementation, tests, canonical documentation and a reviewable PR. Merge and deployment are separate effects.

## Scope and context

- Primary layer: map geography (temporal display applicability). Touched layer: visual engine (overview art and label selection). Session retains the selected period, route and camera; memory attachment is outside this change.
- Inputs: selected overview registration, existing temporal resolver, current overview consumer and user-approved requirement to avoid wholesale loss of building context. Only permitted conclusions and certainty enter product records.
- Allowed outputs: explicit overview display state, matching ground/building/label selection, regression coverage and aligned canonical owners. Reuse selected R7 rasters; no new art, coordinates, heights, destinations, street geometry or private content.
- Overview orientation context and historical environment applicability must remain distinct. Known exclusions retain their explicit scope; unknown chronology is never converted to an exact date or automatic nearest-year choice.
- Carrier: bounded fix in the existing checkout; no independent design or asset sandbox is needed. Production paths: `content/public/overview-registration.json`, `src/domain/temporal.js`, `src/explorer/`, applicable tests and docs. Screenshots and temporary browser runners remain outside Git.
- Owners: ARCHITECTURE four-layer scope; DATA_MODEL time associations; MAP_ASSEMBLY registered display; INTERACTION period selection; RUNTIME selected overview; VERIFICATION T01–T03/U01/A02.

## Acceptance

| ID | Observable outcome | Consumer |
| --- | --- | --- |
| OP01 | Every menu period retains the explicitly selected orientation context instead of an empty block; unsupported IDs do not borrow a state | Actual overview at three zoom tiers |
| OP02 | Art, compound labels and ground resolve the same display state; explicitly dated landmarks retain exclusions | Overview markup and desktop/phone views |
| OP03 | Stage/date distinction, unknown chronology, source geometry, stable IDs and street/bridge availability remain intact | Temporal tests, registration and street entry/return |
| OP04 | Switching away/back and reload retain period, route and camera through session | Built application browser walkthrough |

## Working envelope

- Reuse explicit temporal-state resolution rather than mapping life stages to calendar years. Keep the fix local to overview context and preserve per-object temporal restrictions.
- Review the full diff and affected docs before tests/build; then exercise the real built consumer. No new image generation or broad scene regeneration.
- Replan if a specific construction boundary requires replacement art or new geographic conclusions. Missing exact chronology remains a documented limit.

## Current state

- Lifecycle/phase: delivered / verified locally; PR review is the next action.
- Observed baseline: every painted compound and the block-ground tile admit only `window-2000`; the street already has a distinct approximate working-composite state across all menu periods. The existing test explicitly expects blank buildings for `stage-primary` and `window-1995`.
- Documentation alignment: DATA_MODEL, INTERACTION, MAP_ASSEMBLY, RUNTIME, STATUS and the existing building-result page reflect display membership, narrower phase exclusions and unresolved exact dates. Shared temporal-module changes also require the selected scene manifest's dependency checksum; no other scene hash is regenerated.
- Tested revision: `overview-registration-travel-r7-periods-r1`; shared temporal-module SHA-256 `310dc626328fbe081dcc64a1a1c4cdd471ef9f86abd034701f69e63c8f42bab3`. The committed implementation bytes are the locally tested bytes.
- Validation: 107 application tests and 17 selected-scene tests passed. The fresh build passes strict image/scene/dependency checksums. Registration comparison confirms only temporal-display fields changed; geometry, source heights, spatial identities and raster bytes are retained. Canonical document links and `git diff --check` pass.
- Actual built consumer: Edge headless walkthrough passed 18 period/tier combinations, ground/names/building visibility and narrower phase exclusions, persistence after pan/zoom/reload, phone views at 390 × 844, and street entry/return preserving period, route and overview camera. No page errors or unexpected failed requests. Desktop primary-period and phone middle-period screenshots were visually reviewed; captures stay outside Git. SwiftShader checks do not measure hardware performance.
- Remaining limits: display context is approximate; individual construction years and life-stage/calendar mapping remain unresolved. Later rear towers use only the undated overview. Close-street geometry keeps its previously registered working composite. User visual/historical approval, merge and deployment are not claimed.
- Delivery: active route removed. Open the reviewable PR; inspect its published-head CI and preserve its actual result in the delivery. Next action after engineering delivery is review of the period/phase presentation, without activating unrelated reconstruction work.

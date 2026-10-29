# DM-MEMORY-TRAVEL-20261029 — direct crossings and memory travel

## Intent and authority

- The user requests direct crossing on Xinhua Street, a compact regional destination picker, and selecting a place to arrive after a short transition instead of several minutes of compulsory walking.
- Repository: `StarObserverPro/DigitalMemory`; carrier `agent/memory-travel-20261029`; base `80d05c4ba2757db8c5ecf8a3d32f4087f5454d0f`.
- Authorized scope: implement these navigation/UI changes, align their documentation, validate, and deliver through the existing Site workflow. Preserve the current Site identity/audience and geographic/art assets.
- Current user correction supersedes the older requirement that menu destinations always walk continuously. The application is a digital memoir; walking is optional exploration.

## Scope and acceptance

Production owners: `navigation.mjs`, selected outline runtime/stage adapter, explorer menu/picker/transition, selected scene checksums, and relevant interaction/runtime/status docs. Keep trials and screenshots outside Git. No new place coordinates, historical claims, generated art, interiors or private content.

| ID | Observable acceptance | Evidence |
| --- | --- | --- |
| TRAVEL-A01 | Multiple unobstructed sections of Xinhua can be crossed directly by click routing and keyboard movement; buildings/fences remain solid. | Automatic checks pass for six separated direct 18 m crossings and retained fence collisions; cloud HTTP street-entry evidence unavailable. |
| TRAVEL-A02 | The main menu contains one destination entry; an accessible regional picker keeps the full catalog searchable without listing all places in the menu. | Main-menu reduction observed in cloud browser. Full picker/street walkthrough blocked by preview environment; see limits below. |
| TRAVEL-A03 | Selecting a supported destination arrives after a short cancellable transition, independent of route distance/connectivity, with no residual walking path. | All 25 registered anchors resolve valid ground without route search; preference/return/reload tests pass. Actual rendered travel remains unverified. |
| TRAVEL-A04 | Ordinary walking, reduced motion, menu pause, cancellation, return/reload, stage resource ownership and existing entry presentation remain usable. | 99 application tests, 17 selected-scene tests and production build pass. Existing entry frame-cancellation tests pass. Browser limit below. |

## Working envelope

Read PRODUCT, INTERACTION, ARCHITECTURE session ownership, RUNTIME, STATUS and current source before construction. Align docs and review the full diff before validation/CI. Use current registered destination anchors; landing resolves to valid nearby ground. A short paper fade is the initial travel presentation; richer dedicated transition art remains a later optional design task, without activating a new task or schedule.

## Current state

- Lifecycle: delivered; active route closed after implementation and checks.
- Base: `80d05c4ba2757db8c5ecf8a3d32f4087f5454d0f`; tested runtime identified by the carrier commit and its GitHub CI head.
- Documentation alignment completed before validation: PRODUCT, INTERACTION, ARCHITECTURE, RUNTIME, STATUS, README, Agent entry and selected scene README. 121 local documentation links and `git diff --check` pass.
- `npm run check`: 99 application tests, 17 selected-scene tests, then production build/checksum verification all pass. Six real Xinhua cross-sections return exact direct 18 m paths; all 25 existing anchors have valid ground without A*; regional coverage/search and preference validation/return/reload pass.
- Cloud browser observed the reduced top-level menu and ordinary entry's journal. Managed preview is `http://terminal.local:4173/`; its insecure context lacks `crypto.subtle.digest`, so the existing checksum loader fails before both the destination catalog and original street can load. This is a preview limitation; checksum enforcement and working production code are preserved. No successful rendered travel, phone walkthrough or user visual approval is claimed from those observations.
- GitHub and Site histories differ, but `80d05c4` and opened Site source `1c53ae3ae90f9171f9de18634c0cf327a961b9ab` have identical trees. Both histories are retained; source publication uses the opened Site checkout with an exact reviewed source snapshot.
- A short paper dissolve is implemented. Richer destination transition art is a cold optional follow-up; no task/schedule is active for it.
- Integration/publication: the corresponding PR and Sites native deployment results are the authority; do not infer them from this packet's implementation state.
- Next: verify the final GitHub head/CI and publish the reviewed source through the same Site; inspect the HTTPS consumer where available, retaining any actual browser limitations.

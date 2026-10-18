# Phase 1 verification evidence

Implementation under test: `9487c95f0b208b966bd13eea69ff9a9e9ab43863`. The GitHub implementation tree is exactly fe2e6f5e7117bc96d0038978fe81dd05c7068f1f, identical to the tested local implementation. Source and asset revisions are unchanged by the final documentation/routing closure. Generated B is `board-generated-r1`; geometry is `fengtai-orientation-r1`; transform is `local-equirectangular-r1`.

| Evidence | Consumer / observation |
| --- | --- |
| [Browser result](browser-results.json) | Chromium 151, nine complete-flow observations, no JavaScript errors or unexpected failures |
| [Desktop A](desktop-paper.png), [B](desktop-board.png), [C](desktop-ink.png) | Same frame and registered map inputs; candidate appearance only |
| [Style picker](style-picker.png) | Three comparable candidates without changing identity or location |
| [Mobile map](mobile-board.png), [panel](mobile-panel.png), [picker](mobile-picker.png) | 390×844 readable controls and content |
| [Synthetic memory panel](demo-memories.png) | Current/earlier/unknown temporal relationships, explicitly fictional |
| [Courtyard](demo-courtyard.png), [room](demo-room.png) | Synthetic nested scene and return flow; not historical interiors |

Replay with `node scripts/browser-check.mjs` after installing optional Playwright/browser dependencies, as described in [runtime instructions](../docs/RUNTIME.md). Tests start a private local static server. No real memory archive or external API credentials are required.

Screenshots are author-reviewed implementation evidence. They do not represent user aesthetic acceptance, historical verification, merge or deployment. Browser test JSON includes deliberately failed local image requests; those are expected failure fixtures, not uncontrolled failures.

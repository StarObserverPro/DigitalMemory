# Interaction contract

Status: the three-tier overview is implemented. The current grounded street prototype and its verification limits are in [STREET_PROTOTYPE](STREET_PROTOTYPE.md).

Implementation update: the first planar explorer, shared registration transform, sparse-time/session modules, public adapter and candidate assets now exist; [RUNTIME](RUNTIME.md) records the implemented subset and explicit gaps. The original contract below remains the target, not a claim of complete capability.

## One dominant scene

Open into the illustrated map, or resume the last valid place, period and view. Keep the map/scene as the dominant surface. Do not reserve permanent sidebars for articles, source lists, developer panels, or project statistics.

The only persistent control is one menu button. The menu starts closed and stays closed on map/street transitions and return. Time, search, zoom, street entry/exit, nearby doors and help live inside it. No title card, toolbar, instruction strip, direction pad, debug panel, composition controls, mapping inspector, sample badge or construction message overlays the scene. Do not reintroduce developer wording even inside consumer menus. Read-only QA state belongs in code and evidence, not the product UI.

Menus require an explicit user action. Closing or Escape restores the same place. Keyboard and direct pointer/touch gestures work without displaying additional controls. Opening a modal pauses movement. Credits and short usage guidance remain available through the menu.

## Map language and movement

Use a coherent stylized ground surface derived from registered historical references and user descriptions. Preserve street continuity and significant ground positions. Allow modest cartographic simplification, but record it and keep hit targets registered.

The initial overview is an illustrated travel-journal map: individual building vignettes, readable streets, selective enlargement of meaningful places and restrained texture. The map fills the entire viewport; surrounding city context extends beyond the editable registration area. Never use the registration boundary as a blank artboard edge. The overview has no person, avatar or player marker. Three detail tiers reveal the town, neighborhoods and street surroundings. Clicking a modeled street selects its registered position and enters a separate street view; it does not first place a character on the map. Landmarks and route progress retain stable IDs even when illustration proportions change.

Selecting a modeled street transitions to a close third-person sidewalk view. Nearby facades, courtyard gates and small props stand up as painted film-set flats, with perspective, foreground/background occlusion and restrained shallow geometry. The person appears only after street entry, as a grounded big-headed chibi figure in a moderately elevated board-game-like composition. A brief fog/rotation/approach transition preserves orientation. The earlier near-eye-height half-body framing is superseded. The person can walk forward/backward and turn; pointer drag turns the view. Fog, faded silhouettes and arrows mark unbuilt extents. Do not replace this with a generic full-3D block city or a floating orbital view.

The current prototype uses click/tap destinations on the sidewalk, camera-relative arrow/WASD movement and horizontal drag to orbit. Character facing and camera orbit are independent. Clicking the gate approaches it first and enters only at close range. Opening a menu, blur, visibility change and inactive scenes stop movement. There is no persistent control pad. See STREET_PROTOTYPE for the bounded volumetric replacement of the earlier paper character. Returning to the overview restores the same edge/progress; returning from an interior also restores sidewalk position, heading, period and selection.

The board-game reference supplies readable spatial relationships and character movement. There are no route cells, dice, property prices or compulsory turns. Geographic nodes, illustration anchors and actual historical entrances have distinct approval states.

## Current time and other-time entrances

| Relation to current period | Intended treatment |
| --- | --- |
| Current/compatible | Normal scene color and emphasis |
| Clearly earlier | Restrained grayscale, ink outline, or equivalent subdued entrance |
| Clearly later | A different pale/outline treatment |
| Overlapping or uncertain | Neutral other-time treatment without false directional certainty |

The exact palette is a later style decision. Add a short period label or icon/line-style distinction on focus so meaning does not rely on color alone. Do not grayscale every background building to imply verified temporal information that is not present.

Other-time content stays spatially discoverable, but does not create duplicate solid buildings or overlapping blocks of prose. At a dense place, show a restrained grouped entrance, then expand its fragments. The selected memory and nearby meaningful entrances take precedence over an indiscriminate map of all content.

Selecting an other-time entrance changes the active period deliberately, keeps the geographic anchor/view where possible, and makes the prior layer subordinate. It does not silently change period while walking into a new area. Where no current-period state exists, keep an appropriately sparse background and a clear other-period invitation.

## Route memory view

Open this as a dedicated function. Select a street segment, a stored route, or a drawn corridor and choose its width. Query the relevant memories across periods, then display the resulting chain by time or life stage. Unknown dates remain uncertain groups; do not invent chronological order.

A selected entry returns to its spatial anchor. Closing the view restores the previous map/camera state. This is a way to revisit a route's accumulated fragments, not the compulsory browsing HUD.

## Portal journey

A school exterior can be a simple raised model. Selecting the entrance can produce a brief forward/zoom transition into a separately loaded campus or corridor. The next room may be a still reconstructed image with hotspots and text, not a 3D room.

Capture place, active period, camera, selection, scene revision and navigation mode before entering. Return restores that context. Support nested portals without requiring that every hierarchy level be modeled. A map may lead directly to a classroom doorway image if that best serves the recollection.

Keep origin available during load; failed navigation has a usable back path. Cancel stale loads. A reduced-motion setting skips the swoop and preserves orientation through a short fade or immediate transition. Portals are not game unlocks: an unmodeled or unremembered room can remain a non-interactive door without prompting completion.

## Words and source images

A memory marker opens a short approved text passage first. Expand into a comfortable reading/viewing layer when needed; closing it returns to the same place and orientation. Do not place large blocks of text permanently above buildings.

Original and reconstructed imagery may coexist in the same scene. Each needs an unobtrusive but explicit label, for example 原始照片, 修复照片, 拼合图, or 记忆重建图, plus uncertain source date where relevant. The label is visible at the point of viewing, not only buried in a developer menu. Source detail and licensing can sit one level deeper.

Text can be polished for flow, but the original wording remains reachable to the authorized user. Never turn a generic oral statement into a new first-person anecdote. [Content pipeline](CONTENT_PIPELINE.md) defines the review boundary.

## Capture without breaking recollection

A record action carries forward the current place/route, period, and view as suggestions. The user can speak or write freely without filling a form. The suggested associations remain editable, especially when a recording jumps to another period. Upload/processing failure preserves a durable local draft where feasible and reports its unsynced state; do not claim it has reached the archive.

Review batches and administrative queues live in the private workbench. No construction telemetry, extraction confidence percentages, PR numbers, or model job statuses appear in the ordinary memory landscape.

## Style decisions intentionally left open

An early-2000s illustrated-memory language is established; the exact paper texture, color palette, typefaces, amount of distress, and camera pitch are not. Consider lightly distressed Song-style display lettering with readable Hei-style supporting text, but do not turn this into an artificially antique or uniformly sepia Beijing. Long reading text must remain clean and legible. Evaluate the style on the same short registered segment before large-scale production.

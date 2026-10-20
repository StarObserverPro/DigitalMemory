# Interaction contract

Status: the three-tier overview is implemented. The current grounded street prototype and its verification limits are in [STREET_PROTOTYPE](STREET_PROTOTYPE.md).

Implementation update: the first planar explorer, shared registration transform, sparse-time/session modules, public adapter and candidate assets now exist; [RUNTIME](RUNTIME.md) records the implemented subset and explicit gaps. The integrated requirements below remain the target, not a claim of complete capability.

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

## Area → line → point: selection rules

| Context | Normal selection result | Not a default behavior |
| --- | --- | --- |
| Town/neighborhood overview | Zoom/reframe toward a relevant registered route; orientation labels may remain visible | Open a building's memory, image stack or interior directly |
| Street-surroundings overview | Select the supported street/route position and enter its street scene | Make every visible gate an independent overview portal |
| Entered street/route | Approach/focus a nearby attachment on the correct walking side, then activate it | Reach a door across a wall, fence, carriageway or different elevation |
| Note or illustrated sequence | Read/turn pages, then return to the saved street context | Pretend page turns are walking through a measured interior |
| Local explorable scene | Move only within its approved local space and use nested attachments | Automatically expand an entire campus/hospital |

The area → line → point hierarchy is conceptual, not a demand for a fixed number of zoom clicks. A route can be chosen as soon as it is legible at the current tier; normally the overview never enters place content. A search result first resolves the correct route/side and focuses its attachment. Restoring an existing interior session is an explicit resume path with its saved return stack, not a new map shortcut.

A gate can be conspicuous artwork and still have no reader-facing action. A private author can attach a note to it without creating an interior. Available local actions must be discoverable on approach, focus or the closed menu's accessible list; avoid persistent floating markers. A click target belongs to the registered attachment, not to the entire footprint or all opaque pixels of an enlarged icon.

## One roadside attachment, three content outcomes

**Note.** Open a short selected recollection associated with this object/position. A name-only landmark can remain simple; accumulating notes does not force geometry. Closing restores position, view and period.

**Illustrated sequence.** Open a small collection of text, original photographs or reconstructed pictures with previous/next and an optional compact contents control. A corridor, waiting area or shop interior may be represented by independent still images. Reading order and thematic grouping are explicit; no physical adjacency, exact route through the interior, or chronological sequence is inferred from page order. There is no default walking avatar in this viewer.

**Local scene.** Load a bounded explorable courtyard, school area or familiar corner only where movement and spatial relationships carry memory. It may itself contain note/sequence/scene attachments. Returning pops the saved origin without resetting to the town map.

These outcomes use the same street binding and may change through a content revision. Do not hard-code school→campus, hospital→sequence or shop→retail interaction. No recollection means no invented reader note or completion quest.

## Current time and other-time entrances

| Relation to current period | Intended treatment |
| --- | --- |
| Current/compatible | Normal scene color and emphasis |
| Clearly earlier | Restrained grayscale, ink outline, or equivalent subdued entrance |
| Clearly later | A different pale/outline treatment |
| Overlapping or uncertain | Neutral other-time treatment without false directional certainty |

The exact palette is a later style decision. Add a short period label or icon/line-style distinction on focus so meaning does not rely on color alone. Do not grayscale every background building to imply verified temporal information that is not present.

Other-time content stays spatially discoverable, but does not create duplicate solid buildings or overlapping blocks of prose. At a dense place, show a restrained grouped entrance, then expand its fragments. The selected memory and nearby meaningful entrances take precedence over an indiscriminate map of all content.

Opening an other-time recollection for reading does not itself switch the street environment. Deliberately selecting another supported environment/period preserves the route anchor/view where possible and makes the prior layer subordinate. Walking or turning a picture page does not silently change the period. Where no compatible state exists, use sparse context and intentional local history access.

## Route memory view

Open this as a dedicated function. Select a street segment, a stored route, or a drawn corridor and choose its width. Query the relevant memories across periods, then display the resulting chain by time or life stage. Unknown dates remain uncertain groups; do not invent chronological order.

A selected entry resolves its route context and focuses the corresponding attachment before normal activation. An unresolved area-only association remains a review/search result, not a guessed doorway. Closing restores the previous view. This is a way to revisit accumulated observations, not the compulsory browsing HUD.

## Portal journey

Normal entry is **overview → street/route → attachment → note, sequence or local scene**. A familiar school gate may lead to a modest campus; a different school gate may carry only a note. An image room may follow either kind of content without requiring every intervening building to be modeled. This does not authorize a direct overview-to-classroom shortcut.

Capture place, route/revision, edge/progress, sidewalk side/offset, heading, active period, camera, selection and scene revision before activation. Nested local scenes and illustrated sequences share one session-owned return stack. A selected sequence page may be remembered independently of spatial position.

Keep the origin usable during load and on failure; cancel stale loads. Pause movement while a reading layer is open. Reduced-motion mode skips a camera swoop without losing orientation. Unremembered rooms need not be clickable and never create a completion checklist.

## Words and source images

A memory marker opens a short approved text passage first. Expand into a comfortable reading/viewing layer when needed; closing it returns to the same place and orientation. Do not place large blocks of text permanently above buildings.

Original and reconstructed imagery may coexist in the same scene. Each needs an unobtrusive but explicit label, for example 原始照片, 修复照片, 拼合图, or 记忆重建图, plus uncertain source date where relevant. The label is visible at the point of viewing, not only buried in a developer menu. Source detail and licensing can sit one level deeper.

Text can be polished for flow, but the original wording remains reachable to the authorized user. Never turn a generic oral statement into a new first-person anecdote. [Content pipeline](CONTENT_PIPELINE.md) defines the review boundary.

## Revisiting one place through time

At a focused attachment, an optional “other times” view groups repeated observations without placing several historical buildings on top of each other. Keep the default street visually coherent. Reading a recollection need not change the active environment; selecting a different supported environment is a separate deliberate action.

Where only “before”, “later”, “after the damage” or a life stage is known, preserve that wording and supported ordering. Do not force every page into a dated timeline. If an old gate is absent in the current environment, use a deliberate location-based memory access action rather than rendering a physically usable ghost gate.

## Capture without breaking recollection

A record action carries forward the current place/route, period, and view as suggestions. The user can speak or write freely without filling a form. The suggested associations remain editable, especially when a recording jumps to another period. Upload/processing failure preserves a durable local draft where feasible and reports its unsynced state; do not claim it has reached the archive.

Review batches and administrative queues live in the private workbench. No construction telemetry, extraction confidence percentages, PR numbers, or model job statuses appear in the ordinary memory landscape.

## Style decisions intentionally left open

An early-2000s illustrated-memory language is established; the exact paper texture, color palette, typefaces, amount of distress, and camera pitch are not. Consider lightly distressed Song-style display lettering with readable Hei-style supporting text, but do not turn this into an artificially antique or uniformly sepia Beijing. Long reading text must remain clean and legible. Evaluate the style on the same short registered segment before large-scale production.

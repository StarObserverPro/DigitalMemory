# Interaction contract

Status: the three-tier overview and selected Xinhua/Sanli outline close view are implemented. [RUNTIME](RUNTIME.md) records the current consumer/lifecycle; [STREET_PROTOTYPE](STREET_PROTOTYPE.md) separates it from legacy GLB/graybox evidence.

Implementation update: the first planar explorer, shared registration transform, sparse-time/session modules, public adapter and candidate assets now exist; [RUNTIME](RUNTIME.md) records the implemented subset and explicit gaps. The integrated requirements below remain the target, not a claim of complete capability.

## One dominant scene

Open into the illustrated map, or resume the last valid place, period and view. Keep the map/scene as the dominant surface. Do not reserve permanent sidebars for articles, source lists, developer panels, or project statistics.

The overview's only persistent control is one menu button. The selected outline street additionally has its approved compact compass and collapsible north-up minimap. Menus start closed and stay closed on map/street transitions and return. Time, search, zoom, street entry/exit, nearby actions and help live inside the menu. No title card, toolbar, instruction strip, direction pad, debug panel, composition controls, mapping inspector, sample badge or construction message overlays the scene. Do not reintroduce developer wording even inside consumer menus. Read-only QA state belongs in code and evidence, not the product UI.

Menus require an explicit user action. Closing or Escape restores the same place. Keyboard and direct pointer/touch gestures work without displaying additional controls. Opening a modal pauses movement. Credits and short usage guidance remain available through the menu.

## Map language and movement

Use a coherent stylized ground surface derived from registered historical references and user descriptions. Preserve street continuity and significant ground positions. Allow modest cartographic simplification, but record it and keep hit targets registered.

The initial overview is an illustrated travel-journal map: individual building vignettes, readable streets, selective enlargement of meaningful places and restrained texture. The map fills the entire viewport; surrounding city context extends beyond the editable registration area. Never use the registration boundary as a blank artboard edge. The overview has no person, avatar or player marker. Three detail tiers reveal the town, neighborhoods and street surroundings. Clicking a modeled street selects its registered position and enters a separate street view; it does not first place a character on the map. Landmarks and route progress retain stable IDs even when illustration proportions change.

Selecting a supported street enters a grounded, elevated third-person view. The current Xinhua/Sanli consumer uses registered building masses, quiet filled surfaces, sparse continuous black contours and the outline person under a perspective camera. The figure appears only after street entry. Earlier paper flats, half-body framing and the orthographic GLB graybox are historical presentations, not current camera or art requirements. Preserve recognizable street relationships, ordinary depth occlusion and a readable walking surface without expanding every background parcel into a detailed city model.

The selected street uses click/tap destinations on walkable ground, camera-relative arrow/WASD movement, drag to orbit and wheel camera-distance control. Character facing and camera orbit are independent. Menu destinations walk continuously through supported paths. Opening a menu, blur, visibility change and inactive scenes stop movement; there is no persistent control pad. Returning to the overview preserves its route/camera context, and re-entry restores a valid registered close-view pose. General attachment dispatch and the legacy synthetic courtyard interaction are not claimed as active outline-scene features. Future note/sequence/interior activation must preserve the return contract below.

The board-game reference supplies readable spatial relationships and character movement. There are no route cells, dice, property prices or compulsory turns. Geographic nodes, illustration anchors and actual historical entrances have distinct approval states.

## Map-to-street transition

The selected journal entry uses the current map as a faint underlay for an unframed warm manuscript page. The accepted Haring-inspired hand, short faded wrist and writing anchor are retained. A chosen fragment is paired with one of 30 generated transparent doodles, drawn below/right of the text using paths derived from that raster's black ink; one brief wash completes the sparse unfinished color. The hand lifts between paths, pauses, travels to the upper-left date and writes the fragment with lifted line changes, then withdraws for a 2.1-second reading hold. All 38 user-reviewed fragments retain their original source numbers. Text/art are selected as a pair with no consecutive fragment repeats; the observation “等半天没来，一来来两辆。” draws two buses. Steam, wind, bark/chirp and speed strokes, rain/drips and sleepy curves use restrained code-driven accents. Local hand/art instability does not quantize continuous pen motion; the paper and writing stay stable. Copy wraps without changing its characters, and the illustration fits below the complete writing on narrow screens. The page has no border, ruled lines or permanent thin cancel-button outline. These dated fragments are fictional transition decoration, never memory records or evidence locating real shops or landmarks. The map/page fade into the loaded street.

Menu → 选项 → 简化入街动画 switches to the alternative: an overhead view of the registered street, a soft cloud covering the view, then descent to the valid saved street camera. The preference persists. Journal writing duration follows the short fragment's length (about 11.9–15.5 seconds including the 0.9-second fade, plus any remaining load wait); the simple sequence is about 2.3 seconds after scene readiness. Reduced-motion preference uses a short fade without hand jitter or camera travel.

Entry blocks navigation until the scene is ready and the presentation finishes. Escape or 返回地图 cancels the entry and restores a usable origin; opening another menu or hiding the page also cancels it. Slow loading holds the completed drawing over the map. A failed load leaves the original map available for retry. Returning to the map preserves its route/camera, and re-entry ends at the saved valid street pose. No transition camera altitude or progress is persisted.

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

An early-2000s illustrated-memory language is established. The selected outline close view has an accepted palette, contour/UI pairing and local ZCOOL KuaiLe typeface; preserve them during runtime work. Future overview refinements and long-reading typography remain local art decisions under their owners. Avoid an artificially antique or uniformly sepia Beijing. Long reading text must remain clean and legible. Evaluate any new style on the same registered segment before larger production.

## Selected Xinhua/Sanli outline close view

The accepted sanli-outline-r5 close view now owns the supported Xinhua street entry. This scoped view adds a compact north-up collapsible minimap and compass beside its one menu; the overview and unrelated views retain the menu-only rule. Menu destinations walk continuously; they do not teleport or create memories. Its menu returns to the same overview route/camera, and re-entry restores the registered close-view pose. The selected continuous outline person replaces the schoolwear presentation only in this close view.

Corridor extension uses the existing outline registration and application session. Data-driven destinations include Xinhua east/west, Kandan Bridge and Qili west-facing Daoxiangcun forecourt. The stable scene ID is retained; registration revision invalidates stale poses. Three display masses are segmented above detached low shops while source footprints remain intact. Named shop frontage requires map POI and dated imagery; numerical ground extents remain approximate.

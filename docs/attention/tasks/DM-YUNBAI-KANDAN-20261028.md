# DM-YUNBAI-KANDAN-20261028 — 云柏鞋城至看丹桥街段研究样例

## Intent and authority

User requested one isolated street sample around the Xinhua Street junction, from Yunbai shoe store to Kandan Bridge, using the oldest available photographs/maps. The immediate clarification defines flattening as replacing a standing building on the map with a planar block, preserving its ground position and orientation. Research and standalone sample construction are authorized; application integration, production art replacement, publication and deployment are not.

Base: `StarObserverPro/DigitalMemory` at `f8d7345fe29890f0482828e8f49cf2af8e6aeffe`; local carrier `agent/dm-yunbai-kandan-study`. Current source geometry and selected outline scene are read-only reference inputs. The user's subsequent correction also updates the relevant canonical documentation: visual front/rear relationships take priority over exact shop extents, and unfamiliar upper rear masses may remain open. Trials, source views, scripts and standalone output remain outside the checkout. Documentation correction does not integrate the sandbox runtime/assets.

Documentation delivery is rebased onto `18c8c40f4f96b16fff88b1671c0a01b86b2ee197`, preserving the concurrently merged street-transition documentation. The sample's original source baseline remains unchanged.

## Scope and acceptance

- Keep Yunbai in the user-identified frontage segment on the correct side of the junction. Approximate shop extents are sufficient; do not pursue metre-level doorway placement as an acceptance condition. Record source capture dates separately from publication dates.
- Audit continuous frontage: detached shops before rear housing, integrated ground-floor retail, podium attachment, setbacks, gaps, entrances and broad height classes. Unresolved relationships remain explicit.
- Produce a standalone reviewable geometry sample and map standing/planar comparison. Planar blocks have no facade or visible height; source footprint, orientation and height metadata are retained.
- Preserve the real-time outline approach for street review. Flat planning graphics are audit materials, not selected production overview artwork. No shop-by-shop decorative reconstruction or complete estate interior.
- Inspect actual rendered views and segment movement; bind results to the delivered revision. The user accepted r2's broad Yunbai massing relationship; the later open-upper treatment needs its own visual review.

Owners read: MAP_ASSEMBLY (representation/source separation), LAYER_COMPOSITION (street-edge segments), GEO_DATA_RUNBOOK (location and historical audits), XINHUA_OUTLINE_WORKFLOW (massing then style), VERIFICATION (geographic/visual/engineering evidence), attention README (sandbox scope).

## Working envelope

Use public map/dated panorama and archival search, then a compact independently runnable sample. Prefer existing local vendored rendering dependencies copied into the sandbox. Investigate image availability before detailed geometry. Keep a source ledger, evidence limitations and before/after camera states. Review the packet and sandbox report before local validation. The sample runtime/assets remain local. The later workflow correction follows the standing documentation-only PR/check/merge authorization; it does not authorize runtime integration or deployment.

## Current user correction and evidence

- User locates the former Yunbai at the map's present-day group-buy supermarket marker on Qili's west frontage. This is the authoritative historical identity anchor; the exact former doorway and shop extent remain approximate. Do not substitute Daoxiangcun for Yunbai.
- Retrieved Baidu 2013-08 panoramas `0100220000130824124009161J4` and `0100220000130824124019020J4`. Month is supported by the retained 2020 panorama TimeLine; old sdata returned error 400. Inspect the pictures directly; do not assign the later camera's coordinates/heading to the old image.
- Retained Esri Wayback release 2014-02-20 imagery with source metadata `SRC_DATE=20110201`. Publication and acquisition dates are distinct. Roof parallax and 10.2 m source accuracy limit ground-outline precision.
- Current source footprints are read-only starting inputs. Their storey estimates and presumed detached storefronts must be checked against the acquired imagery, not silently accepted.

## R4 height-range clarification — 2026-10-28

Lifecycle: delivered; active route removed. The user now selects approximately five to six storeys as the useful visible height band: lower buildings can retain their full street silhouette; taller ordinary background masses may stop around that band without needing their exact total storey count. This is an approximate drawing choice, not a requirement for floor measurement. Preserve source heights and the accepted broad geometry; keep the sample isolated. Documentation carrier: `agent/dm-yunbai-five-six-storeys`, based on `e01c8ee980dbeb6e08952a99baab3e1adafde581`.

- Independent `yunbai-kandan-study-r4`, application SHA-256 `aaa75634a6ed845439b6af3b7517959c1b8f281a8acc3ecdd72c1c24272c026a`: the three towers retain their full lower fill to approximately 18 m, then fade through 24 m; selected vertical lines end at 18–20.1 m without a horizontal cap. These sample metres approximate the requested band, not a universal or historically measured floor height. Five lower objects keep their complete geometry.
- Near/far same-camera full/open renders were inspected in the existing in-app browser and saved as `rear-comparison-near-r4.png` / `rear-comparison-far-r4.png`. The lower façade was also inspected from the route's southern segment. Captured warning/error logs were empty. `browser-check-r4.json` and `verification-r4.json` retain this revision's evidence; the earlier full 146 m walk remains R3 evidence, not a new R4 walk claim.
- Eight building records, source/study heights, footprints, coordinate frame and route compare exactly equal to R3. Application/server syntax checks pass. The separate R3 source/evidence snapshots are retained outside the checkout.
- The approximate height rule is accepted; R4's specific appearance remains for user review. Canonical workflow, assembly, verification and status are aligned. Sample code/assets remain outside Git; no production integration or deployment.
- Next action only on request: review the retained height band and continue isolated refinement, or integrate selected work with explicit authorization. No per-building exact floor-count research is activated.

## R3 delivery and earlier correction — 2026-10-28

Lifecycle: delivered; active route removed. User confirms the Yunbai sample broadly conveys the intended relationship. Exact shop boundaries are not the goal; the street-level relationship between foreground and background masses is. Keep front masses and important gaps legible; unfamiliar rear buildings may lose their upper outline and remain open, especially where normal close walking views cannot see their full height. Do not turn those omissions into shorter closed buildings. Preserve source footprint/height and restrict implementation to the independent sample.

- Revision: `yunbai-kandan-study-r3`; application SHA-256 `272d2f95da04e8cd8317b43ccbb52eec4f17b29d8408f5f9604ba533736e59b8`. Full sample hashes are in the external `evidence/verification-r3.json`; R2 remains separately retained.
- Three rear towers retain their source footprints/heights. Lower exposed contours end at varied heights without a horizontal cap; fill returns gradually to the background. Foreground geometry, gaps, route and the eight exported source objects are unchanged from R2. The drawing limits are sample parameters, not new project-wide height thresholds.
- Same-camera near/far closed/open WebGL comparisons were rendered and inspected in the in-app browser (`rear-comparison-near.png`, `rear-comparison-far.png`). The full 146 m walk completed, map standing/flat checks remained consistent, and captured warning/error logs were empty (`browser-check-r3.json`). These observations apply to this independent consumer.
- Canonical alignment: XINHUA_OUTLINE_WORKFLOW owns selective rear contours; GEO_DATA_RUNBOOK and VERIFICATION distinguish visual adequacy from source precision; MAP_ASSEMBLY separates street omission from map flattening; STATUS separates accepted broad massing from pending R3 drawing review.
- Approval and external effects: R2 broad geometry accepted; R3 specific appearance awaits user review. Only the workflow/evidence documentation enters the repository PR. Sample code, original references and screenshots stay outside Git. No production runtime integration or deployment.
- R3's review handoff is superseded by the five/six-storey R4 clarification above. Metre-accurate shop research and invisible structural connections remain outside the default next steps; integration requires explicit authorization.

## Earlier r2 delivery — 2026-10-28

- Lifecycle: delivered; active route removed. Native browser interaction remains excluded after the user's correction; the completed sample was inspected in the in-app browser.
- Independent revision `yunbai-kandan-study-r2`: approximately 146 m route, eight source-linked volumes, five audit segments, standing/zero-height-planar comparison, street review and local evidence gallery. Stored outside the checkout in the task's `yunbai-kandan` artifact folder; starts independently with `node server.mjs` at `http://127.0.0.1:4179/`.
- Reference inspection: map anchor, 2011 aerial mosaic, two 2013 panoramas, larger original-image detail tiles and later frontage image. North frontage is a low commercial-volume candidate in front of a tower, not automatically a six-storey residential slab. The southern red/pale residence is an approximately six/seven-storey candidate rather than the original fourteen-storey estimate. These sample-only display revisions preserve source heights and footprints.
- Geographic gaps: exact former Yunbai doorway and extent; whether low commercial volumes physically connect to the towers; metre-accurate setbacks; full historical chronology. User-authored old-site identity, observed massing, estimated dimensions and unknown construction connections remain separate.
- Actual in-app verification: same-camera standing/flat views and top view inspected; 146 m continuous movement reached the endpoint; segment jumps, turn direction and rear-volume visibility exercised; all six evidence images loaded; no captured warning/error logs. Exported `map-comparison.png`, `street-review.png` and `browser-check.json` bind these observations to r2.
- Static checks: `node --check app.mjs`, `node --check server.mjs`; 147 route samples intersect no retained building footprint; source-coordinate round trip error below 0.001 m; 16 local HTML references resolve. Flat scene has zero extrusions, unchanged eight IDs/footprints/stored heights. These checks establish sample consistency, not geographic accuracy or visual approval.
- At the R2 delivery checkpoint, repository changes were this scope record only; no production runtime/assets, PR, merge, publication or deployment. Broad geometry approval arrived afterward and is recorded in R3 above.
- The former proposed next step of researching A's exact frontage and B/C's structural connections is superseded by the user's correction. R3's visual review is the current handoff; integration remains separately authorized.

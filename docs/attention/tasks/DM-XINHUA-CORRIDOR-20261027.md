# Xinhua corridor correction and integration

User authorized correcting the west-facing Qili Daoxiangcun location, integrating the complete corridor and merging main. Base PR25 head 21340c81b2df4fbadf11da3a3c14fdf958bacf36. Preserve original Sanli, application session/spatial/time ownership and unrelated map artwork. No deployment.

Acceptance: actual Baidu map POI plus dated west-frontage panorama; no south-frontage Daoxiangcun sign; all destinations reachable; application tests/build and actual consumer walkthrough; final PR head checks before merge.

Historical authoring checkpoint: local r4 source had 78 original source buildings, 9 frontage objects and 24 reachable landmarks. Exact shop dimensions and forecourt edges remain approximate. The planned consumer verification and merge are recorded below.

Earlier standalone r3 views carried a Daoxiangcun sign/forecourt identification that the user rejected. The retained r4 registration uses Qili's west frontage facing Fourth Ring, checked against Baidu POI `905d861757ac875e4107c15e` and panorama `09002200122003141220538666G` (2020-03), viewed eastward from the auxiliary road. Earlier route/build checks do not validate the rejected location. The [outline workflow](../../research/XINHUA_OUTLINE_WORKFLOW.md#具名地点的定位与证据) records the accepted geographic evidence; shop extents, setbacks and bridge dimensions remain estimates. This paragraph consolidates the discarded local process copy without restoring its obsolete execution plans.

Validation: 57 application tests, 12 scene tests and static build pass. Source geometry and original accepted gate/fence/bins objects retained; only source commentary differed and was restored from the selected PR data. Named POI registration and all 24 destination routes are covered. Main browser entry successfully renders r4; live west-frontage walk in progress.

## Verified consumer and handoff
Runtime commit c887e311b52b91844c1aef22b9d209819c457dbd. Final built consumer entered via main menu, continuously walked to west forecourt (-434,113), turned toward shop, returned to map, reloaded and restored position/yaw -1.156. No browser warnings/errors. 57 application +12 scene checks and build pass. Map screenshot and panorama evidence retained outside checkout. Implementation delivered; merge authorized and gated on PR25 CI. GitHub PR records merge outcome; deployment is not requested. Future scene changes remain inactive.

Review fixes: delayed cancelled loads exit before session mutation; proximity visits commit immediately. Browser CI selector updated for the renamed Xinhua minimap; prior CI failed on the obsolete Sanli label.

Renderer import is lazy after load cancellation check, with a second cancellation check after import. This permits a real cancelled-load unit fixture without loading browser-only Three add-ons.

## Delivery closure — verified 2026-10-27

Delivered and merged through [PR #25](https://github.com/StarObserverPro/DigitalMemory/pull/25), merge commit `67baf01065f15f9d83a6b4d2903667197582e61b` (2026-10-27 23:58:10 UTC). The source validation above remains bound to its tested revision. No deployment was part of this task. The original active route is closed; later runtime-resource work uses its own explicitly authorized packet and does not reactivate this corridor task.

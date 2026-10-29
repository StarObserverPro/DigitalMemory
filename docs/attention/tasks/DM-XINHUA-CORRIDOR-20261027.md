# Xinhua corridor correction and integration

User authorized correcting the west-facing Qili Daoxiangcun location, integrating the complete corridor and merging main. Base PR25 head 21340c81b2df4fbadf11da3a3c14fdf958bacf36. Preserve original Sanli, application session/spatial/time ownership and unrelated map artwork. No deployment.





## Verified consumer and handoff

Review fixes: delayed cancelled loads exit before session mutation; proximity visits commit immediately. Browser CI selector updated for the renamed Xinhua minimap; prior CI failed on the obsolete Sanli label.

Renderer import is lazy after load cancellation check, with a second cancellation check after import. This permits a real cancelled-load unit fixture without loading browser-only Three add-ons.

## Delivery closure — verified 2026-10-27

Delivered and merged through [PR #25](https://github.com/StarObserverPro/DigitalMemory/pull/25), merge commit `67baf01065f15f9d83a6b4d2903667197582e61b` (2026-10-27 23:58:10 UTC). The source validation above remains bound to its tested revision. No deployment was part of this task. The original active route is closed; later runtime-resource work uses its own explicitly authorized packet and does not reactivate this corridor task.

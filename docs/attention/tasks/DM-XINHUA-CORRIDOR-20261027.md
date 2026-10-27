# Xinhua corridor correction and integration

User authorized correcting the west-facing Qili Daoxiangcun location, integrating the complete corridor and merging main. Base PR25 head 21340c81b2df4fbadf11da3a3c14fdf958bacf36. Preserve original Sanli, application session/spatial/time ownership and unrelated map artwork. No deployment.

Acceptance: actual Baidu map POI plus dated west-frontage panorama; no south-frontage Daoxiangcun sign; all destinations reachable; application tests/build and actual consumer walkthrough; final PR head checks before merge.

Current: executing. Local r4 source has 78 original source buildings, 9 frontage objects and 24 reachable landmarks. Exact shop dimensions and forecourt edges approximate. Next: verify integrated consumer, align documentation and merge verified head.

Validation: 57 application tests, 12 scene tests and static build pass. Source geometry and original accepted gate/fence/bins objects retained; only source commentary differed and was restored from the selected PR data. Named POI registration and all 24 destination routes are covered. Main browser entry successfully renders r4; live west-frontage walk in progress.

## Verified consumer and handoff
Runtime commit c887e311b52b91844c1aef22b9d209819c457dbd. Final built consumer entered via main menu, continuously walked to west forecourt (-434,113), turned toward shop, returned to map, reloaded and restored position/yaw -1.156. No browser warnings/errors. 57 application +12 scene checks and build pass. Map screenshot and panorama evidence retained outside checkout. Implementation delivered; merge authorized and gated on PR25 CI. GitHub PR records merge outcome; deployment is not requested. Future scene changes remain inactive.

# 新华街三里 · 已选定近景

用户于2026-10-27认可 `sanli-outline-r5` 入库并接入主体，原空间修订为 `sanli-block-layout-r4`。当前选定版本已扩展为 `xinhua-corridor-outline-r4`，约875米新华街走廊及七里西侧临街，保留原三里几何与已选定轮廓语法。正式入口已随PR #25合并；当前交付与验证状态见[STATUS](../../docs/STATUS.md)。最终地理取舍保存在 `scene-data.json`，不保存逐次纠正日记。

运行项目根目录 `npm run dev`，在总览新华街已支持路段或菜单选择“到街上走走”。点击铺地步行、拖动转向、滚轮远近、WASD/方向键行走，Shift快走。菜单可选择院内目的地并回到地图。指南针随视角，小地图固定北向，可收起。此版本采用连续轮廓人物；既有校服模型和旧renderer保留供其他受控用途，不与当前场景同时运行。

## 接入与责任

`src/explorer/outline-stage.js`按公开登记加载本目录；`runtime.mjs`挂载隔离样式和可释放的渲染/input生命周期；位置、相机、路径交给应用session。返回地图取消路径并暂停动画/输入，单个兼容stage最多保留60秒，便于同一入口重入；过期、登记/路段/环境不兼容或最终退出时释放renderer、监听器及导航。重新加载先恢复可用地图，进入后恢复已验证的场景状态。新的总览路段选择会重置对应进入位置。

当前资源改造把绘制对象登记成空间构建函数，按完整相机视锥创建活动区块；离屏暖缓存最多8块、估算16 MiB，活动更新时清理闲置超过15秒的区块。暂停后不单独运行15秒释放定时器，返回地图后的60秒整场景期限仍有效。预算只限制暖缓存，不是整个场景或显存上限。共享材质由场景统一释放；导航按需检查格点，整场景只创建一个导航实例。场景数据仍一次完整下载并校验，未实现网络分片、自动LOD或全局路网层级。具体所有者、取消机制与统计限制见[RUNTIME](../../docs/RUNTIME.md#bounded-runtime-resources--dm-runtime-residency-20261027)，本次实际证据见[资源任务包](../../docs/attention/tasks/DM-RUNTIME-RESIDENCY-20261027.md)。

`content/public/outline-registration.json`固定数据哈希、本地米制frame、稳定地点与显式时间成员。时间由现有resolver选择工作合成层，不能把同一近景在多个时间选择下可见解释为旧貌认证。公开轮廓、道路和来源ID保留；楼高及内部地表、绿地边缘、器材和杂物仍含概括。未成功核对的中介图像不作为来源证明。未收录原图、截图、试验脚本和个人原话。

## 检查与复用

`npm test`覆盖应用会话、登记/哈希、时间选择及既有功能。`npm run test:outline`覆盖连续人物、伸缩短线、屏幕让线预算、地面/围栏/绿地/器材、窄门和位置关系。`npm run build`校验所选数据与场景文件哈希并构建主体。实际浏览器验收见任务包，截图留在库外；不能用构建成功替代真实进入/返回。

完整[轮廓风格和工作流程](../../docs/research/XINHUA_OUTLINE_WORKFLOW.md)记录可重用规则。Three.js0.180.0复用相邻已收录路口的vendor，许可见[Three.js MIT](../xinhua-junction-outline/vendor/three/LICENSE)。字体为原始ZCOOL KuaiLe，许可见[OFL1.1](fonts/OFL.txt)。派生地理数据保留OSM contributors/Overture ODbL及相应East Asia上游CC BY4.0，来源边界见[地理谱系](../../docs/GEO_DATA_LINEAGE.md)。应用代码MIT不改变第三方数据/字体许可。

Corridor extension: xinhua-corridor-outline-r4, approximately 875 m of Xinhua Street plus Qili west frontage. Original Sanli geometry retained; detached shops, broad pavement and Kandan Bridge added. Daoxiangcun is on the west frontage facing Fourth Ring, checked against Baidu POI and 2020-03 panorama. Ground extents and bridge heights are estimates. Application session/spatial/time owners remain unchanged.

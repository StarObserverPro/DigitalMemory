# 新华街路口 · 已选定近景

本地库收录版 `outline-motion-r4-05`，空间版 `outline-street-r4-02`。用户于2026-10-27认可当前路口样本入库；本版按最新要求删除电线，保留两盏简化路灯。完整可复用方法见[制作流程](../../docs/research/XINHUA_OUTLINE_WORKFLOW.md)。

## 启动与检查

需要 Node.js 22+。在本目录运行 `node serve.mjs`，打开 `http://127.0.0.1:4197/`。若端口已被旧沙盒占用，先停止对应旧服务，或用其他端口：PowerShell 中运行 `$env:PORT=4198; node serve.mjs`。不需要 npm 安装，Three.js 0.180.0 固定保存在 vendor。

点击铺地行走，拖动转向，滚轮缩放；WASD/方向键移动，Shift快走。菜单提供四个目的地、回到起点和操作说明。自动路线是连续步行，不是图片切换。此目录没有接入主应用入口、构建或 session。

- `node --test navigation.test.mjs motion.test.mjs`：路线连通、碰撞边界、步态轮廓与伸缩规律。
- 服务启动后运行 `node verify-http.mjs`：校验实际服务字节来自本目录、运行资源完整、非运行资料返回404、原空间与导航哈希不变。改用其他端口时设置 `SCENE_URL`，例如 `http://127.0.0.1:4198`。
- `node build-scene.mjs`：从保留的 source snapshot 重建空间底稿；会写 `scene-data.json`，仅在有意重建时运行，随后检查 diff。改动后需更新 manifest 与相应验收，不自动替换已选定版本。

## 文件与使用范围

`manifest.json` 固定当前版本及必要源码/源数据校验值。代码职责、参数起点、已知投影陷阱与正式接入要求在制作流程中说明；[验证记录](evidence/README.md)区分旧版证据和当前检查。

道路和建筑的注册依据来自公开地理数据；底商、汽车、树、门窗和路灯的稀疏画法含重建/示意成分，并非逐物体历史清单。两处入口约有15米位置不确定性。三里8号楼24层是用户明确纠正，绘制高度71.1米并非实测。现代参考不证明特定历史年代，样本没有历史时期切换。

应用代码遵循仓库 [MIT 许可](../../LICENSE)。Three.js 许可见 [vendor/three/LICENSE](vendor/three/LICENSE)。来源快照与派生数据保留 OSM / Overture 的来源及 ODbL / 对应上游许可信息，见 [source 说明](sources/ENTRANCES.md)及 source JSON 的 metadata，不把第三方数据重授权为 MIT。地图原图、街景照片、生成试画、私人素材和运行日志未收录。

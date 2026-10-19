# Modular overview r4

> Superseded by [DM-0015 hand-painted art requirements](../../../docs/HANDPAINTED_MAP_ART.md): visible SVG buildings/decorations/fallback are prohibited; preserve tower height class and floor rhythm. R4 remains installed historical runtime code, not an accepted stylistic solution.


Qili, Wuli-west and Liuli now contain 19 independently positioned building/roof-segment objects. Each owns geographic ground geometry and a ground origin. No whole-compound raster is sheared to fit a parcel. Nine Liuli segments retain the previous approximate roof-trace identity; they are not a claim of nine separately numbered houses.

The map uses a north-up cartographic oblique convention: ground follows the shared spatial transform and illustrated height rises vertically in screen space. It is not a strict 30-degree isometric grid. Building footprints keep their individual directions. Full-image road masking is removed from standing architecture; only ground decoration excludes road corridors.

Built-in image_gen generated a 38-piece atlas: the same 19 shapes at medium and near display budgets. The first result enlarged medium subjects excessively. The selected second atlas preserves occupied size more closely; 37 variants meet the 0.8–1.5 native/display bound. One medium Liuli segment uses a deterministic footprint sketch. Runtime also chooses that sketch when viewport/zoom would require an out-of-budget raster shrink/upscale. The far tier draws sparse footprint-based silhouettes and window dots directly.

`parts-guide.svg/png`: actual generation guide. `plan.json`: native cells, final budgets, footprint sources, projection and height policy. `parts-atlas.webp`: selected native-resolution atlas with alpha preserved. Individual WebPs are crops; `measurement.json` retains trim, native dimensions, size ratios and ground-origin calculation. `generation.json` holds exact prompts. `parts-review.webp` is the crop review sheet. An unused rejected variant remains marked in measurement and is not referenced by the runtime manifest.

Ground decoration is independent: irregular muted grass and worn hardscape, small bare areas, a few debris strokes, and up to four modest young-tree suggestions inside each compound. These are restrained ambience details based on the user's description, not registered trees or objects. No American-style uniform lawn, mature roadside avenue, readable invented sign, parked vehicle fleet or micro-clutter layer.

Source ground positions derive from retained r3 metadata: Esri reference imagery extent (capture date unknown; pixels not distributed) plus © OpenStreetMap contributors, ODbL, https://www.openstreetmap.org/copyright. Existing ground and geographic identity uncertainty remains; independent piece placement does not establish surveyed corners or exact historical heights. Source registration, model tests, native visual review, user aesthetic approval and Site publication are separate states.

Reproduce the guide using `node scripts/prepare-overview-parts.mjs`, then pass the original selected PNG to `python scripts/install-overview-parts.py /absolute/path/to/atlas.png`. Both use the existing application scale and retained source metadata. No runtime image generation occurs.

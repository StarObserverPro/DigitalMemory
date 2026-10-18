# Overview candidate batch 1

Six compound motifs and nine building variants, generated together on two transparent sheets with the built-in `image_gen.imagegen` tool on 2026-10-18. Full prompts and the two style references are in [generation.json](generation.json). Sheet/crop dimensions, cell bounds, ground-anchor suggestions and checksums are in [catalog.json](catalog.json).

These are typology studies for small map placement, not reconstructions of named compounds. No canonical map locations or historical completion dates are inferred from these drawings. None replaces the currently accepted overview automatically.

- Compound cutouts: at most 256 × 220 pixels. Three towers; parallel slabs; corner slabs; mixed towers/slabs; walk-up rows; detached shop row with housing behind it.
- Building cutouts: at most 180 × 180 pixels. Three tower colors, three slab shapes/colors, three detached shop modules.
- No public road or sidewalk is baked into a compound or building. Road geometry, labels, registration and temporal visibility remain separate.
- `compounds-atlas.webp` and `buildings-atlas.webp` retain the complete generated sheets. Individual WebP files preserve alpha and aspect ratio. The generated PNG source checksums are recorded in the catalog.
- A source cell is `[left, top, right, bottom]`; `trim` is relative to that cell. The source sheets did not obey equal row heights, so crops follow the actual content rather than blindly dividing into nine equal cells.

Reproduce derivatives from the original generated PNG directory with `python scripts/slice-overview-candidates.py /absolute/path/to/generated_images`. This explicit cutting workflow uses Pillow, NumPy and SciPy for cropping, excluding tiny clipped neighboring fragments, and resizing; it does not paint replacement buildings. The native-size review board is `evidence/overview-candidates-r1.webp`.

Status: generated candidates, sliced and visually inspected; geographic, historical and user aesthetic acceptance remain open.

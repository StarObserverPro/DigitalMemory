# Independent illustrated modules, r2

Original project-generated PNG assets. Photos linked in `docs/LOCAL_VISUAL_REFERENCES.md` were inspected for broad morphology only; no source photographs are included here.

- `paper-r2.png`: background texture, no geography.
- `apartment-map-r2.png`: overview representation of the apartment family.
- `apartment-front-r2.png`: one short six-storey facade section; two blank ground-floor bays.
- `shop-front-r2.png`: one shop front with a blank sign. Runtime text and occupancy are separate.
- `child-back-r2.png`: anonymous child, full-body back view. Physical height is a character-profile parameter, not inferred from the image or selected year.

PNG alpha is retained. The manifest records image dimensions and visible-content UV rectangles; renderers crop UVs and apply an alpha threshold to reject low-alpha edge wash. Source PNGs are unchanged. No long street strip is used in the active release.

Map and street images are separate level-of-detail representations of the same building family. Shell placement, frontage slot, occupant, entrance and runtime character state never live inside a bitmap. Exact prompts: `generation-r2.json`; exact checksums: `content/public/manifest.json`.

These remain candidate drawings. Merge/deployment approval is not a claim of historical or aesthetic acceptance.


## Thumbnail sketch family — DM-0008

`towerSketch-r1.webp` and `slabSketch-r1.webp` are original generated candidate illustrations, redesigned after the user rejected architecture-render detail. Broad pencil/watercolor marks replace window frames and fine grids. Final scene use keeps a building below roughly 200–300 displayed pixels at the close map tier. The 400-pixel web derivatives preserve alpha; original generated artwork is retained outside the public code repository. No real-estate photo is redistributed.

The tower family has cream walls, a muted red roof edge and suggested enclosed balcony bands; the slab has a flat roof, pale plaster and coral balcony strokes. Floor marks are deliberately symbolic, not a literal floor count. These are drawing-family candidates, not confirmed facades or individual registered addresses. Rejected detailed tower/slab attempts are not active assets.

Generated with the built-in image tool. Prompt direction: one isolated tiny map building; casual warm travel-journal/picture-book drawing; large irregular crayon/pencil and watercolor marks; no window frames, tiny grids, technical precision, ground, roads, shops, people or glow. Buildings remain separate from roads and yards.

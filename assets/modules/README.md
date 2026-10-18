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

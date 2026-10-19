# Hand-painted map art: current production direction

DM-0015, updated 2026-10-19. This records the user's current correction and supersedes older instructions that let tiny isolated images, a fixed pixel ratio or sparse window dots determine the final style.

## Visible art and planning have different owners

All visible map buildings, vegetation, lawns, hardscape, clutter and painted surface details use original hand-painted raster imagery. SVG belongs to footprint/projection planning, guide diagrams, registration, invisible masks/clips, hit areas and ordinary text/UI. SVG cannot paint finished roofs/walls, trees, grass blobs or debris. Rasterizing vector shapes, adding a turbulence filter, or overlaying noise on clean vector faces does not satisfy the drawing requirement.

If a raster is missing or fails the required scale, retain an appropriate previously reviewed raster or leave the supported pale context. Do not fall back to a visible vector building. R4 still contains that rejected behavior; removing it requires a consumer change and rendered evidence, not a documentation claim.

## Generation composition comes before cropping

A tiny subject surrounded by a mostly empty canvas is not a reliable size-control method. Isolated tiny-subject attempts enlarged subjects, drifted from their guide and lost the tower height class despite detailed prompts.

Use a coherent contextual scene instead: occupy the rest of the picture with relevant grass, worn paving, open ground, young trees and a small amount of clutter. Buildings then have a meaningful small share of a larger composition. Context must have readable large shapes, not blanket detail: lawn and paving remain quiet masses, with only a few meaningful interruptions. Packed scenes/modules remain an alternative when they share useful context and camera. This is a practical generation method, not a claim about measured model internals.

Plan the final object size and scene crop first. Generate the surrounding context as actual illustration, not blank padding. Measure returned subject bounds, ground anchors and camera correspondence before cutting. The returned canvas may enlarge the whole composition: its requested dimensions are not evidence that the subject budget was met.

Separate outputs deliberately:

- A cropped contextual patch keeps its painted ground and may be used only with an accepted ground registration/mask.
- A standalone building needs an actual transparent separation from the ground and correct base anchors. A rectangular crop of a scene is not a clean sprite.
- Cropping cannot recover hidden walls. Request them separately when independent occlusion/replacement needs them.

## Preserve tower identity

A 23-storey tower must read as a tall residential tower at every useful tier. Preserve height-to-footprint proportions, many close horizontal storey rhythms and repeated vertical window/balcony bands. Simplify individual windows or merge columns into marks; never replace twenty-odd floors with two or three large windows. Low slabs and high towers must remain distinct.

Near scale can show individual floor marks. Medium scale may group adjacent marks while retaining dense cadence. Far scale may merge fine rows into repeated vertical tonal bands; the tall proportion and density must survive. Do not impose a universal two/four/eight-window mark count on every height class.

The 23-storey study is a user-specified visual requirement, not a new universal count for every Xinhua tower. Existing property-source claims and uncertain building-to-roof matches remain separate. Illustrative storey height is a planning assumption, not a measured building height. Public metadata must not associate a private home with a precise map object.

## One projection for the complete assembly

Define ground axes, vertical direction, camera elevation/azimuth, footprint and height before generation. Roof edges, facade rows, paths and yards must use that same parallel projection. Isometric studies use a consistent pair of 30-degree ground axes and parallel verticals. Check corresponding roof/base vertices and repeated facade directions; a similar bounding box alone is insufficient.

R4's north-up cartographic-oblique ground is not the same camera as the new isometric study. Do not mix the two, shear a painted building to hide the mismatch, or silently move registered places. A production conversion must project ground, roads, footprints, elevated art and hit geometry together through one reviewed mapping. A synthetic style study does not authorize a new geographic layout.

## Make paint survive the display scale

Hand-drawn identity comes from pressure-varying or interrupted contours, coherent pigment patches, directional pencil/brush strokes and purposeful unpainted areas. Tiny noise on flat faces disappears when reduced. Broad material gestures must coexist with the many fine storey marks that identify a tower.

The older 0.8–1.5 native/display ratio was an experimental operating choice, not a universal quality gate. Record the actual ratio and planned reduction, but judge the delivered result at the actual CSS-pixel sizes and normal zoom. A larger source is acceptable only when the reduced image retains useful paint structure, silhouette and floor rhythm. Do not enlarge a file merely to pass metadata, or compensate for faint paint by shrinking the architecture's semantic detail.

Inspect: full composition; near/medium/far crops; at least one representative narrow-screen budget; actual alpha on light/dark backgrounds; and source ground/projection overlays. The raw RGB of a transparent PNG can contain color under zero alpha; inspect composited alpha before calling it a visible halo. A study-size sheet is not a browser walkthrough or a registered-map review.

## Brushwork must carry form, not noise

Random speckles, uniformly distressed surfaces, dense grass fragments and indiscriminate high-frequency grain are not a substitute for hand-drawn marks. Use deliberate stroke direction, pressure, width, edge breaks and pigment pooling to describe a surface or boundary. Leave quiet areas. Decoration must remain subordinate to buildings; adding more yard detail cannot demonstrate a different architectural drawing medium.

When comparing drawing treatments, keep geometry, camera, scale and major colors comparable. Define an observable difference in marks, such as broad dry-brush strokes versus directional pencil hatching, rather than changing style names while generating the same finish. Inspect both the enlarged marks and final display pixels. A comparison fails if the proposed treatments cannot be distinguished visually; proportion/scale success cannot compensate for this failure.

## Drawing skills consulted

Read on 2026-10-19: the following primary-source skill files and their listed drawing references. They inform this specification; they are not approved visual references or a claim that a new package has been installed. Keep their source links here rather than copying their examples or full bundles into the repository.

| Skill / selected references | Useful contribution | Adaptation boundary |
| --- | --- | --- |
| [handdrawn-route-map-card](https://github.com/atian-create/lingzao-skill/blob/main/skills/handdrawn-route-map-card/SKILL.md) | Illustrated route composition and watercolor map vocabulary | Primarily a social-media card template; it provides little architectural brushwork guidance. Do not inherit invented routes, numbered nodes, mascots or collage decorations. |
| [baoyu-infographic](https://github.com/JimLiu/baoyu-skills/blob/main/skills/baoyu-infographic/SKILL.md): [morandi-journal](https://github.com/JimLiu/baoyu-skills/blob/main/skills/baoyu-infographic/references/styles/morandi-journal.md), [storybook-watercolor](https://github.com/JimLiu/baoyu-skills/blob/main/skills/baoyu-infographic/references/styles/storybook-watercolor.md), [isometric-map](https://github.com/JimLiu/baoyu-skills/blob/main/skills/baoyu-infographic/references/layouts/isometric-map.md) | Varied ink weight, restrained warm colors, washes and white space; consistent map angle | Exclude tape, stickers, splatter, floating labels and infographic panels. Its isometric layout is not geographic registration. |
| [baoyu-article-illustrator](https://github.com/JimLiu/baoyu-skills/blob/main/skills/baoyu-article-illustrator/SKILL.md): [sketch](https://github.com/JimLiu/baoyu-skills/blob/main/skills/baoyu-article-illustrator/references/styles/sketch.md), [watercolor](https://github.com/JimLiu/baoyu-skills/blob/main/skills/baoyu-article-illustrator/references/styles/watercolor.md) | Pencil pressure variation, wash overlap and selective soft edges | Do not copy brainstorming annotations, blanket paper grain or instructions to abandon accurate geometry. The separate sketch-notes reference is diagram-oriented and unsuitable for the map scene. |
| [torn-photo-window-sketch-zine](https://github.com/yanghaoraneve/torn-photo-window-sketch-zine-skill/blob/main/SKILL.md) | Architectural graphite contours, selective hatching, quiet vegetation and viewpoint preservation | Use its drawing discipline only; no photo window, torn-paper frame, label or fixed poster proportions. Do not sparsify tower floors out of their height class. |
| [drawing-observation](https://github.com/Tibsfox/gsd-skill-creator/blob/main/examples/skills/art/drawing-observation/SKILL.md) | Relative proportion checks, negative-space checks and light/dark grouping before surface detail | Apply observation to building height/width, roof/base relationships and gaps between objects. Do not import blind-contour distortion, photographic convergence or neurological claims. |
| [pixel-art-fundamentals](https://github.com/ProkStudio/skills/blob/main/skills/game/2d/pixel-art-fundamentals/SKILL.md): canvas/density, texture and critique references | Final-size planning, coherent detail clusters, silhouette/value/context review | Transfer the small-image readability method, not pixel-art rendering. No fixed palette, nearest-neighbor mandate, dither, integer-only scaling or universal 60/30/10 quota. |
| [game-ui-and-hud](https://github.com/ProkStudio/skills/blob/main/skills/game/2d/game-ui-and-hud/SKILL.md): typography-and-icons reference; [game-art-pipeline](https://github.com/ProkStudio/skills/blob/main/skills/game/2d/game-art-pipeline/SKILL.md) | Consistent viewpoint and optical weight across a set; distinguish drawing failures from export/filtering failures | Do not turn buildings into uniform-size UI icons, add HUD elements or inherit the instruction to commit all source art. The repository's production-only rule remains authoritative. |

Also inspected [cc2image](https://github.com/izscc/cc2image/blob/main/SKILL.md), including its architectural-line entry and [isometric method](https://github.com/izscc/cc2image/blob/main/references/kashika_isometric_method.md). The architectural-line entry is mostly a style label, not a sufficient building-sketch production method. Its common-axis rule is useful; poster layouts, floating labels and moving/resizing important buildings for emphasis are not adopted. No dedicated architectural-sketch skill found in this search fully covers registered, hand-painted buildings at multiple map scales.

The rules below are this project's adaptation, informed by those references, the built-in imagegen prompting guidance and the user's rejected results. Combine them by responsibility: observation controls proportion; the chosen drawing medium controls marks; game-art methods control size and detail hierarchy; the project controls projection and registration. Do not concatenate every skill's style vocabulary into one prompt. Local projection, scale, privacy and storage requirements take precedence over source defaults. No external image service or skill-specific setup is needed for this research.

## Drawing rules for the next authorized generation

The proposed first direction is pen with light watercolor; graphite architectural sketching is the alternative. Neither is selected or visually validated yet. Specify the mark-making method instead of accumulating generic words such as handmade, textured, distressed, gritty and highly detailed.

| Treatment | Marks that must be visible | Failure condition |
| --- | --- | --- |
| Pen and light watercolor | Interrupted ink contours with pressure changes; stronger short accents at eaves, overlaps and contact points; broad translucent wall washes with a few pooled edges and unpainted highlights | Uniform heavy outlines around flat polygon fills, repeated contour wobble, or scattered dots standing in for pigment |
| Graphite architectural sketch | Fine structural pencil lines; coherent hatch groups on shadow planes; broader side-of-pencil value strokes; small pressure/spacing variations and open lit faces | Full-surface gray grit, random scratches, uniformly fuzzy edges, or the watercolor treatment merely recolored gray |

1. **Separate structural accuracy from hand motion.** Footprints, storey spacing, roof directions and verticals follow the shared projection. Small pressure changes, taper and interrupted edges may vary along those lines; do not bend whole walls or fan parallel lines to manufacture a hand-drawn appearance. All source roles are explicit: geometry reference constrains shape/camera; a later approved style reference constrains marks only.
2. **Paint the wall as a surface.** Let broad strokes and overlapping washes describe light and material within each face. Reserve crisp/dark accents for selected boundaries, recesses and base contact. Keep much of the lit face quiet. Uniform three-tone polygon shading with a texture overlay still reads as a simple model.
3. **Give detail a hierarchy.** Silhouette and large pigment strokes carry the building at map scale; fine, closely spaced floor/window rhythms preserve the tower identity. Window and balcony strokes follow the facade's projected rows/columns. Trees read as canopy masses before branches; grass reads as patches before blades. Do not spend the image's detail on every leaf, paving chip or stray grass mark.
4. **Budget marks at the final object size.** Use the cropped subject's size, not the whole generated canvas, to estimate reduction. If the subject is reduced by a factor of `r`, a desired displayed mark width of `d` needs roughly `r × d` source pixels. This is a planning estimate, not a renderer guarantee. Judge the actual reduced result: broaden meaningful pigment gestures when they disappear, while retaining dense floor cadence. Do not restore them by sharpening grain or adding noise.
5. **Keep the material quiet outside the drawing.** Paper tooth is subordinate to drawn lines and paint. Avoid combining grain, stipple, splatter, scratches and distressed edges. A standalone asset must not carry a cream-paper rectangle or fibrous fringe; shared paper belongs to the map background. Contextual ground remains subject to the crop/registration contract above.
6. **Compile a short, concrete generation brief.** State scene/context and crop intent, building typology and final display budget, then one drawing treatment with its actual stroke behavior, followed by camera/geometry invariants and output separation. Preserve these invariants in follow-up edits and change one diagnosed feature at a time. Dimensions and style words in a prompt are intentions; inspect the returned image rather than claiming precise generator control.

Review geometry, scaling, medium and noise separately. Geometry/scaling can pass while style fails. At enlarged scale, identify actual contour, hatch or wash behavior; at normal map scale, identify surviving paint structure and tower cadence without relying on the style label. Reject texture that is equally dense across lit walls, roofs and ground. A new style choice requires user review; this research alone does not authorize repainting the street.

## Size and detail contract

Keep the usable proportions/scaling as the starting point. Before another generation, derive the budget from the current map consumer and record these fields in temporary working notes; retain only compact provenance for selected production assets:

- Named viewport, overview tier and subject width/height in **CSS pixels**. Record device pixel ratio separately; a larger bitmap on a high-DPI screen does not make the object visually larger.
- Ground footprint/reservation, complete raised visual bounds and ground anchor. Compare tower/slab proportions and the negative spaces between neighboring buildings, not just total crop size.
- Planned generation canvas, contextual subject share, safe crop margin and actual returned subject bounds. A canvas height `C` with subject-height fraction `f` gives about `C × f` source pixels for the subject; measure the result rather than trusting the request. Populate the surrounding composition coherently without increasing texture density everywhere.
- Smallest meaningful stroke/paint-patch size after reduction and the facade's projected floor cadence. Tie detail to those measured display budgets, not arbitrary native image dimensions. Neighbors should have compatible apparent pen weight and pigment-patch scale; their buildings retain different physical proportions.

Allocate detail by its job. Large shapes carry typology and silhouette; middle-sized washes, hatch groups and broken contour segments carry the drawing medium; fine marks carry selected architectural detail. Removing the middle-sized marks while retaining tiny grain produces the rejected model-with-noise appearance. When reducing detail, cut irrelevant chips, speckles and foliage fragments first. Do not cut the marks that establish paint or the dense facade rhythm that establishes a tower.

| Map tier | Must survive | Detail to merge or omit |
| --- | --- | --- |
| Far | Tall/low typology, roof/base shape, major light/dark separation, a readable broad paint gesture and dense tower-band impression | Individual panes, balcony rails, grass blades and tiny material marks; do not replace the facade with a few giant windows |
| Medium | Shared structure plus clear wash/hatch behavior, clustered floor/window rhythm and selective edge accents | Merge adjacent fine details into coherent bands or strokes; keep broad lit faces quiet |
| Near | Convincing storey cadence, local window/balcony marks, pressure changes, hatch spacing and wash-edge behavior | Avoid filling every surface with texture merely because more pixels are available |

These are representation requirements, not new universal pixel thresholds or a requirement to generate three separate files. If one source cannot serve the actual range, plan a compatible detail variant from the same geometry and anchors rather than stretching the raster or changing the building's height class. Check the intended size on its real map background, including neighboring buildings and occlusion; a clean isolated icon is insufficient evidence.

Review source, cropped export and actual consumer separately. If the source is good but the export loses marks, inspect reduction/filtering; if only the consumer fails, inspect scaling, alpha and atlas edges. If the source itself has weak brushwork, export settings cannot fix it. This painted map does not inherit pixel-art-specific filtering, snapping or palette limits. No renderer changes or visual pass are claimed by this specification.

## Repository storage

Do not put trial paintings, visual examples, contact sheets, unused generated assets, batch prompt dumps or one-off demonstration scripts into this repository, now or in future batches. Keep temporary work outside the checkout. Retain concise requirements, decisions and verification outcomes as text. Only raster assets selected for actual product use, with necessary compact provenance, belong in the production asset paths.

Prepare a clean branch containing only intended deliverables before pushing. Adding images and deleting them in a later commit still stores those images in Git history. The ignore rule for new candidate files is a guard against accidental additions, not a request to rewrite existing shared history or remove earlier tracked production dependencies.

## Current user verdict

On 2026-10-19 the user accepted the specification and found the proportion/scaling result usable. The user rejected the generated finish: excessive meaningless visual noise and no demonstrated difference in brushwork. Neither painting is an accepted style reference, and no version is preferred. Trial images and associated example scripts are excluded from this documentation-only delivery and its branch history.

Production SVG art/fallback remains an outstanding implementation issue. No runtime replacement, registered-map acceptance or deployment is claimed. A future authorized style attempt must show controlled, legible brushwork while preserving the usable proportions and scaling. Full-street repainting waits for an actual style selection.

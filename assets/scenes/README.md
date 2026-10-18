# Scenic-flat sample assets

Generated with the built-in image-generation tool on 2026-10-18 UTC. These are original public interaction-art candidates, not historic photographs or reconstructions certified by the user. Prompts and checksums: `../maps/generation-journal-r1.json`.

- `street-flats-r1.png` — 2164 × 727 RGBA, a front-elevation strip. Four generic storefront/courtyard/house facades share a baseline. It stands on a plane beside the metric sidewalk; shallow returns add limited depth.
- `walker-r1.png` — 1024 × 1536 RGBA, anonymous pedestrian seen from behind. A sprite is placed by its feet and paired with a separate ground-contact shadow. This is a static cutout with a small motion sway, not a skeletal walk-cycle animation.

Scenic planes use alpha testing and depth writes for occlusion. Paper background, road, curb and sidewalk are procedural ground geometry. Fog hides the unbuilt extent. Three.js is pinned locally under `assets/vendor/three`; no CDN is required at runtime.

Only a 140 m demonstration is rendered. Painted shops and the courtyard gate are fictional scenery, and the gate opens the existing explicitly synthetic portal fixture. No new named real business, school entrance or autobiographical memory is asserted.

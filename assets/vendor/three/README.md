# Three.js

Unmodified browser modules from official npm `three@0.180.0` (MIT), retrieved 2026-10-18. https://registry.npmjs.org/three/-/three-0.180.0.tgz. No runtime CDN.

The 2026-10-19 student GLB integration additionally vendors the official Three r180 `GLTFLoader.js` and `BufferGeometryUtils.js` (MIT); their **only source adjustment** is rewriting bare `from 'three'` imports to the colocated `../three.module.min.js` so the static app needs no npm/CDN or import map. These addon files remain attributed to Three.js under its upstream MIT license.

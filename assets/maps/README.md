# Current visual direction

The user rejected the earlier planar A/B/C boards as the primary experience. They remain below as provenance and geography references. The active candidate is `fengtai-journal-r1.png`: an original hand-drawn overview with a separately registered artboard, paired with the close scenic-flat street assets in `../scenes/`.

Mapping: `../../content/public/illustration-mapping.json`. Provenance: `generation-journal-r1.json`. Detailed design: `../../docs/ILLUSTRATION_MAPPING.md`. User art approval and historical facade/entrance verification remain pending.

---

# Fengtai map candidates, revision 1

All maps cover the same approximate north-up 1.8 km square: WGS84 bounds `[116.271, 39.837, 116.292, 39.8531]`. The contemporary orientation extract is in [orientation.json](../../content/public/orientation.json). Four public geographic anchors are registered for orientation only. Historical school sites are deliberately unresolved.

| Candidate | Asset | Method | Review state |
| --- | --- | --- | --- |
| A / paper | [fengtai-paper-r1.svg](fengtai-paper-r1.svg) | Deterministic vector illustration, 2400 × 2400 nominal pixels | Style candidate; exact shared vector transform |
| B / paper relief | [fengtai-board-generated-r1.png](fengtai-board-generated-r1.png) | Built-in imagegen style transfer from [reference SVG](fengtai-board-r1.svg), 1254 × 1254 pixels | Style candidate; raster registration acceptance pending |
| C / blue ink | [fengtai-ink-r1.svg](fengtai-ink-r1.svg) | Deterministic vector illustration, 2400 × 2400 nominal pixels | Style candidate; exact shared vector transform |

[Generation record](generation-board-r1.json) contains the normalized prompt, source/output hashes, constraints and provenance. B keeps the same reference framing; the presentation clips its outer black matte without changing the source pixels. A generated rendering is not registration or historical evidence. Functional labels and hit targets remain separate from all images.

`npm run maps` reproducibly rebuilds the vector references. It preserves B's pinned generated asset only while its reference SVG checksum and geometry revision match. It does not call an image service or regenerate accepted art.

## Source and rights

- Underlying selected geographic data: © OpenStreetMap contributors, [ODbL 1.0](https://www.openstreetmap.org/copyright). See [data notice](../../content/public/NOTICE.md).
- Original procedural styling and application code: repository MIT license. Retain the OSM attribution for maps based on OSM.
- B is AI-generated illustrative styling based on the permitted public OSM-derived reference. Public candidate inclusion is authorized by the construction request; historical, registration and aesthetic approval remain separate and pending.
- No personal photos, recording transcripts, residential unit points or proprietary satellite imagery are included.

This is a selected orientation skeleton, not a complete city database. Sparse building footprints and their stylized roofs do not establish the historical size, density, appearance or number of buildings.

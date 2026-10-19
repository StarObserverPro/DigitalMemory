# UI font subset

## Map handwriting

`fengtai-pen-r2.woff` is a renamed web subset of LXGW WenKai Regular, retrieved from the [author's repository](https://github.com/lxgw/LxgwWenKai) on 2026-10-19. The R2 subset retains earlier map characters and adds the complete current compound labels, including 供热厂. The original font's copyright and [SIL OFL 1.1](LXGW-OFL.txt) are retained. The subset family is **Fengtai Pen**; original reserved family names are not used for this modified font. The original source is `fonts/TTF/LXGWWenKai-Regular.ttf`. No external font request occurs at runtime.

Only map names use this pen-like face; existing UI text keeps its readable UI font. Map road names are 18–19 CSS px and place names 21–23 CSS px. The renderer compensates for SVG viewport scale as well as camera zoom, and limits label count/characters rather than shrinking words to fit.

`memory-cjk-subset.ttf` is a Google Fonts served subset of Noto Sans SC, regular weight, containing the 278 CJK/punctuation characters used by the illustrated-map and street prototype. It makes the current UI and deterministic screenshots legible on systems without Chinese fonts. System CJK fonts remain fallbacks for future content.

Source: [Google Fonts Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC), retrieved 2026-10-18 UTC through the official Google Fonts CSS API with a `text` subset query. The returned font is TrueType, not WOFF2.

Font license: [SIL Open Font License 1.1](OFL.txt); this font is not covered by the application's MIT license. No Google Fonts runtime network request is required by the application.

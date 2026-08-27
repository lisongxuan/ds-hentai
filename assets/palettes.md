# Art direction & palette provenance

## What this plugin ships

This repository is a **code skin**. It ships no raster artwork, no logo, no
screenshot of the reference site, and no copied stylesheet. Visual work is
expressed as CSS color values, layout proportions, and original class names
(`dsh-ex-*`) in `src/skin.css`, plus the `THEME.tokens` dictionary and overlay
components in `src/client.js`.

## Palette source

The palette is an extraction of the *style language* observed in the reference
page (`reference/ExHentai.org.mhtml` / `.settings.mhtml` in the workspace),
specifically the imported stylesheet `https://exhentai.org/z/0381/x.css`. Only
functional design tokens are reused — hex/rgb color values, border weights,
radius, type scale, and layout density — which are not copyrightable
expression. No custom-painted graphic, photograph, brand mark, or source-site
class tree is reproduced.

| Token | Value | Role |
|---|---|---|
| base | `#34353b` | application background |
| panel | `#4f535b` | box / panel surface |
| table-head | `#40454b` | header rows |
| zebra-odd / even | `#363940` / `#3c414b` | striped rows |
| input | `#34353b` | form-control fill |
| input-hover | `#43464e` | hover / focus fill |
| text | `#f1f1f1` | primary text |
| link | `#dddddd` | links |
| border-input | `#8d8d8d` | 2px control border |
| error | `#ff3333` | danger / negative |
| up / positive | `#00e639` | upvote / positive |

Category accent hues reuse ExHentai's `.ct*` palette: `#9e2720`, `#db6c24`,
`#d38f1d`, `#6a936d`, `#325ca2`, `#6a32a2`, `#a23282`, `#5fa9cf`, `#ab9f60`.

Layout proportions follow the same language: 710 px nav, ~720 px search pane,
2px ridge around the compact table, 10×10 range ticks, 20×121 category chips,
yellow `#ffffe1` tooltips. Overlay labels are DSH-mapped (Chat / Code / Files /
…, Auto-Detect / Nexus Fast) rather than source-site gallery categories or
copy.

## Provenance boundary

- Reused: color values, border widths/radii, type scale, and layout density.
- Not reused: any image asset, font file, exact class structure, trademark,
  logo, or wording from the source site.
- If a future version adds a nickname or artwork, it must be original or
  explicitly licensed and recorded here with its source and license terms.

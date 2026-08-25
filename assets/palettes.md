# Art direction & palette provenance

## What this plugin ships

This repository is a **pure code skin**. It ships no raster artwork, no logo,
no screenshot of the reference site, and no copied CSS. All visual work is
expressed as CSS color values and layout proportions in `src/skin.css` and the
`THEME.tokens` dictionary in `src/client.js`.

## Palette source

The palette is an extraction of the *style language* observed in the reference
page (`reference/ExHentai.org.mhtml` / `.settings.mhtml` in the workspace),
specifically the imported stylesheet `https://exhentai.org/z/0381/x.css`. Only
functional design tokens are reused — hex/rgb color values, border weights,
radius, and typography — which are not copyrightable expression. No
custom-painted graphic, photograph, or brand mark is reproduced.

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

## Provenance boundary

- Reused: color values, border widths/radii, type scale, and layout density.
- Not reused: any image asset, font file, exact class structure, trademark,
  logo, or wording from the source site.
- If a future version adds a nickname or artwork, it must be original or
  explicitly licensed and recorded here with its source and license terms.

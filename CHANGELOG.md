# Changelog

## 0.7.0

- **Right sidebar.** The skin covers the sidebar DSH added after `0.1.0-rc.6` —
  the guide panel, dockkit tab strip, files tree, and terminal frame — via
  semantic hooks (`data-sidebar-right-*`, `data-dockkit-*`, `data-files-*`), since
  that feature mixes two class conventions and a suffix selector such as
  `[class$="_tab"]` would silently miss the dockkit chrome. Guide entries become
  zebra rows, tabs lose their 12px pill, and the stock hero glyph (`#3c3c3d` on a
  `#34353b` panel, ~1.06:1) is recoloured locally rather than by redefining the
  host's shared static token.
- **Fixed a stray 1px rule** down the middle of the conversation: DSH keeps
  `[data-sidebar-right-panel]` in the DOM at full size while the sidebar is
  closed, so styling it unconditionally painted a background and left border over
  an empty box. Every right-sidebar rule is now gated on
  `[data-sidebar-right-open="true"]`.
- **Composer chips and a new setting.** `[Workspace files]` and `[New terminal]`
  open the matching native pane on demand; the terminal entry's handler sits on an
  inner button, so the inner control is clicked. **原生右侧边栏 / Native right
  sidebar** (default on, in the host General row and the skin's Settings pane)
  hides the sidebar's only DSH-shipped entry point when switched off, so the empty
  `开始` panel never appears on its own.
- **Chips only where they work.** The two right-pane chips render only when the
  host actually ships the right sidebar (detected through
  `[data-sidebar-right-panel]` / the guide entry / the opener, re-checked briefly
  after mount), so hosts without that sidebar no longer show two buttons that do
  nothing. The static demo gained a fake right sidebar — guide panel, dockkit
  strip, files tree, terminal — so the sidebar skin and both chips are previewable
  without installing DSH, and `docs/preview-sidebar.png` joins the README
  screenshots.
- **Theme layer** adds `--dsw-alias-label-quaternary`,
  `--dsw-alias-state-warning-primary`, and the malformed
  `--dsw-alias-brand-primary-new-colorprimary-new-color` the `0.1.7` browser pane
  asks for (a host-side template artifact, inert once the host fixes the name).
- **Verified through DSH `0.1.7-rc.1`** (`next`), plus `0.1.5-rc.3`,
  `0.1.6-alpha.2`, and `0.1.7-alpha.1/2`: stable APIs, `shell.overlay`, locale, and
  the gallery chrome all load with no page errors, and the peer range already
  admits every one of them. `0.1.7-rc.1` loads the same 57 client bundles as
  `0.1.7-alpha.2`, and its fresh-profile `内测声明` / API-key dialogs are host-side.
- **The compatibility matrix left `package.json`.** `dshCompatibility` held ~150
  lines of per-version probe rows that nothing reads at install or run time, so the
  field is gone (243 lines to 97) and `npm run test:compat:all` now writes
  `docs/COMPATIBILITY.md` only.
- **Harness fixes.** `scripts/e2e-dsh.mjs` handles the DSH `>= 0.1.5` browser auth
  gate (launch token to session cookie to Playwright storage state), which had been
  failing every L3 smoke from `0.1.5-rc.2` on. `test/compat/catalog.json` scans
  `ui-chat` (where `_bubble` moved) and the two sidebar packages, and
  `scripts/compat-lib.mjs` treats a package a version never published as *not
  applicable* instead of a miss. README screenshots include the overlay Settings
  pane.

## 0.6.0
- DSH Desktop: gallery chrome is `position: fixed` just below the command bar
  / caption, without body padding that clipped the sidebar, without overlay
  `no-drag`, and with overlay-page sidebar hide plus an advanced-mode caption
  drag strip.
- Vercel static demo: build writes `demo/` (source lives in `demo-src/`) so the
  project Output Directory named `demo` matches after Vercel clears that folder.

## 0.5.0

- Settings copy (host General row and overlay Settings pane) follows the host
  `zh` / `en` locale via `ctx.locale`. Gallery chrome stays English.
- Static demo (`demo/` → `dist/demo`): same `src/` chrome on a fake DSH host,
  no harness / agent / model calls. `npm run preview` locally; GitHub Actions
  can deploy `dist/demo` to Vercel.
- Compatibility automation: L1 jsdom contract fixtures, L2 npm package probes
  against DSH pin/`latest`, `npm run test:compat:all` for every published CLI
  version (writes `package.json#dshCompatibility` and this matrix), and optional
  isolated Playwright smoke (`npm run test:e2e`).
- Peer range for `@deepseek-ai/dsh-client-*` starts at `0.0.1-rc.5` (first
  `shell.overlay` gallery host) and allows later harness versions, including
  `0.1.x-rc` / `0.2.x-rc` prereleases, via an explicit `||` branch per
  `major.minor.patch` tuple. A lone `>=0.0.1-rc.5` silently excludes every
  `0.1.0-*` and `0.1.1-*` prerelease. Overlay-less hosts keep tokens and the
  General switch; native sidebar/composer stay visible without chrome.

## 0.4.0

- Settings: native sidebar show/hide, and a mutually exclusive native vs
  skin composer. Session view CSS-hides the unused chrome; native nodes stay
  in the DOM as click backends.
- Composer dock is a multiline Search box with per-option `[ Model ]`
  `[ Access ]` `[ Agent ]` `[ Effort ]` `[ Commands ]` `[ Files ]` links
  instead of one Advanced Options dump. Slash lines run as commands.
- Session log export and file drop on the skin composer.

## 0.3.0

- Compact/Extended **Action** column: Rename, Fork, and Archive drive native
  session APIs (`session.rename`, `sessions.fork`, `workspaces.archiveSession`).
- Nav drops Watched. Popular is an index sort (message count, then recency).
- Advanced Options lists live host models and access-mode presets
  (`/permission`), not fictional channel/region radios.
- Gallery chips and row tags follow native `session.tags`, then workspace,
  then model, padding to ten with calculated category ids.

## 0.2.0

Gallery chrome, not just a token recolor.

- `shell.overlay` gallery shell: top nav, centered index pane, compact session
  table, search-style composer (Search / Clear / Advanced / File Search),
  details meta strip, and a status footer (model / units / connection /
  delivery / proxy).
- Display modes Minimal / Compact / Extended / Thumbnail; category filters;
  local favorites; fictional model-channel and region radios in the ExHentai
  option-group style.
- Native adapters drive DSH session select, send, attach, settings, and new
  session; conversation Markdown and tool cards stay native.
- Settings row adds Front Page display mode. Extra `localStorage` keys for
  mode, favs, model, region, and category filters.
- CSS rebuilds the active shell toward a centered gallery box (index covers
  the three-pane frame; session view hides the sidebar and native composer
  dock).

## 0.1.0

Initial release.

- Register `dsh-exhentai` dark theme: monochrome charcoal token palette
  (`#34353b` base, `#4f535b` panels, `#8d8d8d` 2px borders, `#ff3333`/`#00e639`
  status accents).
- Scoped decorative stylesheet under `body[data-dsh-exhentai-active="true"]`:
  form chrome, scrollbars, bubbles, session-row hover/selected, primary button,
  header banner, tooltip yellow ink, best-effort category-chip accents.
- General-settings row with independent appearance and category-chips switches;
  appearance restores the previous built-in theme.
- Reversible `localStorage` persistence (`enabled`, `chips`, `previous-theme`).
- Build (`npm run build`) + check (`npm run check`) scripts.

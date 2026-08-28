# Changelog

## Unreleased

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

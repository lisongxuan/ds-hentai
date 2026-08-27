# Changelog

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

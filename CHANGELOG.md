# Changelog

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

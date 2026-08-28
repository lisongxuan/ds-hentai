# Compatibility

## Supported baseline

- DeepSeek Harness `0.1.0-rc.6`
- Node.js 20 or 22 for build/installation tooling
- Modern Chromium, Firefox, or WebKit with CSS custom properties
- `shell.overlay` (ui-layout) for the gallery chrome; without it the plugin
  degrades to tokens + scoped CSS + the General settings row

## Stable and best-effort layers

- **Stable:** `dsh.bundle`, `dsh.client`, `ctx.theme.register`, `ctx.theme.setTheme`,
  `theme/change`, `settings.general.item`, and the documented `--dsw-*` tokens.
- **Best effort:** `ctx.locale.register` / `bind` / `locale/change` for settings
  copy (`zh` / `en`). Without the locale service, settings fall back to the
  browser language. `shell.overlay` chrome; hashed CSS-module suffix selectors such as
  `[class$="_bubble"]`, `[class*="_sessionRow"]`, `:has()` title-bar rules;
  native-control adapters (send / attach / settings / new session) that match
  by accessible name or `_primary` / `textarea` / `input[type=file]`;
  `useSessions` / `ctx.sessions` / `ctx.workspaces` / `ctx.connection` when those faces
  exist. A DSH UI refactor can reduce decorative and adapter fidelity, but the
  native token palette and settings switch continue to work.

## Responsive and accessibility behavior

- At widths up to 800 px, the base font size is relaxed and the Action column
  hides.
- `prefers-reduced-motion: reduce` disables decorative transitions and
  animations.
- `forced-colors: active` removes cosmetic box-shadows and restores
  system-colored borders.
- Overlay controls are labeled (`aria-label` / `aria-pressed` / `aria-current`
  / `aria-selected`). The native send path remains the conversation control
  path.
- The skin makes no runtime image or network request. Nav chevrons are CSS
  triangles, not the reference site's `mr.gif`.

## Recovery

Use **Settings → General → ExHentai dark gallery skin / ExHentai 深色画廊皮肤 → System appearance / 系统外观**. If the settings
UI cannot be opened, removing the plugin and restarting DSH removes every
effect:

```sh
dsh plugin --profile web remove ds-hentai
dsh web
```

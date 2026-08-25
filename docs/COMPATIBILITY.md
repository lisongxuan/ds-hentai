# Compatibility

## Supported baseline

- DeepSeek Harness `0.1.0-rc.6`
- Node.js 20 or 22 for build/installation tooling
- Modern Chromium, Firefox, or WebKit with CSS custom properties

## Stable and best-effort layers

- **Stable:** `dsh.bundle`, `dsh.client`, `ctx.theme.register`, `ctx.theme.setTheme`,
  `theme/change`, `settings.general.item`, and the documented `--dsw-*` tokens.
- **Best effort:** hashed CSS-module suffix selectors such as
  `[class$="_bubble"]`, `[class*="_sessionRow"]`, `:has()` title-bar rules, and
  the `[class*="_tag"/"_chip"/"_badge"]` category-chip accent. A DSH UI refactor
  can reduce decorative fidelity, but the native token palette and settings
  switch continue to work.

## Responsive and accessibility behavior

- At widths up to 800 px, the base font size is relaxed for readability.
- `prefers-reduced-motion: reduce` disables decorative transitions and
  animations.
- `forced-colors: active` removes cosmetic box-shadows and restores
  system-colored borders.
- All injected visual DOM is outside the conversation control path; the only
  injected control is the labeled settings-row buttons, rendered by the native
  settings host.
- The skin makes no runtime image or network request.

## Recovery

Use **Settings → General → ExHentai 深色画廊皮肤 → 系统外观**. If the settings
UI cannot be opened, removing the plugin and restarting DSH removes every
effect:

```sh
dsh plugin --profile web remove ds-hentai
dsh web
```

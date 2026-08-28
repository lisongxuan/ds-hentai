# Compatibility

## Supported baseline

- DeepSeek Harness from `0.0.1-rc.5` (first `shell.overlay` gallery host)
  onward, with no upper bound. Later 0.1.x / 0.2.x / 1.x installs are
  allowed; later UI drift is fixed when it shows up. Tested pin remains
  `0.1.0-rc.6`; latest scanned is `0.1.1-rc.2`. `0.0.1-rc.1` / `0.0.1-rc.2`
  still load as tokens + settings but are outside the install range.
- The npm `peerDependencies` string is a `||` chain of prerelease branches
  (one `major.minor.patch` tuple each). A single `>=0.0.1-rc.5` does **not**
  match `0.1.0-rc.6` or `0.1.1-rc.2` — node-semver only admits a prerelease
  when some comparator shares that exact tuple and itself carries a
  prerelease tag. Do not “simplify” the peer range back to a lone `>=`.
- Node.js 20 or 22 for build/installation tooling
- Modern Chromium, Firefox, or WebKit with CSS custom properties
- `shell.overlay` (ui-layout) for the gallery chrome; without it the plugin
  degrades to tokens + scoped CSS + the General settings row

## Without `shell.overlay`

The gallery shell (`ChromeOverlay`) never mounts. Missing:

- Top nav (Front Page, New Session, Popular, Workspaces, Favorites, Settings)
- Front Page session table / thumbnail grid, category chips, favorites
- Skin search composer (Search / Clear / Model / Access / …)
- Overlay Settings pane (the native **Settings → General** row still works)

Still present: charcoal `--dsw-*` tokens, scoped bubble/row decorations, the
General master switch, and reversible uninstall. Native sidebar and composer
stay visible; layout-hiding CSS only applies when `.dsh-ex-chrome` is in the
document.

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

## DSH Desktop title bar

DSH Desktop (compatibility / extended) portals a 36px drag frame
(`.dshNativeFrame`, `data-dsh-desktop-frame="titlebar"`, z-index 1000) over the
page. Advanced Windows uses Window Controls Overlay (~32px);
advanced macOS keeps a 20px caption row.

The plugin does **not** require `desktopWindow`. Gallery chrome stays in
`shell.overlay` (no `document.body` portal) as `position: fixed` with
`top: var(--ex-desktop-inset)`.

Compatibility / extended have a separate 36px command bar. Inset is `0`
only when a transform/filter on an overlay ancestor already contains
`position: fixed` below that bar. A shifted `#root` without that containing
block still insets 36px — otherwise the overlay covers the command bar.
Advanced has **no** command bar; the 32px (win32) / 20px (darwin) caption
**is** the drag region. Overlay stacking would swallow it, so advanced
always insets that height and paints `.dsh-ex-desktop-drag` in the caption
band (leaving native window controls alone). `dsh web` never sets
`data-dsh-exhentai-window`, so that strip is `display: none`.

On `html[data-dsh-desktop="true"]`, body `padding-top` is not applied (it
clipped the native sidebar). Overlay pages (Front Page, Settings, …) hide
both the official `[class*="_sidebarCol"]` and Desktop's
`dshDesktopSidebar*` / `SidebarSurface` column (the leftover rail on
extended). The native sidebar only shows on the session surface when the
Chat/Trajectory option is on. That overlay-page hide is the same in
`dsh web`; session-with-sidebar and all other browser layout rules are
unchanged.

The overlay uses `pointer-events: none !important` and must **not** set
`-webkit-app-region` on `.dsh-ex-chrome`. A live install shows
`html[data-dsh-exhentai-desktop="inset-v5"]`.

## Recovery

Use **Settings → General → ExHentai dark gallery skin / ExHentai 深色画廊皮肤 → System appearance / 系统外观**. If the settings
UI cannot be opened, removing the plugin and restarting DSH removes every
effect:

```sh
dsh plugin --profile web remove ds-hentai
dsh web
```

<!-- compat-matrix:start -->

## Published DSH matrix

Scanned `@deepseek-ai/dsh` on 2026-08-28T06:18:04.515Z (plugin `0.5.0`).
L2 packs the matching `@deepseek-ai/dsh-client-*` packages for each CLI version.
L1 runs the plugin against the capability face inferred from that L2 result (same fixtures as `npm run test:l1`).
Regenerate with `npm run test:compat:all`.

| DSH | Support | L1 face | L1 | L2 stable | Overlay | Locale | CSS adapters |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `0.0.1-rc.1` | tokens + settings | no-overlay | pass | pass | no | yes | 7/7 |
| `0.0.1-rc.2` | tokens + settings | no-overlay | pass | pass | no | yes | 7/7 |
| `0.0.1-rc.5` | gallery | full-rc6 | pass | pass | yes | yes | 7/7 |
| `0.1.0-rc.2` | gallery | full-rc6 | pass | pass | yes | yes | 7/7 |
| `0.1.0-rc.3` | gallery | full-rc6 | pass | pass | yes | yes | 7/7 |
| `0.1.0-rc.6` | gallery | full-rc6 | pass | pass | yes | yes | 7/7 |
| `0.1.0-rc.7` | gallery | full-rc6 | pass | pass | yes | yes | 7/7 |
| `0.1.0-rc.8` | gallery | full-rc6 | pass | pass | yes | yes | 7/7 |
| `0.1.1-rc.1` | gallery | full-rc6 | pass | pass | yes | yes | 7/7 |
| `0.1.1-rc.2` | gallery | full-rc6 | pass | pass | yes | yes | 7/7 |

- **gallery** — stable APIs + `shell.overlay`; gallery chrome is expected.
- **tokens + settings** — stable APIs present, no `shell.overlay`; plugin must keep the palette and General switch.
- **unsupported** — a stable probe (`theme/change`, `setTheme`, `settings.general.item`) missed.
- **no matching client packages** — this CLI version has no publish of the web client packages at the same version.

<!-- compat-matrix:end -->

## Automated tests

The executable catalog is `test/compat/catalog.json`. Stable probes fail CI;
best-effort probes warn (or assert a clean degrade) and do not block a PR.

| Layer | Command | What it covers |
| ----- | ------- | -------------- |
| L1 | `npm test` (includes `npm run test:l1`) | jsdom + mock Cordis faces: `full-rc6`, `no-overlay`, `no-locale`, `no-sessions`. Theme register, General row, overlay try/catch, markers, dispose. |
| L2 | `npm run test:compat` | Resolve pin/`latest` from `@deepseek-ai/dsh`, then `npm pack` matching `@deepseek-ai/dsh-client-*` packages. Stable strings must remain; CSS-module suffixes (`_sessionRow`, `_bubble`, …) and `shell.overlay` warn if missing. Offline local runs skip instead of failing; CI does not. |
| L1+L2 matrix | `npm run test:compat:all` | Every published `@deepseek-ai/dsh` version. Writes `package.json#dshCompatibility` and the matrix in this file. |
| L3 | `npm run test:e2e` | Temporary `DSH_HOME`, `npx @deepseek-ai/dsh@<ver> plugin --profile web add ./ds-hentai-*.tgz`, `dsh web --no-open --host 127.0.0.1`, Playwright smoke. Nightly / `workflow_dispatch` in `.github/workflows/compat-e2e.yml`. |

L3 binds only to loopback and deletes the temporary home unless `DSH_E2E_KEEP_HOME=1`. It does not need a live LLM. Point at an already running GUI with `--url http://127.0.0.1:3080`.

# ds-hentai

English | [简体中文](README.zh-CN.md)

**ExHentai.org-inspired UI** for DeepSeek Harness. Charcoal background, light-gray text, gray borders. The session list reads like a gallery index; the composer reads like a search bar.

**[Live demo](https://dshentai-demo.arkady14.site)** — static preview (fake host, no harness).

![Front Page](docs/preview.png)

![Session](docs/preview-session.png)

## Install

```sh
# from npm (prebuilt)
npx @deepseek-ai/dsh plugin --profile web add ds-hentai
# or straight from GitHub
npx @deepseek-ai/dsh plugin --profile web add github:<owner>/ds-hentai
```

Restart `dsh web` and refresh the page. Later skin updates only need a refresh.

## Features

- **Top nav** — Front Page, New Session, Popular, Workspaces, Favorites, Settings.
- **Front Page** — filter by category, search sessions, switch between a table and thumbnails. Compact / Extended rows include Rename / Fork / Archive.
- **Session view** — conversation content stays native. Use the skin search dock (Search / Clear, plus Model, Access, Agent, Effort, Commands, Files) or keep the native composer.
- **Favorites** — tap the heart on a row; Favorites shows only starred sessions.

## Settings

Change these under **Settings → General**, or from the top-nav **Settings** page.
Labels follow the host interface language (`zh` / `en`).

- **Enable gallery skin / System appearance** — master switch. Off restores the DSH look you had before.
- **Native sidebar** — whether the session page shows the left session list. When hidden, open sessions from Front Page.
- **Composer** — skin composer or native composer; one at a time.
- **Front Page display mode** — how the session list is laid out. The Front Page footer dropdown changes the same setting.

| Mode | What you see |
| ---- | ------------ |
| **Minimal** | Table, no tags |
| **Minimal+** | Table with tags |
| **Compact** | Table, tags + Rename / Fork / Archive (default) |
| **Extended** | Same as Compact |
| **Thumbnail** | Card grid |

To restore the built-in look, set the master switch to **System appearance**. If Settings will not open:

```sh
dsh plugin --profile web remove ds-hentai
dsh web
```

## Development

```sh
npm install
npm run build      # src/client.js + src/skin.css → lib/client.js
npm run check      # validate bundle envelope / placeholders / no ESM import / size budget
npm run build:demo # static preview → demo/ (demo-src/ fake host, no harness)
npm run preview    # build:demo + serve http://127.0.0.1:4173/
npm test           # build + check + L1 + demo
npm run test:compat  # L2: probe published DSH packages (pin + latest)
npm run test:compat:all  # L1 + L2 every published @deepseek-ai/dsh version; writes the matrix
npm run test:e2e     # L3: isolated DSH_HOME + Playwright against 0.1.0-rc.6
npm pack --dry-run # release-view gate
```

The static demo reuses `src/client.js` and `src/skin.css`. `demo-src/` is only a fake DSH host, fixtures, and a stand-in conversation pane; `npm run build:demo` writes the static site to `demo/` (Vercel output directory). Search, settings, and session chrome stay local; nothing calls DeepSeek Harness, an agent, or a model API. Hosted copy: [dshentai-demo.arkady14.site](https://dshentai-demo.arkady14.site).


## Layout

- `src/client.js` — plugin body (`THEME`, apply state machine, settings row, `shell.overlay` gallery chrome)
- `src/skin.css` — scoped decoration + layout rebuild
- `demo-src/` — static preview host (fixtures + fake `ctx`); not shipped on npm
- `scripts/build-client.mjs` — wrap `window.__ModuleLoader__.load(...)` into `lib/client.js`
- `scripts/build-demo.mjs` — embed the plugin bundle in `demo/`
- `scripts/capture-preview.mjs` — screenshot Front Page / session into `docs/preview*.png`
- `docs/ARCHITECTURE.md` — runtime data flow and boundaries
- `docs/COMPATIBILITY.md` — baseline, layer stability, recovery
- `test/compat/catalog.json` — executable probe catalog for L1/L2/L3

## Notes

Browser-only plugin; it does not edit DSH files. Sessions, replies, and settings still belong to DeepSeek Harness — this skin only replaces the chrome. Preferences stay in the local browser. Install floor is DSH `0.0.1-rc.5` (first `shell.overlay` host); later harness versions including current `0.1.x-rc` builds are allowed. Tested pin is `0.1.0-rc.6`. See [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md).

## License

[MIT](LICENSE)

# ds-hentai

English | [简体中文](README.zh-CN.md)

**ExHentai.org-inspired UI** for DeepSeek Harness. Charcoal background, light-gray text, gray borders. The session list reads like a gallery index; the composer reads like a search bar.

![Preview](docs/preview.svg)

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
npm test           # build + check
npm pack --dry-run # release-view gate
```

## Layout

- `src/client.js` — plugin body (`THEME`, apply state machine, settings row, `shell.overlay` gallery chrome)
- `src/skin.css` — scoped decoration + layout rebuild
- `scripts/build-client.mjs` — wrap `window.__ModuleLoader__.load(...)` into `lib/client.js`
- `docs/ARCHITECTURE.md` — runtime data flow and boundaries
- `docs/COMPATIBILITY.md` — baseline, layer stability, recovery

## Notes

Browser-only plugin; it does not edit DSH files. Sessions, replies, and settings still belong to DeepSeek Harness — this skin only replaces the chrome. Preferences stay in the local browser. Needs a recent DSH Web GUI (`0.1.0-rc.6` and ui-layout with `shell.overlay`); older builds may keep only the palette and the General switch. See [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md).

## License

[MIT](LICENSE)

# Architecture

## Goal

Add a reversible ExHentai.org-style dark gallery appearance to the DSH Web
GUI: token palette plus a structural chrome overlay. The plugin does not edit
DSH files, open a debug port, or maintain a parallel conversation store.

## Package shape

```text
ds-hentai
├─ dsh.bundle → cordis.patch.yml → host no-op loader entry
├─ dsh.client → lib/client.js → browser ThemeRuntime / CSS / overlay / settings
└─ demo-src/ → demo/ → static preview (fake ctx, fixtures, no DSH)
```

The host half exists only so `dsh plugin --profile web add ...` can compose the
package as a standard profile bundle. All behavior is browser-local.

The static demo loads the same `lib/client.js` factory through a fake
`window.__ModuleLoader__` and a Cordis-shaped `ctx` (`theme`, `slots`,
`sessions`, `locale`, `workspaces`, `modelDirectories`). Conversation bubbles
are a stand-in DOM tree so session-view CSS has something to paint. `native.*`
paths that would send, select models, or run commands mutate an in-memory
store. `demo-src/` is not in the npm `files` whitelist.

## Runtime flow

1. Register `dsh-exhentai` with `ctx.theme.register()` using the `--dsw-*`
   override dictionary (`colorScheme: 'dark'`). The presenter
   (`ui-layout`'s `ThemePresenter`) already applies the snapshot's `active`
   tokens as inline variables on `body` and toggles
   `body[data-ds-dark-theme]` from `colorScheme`.
2. Restore the per-browser enabled flag from `localStorage`; first install
   defaults to enabled.
3. Switch through `ctx.theme.setTheme()` and follow `theme/change` as the single
   active-state signal; a bounded 2.5 s startup stabilization window survives
   the Host settings scope's late built-in-theme adoption, then yields to user
   changes.
4. Install one `<style>` scoped under
   `body[data-dsh-exhentai-active="true"]`; the stylesheet (and no network
   request) carries token decorations and native-shell layout transforms.
5. Set `body[data-dsh-exhentai-chips="on"|"off"]` and
   `body[data-dsh-exhentai-view="index"|"session"]` for chip accents and
   index-vs-session layout.
6. Register a General-settings item: appearance, category chips, native
   sidebar visibility, skin vs native composer, Front Page display mode.
   Appearance restores the previous built-in `light`, `dark`, or `system`
   preference. Settings labels register a `ds-hentai` dictionary on
   `ctx.locale` (`zh` / `en`) and re-render on `locale/change`; the gallery
   chrome is not localized.
7. Register a `shell.overlay` list entry (`ds-hentai-chrome`) that paints the
   gallery nav, compact session table, search-style composer, and status
   footer. Session list prefers the slot runtime `useSessions` snapshot and
   falls back to native `[class*="_sessionRow"]` DOM. Send / attach / settings
   / new-session call into `ctx.sessions` / `ctx.layout` when present, else
   click the native control. Overlay registration is try/caught so older
   baselines without `shell.overlay` still get tokens + CSS.
8. Stay in `shell.overlay` (no `document.body` portal). Paint gallery chrome
   `position: fixed` with `--ex-desktop-inset` (36px framed command bar, or
   always 32/20px in advanced). Hide native/Desktop sidebar on non-session
   views. Do not pad `body` on `html[data-dsh-desktop="true"]`. Advanced
   gets a `.dsh-ex-desktop-drag` strip; never set `-webkit-app-region:
   no-drag` on the full overlay. Dispose the watcher with the stylesheet fiber.
9. Dispose theme registration, the stylesheet, the overlay, subscribers, and
   state markers with the owning Cordis fiber.

## Native interaction boundary

The overlay is replacement *chrome*, not a second agent runtime. It does not
copy prompts or session payloads out of DSH. Selecting a row, Search, File
Search, Settings, Uploads, Rename / Fork / Archive, model radios, and access
mode ultimately activate the native session list, composer, file input,
settings host, session APIs (`rename` / `fork` / `archiveSession`),
`sessions.models` / `selectModel`, and `/permission`. The native send
button keeps DSH's element, handler, disabled state, and accessible name; the
overlay Search control fills the composer and clicks that button (or
`ctx.sessions.scope(id).conversation.send` when the scoped service exists).
The plugin injects no document-level key logger; the overlay's own inputs only
listen on their nodes.

Fictional model / quota / connection / delivery / proxy readouts are local
presentation. Connection label is a best-effort map of `ctx.connection` when
that service exists; quota units are a decorative counter, not a billing API.

## Persistence

Browser `localStorage` keys:

- `ds-hentai:enabled=on|off`
- `ds-hentai:chips=on|off`
- `ds-hentai:previous-theme` (`light` | `dark` | `system`)
- `ds-hentai:mode` (`minimal` | `compact` | `extended` | `thumbnail`)
- `ds-hentai:favs` (JSON array of session ids)
- `ds-hentai:model` / `ds-hentai:region` / `ds-hentai:cats` (chrome filters)
- `ds-hentai:native-sidebar=on|off` (session-view native sidebar)
- `ds-hentai:composer=skin|native` (mutually exclusive composer chrome)

No prompts, replies, credentials, or usage telemetry are stored or transmitted.

## Build

`src/client.js` and `src/skin.css` are the deterministic bundle inputs.
`npm run build` embeds the CSS into the standard `window.__ModuleLoader__.load`
envelope at `lib/client.js`. `npm run check` validates the envelope, the
absence of unresolved placeholders, the absence of top-level ESM imports, and a
size budget. `npm run build:demo` bundles `demo-src/boot.js` with React, then
appends `lib/client.js` into `demo/app.js`.

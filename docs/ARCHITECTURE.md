# Architecture

## Goal

Add a reversible ExHentai.org-style dark appearance to the DSH Web GUI without
replacing native controls, editing DSH files, opening a debug port, or
maintaining a parallel data model.

## Package shape

```text
ds-hentai
├─ dsh.bundle → cordis.patch.yml → host no-op loader entry
└─ dsh.client → lib/client.js → browser ThemeRuntime/CSS/settings effects
```

The host half exists only so `dsh plugin --profile web add ...` can compose the
package as a standard profile bundle. All behavior is browser-local and purely
visual.

## Runtime flow

One reversible dark theme applied through the registered theme registry, plus
a scoped decorative stylesheet and one General-settings row.

1. Register `dsh-exhentai` with `ctx.theme.register()` using the `--dsw-*`
   override dictionary (`colorScheme: 'dark'`). The presenter
   (`ui-layout`'s `ThemePresenter`) already applies the snapshot's `active`
   tokens as inline variables on `body` and toggles
   `body[data-ds-dark-theme]` from `colorScheme`, so a registered theme needs no
   manual DOM token writes.
2. Restore the per-browser enabled flag from `localStorage`; first install
   defaults to enabled.
3. Switch through `ctx.theme.setTheme()` and follow `theme/change` as the single
   active-state signal; a bounded 2.5 s startup stabilization window survives
   the Host settings scope's late built-in-theme adoption, then yields to user
   changes.
4. Install one `<style>` scoped under
   `body[data-dsh-exhentai-active="true"]`; the stylesheet (and no network
   request) carries every decoration.
5. Set `body[data-dsh-exhentai-chips="on"|"off"]` to enable or disable the
   best-effort ExHentai-style category accents.
6. Register a General-settings item with an independent appearance switch and a
   category-chips switch. Appearance restores the previous built-in `light`,
   `dark`, or `system` preference.
7. Dispose theme registration, the stylesheet, the disposed flag, subscribers,
   and state markers with the owning Cordis fiber.

## Native interaction boundary

The plugin does not create replacement chat, model, attachment, send, settings,
session, or details controls. Selectors only decorate existing shell surfaces;
the native send button retains DSH's element, handler, disabled state, and
accessible name. The plugin injects no document-level input listeners.

## Persistence

Only `ds-hentai:enabled=on|off`, `ds-hentai:chips=on|off`, and
the previous built-in theme id (`light`, `dark`, or `system`) are stored in
browser `localStorage`. No prompts, replies, session identifiers, file paths,
credentials, or usage data are stored or transmitted.

## Build

`src/client.js` and `src/skin.css` are the deterministic bundle inputs.
`npm run build` embeds the CSS into the standard `window.__ModuleLoader__.load`
envelope at `lib/client.js`. `npm run check` validates the envelope, the
absence of unresolved placeholders, the absence of top-level ESM imports, and a
size budget.

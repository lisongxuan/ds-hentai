# Security

`ds-hentai` is a browser-only theme skin. Its surface is intentionally
scoped:

- It ships one client bundle (`lib/client.js`) and a no-op host half. It
  registers a theme, injects one `<style>` element, registers one settings
  row, and (when `shell.overlay` exists) one overlay chrome. It runs no
  host-side code, opens no network connection, and reads no file system.
- **No credentials or secrets.** The plugin stores only skin preferences in
  `localStorage` (enabled, chips, previous-theme, display mode, favorite ids,
  fictional model/region, category filters). It never reads or writes
  credentials, tokens, or user-settings documents other than the theme
  preference the theme runtime itself manages.
- **No data collection.** It does not transmit prompts, sessions, identities,
  or usage telemetry. Overlay Search fills the native composer in-page.
- **All assets are inline.** The bundle references no external URL; there is no
  fetch or image request at runtime.
- **DOM is scoped and reversible.** Styles are scoped under
  `body[data-dsh-exhentai-active="true"]`; overlay unmounts when the theme is
  off. Removing the plugin and restarting removes every effect.
- **Native control path.** Overlay adapters click or fill existing DSH
  controls; they do not install document-level input listeners.

## Reporting

Please report security issues privately to the maintainers rather than in a
public issue. Include the plugin version, DSH version, and a minimal repro.

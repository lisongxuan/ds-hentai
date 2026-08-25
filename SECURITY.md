# Security

`ds-hentai` is a browser-only theme skin. Its surface is intentionally
small:

- It ships one client bundle (`lib/client.js`) and a no-op host half. It
  registers a theme, injects one `<style>` element, and registers one settings
  row. It runs no host-side code, opens no network connection, and reads no
  file system.
- **No credentials or secrets.** The plugin stores only `enabled`, `chips`, and
  the previous built-in theme id in `localStorage`. It never reads or writes
  credentials, tokens, or user-settings documents other than the theme
  preference the theme runtime itself manages.
- **No data collection.** It does not transmit prompts, sessions, identities,
  or usage telemetry.
- **All assets are inline.** The bundle references no external URL; there is no
  fetch or image request at runtime.
- **DOM is scoped and reversible.** Styles are scoped under
  `body[data-dsh-exhentai-active="true"]`; removing the plugin and restarting
  removes every effect.

## Reporting

Please report security issues privately to the maintainers rather than in a
public issue. Include the plugin version, DSH version, and a minimal repro.

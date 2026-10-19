#!/usr/bin/env node
/**
 * Wait until a published version is readable from the npm registry.
 *
 * Two reasons this reads the registry directly instead of `npm view`:
 *
 * 1. npm answers `npm view` from ~/.npm/_cacache, so a cached miss can outlive
 *    the real publish.
 * 2. The registry accepts an upload before the version is servable. A fresh
 *    publish shows up as "Validating" on the package page and can take minutes
 *    to become readable, while `npm publish` has already exited 0 and printed
 *    "+ ds-hentai@0.7.1". A short retry loop therefore fails healthy releases.
 *
 * Usage: node scripts/registry-published.mjs <name> <version> [flags]
 *   --once                 check once and exit (no waiting)
 *   --timeout-seconds N    total wait budget (default 1800; ds-hentai@0.7.1
 *                          needed roughly ten minutes to leave "Validating")
 *   --interval-seconds N   delay between attempts (default 15)
 *
 * Env: REGISTRY_URL (default https://registry.npmjs.org), plus
 *      REGISTRY_TIMEOUT_SECONDS / REGISTRY_INTERVAL_SECONDS for the same knobs.
 * Exit codes: 0 readable, 1 not readable within the budget, 2 usage error.
 *
 * The process never calls process.exit(): leaving while fetch handles are
 * closing trips a libuv assertion on Windows (`UV_HANDLE_CLOSING` in async.c),
 * which turns a success into exit code -1073740791.
 */
import { setTimeout as delay } from 'node:timers/promises'

const USAGE = 'usage: node scripts/registry-published.mjs <name> <version> [--once] [--timeout-seconds N] [--interval-seconds N]'

function parseArgs(argv) {
  const positional = []
  const flags = Object.create(null)
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--once') {
      flags.once = true
    } else if (arg.startsWith('--')) {
      flags[arg.slice(2)] = argv[i + 1]
      i += 1
    } else {
      positional.push(arg)
    }
  }
  return { positional, flags }
}

const clock = () => new Date().toISOString().slice(11, 19)
const sleep = (seconds) => delay(seconds * 1000)

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2))
  const [name, version] = positional
  if (!name || !version) {
    console.error(USAGE)
    return 2
  }

  const registry = (process.env.REGISTRY_URL || 'https://registry.npmjs.org').replace(/\/+$/, '')
  const timeoutSeconds = Number(flags['timeout-seconds'] ?? process.env.REGISTRY_TIMEOUT_SECONDS ?? 1800)
  const intervalSeconds = Number(flags['interval-seconds'] ?? process.env.REGISTRY_INTERVAL_SECONDS ?? 15)
  if (!Number.isFinite(timeoutSeconds) || timeoutSeconds < 0 || !Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
    console.error('usage: --timeout-seconds must be >= 0 and --interval-seconds must be > 0')
    return 2
  }

  async function readable() {
    // Cache-bust: registry reads sit behind a CDN, and a 404 for a version that
    // was accepted seconds ago must not be served from an edge cache.
    const url = `${registry}/${encodeURIComponent(name)}/${encodeURIComponent(version)}?t=${Date.now()}`
    let response
    try {
      response = await fetch(url, {
        cache: 'no-store',
        headers: { accept: 'application/json', 'cache-control': 'no-cache' }
      })
    } catch (error) {
      return { live: false, reason: `request failed: ${error.message}` }
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      const detail = body.slice(0, 120).replace(/\s+/g, ' ').trim()
      return { live: false, reason: `HTTP ${response.status}${detail ? ` (${detail})` : ''}` }
    }
    const manifest = await response.json().catch(() => null)
    if (!manifest || manifest.version !== version) {
      return { live: false, reason: 'manifest did not carry the expected version' }
    }
    return { live: true }
  }

  if (flags.once || timeoutSeconds === 0) {
    const result = await readable()
    if (result.live) {
      console.log(`${name}@${version} is readable from the registry.`)
      return 0
    }
    console.log(`${name}@${version} is not readable yet: ${result.reason}`)
    return 1
  }

  const deadline = Date.now() + timeoutSeconds * 1000
  let attempt = 0
  let lastReason = 'no attempt made'

  for (;;) {
    attempt += 1
    const result = await readable()
    if (result.live) {
      console.log(`${clock()} attempt ${attempt}: ${name}@${version} is live on the registry.`)
      return 0
    }
    lastReason = result.reason
    const remaining = Math.ceil((deadline - Date.now()) / 1000)
    if (remaining <= 0) break
    console.log(`${clock()} attempt ${attempt}: not readable yet (${result.reason}); ${remaining}s left`)
    await sleep(Math.min(intervalSeconds, remaining))
  }

  console.error(`${name}@${version} is still not readable after ${timeoutSeconds}s (last: ${lastReason}).`)
  return 1
}

process.exitCode = await main()

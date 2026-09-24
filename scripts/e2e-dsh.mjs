import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { root } from '../test/compat/catalog.mjs'

function parseArgs(argv) {
  const out = { version: '0.1.0-rc.6', port: 43180, url: '', headed: false, plugin: '' }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--version') out.version = argv[++i]
    else if (arg === '--port') out.port = Number(argv[++i])
    else if (arg === '--url') out.url = argv[++i]
    else if (arg === '--plugin') out.plugin = argv[++i]
    else if (arg === '--headed') out.headed = true
    else if (arg === '--help') out.help = true
  }
  return out
}

function bin(name) {
  return name
}

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms))

const stripAnsi = (text) => text.replace(/\u001b\[[0-9;]*[A-Za-z]/g, '')

/**
 * Extra `npx` flags. `DSH_E2E_NPM_CACHE` points the transient CLI install at a
 * throwaway npm cache, which avoids `ECOMPROMISED` lock contention when several
 * probes run at once.
 */
function npxPrefix(env) {
  return env.DSH_E2E_NPM_CACHE ? ['--cache', env.DSH_E2E_NPM_CACHE] : []
}

function spawnCmd(command, args, options) {
  const child = spawn(command, args, {
    cwd: options.cwd || root,
    env: options.env || process.env,
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    windowsHide: true,
    detached: process.platform !== 'win32'
  })
  if (options.log) {
    child.stdout?.on('data', (chunk) => options.log.write(chunk))
    child.stderr?.on('data', (chunk) => options.log.write(chunk))
  }
  if (options.capture) {
    child.stdout?.on('data', (chunk) => options.capture(chunk))
    child.stderr?.on('data', (chunk) => options.capture(chunk))
  }
  if (options.tee) {
    child.stdout?.on('data', (chunk) => process.stderr.write(chunk))
    child.stderr?.on('data', (chunk) => process.stderr.write(chunk))
  }
  return child
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawnCmd(command, args, options)
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (chunk) => { stdout += chunk })
    child.stderr?.on('data', (chunk) => { stderr += chunk })
    child.on('error', reject)
    child.on('close', (code) => resolvePromise({ code: code ?? 1, stdout, stderr }))
  })
}

/**
 * Wait for the browser URL `dsh web` prints once it is listening.
 *
 * DSH >= 0.1.5 gates the GUI behind a per-process launch token: the printed URL
 * carries `?token=...`, which mints a signed session cookie and redirects to the
 * clean path. Older builds print the same URL without the query. Without this
 * token a bare `/` request answers 401 and the frontend never boots, so the
 * launch URL — not a bare HTTP probe — is the readiness signal.
 */
async function waitForLaunchUrl(getLog, port, timeoutMs) {
  const started = Date.now()
  const pattern = new RegExp(`https?://127\\.0\\.0\\.1:${port}/?(\\?token=[A-Za-z0-9_.\\-]+)?`)
  while (Date.now() - started < timeoutMs) {
    const match = stripAnsi(getLog()).match(pattern)
    if (match) return match[0]
    await sleep(500)
  }
  throw new Error(`timeout waiting for the dsh web launch URL on port ${port}`)
}

function waitForHttp(url, timeoutMs, cookie) {
  const started = Date.now()
  return new Promise((resolvePromise, reject) => {
    const tick = () => {
      const headers = cookie ? { cookie } : undefined
      const req = http.get(url, { timeout: 3000, headers }, (res) => {
        res.resume()
        if (res.statusCode && res.statusCode < 500) {
          resolvePromise(res.statusCode)
          return
        }
        retry()
      })
      req.on('error', retry)
      req.on('timeout', () => { req.destroy(); retry() })
    }
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`timeout waiting for ${url}`))
        return
      }
      setTimeout(tick, 1000)
    }
    tick()
  })
}

/**
 * Wait for one exact status. The plugin bundle route is registered while the
 * profile loads, so it can answer 404 for a moment after the port is listening —
 * a bare `< 500` readiness probe would accept that 404 and report a false miss.
 */
function waitForStatus(url, status, timeoutMs, cookie) {
  const started = Date.now()
  return new Promise((resolvePromise, reject) => {
    const tick = () => {
      const headers = cookie ? { cookie } : undefined
      const req = http.get(url, { timeout: 3000, headers }, (res) => {
        res.resume()
        if (res.statusCode === status) {
          resolvePromise(res.statusCode)
          return
        }
        retry(res.statusCode)
      })
      req.on('error', () => retry(null))
      req.on('timeout', () => { req.destroy(); retry(null) })
    }
    const retry = (last) => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`timeout waiting for ${url} to answer ${status} (last: ${last})`))
        return
      }
      setTimeout(tick, 500)
    }
    tick()
  })
}

async function stopChild(child) {
  if (!child || child.killed) return
  const pid = child.pid
  if (process.platform === 'win32' && pid) {
    await run('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: ['ignore', 'ignore', 'ignore'] }).catch(() => {})
    return
  }
  try {
    if (pid) process.kill(-pid, 'SIGTERM')
  } catch {
    try { child.kill('SIGTERM') } catch {}
  }
  await sleep(1000)
  try {
    if (pid) process.kill(-pid, 'SIGKILL')
  } catch {
    try { child.kill('SIGKILL') } catch {}
  }
}

async function packPlugin(work) {
  const packed = await run(bin('npm'), ['pack', '--pack-destination', work, '--json'])
  if (packed.code !== 0) throw new Error(`npm pack failed: ${packed.stderr || packed.stdout}`)
  let filename = ''
  try {
    const parsed = JSON.parse(packed.stdout)
    const row = Array.isArray(parsed) ? parsed[0] : parsed
    filename = (row && (row.filename || row.name)) || ''
  } catch {
    filename = packed.stdout.trim().split(/\s+/).pop() || ''
  }
  filename = String(filename).replace(/^.*[/\\]/, '')
  if (!filename.endsWith('.tgz')) {
    const { readdir } = await import('node:fs/promises')
    const files = (await readdir(work)).filter((name) => name.endsWith('.tgz'))
    if (!files.length) throw new Error('npm pack produced no tarball')
    return join(work, files[0])
  }
  return join(work, filename)
}

async function ensureChromium(env) {
  const install = await run(bin('npx'), [...npxPrefix(env), 'playwright', 'install', 'chromium'], { env, cwd: root })
  if (install.code !== 0) {
    if (process.env.CI === 'true') throw new Error(`playwright install failed: ${install.stderr || install.stdout}`)
    console.error(`warning: playwright install chromium failed: ${install.stderr || install.stdout}`)
    return false
  }
  return true
}

/**
 * Exchange a launch-token URL for the browser session cookie and persist it as a
 * Playwright storage state, so the spec can keep navigating to the clean `/`.
 * Returns `{ path, cookie }` or null when the URL carries no token.
 */
async function primeSession(authUrl, statePath) {
  const parsed = new URL(authUrl)
  if (!parsed.searchParams.has('token')) return null
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(authUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForURL((url) => !url.searchParams.has('token'), { timeout: 30_000 }).catch(() => {})
    await context.storageState({ path: statePath })
    const state = JSON.parse(await (await import('node:fs/promises')).readFile(statePath, 'utf8'))
    const cookie = (state.cookies || [])
      .filter((item) => item.domain === parsed.hostname || parsed.hostname.endsWith(item.domain.replace(/^\./, '')))
      .map((item) => `${item.name}=${item.value}`)
      .join('; ')
    return { path: statePath, cookie }
  } finally {
    await browser.close()
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log('Usage: node scripts/e2e-dsh.mjs [--version 0.1.0-rc.6|latest] [--plugin ds-hentai@0.7.0] [--port 43180] [--url http://127.0.0.1:3080] [--headed]')
    console.log('Env: DSH_E2E_NPM_CACHE=<dir> for a throwaway npm cache; DSH_E2E_KEEP_HOME=1 to keep the temp home.')
    process.exit(0)
  }

  const env = {
    ...process.env,
    DSH_E2E_EXPECT_CHROME: process.env.DSH_E2E_EXPECT_CHROME || '1'
  }

  if (args.url) {
    const parsed = new URL(args.url)
    env.DSH_E2E_URL = parsed.origin
    await ensureChromium(env)
    const statePath = join(tmpdir(), `ds-hentai-e2e-state-${process.pid}.json`)
    const primed = await primeSession(args.url, statePath)
    if (primed) {
      env.DSH_E2E_STORAGE_STATE = primed.path
      console.error('e2e: primed the browser session cookie from the launch URL')
    }
    const code = await runPlaywright(env, args.headed)
    process.exit(code)
  }

  const work = await mkdtemp(join(tmpdir(), 'ds-hentai-e2e-'))
  const home = join(work, 'dsh-home')
  const logPath = join(work, 'dsh-web.log')
  await mkdir(home, { recursive: true })
  const log = createWriteStream(logPath)
  let child = null

  try {
    const spec = args.plugin || await packPlugin(work)
    const dsh = `@deepseek-ai/dsh@${args.version}`
    console.error(`e2e: ${dsh} plugin add ${spec}`)
    const add = await run(bin('npx'), [...npxPrefix(env), '-y', dsh, 'plugin', '--profile', 'web', 'add', spec], {
      env: { ...process.env, DSH_HOME: home }
    })
    if (add.code !== 0) {
      const allowOffline = process.env.CI !== 'true' && process.env.COMPAT_ALLOW_OFFLINE !== '0'
      const offline = /ENOTFOUND|EAI_AGAIN|404|ETIMEDOUT|network/i.test(`${add.stderr}\n${add.stdout}`)
      if (offline && allowOffline) {
        console.error(`e2e skipped: could not install ${dsh}\n${add.stderr || add.stdout}`)
        process.exit(0)
      }
      throw new Error(`dsh plugin add failed:\n${add.stderr || add.stdout}`)
    }

    if (add.stdout) process.stderr.write(add.stdout)
    if (add.stderr) process.stderr.write(add.stderr)
    const installed = join(home, 'profiles', 'web', 'node_modules', 'ds-hentai', 'package.json')
    try {
      const { readFile } = await import('node:fs/promises')
      const pkg = JSON.parse(await readFile(installed, 'utf8'))
      console.error(`e2e: installed ${pkg.name}@${pkg.version} from ${spec}`)
    } catch (err) {
      console.error(`e2e: could not read installed plugin at ${installed}: ${err && err.message || err}`)
    }

    let output = ''
    child = spawnCmd(bin('npx'), [...npxPrefix(env), '-y', dsh, 'web', '--no-open', '--host', '127.0.0.1', '--port', String(args.port)], {
      env: { ...process.env, DSH_HOME: home },
      log,
      capture: (chunk) => { output += chunk },
      tee: process.env.DSH_E2E_VERBOSE === '1'
    })

    const died = new Promise((_, reject) => {
      child.on('close', (code) => {
        const tail = stripAnsi(output).split(/\r?\n/).filter(Boolean).slice(-12).join('\n')
        reject(new Error(`dsh web exited before ready (code ${code})${tail ? `:\n${tail}` : ''}\nSee ${logPath}`))
      })
    })
    // the child is stopped in `finally`, which would otherwise surface as an
    // unhandled rejection after a passing run
    died.catch(() => {})

    const launchUrl = await Promise.race([
      waitForLaunchUrl(() => output, args.port, 120_000),
      died
    ])
    const url = `http://127.0.0.1:${args.port}`
    console.error(`e2e: dsh web ready at ${stripAnsi(launchUrl)}`)
    // Older builds print their URL before the webserver accepts connections, so
    // keep probing the port; DSH_E2E_READY_TIMEOUT_MS raises the window on slow hosts.
    const readyMs = Number(process.env.DSH_E2E_READY_TIMEOUT_MS || 120_000)
    await waitForHttp(url, readyMs).catch(() => {
      console.error(`warning: ${url} did not answer within ${readyMs}ms; continuing`)
    })

    await ensureChromium(env)
    const primed = await primeSession(launchUrl, join(work, 'storage-state.json'))
    if (primed) {
      env.DSH_E2E_STORAGE_STATE = primed.path
      console.error('e2e: primed the browser session cookie from the launch URL')
    }

    // Readiness only — the spec asserts the applied markers, which is the
    // authoritative check. DSH >= 0.1.7 batches client bundles behind
    // `/plugins/??<ids>&rev=<hash>`, so the per-plugin path legitimately 404s
    // there and `/plugins/events` is the better liveness signal.
    const cookie = primed && primed.cookie
    const perPlugin = await waitForStatus(`${url}/plugins/ds-hentai/client.js`, 200, 20_000, cookie).then(() => true).catch(() => false)
    if (perPlugin) {
      console.error('e2e: /plugins/ds-hentai/client.js is served')
    } else {
      const events = await waitForStatus(`${url}/plugins/events`, 200, 15_000, cookie).then(() => true).catch(() => false)
      if (events) console.error('e2e: per-plugin bundle path unused on this DSH; /plugins/events is served')
      else console.error(`warning: no plugin bundle route answered on ${url}; continuing`)
    }

    env.DSH_E2E_URL = url
    env.DSH_E2E_VERSION = args.version
    const code = await runPlaywright(env, args.headed)
    if (code !== 0) process.exit(code)
  } finally {
    log.end()
    await stopChild(child)
    if (process.env.DSH_E2E_KEEP_HOME === '1') {
      console.error(`kept DSH_HOME at ${home}`)
    } else {
      await rm(work, { recursive: true, force: true })
    }
  }
}

async function runPlaywright(env, headed) {
  const args = ['playwright', 'test', '--config', join(root, 'playwright.config.mjs')]
  if (headed) args.push('--headed')
  const result = await run(bin('npx'), [...npxPrefix(env), ...args], { env, cwd: root })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  return result.code
}

await main()

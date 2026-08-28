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
    if (options.tee) {
      child.stdout?.on('data', (chunk) => process.stderr.write(chunk))
      child.stderr?.on('data', (chunk) => process.stderr.write(chunk))
    }
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

function waitForHttp(url, timeoutMs) {
  const started = Date.now()
  return new Promise((resolvePromise, reject) => {
    const tick = () => {
      const req = http.get(url, { timeout: 3000 }, (res) => {
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
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000))
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

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log('Usage: node scripts/e2e-dsh.mjs [--version 0.1.0-rc.6|latest] [--plugin ds-hentai@0.6.0] [--port 43180] [--url http://127.0.0.1:3080] [--headed]')
    process.exit(0)
  }

  const env = {
    ...process.env,
    DSH_E2E_EXPECT_CHROME: process.env.DSH_E2E_EXPECT_CHROME || '1'
  }

  if (args.url) {
    env.DSH_E2E_URL = args.url.replace(/\/$/, '')
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
    const add = await run(bin('npx'), ['-y', dsh, 'plugin', '--profile', 'web', 'add', spec], {
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

    const url = `http://127.0.0.1:${args.port}`
    child = spawnCmd(bin('npx'), ['-y', dsh, 'web', '--no-open', '--host', '127.0.0.1', '--port', String(args.port)], {
      env: { ...process.env, DSH_HOME: home },
      log,
      tee: process.env.DSH_E2E_VERBOSE === '1'
    })

    const ready = waitForHttp(url, 120_000)
    const died = new Promise((_, reject) => {
      child.on('close', (code) => reject(new Error(`dsh web exited before ready (code ${code}). See ${logPath}`)))
    })
    await Promise.race([ready, died])
    await waitForHttp(`${url}/plugins/ds-hentai/client.js`, 30_000).catch(() => {
      console.error(`warning: /plugins/ds-hentai/client.js not reachable yet; continuing against ${url}`)
    })

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
  const install = await run(bin('npx'), ['playwright', 'install', 'chromium'], { env, cwd: root })
  if (install.code !== 0 && process.env.CI === 'true') {
    throw new Error(`playwright install failed: ${install.stderr || install.stdout}`)
  }
  const args = ['playwright', 'test', '--config', join(root, 'playwright.config.mjs')]
  if (headed) args.push('--headed')
  const result = await run(bin('npx'), args, { env, cwd: root })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  return result.code
}

await main()

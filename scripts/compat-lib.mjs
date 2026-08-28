import { mkdir, mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { spawn } from 'node:child_process'
import { loadCatalog, root } from '../test/compat/catalog.mjs'

const TEXT_EXTS = new Set(['.js', '.mjs', '.cjs', '.css', '.ts', '.map', '.json', '.d.ts'])

export function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || root,
      env: options.env || process.env,
      stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      windowsHide: true
    })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (chunk) => { stdout += chunk })
    child.stderr?.on('data', (chunk) => { stderr += chunk })
    child.on('error', reject)
    child.on('close', (code) => {
      resolvePromise({ code: code ?? 1, stdout, stderr })
    })
  })
}

async function walkFiles(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      await walkFiles(full, acc)
    } else {
      acc.push(full)
    }
  }
  return acc
}

function isTextPath(filePath) {
  if (filePath.endsWith('.d.ts')) return true
  return TEXT_EXTS.has(extname(filePath))
}

async function concatPackageText(dir) {
  const files = await walkFiles(dir)
  const parts = []
  for (const file of files) {
    if (!isTextPath(file)) continue
    try {
      parts.push(await readFile(file, 'utf8'))
    } catch {
      // ignore unreadable binaries that slipped through
    }
  }
  return parts.join('\n')
}

export async function listCliVersions(cli) {
  const result = await run('npm', ['view', cli, 'versions', '--json'])
  if (result.code !== 0) {
    const err = new Error(`npm view versions failed for ${cli}: ${result.stderr || result.stdout}`)
    err.offline = isOffline(result)
    throw err
  }
  const parsed = JSON.parse(result.stdout)
  return Array.isArray(parsed) ? parsed : [parsed]
}

export async function resolveVersion(name, spec) {
  const query = spec === 'latest' ? name : `${name}@${spec}`
  const result = await run('npm', ['view', query, 'version', '--silent'])
  if (result.code !== 0) {
    const err = new Error(`npm view failed for ${query}: ${result.stderr || result.stdout}`)
    err.offline = isOffline(result)
    err.notFound = isNotFound(result)
    throw err
  }
  const version = result.stdout.trim().split(/\s+/).pop()
  if (!version) throw new Error(`could not resolve version for ${query}`)
  return version
}

function isOffline(result) {
  return /ENOTFOUND|EAI_AGAIN|network|EPERM|ETIMEDOUT/i.test(`${result.stderr}\n${result.stdout}`)
}

function isNotFound(result) {
  return /404|E404|No matching version|not in this registry/i.test(`${result.stderr}\n${result.stdout}`)
}

export async function packExtract(name, version, parent) {
  const dest = await mkdtemp(join(parent, 'pkg-'))
  const spec = `${name}@${version}`
  const packed = await run('npm', ['pack', spec, '--pack-destination', dest, '--silent'])
  if (packed.code !== 0) {
    const err = new Error(`npm pack failed for ${spec}: ${packed.stderr || packed.stdout}`)
    err.offline = isOffline(packed)
    err.notFound = isNotFound(packed)
    throw err
  }
  const files = (await readdir(dest)).filter((item) => item.endsWith('.tgz'))
  if (!files.length) throw new Error(`npm pack produced no tarball for ${spec}`)
  const tgz = join(dest, files[0])
  const out = join(dest, 'extracted')
  await mkdir(out, { recursive: true })
  const extracted = await run('tar', ['-xf', tgz, '-C', out])
  if (extracted.code !== 0) {
    throw new Error(`tar extract failed for ${spec}: ${extracted.stderr || extracted.stdout}`)
  }
  return out
}

function matchNeedles(haystack, needles) {
  return (needles || []).map((needle) => ({
    id: needle.id,
    layer: needle.layer,
    pattern: needle.pattern,
    hit: haystack.includes(needle.pattern)
  }))
}

function pkgHasStableNeedles(pkg) {
  return (pkg.needles || []).some((needle) => needle.layer === 'stable')
}

export function summarizeProbe(hostRow) {
  const overlay = needleHit(hostRow, 'shell.overlay')
  const locale = needleHit(hostRow, 'locale/change')
  const stableNeedles = allNeedles(hostRow).filter((item) => item.layer === 'stable')
  const stable = stableNeedles.length > 0 && stableNeedles.every((item) => item.hit)
  const cssMatches = ((hostRow.css || [])[0] || {}).matches || []
  const cssHit = cssMatches.filter((item) => item.hit).length
  const cssTotal = cssMatches.length
  let support = 'gallery'
  let l1Face = 'full-rc6'
  if (hostRow.unavailable) {
    support = 'unavailable'
    l1Face = null
  } else if (!stable) {
    support = 'unsupported'
    l1Face = null
  } else if (!overlay) {
    support = 'tokens'
    l1Face = 'no-overlay'
  } else if (!locale) {
    support = 'gallery'
    l1Face = 'no-locale'
  } else if (cssTotal && cssHit < cssTotal) {
    support = 'gallery-partial'
    l1Face = 'full-rc6'
  } else {
    support = 'gallery'
    l1Face = 'full-rc6'
  }
  return {
    overlay,
    locale,
    stable,
    cssHit,
    cssTotal,
    support,
    l1Face,
    missing: allNeedles(hostRow).filter((item) => !item.hit).map((item) => item.id)
  }
}

function allNeedles(hostRow) {
  const rows = []
  for (const pkg of hostRow.packages || []) {
    for (const match of pkg.matches || []) rows.push(match)
  }
  for (const match of ((hostRow.css || [])[0] || {}).matches || []) rows.push(match)
  return rows
}

function needleHit(hostRow, id) {
  return allNeedles(hostRow).some((item) => item.id === id && item.hit)
}

export async function probeVersion(catalog, version, work) {
  const hostRow = {
    id: version,
    requested: version,
    resolved: version,
    packages: [],
    css: [],
    unavailable: false
  }
  const cssParts = []
  let packed = 0
  for (const pkg of catalog.packages) {
    try {
      const extracted = await packExtract(pkg.name, version, work)
      packed += 1
      const text = await concatPackageText(extracted)
      const matches = matchNeedles(text, pkg.needles || [])
      hostRow.packages.push({ name: pkg.name, version, matches })
      if ((catalog.cssScanPackages || []).includes(pkg.id)) cssParts.push(text)
    } catch (err) {
      if (err.notFound) {
        hostRow.packages.push({
          name: pkg.name,
          version,
          missing: true,
          matches: (pkg.needles || []).map((needle) => ({
            id: needle.id,
            layer: needle.layer,
            pattern: needle.pattern,
            hit: false
          }))
        })
        continue
      }
      throw err
    }
  }
  if (packed === 0) hostRow.unavailable = true
  const cssMatches = matchNeedles(cssParts.join('\n'), catalog.cssModuleNeedles || [])
  hostRow.css = [{ version, matches: cssMatches, packages: catalog.cssScanPackages || [] }]
  hostRow.summary = summarizeProbe(hostRow)
  return hostRow
}

export async function probeHosts(catalog, hosts) {
  const warnings = []
  const failures = []
  const report = { ok: true, plugin: catalog.plugin, hosts: [] }
  const work = await mkdtemp(join(tmpdir(), 'ds-hentai-probe-'))
  try {
    for (const host of hosts) {
      const requested = host.version || host.id
      try {
        const version = await resolveVersion(catalog.cli, requested)
        const row = await probeVersion(catalog, version, work)
        row.id = host.id || version
        row.requested = requested
        report.hosts.push(row)
        for (const match of allNeedles(row)) {
          const label = `${row.id} @ ${version} ${match.id}`
          if (!match.hit && match.layer === 'stable') failures.push(`${label}: stable needle missing`)
          if (!match.hit && match.layer === 'best-effort') warnings.push(`${label}: best-effort needle missing`)
        }
      } catch (err) {
        const allowOffline = process.env.CI !== 'true' && process.env.COMPAT_ALLOW_OFFLINE !== '0'
        if (err.offline && allowOffline) {
          warnings.push(`${requested}: skipped (${err.message})`)
          report.hosts.push({ id: host.id || requested, requested, skipped: true })
        } else {
          failures.push(`${requested}: ${err.message}`)
          report.hosts.push({ id: host.id || requested, requested, error: err.message })
        }
      }
    }
  } finally {
    await rm(work, { recursive: true, force: true })
  }
  report.warnings = warnings
  report.failures = failures
  report.ok = failures.length === 0
  return report
}

export { root }

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { listCliVersions, probeVersion, root, run } from './compat-lib.mjs'
import { loadCatalog } from '../test/compat/catalog.mjs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'

const MARK_START = '<!-- compat-matrix:start -->'
const MARK_END = '<!-- compat-matrix:end -->'

function parseArgs(argv) {
  return {
    write: argv.includes('--write'),
    json: argv.includes('--json')
  }
}

async function runL1() {
  const result = await new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, ['--test', '--test-timeout=30000', 'test/compat/l1.test.mjs'], {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', reject)
    child.on('close', (code) => resolvePromise({ code: code ?? 1, stdout, stderr }))
  })
  const passed = [...result.stdout.matchAll(/^✔\s+(.+)$/gm)].map((item) => item[1].trim())
  const failed = [...result.stdout.matchAll(/^✖\s+(.+)$/gm)].map((item) => item[1].trim())
  const faces = {}
  const faceIds = ['full-rc6', 'no-overlay', 'no-locale', 'no-sessions']
  for (const id of faceIds) {
    const hitFail = failed.some((line) => line.includes(id))
    const hitPass = passed.some((line) => line.includes(id))
    faces[id] = hitFail ? 'fail' : hitPass || result.code === 0 ? 'pass' : 'fail'
  }
  return {
    ok: result.code === 0,
    faces,
    passed: passed.length,
    failed: failed.length,
    output: `${result.stdout}\n${result.stderr}`.trim()
  }
}

function cell(ok) {
  if (ok === true) return 'yes'
  if (ok === false) return 'no'
  return '—'
}

function supportLabel(support) {
  return {
    gallery: 'gallery',
    'gallery-partial': 'gallery (css drift)',
    tokens: 'tokens + settings',
    unsupported: 'unsupported',
    unavailable: 'no matching client packages'
  }[support] || support
}

function renderMatrixMarkdown(matrix) {
  const lines = [
    MARK_START,
    '',
    '## Published DSH matrix',
    '',
    `Scanned \`${matrix.cli}\` on ${matrix.scannedAt} (plugin \`${matrix.pluginVersion}\`).`,
    'L2 packs the matching `@deepseek-ai/dsh-client-*` packages for each CLI version.',
    'L1 runs the plugin against the capability face inferred from that L2 result (same fixtures as `npm run test:l1`).',
    `Regenerate with \`npm run test:compat:all\`.`,
    '',
    '| DSH | Support | L1 face | L1 | L2 stable | Overlay | Locale | CSS adapters |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |'
  ]
  for (const row of matrix.versions) {
    const css = row.cssTotal ? `${row.cssHit}/${row.cssTotal}` : '—'
    lines.push(`| \`${row.version}\` | ${supportLabel(row.support)} | ${row.l1Face || '—'} | ${row.l1 || '—'} | ${row.stable ? 'pass' : row.support === 'unavailable' ? '—' : 'fail'} | ${cell(row.overlay)} | ${cell(row.locale)} | ${css} |`)
  }
  lines.push('')
  lines.push('- **gallery** — stable APIs + `shell.overlay`; gallery chrome is expected.')
  lines.push('- **tokens + settings** — stable APIs present, no `shell.overlay`; plugin must keep the palette and General switch.')
  lines.push('- **unsupported** — a stable probe (`theme/change`, `setTheme`, `settings.general.item`) missed.')
  lines.push('- **no matching client packages** — this CLI version has no publish of the web client packages at the same version.')
  lines.push('')
  lines.push(MARK_END)
  return lines.join('\n')
}

function upsertMarkdown(source, block) {
  if (source.includes(MARK_START) && source.includes(MARK_END)) {
    const before = source.slice(0, source.indexOf(MARK_START))
    const after = source.slice(source.indexOf(MARK_END) + MARK_END.length)
    return `${before.trimEnd()}\n\n${block}\n${after.replace(/^\s*\n/, '')}`
  }
  const needle = '## Automated tests'
  const idx = source.indexOf(needle)
  if (idx >= 0) {
    return `${source.slice(0, idx).trimEnd()}\n\n${block}\n\n${source.slice(idx)}`
  }
  return `${source.trimEnd()}\n\n${block}\n`
}

async function writePackage(matrix) {
  const packagePath = join(root, 'package.json')
  const pkg = JSON.parse(await readFile(packagePath, 'utf8'))
  pkg.dshCompatibility = matrix
  await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
}

async function writeCompatDoc(matrix) {
  const docPath = join(root, 'docs/COMPATIBILITY.md')
  const source = await readFile(docPath, 'utf8')
  const next = upsertMarkdown(source, renderMatrixMarkdown(matrix))
  await writeFile(docPath, next.endsWith('\n') ? next : `${next}\n`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const catalog = await loadCatalog()
  try {
    await run('npm', ['run', 'build'])
  } catch {
    // build is best-effort; L1 will fail clearly if lib/client.js is missing
  }

  const l1 = await runL1()
  const versions = await listCliVersions(catalog.cli)
  const work = await mkdtemp(join(tmpdir(), 'ds-hentai-matrix-'))
  const rows = []
  try {
    for (const version of versions) {
      process.stderr.write(`probing ${catalog.cli}@${version}\n`)
      const probed = await probeVersion(catalog, version, work)
      const summary = probed.summary
      const l1Status = !summary.l1Face ? '—' : (l1.ok && l1.faces[summary.l1Face] !== 'fail' ? 'pass' : 'fail')
      const row = {
        version,
        support: summary.support,
        l1Face: summary.l1Face,
        l1: l1Status,
        l2: probed.unavailable ? 'unavailable' : (summary.stable ? 'pass' : 'fail'),
        overlay: probed.unavailable ? null : summary.overlay,
        locale: probed.unavailable ? null : summary.locale,
        stable: probed.unavailable ? null : summary.stable,
        cssHit: summary.cssHit,
        cssTotal: summary.cssTotal
      }
      if (summary.missing.length) row.missing = summary.missing
      rows.push(row)
    }
  } finally {
    await rm(work, { recursive: true, force: true })
  }

  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  const latest = versions[versions.length - 1]
  const matrix = {
    scannedAt: new Date().toISOString(),
    cli: catalog.cli,
    pluginVersion: pkg.version,
    baseline: catalog.baseline,
    installFrom: catalog.installFrom || catalog.baseline,
    peerRange: catalog.peerRange || `>=${catalog.installFrom || catalog.baseline}`,
    latest,
    l1: {
      ok: l1.ok,
      faces: l1.faces
    },
    versions: rows
  }

  if (args.json || !args.write) {
    console.log(JSON.stringify(matrix, null, 2))
  }
  if (args.write) {
    await writePackage(matrix)
    await writeCompatDoc(matrix)
    console.error(`wrote ${rows.length} DSH versions to package.json#dshCompatibility and docs/COMPATIBILITY.md`)
  }
  if (!l1.ok) process.exit(1)
}

await main()

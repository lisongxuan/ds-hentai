import { readFile, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const demoDir = resolve(root, 'dist/demo')
const errors = []

async function mustExist(rel) {
  const file = resolve(demoDir, rel)
  try {
    const info = await stat(file)
    if (!info.isFile() || info.size < 32) errors.push(`${rel} is missing or empty`)
  } catch {
    errors.push(`${rel} is missing`)
  }
}

await mustExist('index.html')
await mustExist('app.js')
await mustExist('host.css')

const html = await readFile(resolve(demoDir, 'index.html'), 'utf8').catch(() => '')
const app = await readFile(resolve(demoDir, 'app.js'), 'utf8').catch(() => '')

if (!html.includes('Static demo') || !html.includes('./app.js')) {
  errors.push('index.html must load app.js and show the static-demo banner')
}
if (!app.includes('__DS_HENTAI_DEMO__')) {
  errors.push('demo boot marker __DS_HENTAI_DEMO__ is missing')
}
if (!app.includes('window.__ModuleLoader__.load')) {
  errors.push('plugin ModuleLoader envelope is missing from the demo bundle')
}
if (!app.includes('factory: (require)')) {
  errors.push('plugin factory is missing from the demo bundle')
}
if (/(^|\n)\s*import\s+[^\n]*from\s+['"]@deepseek-ai\//.test(app)) {
  errors.push('demo bundle must not import DeepSeek Harness packages')
}
if (/wss:\/\//i.test(app) || /api\.deepseek\.com/i.test(app)) {
  errors.push('demo bundle must not include live model or harness endpoints')
}

const maxBytes = 2 * 1024 * 1024
const bytes = Buffer.byteLength(app)
if (bytes > maxBytes) errors.push(`demo app.js exceeds ${maxBytes} bytes (got ${bytes})`)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(JSON.stringify({ ok: true, appBytes: bytes }))

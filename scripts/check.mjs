import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const clientPath = resolve(root, 'lib/client.js')

const bundle = await readFile(clientPath, 'utf8')

const errors = []

if (!bundle.includes('window.__ModuleLoader__.load')) {
  errors.push('bundle must be wrapped in window.__ModuleLoader__.load(...) ')
}

if (/__EXHENTAI_[A-Z_]+__/.test(bundle)) {
  errors.push('unresolved build placeholder remains in the bundle')
}

// The client bundle is a CJS-style factory body; it must not contain ESM import
// statements, which browser module-table factories cannot satisfy.
if (/(^|\n)\s*import\s+[^\n]*from\s+['"]/.test(bundle)) {
  errors.push('bundle contains a top-level ESM import statement')
}

const maxBytes = 300 * 1024
const bytes = Buffer.byteLength(bundle)
if (bytes > maxBytes) {
  errors.push(`bundle exceeds ${maxBytes} bytes (got ${bytes})`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(JSON.stringify({ ok: true, clientBytes: bytes }))

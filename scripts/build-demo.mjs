import { mkdir, copyFile, chmod, readFile, writeFile, unlink } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { build } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'demo')

async function run(args) {
  await new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolveRun()
      else reject(new Error(`node ${args.join(' ')} exited ${code}`))
    })
  })
}

await run([resolve(root, 'scripts/build-client.mjs')])

await mkdir(outDir, { recursive: true })

await build({
  absWorkingDir: root,
  entryPoints: [resolve(root, 'demo-src/boot.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  outfile: resolve(outDir, 'boot.js'),
  jsx: 'automatic',
  logLevel: 'silent',
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})

const boot = await readFile(resolve(outDir, 'boot.js'), 'utf8')
const client = await readFile(resolve(root, 'lib/client.js'), 'utf8')
const app = `${boot}\n;\n${client}\n`
await writeFile(resolve(outDir, 'app.js'), app, 'utf8')
await chmod(resolve(outDir, 'app.js'), 0o644).catch(() => {})
await unlink(resolve(outDir, 'boot.js')).catch(() => {})

/**
 * `copyFile` preserves the source mode. On ACL/FUSE shares (fnOS, some NAS
 * mounts) a source stored as 000 yields an unreadable destination with no ACL
 * entry even for its owner, which broke `npm test` while the file itself was
 * fine. Normalize the copy; a plain filesystem just keeps 644.
 */
async function copyStatic(source, name) {
  const destination = resolve(outDir, name)
  await copyFile(resolve(root, 'demo-src', source), destination)
  await chmod(destination, 0o644).catch(() => {})
}

await copyStatic('index.html', 'index.html')
await copyStatic('skin-host.css', 'host.css')

console.log(JSON.stringify({
  outDir: 'demo',
  bootBytes: Buffer.byteLength(boot),
  clientBytes: Buffer.byteLength(client),
  appBytes: Buffer.byteLength(app)
}))

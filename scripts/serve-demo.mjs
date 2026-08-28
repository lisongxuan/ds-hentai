import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../demo', import.meta.url)))
const port = Number(process.env.PORT) || 4173
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
}

function locate(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0])
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '')
  const file = resolve(root, normalize(relative))
  if (!file.startsWith(root)) return null
  return file
}

const server = createServer(async (req, res) => {
  const file = locate(req.url || '/')
  if (!file) {
    res.writeHead(403).end('Forbidden')
    return
  }
  try {
    const info = await stat(file)
    if (!info.isFile()) throw new Error('not a file')
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
    createReadStream(file).pipe(res)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`ds-hentai static demo: http://127.0.0.1:${port}/`)
})

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const catalogPath = resolve(dirname(fileURLToPath(import.meta.url)), 'catalog.json')
export const clientBundlePath = resolve(root, 'lib/client.js')

export async function loadCatalog() {
  return JSON.parse(await readFile(catalogPath, 'utf8'))
}

export function faceById(catalog, id) {
  const face = (catalog.faces || []).find((item) => item.id === id)
  if (!face) throw new Error(`unknown compat face: ${id}`)
  return face
}

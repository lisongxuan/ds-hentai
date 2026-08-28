import { access, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import vm from 'node:vm'
import { JSDOM } from 'jsdom'
import { clientBundlePath, root } from './catalog.mjs'
import { createMockCtx } from './mock-ctx.mjs'

const require = createRequire(resolve(root, 'package.json'))
const react = require('react')

export async function readBundle() {
  try {
    await access(clientBundlePath)
  } catch {
    throw new Error('lib/client.js is missing; run npm run build first')
  }
  return readFile(clientBundlePath, 'utf8')
}

export function createPluginWorld(bundle) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://127.0.0.1/',
    pretendToBeVisual: true
  })
  const win = dom.window
  const context = {
    window: win,
    document: win.document,
    localStorage: win.localStorage,
    sessionStorage: win.sessionStorage,
    navigator: win.navigator,
    console,
    setTimeout: (...args) => win.setTimeout(...args),
    clearTimeout: (...args) => win.clearTimeout(...args),
    setInterval: (...args) => win.setInterval(...args),
    clearInterval: (...args) => win.clearInterval(...args),
    HTMLElement: win.HTMLElement,
    Node: win.Node,
    MutationObserver: win.MutationObserver,
    requestAnimationFrame: (cb) => win.setTimeout(cb, 16),
    cancelAnimationFrame: (id) => win.clearTimeout(id)
  }
  vm.createContext(context)
  let plugin = null
  win.__ModuleLoader__ = {
    load(entry) {
      if (!entry || typeof entry.factory !== 'function') {
        throw new Error('bundle did not provide a factory')
      }
      plugin = entry.factory((id) => {
        if (id === 'react') return react
        throw new Error(`unexpected require: ${id}`)
      })
    }
  }
  vm.runInContext(bundle, context, { filename: 'lib/client.js' })
  if (!plugin || typeof plugin.apply !== 'function') {
    throw new Error('bundle factory did not export apply')
  }
  return {
    dom,
    win,
    document: win.document,
    plugin,
    destroy() {
      win.close()
    }
  }
}

export async function bootPlugin(face, bundle) {
  const world = createPluginWorld(bundle)
  const harness = createMockCtx(face, world.win)
  world.plugin.apply(harness.ctx)
  return {
    ...world,
    harness,
    dispose() {
      harness.disposeEffects()
      world.destroy()
    }
  }
}

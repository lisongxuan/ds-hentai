import React from 'react'
import { createRoot } from 'react-dom/client'
import { createDemoHost, createDemoRequire } from './host.js'
import { DemoShell } from './shell.jsx'
import { createDemoStore } from './store.js'

window.__DS_HENTAI_DEMO__ = true
document.documentElement.setAttribute('data-dsh-exhentai-demo', 'true')
document.body.classList.add('dsh-ex-demo')

const store = createDemoStore()
const overlayTarget = document.getElementById('dsh-demo-overlay')
const shellTarget = document.getElementById('root')

createRoot(shellTarget).render(React.createElement(DemoShell, { store }))

const noOverlay = new URLSearchParams(window.location.search).has('noOverlay')
if (noOverlay) {
  const banner = document.querySelector('.dsh-ex-demo-banner span')
  if (banner) {
    banner.textContent = 'Simulating DSH 0.0.1-rc.2: no shell.overlay. Tokens + General switch only. Native chrome stays.'
  }
}
const ctx = createDemoHost(store, { overlayTarget, noOverlay })

window.__ModuleLoader__ = {
  load(entry) {
    if (!entry || typeof entry.factory !== 'function') {
      throw new Error('ds-hentai demo: plugin factory missing')
    }
    const plugin = entry.factory(createDemoRequire())
    if (!plugin || typeof plugin.apply !== 'function') {
      throw new Error('ds-hentai demo: plugin.apply missing')
    }
    plugin.apply(ctx)
  }
}

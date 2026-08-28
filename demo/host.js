import React from 'react'
import { createRoot } from 'react-dom/client'
import * as ReactDOM from 'react-dom'

const THEME_ID = 'dsh-exhentai'
const BUILTIN = new Set(['light', 'dark', 'system'])
const LIGHT_TOKENS = {
  '--dsw-alias-bg-base': '#f4f4f5',
  '--dsw-alias-bg-layer-1': '#ececee',
  '--dsw-alias-bg-layer-2': '#e4e4e7',
  '--dsw-alias-bg-layer-3': '#ffffff',
  '--dsw-alias-label-primary': '#1f1f1f',
  '--dsw-alias-label-secondary': '#4b4b4b',
  '--dsw-alias-label-tertiary': '#6f6f6f',
  '--dsw-alias-border-l3': '#8d8d8d',
  '--dsw-alias-button-elevated-fill': '#ffffff'
}

function systemScheme() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'dark'
  }
}

function applyBodyTokens(tokens, scheme) {
  const body = document.body
  const stale = []
  for (const name of Array.prototype.slice.call(body.style)) {
    if (String(name).startsWith('--dsw-')) stale.push(name)
  }
  for (const name of stale) body.style.removeProperty(name)
  if (tokens) {
    for (const key of Object.keys(tokens)) body.style.setProperty(key, tokens[key])
  }
  if (scheme === 'dark') body.setAttribute('data-ds-dark-theme', 'true')
  else body.removeAttribute('data-ds-dark-theme')
}

export function createDemoRequire() {
  return (id) => {
    if (id === 'react') return React
    if (id === 'react-dom') return ReactDOM
    throw new Error(`ds-hentai demo: cannot require "${id}"`)
  }
}

export function createDemoHost(store, options) {
  const overlayTarget = options && options.overlayTarget
  const themes = new Map()
  const effects = []
  const listeners = {
    'theme/change': new Set(),
    'locale/change': new Set()
  }
  let activeId = 'dark'
  let preference = 'dark'
  let overlayRoot = null
  let settingsRoot = null
  const slotItems = { 'settings.general.item': null, 'shell.overlay': null }

  const emit = (name, payload) => {
    const set = listeners[name]
    if (!set) return
    for (const handler of set) {
      try { handler(payload) } catch {}
    }
  }

  const snapshot = () => ({
    active: themes.get(activeId) || { id: activeId, tokens: {}, colorScheme: activeId === 'light' ? 'light' : 'dark' },
    preference
  })

  const paintTheme = () => {
    const live = snapshot().active
    if (live.id === THEME_ID) {
      applyBodyTokens(live.tokens, live.colorScheme || 'dark')
      return
    }
    const scheme = live.id === 'system' ? systemScheme() : (live.id === 'light' ? 'light' : 'dark')
    applyBodyTokens(scheme === 'light' ? LIGHT_TOKENS : null, scheme)
  }

  const theme = {
    register(spec) {
      if (spec && spec.id) themes.set(spec.id, spec)
      return () => { if (spec && spec.id) themes.delete(spec.id) }
    },
    setTheme(id) {
      const next = String(id || '')
      if (BUILTIN.has(next)) {
        preference = next
        activeId = next
      } else {
        activeId = next
      }
      paintTheme()
      emit('theme/change', snapshot())
    },
    getTheme() {
      return snapshot()
    }
  }

  const locale = {
    dicts: Object.create(null),
    register(ns, dicts) {
      this.dicts[ns] = dicts || {}
      return () => { delete this.dicts[ns] }
    },
    bind(ns) {
      return (key, params) => {
        const pack = this.dicts[ns] || {}
        const id = String(store.get().locale || 'en').toLowerCase()
        const dict = (id.startsWith('zh') ? pack.zh : pack.en) || pack.en || pack.zh || {}
        let text = dict[key] || key
        if (params) {
          text = String(text).replace(/\{(\w+)\}/g, (match, name) => (
            Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
          ))
        }
        return text
      }
    },
    list() {
      return [
        { id: 'en', label: 'English' },
        { id: 'zh', label: '中文' }
      ]
    },
    getLocale() { return store.get().locale },
    setLocale(id) {
      store.setLocale(id)
      emit('locale/change', { locale: id })
      return true
    },
    set(id) { return this.setLocale(id) }
  }

  const renderSlot = (name) => {
    const entry = slotItems[name]
    if (!entry) return
    const props = typeof entry.descriptor.inject === 'function' ? entry.descriptor.inject() : {}
    if (name === 'shell.overlay') {
      if (!overlayTarget) return
      if (!overlayRoot) overlayRoot = createRoot(overlayTarget)
      overlayRoot.render(React.createElement(entry.Component, props))
      return
    }
    if (name === 'settings.general.item') {
      const target = document.getElementById('dsh-demo-settings-slot')
      if (!target) return
      if (!settingsRoot) settingsRoot = createRoot(target)
      settingsRoot.render(React.createElement(entry.Component, props))
    }
  }

  const slots = {
    inject(name, factory) {
      if (name === 'shell.overlay' && options && options.noOverlay) {
        throw new Error('slot not declared: shell.overlay')
      }
      if (typeof factory === 'function') factory()
    },
    register(descriptor, Component) {
      const name = descriptor && descriptor.name
      if (!name) return () => {}
      slotItems[name] = { descriptor, Component }
      renderSlot(name)
      return () => {
        slotItems[name] = null
        if (name === 'shell.overlay' && overlayRoot) overlayRoot.render(null)
        if (name === 'settings.general.item' && settingsRoot) settingsRoot.render(null)
      }
    }
  }

  const sessions = {
    list: {
      getSnapshot() {
        const live = store.get()
        const byId = Object.create(null)
        for (const item of live.sessions) byId[item.id] = item
        return { byId, ids: live.sessions.map((item) => item.id), currentId: live.currentId }
      }
    },
    getSnapshot() { return this.list.getSnapshot() },
    select: (id) => store.select(id),
    setCurrent: (id) => store.select(id),
    open: (id) => store.select(id),
    create: () => store.create(),
    fork: (opts) => store.fork(opts || {}),
    scope: (sessionId) => ({
      conversation: {
        send: (text) => store.send(text, sessionId)
      }
    }),
    binding: (sessionId) => ({
      session: {
        rename: (title) => store.rename(sessionId, title),
        command: (line) => store.command(sessionId, line),
        projections: {
          faceOf(key) {
            return {
              getSnapshot() {
                const row = store.get().sessions.find((item) => item.id === sessionId)
                if (key === 'permissions') return store.readPermission(sessionId)
                if (key === 'sessionStats') return (row && row.stats) || null
                if (key === 'tokenUsage') return (row && row.tokens) || null
                return null
              }
            }
          }
        }
      }
    })
  }

  const workspaces = {
    list: { getSnapshot: () => store.get().workspaces },
    archiveSession: (sessionId) => store.archive(sessionId)
  }

  const modelDirectories = {
    directoryFor(sessionId) {
      return {
        load: async () => {},
        select: async (payload) => { store.selectModel(sessionId, payload) },
        store: { getSnapshot: () => store.get().models }
      }
    }
  }

  const layout = {
    open(name) {
      if (name === 'settings') store.openSettings()
    },
    show(name) { this.open(name) },
    close(name) {
      if (name === 'settings') store.closeSettings()
    },
    hide(name) { this.close(name) }
  }

  const connection = {
    getSnapshot: () => ({ state: 'connected', status: 'connected (demo)' })
  }

  const ctx = {
    theme,
    locale,
    slots,
    sessions,
    workspaces,
    modelDirectories,
    layout,
    connection,
    get(name) { return ctx[name] || null },
    effect(setup) {
      let dispose
      try { dispose = setup() } catch {}
      if (typeof dispose === 'function') effects.push(dispose)
      return () => { if (typeof dispose === 'function') dispose() }
    },
    on(name, handler) {
      if (!listeners[name]) listeners[name] = new Set()
      listeners[name].add(handler)
      return () => listeners[name].delete(handler)
    }
  }

  const paintSettings = () => {
    if (!store.get().settingsOpen) {
      if (settingsRoot) {
        settingsRoot.unmount()
        settingsRoot = null
      }
      return
    }
    window.requestAnimationFrame(() => renderSlot('settings.general.item'))
  }
  store.subscribe(paintSettings)
  if (typeof window !== 'undefined') {
    window.addEventListener('dsh-demo-settings-slot', paintSettings)
  }

  ctx.dispose = () => {
    for (const dispose of effects.splice(0)) {
      try { dispose() } catch {}
    }
    if (overlayRoot) overlayRoot.unmount()
    if (settingsRoot) settingsRoot.unmount()
  }

  return ctx
}

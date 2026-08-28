const THEME_ID = 'dsh-exhentai'

function faceSessions() {
  const snapshot = {
    sessions: [
      { id: 's1', title: 'Hello session', tags: ['chat'], selected: true }
    ],
    currentId: 's1'
  }
  return {
    list: {
      getSnapshot: () => snapshot
    },
    getSnapshot: () => snapshot,
    select(id) { snapshot.currentId = id },
    create() { return { id: 's2' } }
  }
}

function faceLocale() {
  const dicts = new Map()
  let current = 'zh'
  return {
    register(ns, pack) {
      dicts.set(ns, pack)
      return () => dicts.delete(ns)
    },
    bind(ns) {
      return (key) => {
        const pack = dicts.get(ns) || {}
        const table = pack[current] || pack.zh || pack.en || {}
        return table[key] || key
      }
    },
    getLocale: () => current,
    setLocale(id) { current = id },
    list: () => [{ id: 'zh', label: '中文' }, { id: 'en', label: 'English' }]
  }
}

export function createMockCtx(face, win) {
  let activeId = 'dark'
  let preference = 'dark'
  const themeHistory = []
  const effects = []
  const listeners = new Map()
  const slots = []
  const locale = face.locale ? faceLocale() : null
  const sessions = face.sessions ? faceSessions() : null
  const workspaces = face.sessions
    ? { archiveSession: async () => {}, list: { getSnapshot: () => ({ items: [] }) } }
    : null
  const connection = face.sessions
    ? { getSnapshot: () => ({ state: 'connected' }) }
    : null

  const theme = {
    register(spec) {
      themeHistory.push({ op: 'register', spec })
      return () => { themeHistory.push({ op: 'unregister', id: spec && spec.id }) }
    },
    setTheme(id) {
      themeHistory.push({ op: 'setTheme', id })
      activeId = id
      if (id === 'light' || id === 'dark' || id === 'system') preference = id
      const snapshot = theme.getTheme()
      for (const handler of listeners.get('theme/change') || []) handler(snapshot)
    },
    getTheme() {
      return {
        active: { id: activeId },
        preference
      }
    }
  }

  const ctx = {
    theme,
    locale,
    sessions,
    workspaces,
    connection,
    layout: {
      open() { return true },
      close() { return true },
      show() { return true },
      hide() { return true }
    },
    get(name) {
      if (name === 'theme') return theme
      if (name === 'locale') return locale
      if (name === 'sessions') return sessions
      if (name === 'workspaces') return workspaces
      if (name === 'connection') return connection
      return null
    },
    on(event, handler) {
      const list = listeners.get(event) || []
      list.push(handler)
      listeners.set(event, list)
      return () => {
        const next = (listeners.get(event) || []).filter((item) => item !== handler)
        listeners.set(event, next)
      }
    },
    effect(fn, label) {
      const dispose = fn()
      const entry = {
        label,
        dispose: () => {
          if (typeof dispose === 'function') dispose()
        }
      }
      effects.push(entry)
      return entry.dispose
    },
    slots: {
      inject(name, factory) {
        if (name === 'shell.overlay' && !face.overlay) {
          throw new Error('slot not declared: shell.overlay')
        }
        return factory()
      },
      register(meta, component) {
        const hooks = typeof meta.inject === 'function' ? meta.inject() : {}
        const row = { name: meta.name, id: meta.id, meta, hooks, component }
        slots.push(row)
        return () => {
          const index = slots.indexOf(row)
          if (index >= 0) slots.splice(index, 1)
        }
      }
    }
  }

  void win

  return {
    ctx,
    themeHistory,
    listeners,
    effects,
    slots,
    locale,
    sessions,
    slot(name) {
      return slots.find((item) => item.name === name) || null
    },
    emit(event, payload) {
      for (const handler of listeners.get(event) || []) handler(payload)
    },
    disposeEffects() {
      for (let i = effects.length - 1; i >= 0; i -= 1) effects[i].dispose()
    }
  }
}

export { THEME_ID }

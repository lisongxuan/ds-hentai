import {
  CANNED_REPLY,
  COMMAND_REPLY,
  MESSAGES,
  MODEL_DIRECTORY,
  PERMISSION_OPTIONS,
  SESSIONS,
  WORKSPACES
} from './fixtures.js'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function sessionRecord(item, currentId) {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle || '',
    updatedAt: item.updatedAt,
    cwd: item.cwd || '',
    model: item.model || '',
    workspace: item.workspace || '',
    tags: Array.isArray(item.tags) ? item.tags.slice() : [],
    messageCount: item.messageCount || (item.messages && item.messages.length) || 0,
    selected: item.id === currentId,
    permission: item.permission || 'workspace-write',
    stats: item.stats || null,
    tokens: item.tokens || null,
    provider: item.provider || 'demo',
    modelId: item.modelId || 'demo-static',
    reasoningEffort: item.reasoningEffort || 'medium',
    projectionValues: {
      sessionStats: item.stats || null,
      tokenUsage: item.tokens || null,
      tags: item.tags
    }
  }
}

export function createDemoStore() {
  const initialCurrent = SESSIONS[0].id
  let state = {
    currentId: initialCurrent,
    sessions: SESSIONS.map((item) => sessionRecord(item, initialCurrent)),
    messages: clone(MESSAGES),
    drafts: {},
    workspaces: clone(WORKSPACES),
    models: clone(MODEL_DIRECTORY),
    preset: 'Standard mode',
    locale: 'en',
    settingsOpen: false,
    workspaceOpen: false,
    notice: null
  }
  const listeners = new Set()

  const notify = () => {
    for (const listener of listeners) listener()
  }
  const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  const getSnapshot = () => state
  const setState = (next) => {
    state = next
    notify()
  }
  const update = (patch) => {
    setState(Object.assign({}, state, typeof patch === 'function' ? patch(state) : patch))
  }

  const current = () => state.sessions.find((item) => item.id === state.currentId) || null

  const select = (sessionId) => {
    if (!sessionId || !state.sessions.some((item) => item.id === sessionId)) return false
    update({
      currentId: sessionId,
      sessions: state.sessions.map((item) => Object.assign({}, item, { selected: item.id === sessionId })),
      settingsOpen: false,
      workspaceOpen: false
    })
    return true
  }

  const create = (title) => {
    const id = `s-new-${Date.now().toString(36)}`
    const row = sessionRecord({
      id,
      title: title || 'Untitled gallery',
      subtitle: 'Created in the static demo',
      updatedAt: Date.now(),
      cwd: '/demo',
      model: 'Static (no API)',
      workspace: 'playground',
      tags: ['chat'],
      messageCount: 0,
      permission: 'workspace-write',
      modelId: 'demo-static',
      provider: 'demo'
    }, id)
    const workspaces = clone(state.workspaces)
    const play = workspaces.items.find((item) => item.id === 'ws-play')
    if (play) play.sessionIds = [id].concat(play.sessionIds)
    update({
      currentId: id,
      sessions: [row].concat(state.sessions.map((item) => Object.assign({}, item, { selected: false }))),
      messages: Object.assign({}, state.messages, { [id]: [] }),
      workspaces,
      settingsOpen: false,
      workspaceOpen: false
    })
    return id
  }

  const rename = (sessionId, title) => {
    const next = String(title || '').trim()
    if (!sessionId || !next) return { ok: false, error: { message: 'title required' } }
    update({
      sessions: state.sessions.map((item) => (
        item.id === sessionId ? Object.assign({}, item, { title: next, updatedAt: Date.now() }) : item
      ))
    })
    return { ok: true }
  }

  const fork = ({ sessionId, increaseTitle }) => {
    const src = state.sessions.find((item) => item.id === sessionId)
    if (!src) return null
    const id = `s-fork-${Date.now().toString(36)}`
    const title = increaseTitle ? `${src.title} (fork)` : src.title
    const row = sessionRecord(Object.assign({}, src, {
      id,
      title,
      updatedAt: Date.now(),
      messageCount: (state.messages[sessionId] || []).length
    }), id)
    update({
      currentId: id,
      sessions: [row].concat(state.sessions.map((item) => Object.assign({}, item, { selected: false }))),
      messages: Object.assign({}, state.messages, { [id]: clone(state.messages[sessionId] || []) }),
      drafts: Object.assign({}, state.drafts, { [id]: (state.drafts[sessionId] || []).slice() })
    })
    return id
  }

  const archive = (sessionId) => {
    const remaining = state.sessions.filter((item) => item.id !== sessionId)
    const nextId = state.currentId === sessionId
      ? (remaining[0] && remaining[0].id) || null
      : state.currentId
    const workspaces = clone(state.workspaces)
    workspaces.archivedSessionIds = workspaces.archivedSessionIds.concat(sessionId)
    for (const item of workspaces.items) {
      item.sessionIds = item.sessionIds.filter((id) => id !== sessionId)
    }
    update({
      currentId: nextId,
      sessions: remaining.map((item) => Object.assign({}, item, { selected: item.id === nextId })),
      workspaces
    })
    return true
  }

  const appendMessage = (sessionId, role, text) => {
    const lines = (state.messages[sessionId] || []).concat([{ role, text }])
    const messages = Object.assign({}, state.messages, { [sessionId]: lines })
    const sessions = state.sessions.map((item) => {
      if (item.id !== sessionId) return item
      const stats = Object.assign({}, item.stats || {}, {
        turns: Math.ceil(lines.filter((row) => row.role === 'user').length)
      })
      return Object.assign({}, item, {
        messageCount: lines.length,
        updatedAt: Date.now(),
        stats,
        projectionValues: Object.assign({}, item.projectionValues, { sessionStats: stats })
      })
    })
    update({ messages, sessions })
  }

  const send = (text, sessionId) => {
    const id = sessionId || state.currentId
    const trimmed = String(text || '').trim()
    if (!id || !trimmed) return false
    appendMessage(id, 'user', trimmed)
    if (/^\/[A-Za-z][\w-]*/.test(trimmed)) {
      appendMessage(id, 'assistant', COMMAND_REPLY(trimmed))
    } else {
      appendMessage(id, 'assistant', CANNED_REPLY)
    }
    return true
  }

  const attach = (fileList, sessionId) => {
    const id = sessionId || state.currentId
    if (!id) return false
    const names = Array.prototype.map.call(fileList || [], (file) => file && file.name).filter(Boolean)
    if (!names.length) return false
    const drafts = Object.assign({}, state.drafts, {
      [id]: (state.drafts[id] || []).concat(names)
    })
    update({ drafts })
    appendMessage(id, 'assistant', `Demo: queued ${names.join(', ')}. Files are not uploaded or sent to a model.`)
    return true
  }

  const listDrafts = (sessionId) => (state.drafts[sessionId] || []).slice()

  const setPermission = (sessionId, preset) => {
    if (!sessionId || !preset) return false
    update({
      sessions: state.sessions.map((item) => (
        item.id === sessionId ? Object.assign({}, item, { permission: preset }) : item
      ))
    })
    return true
  }

  const readPermission = (sessionId) => {
    const row = state.sessions.find((item) => item.id === sessionId)
    return {
      currentValue: (row && row.permission) || 'workspace-write',
      options: PERMISSION_OPTIONS.slice()
    }
  }

  const selectModel = (sessionId, selection) => {
    if (!sessionId || !selection || selection.model == null) return false
    const groups = state.models.groups || []
    const group = groups.find((item) => item.id === selection.provider) || groups[0]
    const model = ((group && group.models) || []).find((item) => item.id === selection.model)
    const label = (model && model.name) || selection.model
    const models = clone(state.models)
    models.current = {
      provider: selection.provider || (group && group.id) || '',
      model: selection.model,
      reasoningEffort: selection.reasoningEffort || selection.effort || (models.current && models.current.reasoningEffort) || ''
    }
    update({
      models,
      sessions: state.sessions.map((item) => (
        item.id === sessionId
          ? Object.assign({}, item, {
            model: label,
            modelId: selection.model,
            provider: models.current.provider,
            reasoningEffort: models.current.reasoningEffort
          })
          : item
      ))
    })
    return true
  }

  const command = (sessionId, line) => {
    const trimmed = String(line || '').trim()
    if (!sessionId || !trimmed) return { ok: false }
    if (trimmed.startsWith('/permission ')) {
      const preset = trimmed.slice('/permission '.length).trim()
      setPermission(sessionId, preset)
      appendMessage(sessionId, 'assistant', COMMAND_REPLY(trimmed))
      return { ok: true, value: { matched: true } }
    }
    send(trimmed, sessionId)
    return { ok: true, value: { matched: true } }
  }

  const setNotice = (message) => {
    update({ notice: message || null })
  }

  return {
    subscribe,
    getSnapshot,
    get: getSnapshot,
    current,
    select,
    create,
    rename,
    fork,
    archive,
    send,
    attach,
    listDrafts,
    setPermission,
    readPermission,
    selectModel,
    command,
    setNotice,
    openSettings: () => update({ settingsOpen: true, workspaceOpen: false }),
    closeSettings: () => update({ settingsOpen: false }),
    openWorkspace: () => update({ workspaceOpen: true, settingsOpen: false }),
    closeWorkspace: () => update({ workspaceOpen: false }),
    setPreset: (label) => update({ preset: String(label || '') }),
    setLocale: (id) => update({ locale: String(id || 'en') })
  }
}

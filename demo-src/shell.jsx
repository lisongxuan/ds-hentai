import React, { useEffect, useRef, useSyncExternalStore } from 'react'

const PRESETS = ['Standard mode', 'PTC mode', 'Minimal mode', 'Creator mode']

function rowClass(session, currentId) {
  return session.id === currentId ? 'dshDemo_sessionRow dshDemo_selected' : 'dshDemo_sessionRow'
}

export function DemoShell({ store }) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const current = state.sessions.find((item) => item.id === state.currentId) || null
  const messages = (current && state.messages[current.id]) || []
  const composerRef = useRef(null)

  useEffect(() => {
    if (!state.notice) return undefined
    const timer = window.setTimeout(() => store.setNotice(null), 4200)
    return () => window.clearTimeout(timer)
  }, [state.notice, store])

  useEffect(() => {
    if (!state.settingsOpen) return undefined
    window.dispatchEvent(new Event('dsh-demo-settings-slot'))
    return undefined
  }, [state.settingsOpen])

  const sendNative = () => {
    const node = composerRef.current
    const text = node ? node.value : ''
    if (store.send(text, state.currentId) && node) node.value = ''
  }

  return (
    React.createElement('div', { className: 'dshDemo_frame', id: 'dsh-demo-frame' },
      React.createElement('aside', { className: 'dshDemo_sidebarCol dshDemo_sidebar' },
        React.createElement('div', { className: 'dshDemo_brand dshDemo_rail' },
          React.createElement('strong', null, 'deepseek'),
          ' HARNESS',
          React.createElement('span', { className: 'dshDemo_brandNote' }, ' demo')
        ),
        React.createElement('button', {
          type: 'button',
          className: 'dshDemo_newSession',
          'aria-label': 'New session',
          onClick: () => store.create()
        }, 'New session'),
        React.createElement('div', { className: 'dshDemo_sectionLabel' }, 'Sessions'),
        state.sessions.map((session) => (
          React.createElement('button', {
            key: session.id,
            type: 'button',
            className: rowClass(session, state.currentId),
            'data-id': session.id,
            'aria-selected': session.id === state.currentId,
            onClick: () => store.select(session.id)
          },
            React.createElement('span', { className: 'dshDemo_title' }, session.title),
            React.createElement('span', { className: 'dshDemo_time' }, new Date(session.updatedAt).toISOString().slice(0, 16).replace('T', ' '))
          )
        )),
        React.createElement('button', {
          type: 'button',
          className: 'dshDemo_trigger dshDemo_rail',
          'aria-label': 'Workspaces',
          onClick: () => (state.workspaceOpen ? store.closeWorkspace() : store.openWorkspace())
        }, 'Workspaces'),
        React.createElement('button', {
          type: 'button',
          className: 'dshDemo_trigger dshDemo_rail',
          'aria-label': 'Settings',
          'aria-expanded': state.settingsOpen ? 'true' : 'false',
          onClick: () => (state.settingsOpen ? store.closeSettings() : store.openSettings())
        }, 'Settings'),
        React.createElement('button', {
          type: 'button',
          className: 'dshDemo_preset',
          'aria-label': `Agent preset for this session: ${state.preset}`
        }, state.preset),
        React.createElement('div', { role: 'menu', className: 'dshDemo_presetMenu', 'aria-label': 'Agent presets' },
          PRESETS.map((label) => React.createElement('button', {
            key: label,
            type: 'button',
            role: 'menuitem',
            onClick: () => store.setPreset(label)
          }, label))
        ),
        state.settingsOpen
          ? React.createElement('div', {
            className: 'dshDemo_settings dshDemo_dialog',
            role: 'dialog',
            'aria-label': 'Host Settings'
          },
            React.createElement('div', { className: 'dshDemo_dialogHead' },
              React.createElement('h2', { className: 'dshDemo_sectionTitle' }, 'Host Settings'),
              React.createElement('button', {
                type: 'button',
                className: 'dshDemo_close',
                'aria-label': 'Close',
                onClick: () => store.closeSettings()
              }, '×')
            ),
            React.createElement('p', { className: 'dshDemo_dim' },
              'Plugin Market, provider API keys, and configuration files are not available in this static preview.'
            ),
            React.createElement('button', {
              type: 'button',
              onClick: () => store.setNotice('Demo: configuration files are not available.')
            }, 'Open configuration file'),
            React.createElement('div', { id: 'dsh-demo-settings-slot' })
          )
          : null
      ),
      React.createElement('div', { className: 'dshDemo_handle', 'aria-hidden': 'true' }),
      React.createElement('main', { className: 'dshDemo_centerCol' },
        React.createElement('header', { className: 'dshDemo_header' },
          React.createElement('div', { className: 'dshDemo_titleRow' },
            React.createElement('span', { className: 'dshDemo_crumb' }, 'Demo'),
            React.createElement('span', { className: 'dshDemo_crumbSep' }, ' / '),
            React.createElement('span', { className: 'dshDemo_crumbCurrent' }, current ? current.title : 'No session')
          ),
          React.createElement('div', { className: 'dshDemo_fallbackNav' },
            React.createElement('button', {
              type: 'button',
              className: 'dshDemo_primary',
              onClick: () => store.openSettings()
            }, 'Host Settings')
          )
        ),
        React.createElement('div', { className: 'dshDemo_thread', 'aria-label': 'Conversation' },
          messages.length === 0
            ? React.createElement('p', { className: 'dshDemo_dim' }, 'No messages in this session. Use Search on the skin composer, or the native box below.')
            : messages.map((item, index) => (
              React.createElement('article', {
                key: `${item.role}-${index}`,
                className: item.role === 'user' ? 'dshDemo_user_bubble' : 'dshDemo_assistant_bubble'
              }, item.text)
            ))
        ),
        React.createElement('div', { className: 'dshDemo_composerSeat' },
          React.createElement('textarea', {
            ref: composerRef,
            rows: 3,
            placeholder: 'Native composer (shown when the skin composer is off)',
            'aria-label': 'Prompt'
          }),
          React.createElement('button', {
            type: 'button',
            className: 'dshDemo_primary',
            'aria-label': 'Send',
            onClick: sendNative
          }, 'Send')
        )
      ),
      React.createElement('aside', { className: 'dshDemo_detailsCol dshDemo_details' },
        React.createElement('h2', null, 'Details'),
        current
          ? React.createElement('table', null,
            React.createElement('tbody', null,
              React.createElement('tr', null, React.createElement('th', null, 'Workspace'), React.createElement('td', null, current.workspace || '—')),
              React.createElement('tr', null, React.createElement('th', null, 'Model'), React.createElement('td', null, current.model || '—')),
              React.createElement('tr', null, React.createElement('th', null, 'Access'), React.createElement('td', null, current.permission || '—')),
              React.createElement('tr', null, React.createElement('th', null, 'Messages'), React.createElement('td', null, String(current.messageCount || 0)))
            )
          )
          : React.createElement('p', { className: 'dshDemo_dim' }, 'Select a session.')
      ),
      state.workspaceOpen
        ? React.createElement('div', {
          className: 'dshDemo_settings dshDemo_dialog dshDemo_workspace',
          role: 'dialog',
          'aria-label': 'Workspaces'
        },
          React.createElement('div', { className: 'dshDemo_dialogHead' },
            React.createElement('h2', { className: 'dshDemo_sectionTitle' }, 'Workspaces'),
            React.createElement('button', {
              type: 'button',
              className: 'dshDemo_close',
              'aria-label': 'Close',
              onClick: () => store.closeWorkspace()
            }, '×')
          ),
          React.createElement('p', { className: 'dshDemo_dim' }, 'Display-only. The demo does not open folders or run a harness.'),
          (state.workspaces.items || []).map((item) => (
            React.createElement('p', { key: item.id },
              React.createElement('strong', null, item.title),
              ` — ${item.sessionIds.length} session${item.sessionIds.length === 1 ? '' : 's'}`
            )
          ))
        )
        : null,
      state.notice
        ? React.createElement('div', { className: 'dshDemo_toast', role: 'status' }, state.notice)
        : null
    )
  )
}

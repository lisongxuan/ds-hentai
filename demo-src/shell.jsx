import React, { useEffect, useRef, useSyncExternalStore } from 'react'

const PRESETS = ['Standard mode', 'PTC mode', 'Minimal mode', 'Creator mode']

function rowClass(session, currentId) {
  return session.id === currentId ? 'dshDemo_sessionRow dshDemo_selected' : 'dshDemo_sessionRow'
}

// --- Fake right sidebar (DSH's dockkit surface) ---------------------------
// Mirrors the real host's semantic contract so the skin's right-sidebar CSS
// has something to style: data-sidebar-right-panel / -guide / -guide-entry,
// the dockkit tab strip, and the files / terminal panes. The panel element
// stays mounted when closed (only [data-sidebar-right-open] goes away), which
// is what makes the skin's open-state gating observable here.

const FILE_ROWS = [
  { kind: 'dir', name: 'src', size: '' },
  { kind: 'dir', name: 'test', size: '' },
  { kind: 'file', name: 'README.md', size: '3.1 kB' },
  { kind: 'file', name: 'package.json', size: '1.9 kB' },
  { kind: 'file', name: 'skin.css', size: '49.2 kB' }
]

const TERMINAL_LINES = [
  'Microsoft Windows [Version 10.0.26100.3476]',
  '(c) Microsoft Corporation. All rights reserved.',
  '',
  'D:\\demo\\playground> dir',
  ' Directory of D:\\demo\\playground',
  '',
  '08/28/2026  09:14 AM    <DIR>          src',
  '08/28/2026  09:14 AM             3,172 README.md',
  '08/28/2026  09:14 AM             1,940 package.json',
  'D:\\demo\\playground> _'
]

function entryIcon(kind) {
  const base = {
    className: 'dshDemo_entryIcon',
    viewBox: '0 0 24 24',
    width: 22,
    height: 22,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  }
  if (kind === 'terminal') {
    return React.createElement('svg', base,
      React.createElement('path', { d: 'M5 8l4 4-4 4' }),
      React.createElement('path', { d: 'M12 16h7' })
    )
  }
  return React.createElement('svg', base,
    React.createElement('path', { d: 'M4 6h6l2 2h8v10H4z' }),
    React.createElement('path', { d: 'M4 10h16' })
  )
}

function guidePane(store) {
  return React.createElement('section', {
    className: 'dshDemo_pane',
    'data-dockkit-pane': 'push',
    'data-dockkit-pane-active': 'true'
  },
    React.createElement('div', { className: 'dshDemo_guide', 'data-sidebar-right-guide': 'true' },
      React.createElement('span', { className: 'dshDemo_hero' }, 'Get started'),
      React.createElement('div', { className: 'dshDemo_entryCell' },
        React.createElement('button', {
          type: 'button',
          className: 'dshDemo_entry',
          'data-sidebar-right-guide-entry': 'files',
          onClick: () => store.openRightPane('files')
        },
          entryIcon('files'),
          React.createElement('span', { className: 'dshDemo_entryText' },
            React.createElement('span', { className: 'dshDemo_entryTitle' }, 'Workspace files'),
            React.createElement('span', { className: 'dshDemo_entryDescription' }, 'Browse files in the session workspace')
          )
        )
      ),
      React.createElement('div', { className: 'dshDemo_entryCell' },
        React.createElement('div', {
          className: 'dshDemo_entry dshDemo_entryWide',
          'data-sidebar-right-guide-entry': 'terminal'
        },
          React.createElement('button', {
            type: 'button',
            className: 'dshDemo_entryMain',
            onClick: () => store.openRightPane('terminal')
          },
            entryIcon('terminal'),
            React.createElement('span', { className: 'dshDemo_text' },
              React.createElement('span', { className: 'dshDemo_title' }, 'New terminal'),
              React.createElement('span', { className: 'dshDemo_description' }, 'Run commands in the session workspace')
            )
          ),
          React.createElement('button', {
            type: 'button',
            className: 'dshDemo_entryTrigger',
            'aria-label': 'Terminal options',
            onClick: () => store.setNotice('Demo: terminal options are not available.')
          }, '⌄')
        )
      )
    )
  )
}

function filesPane(store) {
  return React.createElement('section', {
    className: 'dshDemo_pane',
    'data-dockkit-pane': 'push',
    'data-dockkit-pane-active': 'true'
  },
    React.createElement('div', { className: 'dshDemo_files', 'data-files-state': 'ready' },
      React.createElement('div', { className: 'dshDemo_filesBand' },
        React.createElement('span', { className: 'dshDemo_filesPath', 'data-files-path': 'true' }, 'D:\\demo\\playground'),
        React.createElement('button', {
          type: 'button',
          className: 'dshDemo_iconBtn',
          'data-files-reload': 'true',
          'aria-label': 'Reload',
          onClick: () => store.setNotice('Demo: reload is a no-op in the static preview.')
        }, '⟳')
      ),
      React.createElement('div', { className: 'dshDemo_filesBody', 'data-files-body': 'true' },
        FILE_ROWS.map((row) => React.createElement('div', {
          key: row.name,
          className: 'dshDemo_filesRow',
          'data-files-row': row.name
        },
          React.createElement('span', { className: 'dshDemo_filesEntry', 'data-files-entry': row.name },
            row.kind === 'dir' ? `${row.name}\\` : row.name),
          React.createElement('span', { className: 'dshDemo_filesSize' }, row.size)
        ))
      ),
      React.createElement('code', { className: 'dshDemo_filesCode', 'data-files-code': 'true' },
        'Static preview: no filesystem access.')
    )
  )
}

function terminalPane() {
  return React.createElement('section', {
    className: 'dshDemo_pane',
    'data-dockkit-pane': 'push',
    'data-dockkit-pane-active': 'true'
  },
    React.createElement('div', { className: 'dshDemo_terminal', 'data-sidebar-terminal': 'true' },
      React.createElement('div', { className: 'dshDemo_screen' },
        TERMINAL_LINES.map((line, index) => React.createElement('div', { key: index }, line || '\u00a0'))
      )
    )
  )
}

function DemoRightSidebar({ state, store }) {
  const bar = state.rightSidebar
  const tabs = bar.tabs
  const activeTab = tabs.find((tab) => tab.id === bar.active) || tabs[0]
  const attrs = {
    className: 'dshDemo_rightSidebar',
    'data-sidebar-right-panel': 'push',
    'data-sidebar-right-region-nudge': 'true'
  }
  if (bar.open) attrs['data-sidebar-right-open'] = 'true'

  return React.createElement('aside', attrs,
    bar.open
      ? React.createElement('div', {
        className: 'dshDemo_dockkitSurface',
        'data-dockkit-surface': 'push',
        'data-dockkit-host': 'dock',
        'data-dockkit-column': 'right'
      },
        React.createElement('header', { className: 'dshDemo_strip', 'data-dockkit-strip': 'true' },
          React.createElement('div', { className: 'dshDemo_stripTabs', 'data-dockkit-strip-tabs': 'true' },
            tabs.map((tab) => React.createElement('div', {
              key: tab.id,
              className: tab.id === activeTab.id ? 'dshDemo_tab dshDemo_tabActive' : 'dshDemo_tab',
              'data-dockkit-tab': tab.id,
              role: 'tab',
              'aria-selected': tab.id === activeTab.id ? 'true' : 'false',
              onClick: () => store.activateRightTab(tab.id)
            },
              React.createElement('span', { className: 'dshDemo_tabTitle', 'data-dockkit-tab-title': 'true' }, tab.title),
              tab.id === 'guide'
                ? null
                : React.createElement('button', {
                  type: 'button',
                  className: 'dshDemo_tabClose',
                  'data-dockkit-tab-close': 'true',
                  'aria-label': `Close ${tab.title}`,
                  onClick: (event) => {
                    event.stopPropagation()
                    store.closeRightTab(tab.id)
                  }
                }, '×')
            ))
          ),
          React.createElement('button', {
            type: 'button',
            className: 'dshDemo_iconBtn',
            'data-dockkit-add-tab': 'true',
            'aria-label': 'New tab',
            onClick: () => store.activateRightTab('guide')
          }, '+'),
          React.createElement('button', {
            type: 'button',
            className: 'dshDemo_iconBtn',
            'data-dockkit-split-button': 'true',
            'aria-label': 'Split right',
            onClick: () => store.setNotice('Demo: split panes are not available.')
          }, '⇋'),
          React.createElement('span', { className: 'dshDemo_mode', 'data-sidebar-right-mode': 'push' }, 'Push'),
          React.createElement('button', {
            type: 'button',
            className: 'dshDemo_iconBtn',
            'data-sidebar-right-toggle': 'true',
            'aria-label': 'Close right sidebar',
            onClick: () => store.closeRightSidebar()
          }, '×')
        ),
        activeTab.kind === 'files'
          ? filesPane(store)
          : (activeTab.kind === 'terminal' ? terminalPane() : guidePane(store))
      )
      : null
  )
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
    React.createElement('div', {
      className: state.rightSidebar.open ? 'dshDemo_rightOpen dshDemo_frame' : 'dshDemo_frame',
      id: 'dsh-demo-frame'
    },
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
      current
        ? React.createElement('main', { className: 'dshDemo_centerCol' },
          React.createElement('header', { className: 'dshDemo_header' },
            React.createElement('div', { className: 'dshDemo_titleRow' },
              React.createElement('span', { className: 'dshDemo_crumb' }, 'Demo'),
              React.createElement('span', { className: 'dshDemo_crumbSep' }, ' / '),
              React.createElement('span', { className: 'dshDemo_crumbCurrent' }, current.title)
            ),
            React.createElement('div', { className: 'dshDemo_fallbackNav' },
              React.createElement('button', {
                type: 'button',
                className: 'dshDemo_primary',
                onClick: () => store.openSettings()
              }, 'Host Settings')
            ),
            React.createElement('button', {
              type: 'button',
              className: 'dshDemo_iconBtn dshDemo_rightOpener',
              'aria-label': 'Open right sidebar',
              'aria-expanded': state.rightSidebar.open ? 'true' : 'false',
              onClick: () => store.toggleRightSidebar()
            }, '⌸')
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
        )
        : React.createElement('main', { className: 'dshDemo_centerCol', 'aria-hidden': 'true' },
          React.createElement('button', {
            type: 'button',
            className: 'dshDemo_iconBtn dshDemo_rightOpener',
            'aria-label': 'Open right sidebar',
            'aria-expanded': state.rightSidebar.open ? 'true' : 'false',
            onClick: () => store.toggleRightSidebar()
          }, '⌸')
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
      React.createElement(DemoRightSidebar, { state, store }),
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

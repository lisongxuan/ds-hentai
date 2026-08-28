/** Seed data for the static demo. No live sessions, models, or workspaces. */

const HOUR = 60 * 60 * 1000
const now = Date.parse('2026-08-28T04:00:00Z')

export const MODEL_DIRECTORY = {
  current: { provider: 'demo', model: 'demo-static', reasoningEffort: 'medium' },
  groups: [
    {
      id: 'demo',
      name: 'Demo',
      models: [
        {
          id: 'demo-static',
          name: 'Static (no API)',
          reasoning: { efforts: ['low', 'medium', 'high'], defaultEffort: 'medium' }
        },
        {
          id: 'demo-reasoner',
          name: 'Reasoner (canned)',
          reasoning: { efforts: ['low', 'medium', 'high'], defaultEffort: 'high' }
        }
      ]
    },
    {
      id: 'deepseek',
      name: 'DeepSeek (display only)',
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat' },
        {
          id: 'deepseek-reasoner',
          name: 'DeepSeek Reasoner',
          reasoning: { efforts: ['low', 'medium', 'high'], defaultEffort: 'high' }
        }
      ]
    }
  ],
  failures: [],
  status: 'ready',
  error: null,
  routable: null
}

export const PERMISSION_OPTIONS = [
  { value: 'read-only', name: 'read-only' },
  { value: 'workspace-write', name: 'workspace-write' },
  { value: 'danger-full-access', name: 'danger-full-access' }
]

export const WORKSPACES = {
  items: [
    { id: 'ws-skin', title: 'ds-hentai', sessionIds: ['s-gallery', 's-css', 's-settings'] },
    { id: 'ws-play', title: 'playground', sessionIds: ['s-plan', 's-agent', 's-search'] }
  ],
  archivedSessionIds: []
}

export const SESSIONS = [
  {
    id: 's-gallery',
    title: 'Gallery chrome overlay',
    subtitle: 'Nav, index table, and search-style composer',
    updatedAt: now - 2 * HOUR,
    cwd: '/projects/ds-hentai',
    model: 'Static (no API)',
    workspace: 'ds-hentai',
    tags: ['code', 'ui'],
    messageCount: 6,
    permission: 'workspace-write',
    stats: { turns: 3, steps: 8, llmMs: 4200, toolMs: 0, ttftMs: 800, ttftSteps: 1, decodeMs: 2400, decodeTokens: 180 },
    tokens: { uncachedInputTokens: 1200, cacheReadTokens: 400, cacheWriteTokens: 0, outputTokens: 180 }
  },
  {
    id: 's-css',
    title: 'Scoped skin.css tokens',
    subtitle: 'Charcoal palette under data-dsh-exhentai-active',
    updatedAt: now - 5 * HOUR,
    cwd: '/projects/ds-hentai',
    model: 'Static (no API)',
    workspace: 'ds-hentai',
    tags: ['files', 'css'],
    messageCount: 4,
    permission: 'workspace-write',
    stats: { turns: 2, steps: 4, llmMs: 2100 },
    tokens: { uncachedInputTokens: 800, outputTokens: 90 }
  },
  {
    id: 's-settings',
    title: 'Reversible General settings',
    subtitle: 'Enable skin / system appearance, chips, composer',
    updatedAt: now - 26 * HOUR,
    cwd: '/projects/ds-hentai',
    model: 'DeepSeek Chat',
    workspace: 'ds-hentai',
    tags: ['misc', 'settings'],
    messageCount: 3,
    permission: 'read-only',
    stats: { turns: 2, steps: 2 },
    tokens: { uncachedInputTokens: 500, outputTokens: 40 }
  },
  {
    id: 's-plan',
    title: 'Static demo plan',
    subtitle: 'Host stub, fixtures, Vercel output',
    updatedAt: now - 3 * HOUR,
    cwd: '/projects/playground',
    model: 'Reasoner (canned)',
    workspace: 'playground',
    tags: ['plan'],
    messageCount: 8,
    permission: 'workspace-write',
    stats: { turns: 4, steps: 12, llmMs: 9100, toolMs: 400 },
    tokens: { uncachedInputTokens: 2400, cacheReadTokens: 800, outputTokens: 520 }
  },
  {
    id: 's-agent',
    title: 'Pretend agent trajectory',
    subtitle: 'Messages only — no tools run',
    updatedAt: now - 8 * HOUR,
    cwd: '/projects/playground',
    model: 'Reasoner (canned)',
    workspace: 'playground',
    tags: ['agent', 'tools'],
    messageCount: 10,
    permission: 'workspace-write',
    stats: { turns: 5, steps: 16, llmMs: 12000, toolMs: 3200 },
    tokens: { uncachedInputTokens: 3100, outputTokens: 640 }
  },
  {
    id: 's-search',
    title: 'Front Page filters',
    subtitle: 'Category chips, favorites, thumbnail mode',
    updatedAt: now - 12 * HOUR,
    cwd: '/projects/playground',
    model: 'Static (no API)',
    workspace: 'playground',
    tags: ['search', 'chat'],
    messageCount: 5,
    permission: 'read-only',
    stats: { turns: 3, steps: 3 },
    tokens: { uncachedInputTokens: 900, outputTokens: 110 }
  },
  {
    id: 's-skill',
    title: 'Notes from the skin README',
    subtitle: 'Install via dsh plugin — not in this demo',
    updatedAt: now - 48 * HOUR,
    cwd: '/tmp',
    model: 'DeepSeek Chat',
    workspace: '',
    tags: ['notes', 'skill'],
    messageCount: 2,
    permission: 'read-only',
    stats: { turns: 1, steps: 1 },
    tokens: { uncachedInputTokens: 200, outputTokens: 60 }
  }
]

export const MESSAGES = {
  's-gallery': [
    { role: 'user', text: 'Can the overlay switch Front Page without a real DSH host?' },
    { role: 'assistant', text: 'In this static demo, yes. Nav, the session table, favorites, and Settings are React state plus localStorage. The gallery chrome is the same overlay the plugin registers on shell.overlay.' },
    { role: 'user', text: 'What happens if I press Search?' },
    { role: 'assistant', text: 'The demo appends your prompt and a canned reply. It never calls DeepSeek Harness, an agent runtime, or a model endpoint.' }
  ],
  's-css': [
    { role: 'user', text: 'Where do the charcoal tokens live?' },
    { role: 'assistant', text: 'src/skin.css, scoped under body[data-dsh-exhentai-active="true"]. The demo host applies the plugin THEME dictionary as --dsw-* variables on body, the same way ui-layout would.' }
  ],
  's-settings': [
    { role: 'user', text: 'How do I restore the built-in look?' },
    { role: 'assistant', text: 'Open Settings and choose System appearance, or use the General row inside Host Settings. The native frame underneath stays in the DOM; the overlay unmounts when the skin is off.' }
  ],
  's-plan': [
    { role: 'user', text: 'Keep the demo in this repo so src/ updates rebuild the preview.' },
    { role: 'assistant', text: 'demo/ is only the fake host, fixtures, and a stand-in conversation pane. npm run build:demo embeds the same src/client.js + src/skin.css the plugin ships.' }
  ],
  's-agent': [
    { role: 'user', text: 'Run the test suite and open a PR.' },
    { role: 'assistant', text: 'Declined in the static demo. Slash commands and Search only write local messages. Treat this session as a screenshot you can click through.' },
    { role: 'user', text: '/plan' },
    { role: 'assistant', text: 'Demo: /plan was not sent to an agent. Permission, model, and preset radios only mutate this in-memory store.' }
  ],
  's-search': [
    { role: 'user', text: 'Filter by Favorites and switch to Thumbnail.' },
    { role: 'assistant', text: 'Use the top nav for Favorites / Popular, the heart on a row to star it, and the Front Page footer dropdown for Minimal through Thumbnail.' }
  ],
  's-skill': [
    { role: 'user', text: 'How do I install the real skin?' },
    { role: 'assistant', text: 'This page cannot. Install with npx @deepseek-ai/dsh plugin --profile web add ds-hentai and restart dsh web. The demo exists so you can preview chrome without that host.' }
  ]
}

export const CANNED_REPLY = 'This is the static ds-hentai demo. Navigation, filters, settings, rename/fork/archive, and the composer UI run in the browser only. No DeepSeek Harness, agent, or model API is called.'

export const COMMAND_REPLY = (line) => (
  `Demo: ${line} was not executed. The real plugin would forward this to the native session; this preview only records it in the transcript.`
)

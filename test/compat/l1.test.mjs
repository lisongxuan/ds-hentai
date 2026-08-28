import assert from 'node:assert/strict'
import { before, test } from 'node:test'
import { faceById, loadCatalog } from './catalog.mjs'
import { bootPlugin, createPluginWorld, readBundle } from './load-plugin.mjs'
import { createMockCtx, THEME_ID } from './mock-ctx.mjs'

const catalog = await loadCatalog()
const bundle = await readBundle()

function sel(name) {
  const value = catalog.selectors[name]
  if (!value) throw new Error(`missing selector ${name}`)
  return value
}

async function withFace(faceId, fn) {
  const face = faceById(catalog, faceId)
  const session = await bootPlugin(face, bundle)
  try {
    return await fn(session, face)
  } finally {
    session.dispose()
  }
}

before(() => {
  assert.equal(catalog.baseline, '0.1.0-rc.6')
  assert.ok(Array.isArray(catalog.faces) && catalog.faces.length > 0)
  assert.ok(catalog.theme.id === THEME_ID)
})

test('bundle exports the client plugin contract', async () => {
  const session = await bootPlugin(faceById(catalog, 'full-rc6'), bundle)
  try {
    assert.equal(session.plugin.THEME_ID, THEME_ID)
    assert.equal(Array.from(session.plugin.inject).join(','), 'theme,slots,locale')
    assert.equal(typeof session.plugin.apply, 'function')
    assert.equal(session.plugin.THEME.tokens[catalog.theme.token], catalog.theme.tokenValue)
  } finally {
    session.dispose()
  }
})

test('full-rc6 registers theme, settings, overlay, locale, and markers', async () => {
  await withFace('full-rc6', (session) => {
    const { harness, document } = session
    const themeReg = harness.themeHistory.find((item) => item.op === 'register')
    assert.ok(themeReg)
    assert.equal(themeReg.spec.id, THEME_ID)
    assert.equal(themeReg.spec.colorScheme, 'dark')
    assert.equal(themeReg.spec.tokens[catalog.theme.token], catalog.theme.tokenValue)
    assert.ok(harness.themeHistory.some((item) => item.op === 'setTheme' && item.id === THEME_ID))

    const settings = harness.slot('settings.general.item')
    const overlay = harness.slot('shell.overlay')
    assert.ok(settings, 'settings.general.item must register')
    assert.ok(overlay, 'shell.overlay must register on full face')
    assert.equal(overlay.id, 'ds-hentai-chrome')
    assert.equal(typeof settings.hooks.setEnabled, 'function')
    assert.equal(typeof overlay.hooks.native.listSessions, 'function')

    assert.ok(harness.locale)
    assert.equal(typeof harness.locale.bind('ds-hentai'), 'function')

    assert.ok(document.documentElement.matches(sel('installed')))
    assert.ok(document.body.matches(sel('active')))
    assert.ok(document.querySelector(sel('style')))
    assert.ok(document.body.matches(sel('chipsOn')))
    assert.ok(document.body.matches(sel('composerSkin')))
    assert.ok(document.body.matches(sel('sidebarOff')))

    const listed = overlay.hooks.native.listSessions()
    assert.ok(Array.isArray(listed) && listed.some((item) => item.id === 's1'))
  })
})

test('settings master switch restores the previous built-in theme', async () => {
  await withFace('full-rc6', (session) => {
    const settings = session.harness.slot('settings.general.item')
    assert.equal(settings.hooks.getEnabled(), true)
    settings.hooks.setEnabled(false)
    assert.equal(settings.hooks.getEnabled(), false)
    assert.equal(session.document.body.getAttribute('data-dsh-exhentai-active'), null)
    assert.ok(session.harness.themeHistory.some((item) => item.op === 'setTheme' && item.id === 'dark'))
    settings.hooks.setEnabled(true)
    assert.ok(session.document.body.matches(sel('active')))
    const last = session.harness.themeHistory.filter((item) => item.op === 'setTheme').at(-1)
    assert.equal(last.id, THEME_ID)
  })
})

test('no-overlay degrades without throwing and keeps the stable layer', async () => {
  await withFace('no-overlay', (session, face) => {
    assert.equal(face.expectOverlay, false)
    assert.ok(session.harness.slot('settings.general.item'))
    assert.equal(session.harness.slot('shell.overlay'), null)
    assert.ok(session.document.documentElement.matches(sel('installed')))
    assert.ok(session.document.body.matches(sel('active')))
    assert.ok(session.document.querySelector(sel('style')))
    assert.ok(session.harness.themeHistory.some((item) => item.op === 'register'))
  })
})

test('no-locale falls back and still applies the skin', async () => {
  await withFace('no-locale', (session) => {
    assert.equal(session.harness.locale, null)
    assert.ok(session.harness.slot('settings.general.item'))
    assert.ok(session.harness.slot('shell.overlay'))
    assert.ok(session.document.body.matches(sel('active')))
    const t = session.harness.slot('settings.general.item').hooks.t
    assert.equal(typeof t, 'function')
    assert.ok(String(t('skin.enable')).length > 0)
  })
})

test('no-sessions keeps chrome registration and listSessions returns an array', async () => {
  await withFace('no-sessions', (session) => {
    const overlay = session.harness.slot('shell.overlay')
    assert.ok(overlay)
    const rows = overlay.hooks.native.listSessions()
    assert.ok(Array.isArray(rows))
    assert.equal(overlay.hooks.native.startSession(), false)
    assert.equal(overlay.hooks.native.sendPrompt('hello'), false)
  })
})

test('disposing the fiber removes stylesheet and markers', async () => {
  const session = await bootPlugin(faceById(catalog, 'full-rc6'), bundle)
  assert.ok(session.document.querySelector(sel('style')))
  session.harness.disposeEffects()
  assert.equal(session.document.querySelector(sel('style')), null)
  assert.equal(session.document.documentElement.getAttribute('data-dsh-exhentai-installed'), null)
  assert.equal(session.document.body.getAttribute('data-dsh-exhentai-active'), null)
  session.destroy()
})

test('gallery chrome CSS reserves a desktop titlebar inset', async () => {
  await withFace('full-rc6', (session) => {
    const css = session.document.querySelector(sel('style')).textContent
    assert.match(css, /--ex-desktop-inset/)
    assert.match(css, /dshDesktopWindowsCaptionRow/)
    assert.match(css, /dshDesktopSidebarSurface/)
    assert.match(css, /dsh-ex-desktop-drag/)
    assert.match(css, /data-dsh-exhentai-window="advanced"/)
    assert.match(css, /\.dsh-ex-chrome\s*\{[^}]*position:\s*fixed/s)
    assert.match(css, /\.dsh-ex-chrome\s*\{[^}]*top:\s*var\(--ex-desktop-inset/s)
    assert.match(css, /\.dsh-ex-chrome\s*\{[^}]*pointer-events:\s*none\s*!important/s)
    assert.doesNotMatch(css, /\.dsh-ex-chrome\s*\{[^}]*-webkit-app-region:\s*no-drag/s)
    assert.equal(session.document.documentElement.getAttribute('data-dsh-exhentai-desktop'), 'inset-v5')
  })
})

test('overlapping Desktop titlebar sets --ex-desktop-inset and clears on dispose', async () => {
  const world = createPluginWorld(bundle)
  const bar = world.document.createElement('div')
  bar.className = 'dshNativeFrame'
  bar.setAttribute('data-dsh-desktop-frame', 'titlebar')
  bar.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 36, width: 800, height: 36,
    toJSON() { return {} }
  })
  world.document.body.appendChild(bar)

  const harness = createMockCtx(faceById(catalog, 'full-rc6'), world.win)
  world.plugin.apply(harness.ctx)
  assert.equal(world.document.documentElement.style.getPropertyValue('--ex-desktop-inset'), '36px')
  assert.equal(world.document.documentElement.getAttribute('data-dsh-exhentai-desktop'), 'inset-v5')
  assert.equal(world.document.documentElement.getAttribute('data-dsh-exhentai-window'), 'framed')

  harness.disposeEffects()
  assert.equal(world.document.documentElement.style.getPropertyValue('--ex-desktop-inset'), '')
  assert.equal(world.document.documentElement.getAttribute('data-dsh-exhentai-desktop'), null)
  assert.equal(world.document.documentElement.getAttribute('data-dsh-exhentai-window'), null)
  world.destroy()
})

test('overlay below the titlebar still insets unless it contains position:fixed', async () => {
  const world = createPluginWorld(bundle)
  const bar = world.document.createElement('div')
  bar.className = 'dshNativeFrame'
  bar.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 36, width: 800, height: 36,
    toJSON() { return {} }
  })
  const slot = world.document.createElement('div')
  slot.setAttribute('data-shell-overlay', '')
  slot.getBoundingClientRect = () => ({
    x: 0, y: 36, top: 36, left: 0, right: 800, bottom: 800, width: 800, height: 764,
    toJSON() { return {} }
  })
  world.document.body.appendChild(bar)
  world.document.body.appendChild(slot)

  const harness = createMockCtx(faceById(catalog, 'full-rc6'), world.win)
  world.plugin.apply(harness.ctx)
  assert.equal(world.document.documentElement.style.getPropertyValue('--ex-desktop-inset'), '36px')
  harness.disposeEffects()
  world.destroy()
})

test('transformed overlay already below the titlebar does not double-inset', async () => {
  const world = createPluginWorld(bundle)
  const bar = world.document.createElement('div')
  bar.className = 'dshNativeFrame'
  bar.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 36, width: 800, height: 36,
    toJSON() { return {} }
  })
  const slot = world.document.createElement('div')
  slot.setAttribute('data-shell-overlay', '')
  slot.style.transform = 'translateY(0px)'
  slot.getBoundingClientRect = () => ({
    x: 0, y: 36, top: 36, left: 0, right: 800, bottom: 800, width: 800, height: 764,
    toJSON() { return {} }
  })
  world.document.body.appendChild(bar)
  world.document.body.appendChild(slot)

  const harness = createMockCtx(faceById(catalog, 'full-rc6'), world.win)
  world.plugin.apply(harness.ctx)
  assert.equal(world.document.documentElement.style.getPropertyValue('--ex-desktop-inset'), '')
  harness.disposeEffects()
  world.destroy()
})

test('shifted #root below the titlebar still insets unless it contains position:fixed', async () => {
  const world = createPluginWorld(bundle)
  const bar = world.document.createElement('div')
  bar.className = 'dshNativeFrame'
  bar.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 36, width: 800, height: 36,
    toJSON() { return {} }
  })
  const root = world.document.createElement('div')
  root.id = 'root'
  root.getBoundingClientRect = () => ({
    x: 0, y: 36, top: 36, left: 0, right: 800, bottom: 800, width: 800, height: 764,
    toJSON() { return {} }
  })
  world.document.body.appendChild(bar)
  world.document.body.appendChild(root)

  const harness = createMockCtx(faceById(catalog, 'full-rc6'), world.win)
  world.plugin.apply(harness.ctx)
  assert.equal(world.document.documentElement.style.getPropertyValue('--ex-desktop-inset'), '36px')
  harness.disposeEffects()
  world.destroy()
})

test('transformed #root that contains the overlay does not double-inset', async () => {
  const world = createPluginWorld(bundle)
  const bar = world.document.createElement('div')
  bar.className = 'dshNativeFrame'
  bar.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 36, width: 800, height: 36,
    toJSON() { return {} }
  })
  const root = world.document.createElement('div')
  root.id = 'root'
  root.style.transform = 'translateZ(0)'
  root.getBoundingClientRect = () => ({
    x: 0, y: 36, top: 36, left: 0, right: 800, bottom: 800, width: 800, height: 764,
    toJSON() { return {} }
  })
  const slot = world.document.createElement('div')
  slot.setAttribute('data-shell-overlay', '')
  slot.getBoundingClientRect = () => ({
    x: 0, y: 36, top: 36, left: 0, right: 800, bottom: 800, width: 800, height: 764,
    toJSON() { return {} }
  })
  root.appendChild(slot)
  world.document.body.appendChild(bar)
  world.document.body.appendChild(root)

  const harness = createMockCtx(faceById(catalog, 'full-rc6'), world.win)
  world.plugin.apply(harness.ctx)
  assert.equal(world.document.documentElement.style.getPropertyValue('--ex-desktop-inset'), '')
  harness.disposeEffects()
  world.destroy()
})

test('advanced overlay covering the caption still insets when content viewport is below', async () => {
  const world = createPluginWorld(bundle)
  const bar = world.document.createElement('div')
  bar.className = 'dshDesktopWindowsCaptionRow'
  bar.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 32, width: 800, height: 32,
    toJSON() { return {} }
  })
  const viewport = world.document.createElement('div')
  viewport.setAttribute('data-dsh-desktop-content-viewport', '')
  viewport.getBoundingClientRect = () => ({
    x: 0, y: 32, top: 32, left: 0, right: 800, bottom: 800, width: 800, height: 768,
    toJSON() { return {} }
  })
  const slot = world.document.createElement('div')
  slot.className = 'dshDesktopOverlay'
  slot.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 800, width: 800, height: 800,
    toJSON() { return {} }
  })
  world.document.body.appendChild(bar)
  world.document.body.appendChild(viewport)
  world.document.body.appendChild(slot)

  const harness = createMockCtx(faceById(catalog, 'full-rc6'), world.win)
  world.plugin.apply(harness.ctx)
  assert.equal(world.document.documentElement.style.getPropertyValue('--ex-desktop-inset'), '32px')
  assert.equal(world.document.documentElement.getAttribute('data-dsh-exhentai-window'), 'advanced')
  harness.disposeEffects()
  world.destroy()
})

test('advanced still insets when #root is shifted below the caption', async () => {
  const world = createPluginWorld(bundle)
  const bar = world.document.createElement('div')
  bar.className = 'dshDesktopWindowsCaptionRow'
  bar.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 32, width: 800, height: 32,
    toJSON() { return {} }
  })
  const root = world.document.createElement('div')
  root.id = 'root'
  root.getBoundingClientRect = () => ({
    x: 0, y: 32, top: 32, left: 0, right: 800, bottom: 800, width: 800, height: 768,
    toJSON() { return {} }
  })
  const slot = world.document.createElement('div')
  slot.className = 'dshDesktopOverlay'
  slot.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 800, width: 800, height: 800,
    toJSON() { return {} }
  })
  world.document.body.appendChild(bar)
  world.document.body.appendChild(root)
  world.document.body.appendChild(slot)

  const harness = createMockCtx(faceById(catalog, 'full-rc6'), world.win)
  world.plugin.apply(harness.ctx)
  assert.equal(world.document.documentElement.style.getPropertyValue('--ex-desktop-inset'), '32px')
  assert.equal(world.document.documentElement.getAttribute('data-dsh-exhentai-window'), 'advanced')
  harness.disposeEffects()
  world.destroy()
})

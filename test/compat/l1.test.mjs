import assert from 'node:assert/strict'
import { before, test } from 'node:test'
import { faceById, loadCatalog } from './catalog.mjs'
import { bootPlugin, readBundle } from './load-plugin.mjs'
import { THEME_ID } from './mock-ctx.mjs'

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

import { expect, test } from '@playwright/test'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const catalog = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../compat/catalog.json'), 'utf8')
)
const expectChrome = process.env.DSH_E2E_EXPECT_CHROME !== '0'
const shotDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../test-results/compat-screenshots')

test.beforeAll(async () => {
  await mkdir(shotDir, { recursive: true })
})

// DSH 0.2.x greets a fresh home with the preview notice and onboarding dialogs.
// They cover the chrome, so dismiss them before asserting the real UI.
async function dismissFirstRun(page) {
  // The onboarding dialog mounts after the plugin marker, so poll briefly for
  // the first one and for any that follow it.
  let waitUntil = Date.now() + 5_000
  while (Date.now() < waitUntil) {
    const dialog = page.locator('[role="dialog"]:visible').first()
    if (!(await dialog.count())) {
      await page.waitForTimeout(200)
      continue
    }
    const cont = dialog.getByRole('button', { name: /^(Continue|继续)$/i })
    const close = dialog.locator('button[aria-label]').first()
    if (await cont.count()) await cont.first().click()
    else if (await close.count()) await close.first().click()
    else await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})
    await page.waitForTimeout(300)
    waitUntil = Date.now() + 2_000
  }
}

test('stable layer: plugin applies without throwing', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', (err) => { pageErrors.push(String(err)) })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator(catalog.selectors.installed)).toBeAttached({ timeout: 45_000 })
  await dismissFirstRun(page)
  await expect(page.locator(catalog.selectors.active)).toBeAttached()
  await expect(page.locator(catalog.selectors.style)).toBeAttached()

  const bg = await page.locator('body').evaluate((body, token) => {
    return getComputedStyle(body).getPropertyValue(token).trim()
  }, catalog.theme.token)
  if (bg) expect(bg.toLowerCase()).toContain('34353b')

  await page.screenshot({ path: resolve(shotDir, 'active.png'), fullPage: true })

  if (expectChrome) {
    await expect(page.locator(catalog.selectors.chrome)).toBeVisible()
    await page.screenshot({ path: resolve(shotDir, 'chrome.png'), fullPage: true })
  }

  const pluginErrors = pageErrors.filter((msg) => /ds-hentai|exhentai/i.test(msg))
  expect(pluginErrors, pluginErrors.join('\n') || 'plugin page errors').toEqual([])
})

test('best-effort chrome: Front Page is visible on gallery hosts', async ({ page }) => {
  test.skip(!expectChrome, 'DSH_E2E_EXPECT_CHROME=0')
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator(catalog.selectors.installed)).toBeAttached({ timeout: 45_000 })
  await dismissFirstRun(page)
  await expect(page.locator(catalog.selectors.chrome)).toBeVisible({ timeout: 45_000 })
  await expect(page.getByText('Front Page', { exact: true }).first()).toBeVisible()
  await page.screenshot({ path: resolve(shotDir, 'front-page.png'), fullPage: true })
})

test('best-effort chrome: host settings opens the native General row', async ({ page }) => {
  test.skip(!expectChrome, 'DSH_E2E_EXPECT_CHROME=0')
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator(catalog.selectors.installed)).toBeAttached({ timeout: 45_000 })
  await dismissFirstRun(page)
  await page.locator(catalog.selectors.chrome).getByRole('button', { name: 'Settings', exact: true }).first().click()
  const hostButton = page.getByRole('button', { name: /Open Host Settings|打开宿主设置/i })
  if (!(await hostButton.count())) test.skip(true, 'host settings button not rendered')
  await hostButton.first().click()
  await expect(page.getByText(/DsHentai (dark gallery skin|深色画廊皮肤)/).first()).toBeVisible({ timeout: 15_000 })
})


// Create one blank Session through the authenticated host RPC. This is the same
// `session/create` unary the native UI calls; seeding it here gives the gallery
// more than the auto-restored blank conversation to open.
async function createBlankSession(page, cwd) {
  const response = await page.request.post(new URL('/api/session/create', page.url()).href, {
    headers: { 'content-type': 'application/json' },
    data: {
      type: 'client-request',
      rpcId: randomUUID(),
      method: 'session/create',
      payload: { args: { request: { cwd } } },
    },
  })
  const body = await response.json().catch(() => ({}))
  expect(body.result?.ok, JSON.stringify(body)).toBe(true)
  return body.result.value.sessionId
}

test('best-effort chrome: clicking a gallery row opens that conversation', async ({ page }) => {
  test.skip(!expectChrome, 'DSH_E2E_EXPECT_CHROME=0')
  const pageErrors = []
  page.on('pageerror', (err) => { pageErrors.push(String(err)) })
  const workA = await mkdtemp(join(tmpdir(), 'ds-hentai-e2e-a-'))
  const workB = await mkdtemp(join(tmpdir(), 'ds-hentai-e2e-b-'))
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator(catalog.selectors.installed)).toBeAttached({ timeout: 45_000 })
    await dismissFirstRun(page)
    await createBlankSession(page, workA)
    await createBlankSession(page, workB)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator(catalog.selectors.installed)).toBeAttached({ timeout: 45_000 })
    await dismissFirstRun(page)
    await page.waitForTimeout(1_500)

    const sessionBefore = await page.evaluate(() => {
      const node = document.querySelector('[data-conversation-content]')
      return node ? node.getAttribute('data-conversation-session') : null
    })
    await page.locator(catalog.selectors.chrome).getByRole('button', { name: 'Front Page', exact: true }).first().click()
    const galleryRows = page.locator('.dsh-ex-itg tbody tr')
    await expect(galleryRows.first()).toBeVisible({ timeout: 15_000 })
    const rowCount = await galleryRows.count()
    expect(rowCount, 'gallery rows').toBeGreaterThanOrEqual(2)

    // Prefer a row the skin does not mark current, so the click must navigate.
    let row = galleryRows.first()
    for (let index = 0; index < rowCount; index += 1) {
      if ((await galleryRows.nth(index).getAttribute('aria-selected')) === 'false') {
        row = galleryRows.nth(index)
        break
      }
    }
    await row.click()

    // The overlay must switch AND the host main view must land on a Session.
    // The old fallback clicked '[class*="_sessionRow"]' by title text, which
    // silently missed unmounted rows and left the previous blank conversation in
    // place: the reported "click a conversation, no content" bug.
    await expect(page.locator('body[data-dsh-exhentai-view="session"]')).toBeAttached({ timeout: 15_000 })
    await expect(page.locator('[data-conversation-content]')).toHaveAttribute('data-conversation-session', /^session-/, { timeout: 15_000 })
    const sessionAfter = await page.evaluate(() => {
      const node = document.querySelector('[data-conversation-content]')
      return node ? node.getAttribute('data-conversation-session') : null
    })
    expect(sessionAfter).toMatch(/^session-/)
    expect(sessionAfter).not.toBe(sessionBefore)

    const pluginErrors = pageErrors.filter((msg) => /ds-hentai|exhentai/i.test(msg))
    expect(pluginErrors, pluginErrors.join('\n') || 'plugin page errors').toEqual([])
  } finally {
    await rm(workA, { recursive: true, force: true }).catch(() => {})
    await rm(workB, { recursive: true, force: true }).catch(() => {})
  }
})

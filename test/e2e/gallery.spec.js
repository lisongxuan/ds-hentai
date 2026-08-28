import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const catalog = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../compat/catalog.json'), 'utf8')
)
const expectChrome = process.env.DSH_E2E_EXPECT_CHROME !== '0'
const shotDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../test-results/compat-screenshots')

test.beforeAll(async () => {
  await mkdir(shotDir, { recursive: true })
})

test('stable layer: plugin applies without throwing', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', (err) => { pageErrors.push(String(err)) })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator(catalog.selectors.installed)).toBeAttached({ timeout: 45_000 })
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
  await expect(page.locator(catalog.selectors.chrome)).toBeVisible({ timeout: 45_000 })
  await expect(page.getByText('Front Page', { exact: true }).first()).toBeVisible()
  await page.screenshot({ path: resolve(shotDir, 'front-page.png'), fullPage: true })
})

import { chromium } from '@playwright/test'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// README / storefront screenshots from the static demo. Serve first: npm run preview
// Uses the local Edge/Chrome channel so Playwright's bundled browser is not required.

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const url = process.env.DEMO_URL || 'http://127.0.0.1:4173/'
const shots = {
  session: resolve(root, 'docs/preview-session.png'),
  index: resolve(root, 'docs/preview.png'),
  settings: resolve(root, 'docs/preview-settings.png')
}

const hideDemoBanner = `
  .dsh-ex-demo-banner { display: none !important; }
  body.dsh-ex-demo { padding-top: 0 !important; }
  body.dsh-ex-demo .dsh-ex-chrome { top: 0 !important; }
  body.dsh-ex-demo[data-dsh-exhentai-active="true"]:has(.dsh-ex-chrome) {
    padding-top: var(--ex-chrome-nav, 32px) !important;
  }
`

const browser = await chromium.launch({ channel: 'msedge' }).catch(() => chromium.launch({ channel: 'chrome' }))
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
  locale: 'en-US'
})
await page.goto(url, { waitUntil: 'networkidle' })
await page.locator('.dsh-ex-chrome').waitFor({ state: 'visible' })
await page.addStyleTag({ content: hideDemoBanner })

await page.locator('.dsh-ex-composer').waitFor({ state: 'visible' })
await page.locator('.dshDemo_thread').waitFor({ state: 'visible' })
await page.waitForTimeout(400)
await page.screenshot({ path: shots.session, type: 'png' })
console.log(`wrote ${shots.session}`)

await page.locator('.dsh-ex-nb').getByRole('button', { name: 'Front Page', exact: true }).click()
await page.locator('.dsh-ex-ido').waitFor({ state: 'visible' })
await page.locator('.dsh-ex-itg').waitFor({ state: 'visible' })
await page.waitForTimeout(400)
await page.screenshot({ path: shots.index, type: 'png' })
console.log(`wrote ${shots.index}`)

await page.locator('.dsh-ex-nb').getByRole('button', { name: 'Settings', exact: true }).click()
await page.locator('#dsh-ex-outer').waitFor({ state: 'visible' })
await page.getByRole('heading', { name: 'Gallery Skin', exact: true }).waitFor({ state: 'visible' })
await page.waitForTimeout(400)
await page.screenshot({ path: shots.settings, type: 'png' })
console.log(`wrote ${shots.settings}`)

await browser.close()

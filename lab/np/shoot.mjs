import { chromium } from 'playwright-core'
const url = process.argv[2], w = +process.argv[3] || 1440, h = +process.argv[4] || 900, tag = process.argv[5] || 'd'
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: w, height: h } })
const errs = []
page.on('console', m => m.type() === 'error' && errs.push(m.text()))
page.on('pageerror', e => errs.push(String(e)))
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(800)
const H = await page.evaluate(() => document.documentElement.scrollHeight)
let i = 0
for (let y = 0; y < H; y += h * 0.9) {
  await page.evaluate(y => scrollTo(0, y), y)
  await page.waitForTimeout(700)
  await page.screenshot({ path: `lab/np/${tag}-${String(i++).padStart(2, '0')}.png` })
}
console.log('height', H, 'shots', i, 'errors', errs)
await browser.close()

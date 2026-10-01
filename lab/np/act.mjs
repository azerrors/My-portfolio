import { chromium } from 'playwright-core'
const [url, sel, tag, w = 1440, h = 900, steps = 6] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: +w, height: +h } })
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const box = await page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { top: r.top + scrollY, height: r.height } }, sel)
for (let i = 0; i <= +steps; i++) {
  const y = box.top + (box.height - +h) * (i / +steps)
  await page.evaluate(y => scrollTo(0, y), y)
  await page.waitForTimeout(900)
  const p = await page.evaluate(s => document.querySelector(s).style.getPropertyValue('--sc-p'), sel)
  await page.screenshot({ path: `lab/np/${tag}-${i}.png` })
  console.log(i, p)
}
await browser.close()

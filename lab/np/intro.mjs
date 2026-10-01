import { chromium } from 'playwright-core'
const [url, w, h, tag] = process.argv.slice(2)
const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage({ viewport: { width: +w, height: +h } })
const errs = []
p.on('pageerror', e => errs.push(String(e)))
p.on('console', m => m.type() === 'error' && errs.push(m.text()))
await p.goto(url, { waitUntil: 'networkidle' })
await p.evaluate(() => document.fonts.ready)
await p.waitForTimeout(800)
const travel = await p.evaluate(() => { const s = document.querySelector('.np-intro'); return s.offsetHeight - innerHeight })
for (const f of [0, 0.3, 0.6, 0.85, 0.96, 1, 1.25]) {
  await p.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), travel * f)
  await p.waitForTimeout(900)
  await p.screenshot({ path: `lab/np/i${tag}-${f}.png` })
}
console.log(errs, await p.evaluate(() => document.querySelectorAll('[data-sc-act]').length))
await b.close()

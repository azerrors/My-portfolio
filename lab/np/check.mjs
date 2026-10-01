import { chromium } from 'playwright-core'
const [url, w, h, tag] = process.argv.slice(2)
const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage({ viewport: { width: +w, height: +h } })
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type()==='error' && errs.push(m.text()))
await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready)
await p.waitForTimeout(700); await p.screenshot({ path: `lab/np/${tag}-hero-mid.png` })
await p.waitForTimeout(2500); await p.screenshot({ path: `lab/np/${tag}-hero.png` })
const shoot = async (sel, frac, name) => {
  const y = await p.evaluate(([s, f]) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top + scrollY + (r.height - innerHeight) * f }, [sel, frac])
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(1000)
  await p.screenshot({ path: `lab/np/${tag}-${name}.png` })
}
await shoot('#ignition', 0.1, 'sp1'); await shoot('#ignition', 0.5, 'sp2'); await shoot('#ignition', 0.9, 'sp3')
await shoot('.np-hole', 0, 'hole1')
await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(400)
await shoot('.np-hole', 0.5, 'hole2')
console.log('errors', errs)
await b.close()

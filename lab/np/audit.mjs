import { chromium } from 'playwright-core'
const url = process.argv[2]
const sizes = (process.argv[3] || '320x640,375x667,768x1024,1024x768,1280x800').split(',').map(s => s.split('x').map(Number))
const b = await chromium.launch({ channel: 'chrome' })
for (const [w, h] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  const errs = []
  p.on('pageerror', e => errs.push(String(e)))
  await p.goto(url, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(600)
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  const over = new Map()
  let i = 0
  for (let y = 0; y < H; y += h * 0.85) {
    await p.evaluate(y => scrollTo(0, y), y)
    await p.waitForTimeout(450)
    const found = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth
      const out = []
      for (const el of document.querySelectorAll('main *, header *, footer *, nav *')) {
        if (el.closest('.np-backdrop, .ob-rail, [aria-hidden="true"]')) continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.bottom < 0 || r.top > innerHeight) continue
        if (r.right > vw + 1 || r.left < -1) {
          const cs = getComputedStyle(el)
          if (cs.position === 'fixed') continue
          out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} L${Math.round(r.left)} R${Math.round(r.right)}`)
        }
      }
      return { sw: document.documentElement.scrollWidth, vw, out: out.slice(0, 6) }
    })
    if (found.sw > found.vw) over.set('doc', `scrollWidth ${found.sw} > ${found.vw}`)
    for (const o of found.out) over.set(o, y)
    await p.screenshot({ path: `lab/np/a${w}-${String(i++).padStart(2, '0')}.png` })
  }
  console.log(`== ${w}x${h} shots ${i}`, errs, [...over.entries()].slice(0, 25))
  await p.close()
}
await b.close()

import { chromium } from 'playwright-core'
import fs from 'fs'
const jobs = [
  ['1', 'portrait', 108, 37, 901, 830],
  ['2', 'moon', 129, 38, 899, 810],
  ['3', 'black-hole', 66, 40, 957, 486],
]
const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage()
for (const [f, name, x0, y0, x1, y1] of jobs) {
  const src = 'data:image/webp;base64,' + fs.readFileSync(`lab/np/${f}.webp`).toString('base64')
  const out = await p.evaluate(async ({ src, x0, y0, x1, y1 }) => {
    const img = new Image(); img.src = src; await img.decode()
    const c = document.createElement('canvas'); c.width = x1 - x0; c.height = y1 - y0
    c.getContext('2d').drawImage(img, x0, y0, c.width, c.height, 0, 0, c.width, c.height)
    return c.toDataURL('image/webp', 0.9)
  }, { src, x0, y0, x1, y1 })
  fs.writeFileSync(`public/plates/${name}.webp`, Buffer.from(out.split(',')[1], 'base64'))
  console.log(name, x1 - x0, y1 - y0)
}
await b.close()

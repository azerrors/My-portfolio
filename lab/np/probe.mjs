import { chromium } from 'playwright-core'
import fs from 'fs'
const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage()
for (const f of ['1', '2', '3']) {
  const data = 'data:image/webp;base64,' + fs.readFileSync(`lab/np/${f}.webp`).toString('base64')
  const r = await p.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const x = c.getContext('2d'); x.drawImage(img, 0, 0)
    const d = x.getImageData(0, 0, c.width, c.height).data
    const dark = (i) => d[i] + d[i + 1] + d[i + 2] < 300
    // scan middle row & column for dark runs near edges
    const row = Math.floor(c.height / 2), col = Math.floor(c.width / 2)
    const xs = [], ys = []
    for (let i = 0; i < c.width; i++) if (dark((row * c.width + i) * 4)) xs.push(i)
    for (let j = 0; j < c.height; j++) if (dark((j * c.width + col) * 4)) ys.push(j)
    return { w: c.width, h: c.height, xs: [xs.slice(0, 12), xs.slice(-12)], ys: [ys.slice(0, 12), ys.slice(-12)] }
  }, data)
  console.log(f, JSON.stringify(r))
}
await b.close()

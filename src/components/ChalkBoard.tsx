import { useEffect, useRef, useState } from 'react'
import type { backIssues as Issues } from '@/data/site'
import { moonAge, moonPhase } from '@/lib/edition'
import { docTop, nearView, onMeasure } from '@/lib/measure'

/**
 * The first projects, beside the moon, on a blackboard. Each one starts
 * covered in chalk: its name, its date, a note that it was built by hand
 * before AI. Scrolling drives a board eraser across it in sweeps, and the
 * screenshot comes up through the cleared slate. Then the next one is
 * chalked up and wiped in turn.
 *
 * Everything runs off the act's own --sc-p, so scrolling back up chalks the
 * board over again. The eraser path is fixed, so every frame is reproducible.
 */

type Issue = (typeof Issues)[number]

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** When the board takes over in the act, and how much of each window wipes. */
const START = 0.45
const WIPE = 0.72

/** A moon at a given age, lit from the side the real one was. */
function MoonGlyph({ age }: { age: number }) {
  const r = 10
  const waxing = age < 0.5
  const k = Math.abs(Math.cos(age * Math.PI * 2)) * r
  const crescent = age < 0.25 || age > 0.75
  const outer = waxing ? 1 : 0
  const inner = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0
  const lit = `M 0 ${-r} A ${r} ${r} 0 0 ${outer} 0 ${r} A ${k} ${r} 0 0 ${inner} 0 ${-r} Z`
  return (
    <svg className="np-board__moon" viewBox="-12 -12 24 24" aria-hidden="true">
      <circle r={r} className="np-board__moon-dark" />
      <path d={lit} className="np-board__moon-lit" />
      <circle r={r} className="np-board__moon-rim" />
    </svg>
  )
}

const day = (d: Date) =>
  d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

/** The eraser's route: sweeps across the board, top to bottom, as points. */
function route(w: number, h: number) {
  const rows = 5
  const pad = h * 0.08
  const pts: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    const y = pad + ((h - pad * 2) * r) / (rows - 1)
    const a: [number, number] = [-w * 0.05, y]
    const b: [number, number] = [w * 1.05, y + h * 0.03]
    if (r % 2) pts.push(b, a)
    else pts.push(a, b)
  }
  return { pts, band: (h / rows) * 1.45 }
}

/** The point a fraction `t` along a polyline, and everything before it. */
function along(pts: [number, number][], t: number) {
  const seg = pts
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  const total = seg.reduce((s, x) => s + x, 0)
  let left = total * t
  const out: [number, number][] = [pts[0]]
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) {
      out.push(pts[i + 1])
      left -= seg[i]
      continue
    }
    const f = seg[i] ? left / seg[i] : 0
    out.push([
      pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f,
      pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f,
    ])
    break
  }
  return out
}

/** Chalk: the same stroke laid down a few times, a hair apart, thinly. */
function chalkText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  alpha = 0.85,
) {
  ctx.font = `600 ${size}px Caveat, 'Segoe Print', cursive`
  const offs = [
    [0, 0, 1],
    [0.6, 0.3, 0.45],
    [-0.4, 0.5, 0.35],
    [0.3, -0.5, 0.3],
  ]
  for (const [dx, dy, a] of offs) {
    ctx.fillStyle = `rgba(240,236,226,${(alpha * a).toFixed(3)})`
    ctx.fillText(text, x + dx, y + dy)
  }
}

export default function ChalkBoard({ issues }: { issues: Issue[] }) {
  const boardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const eraserRef = useRef<HTMLSpanElement>(null)
  const [now, setNow] = useState(0)

  useEffect(() => {
    const board = boardRef.current
    const canvas = canvasRef.current
    const eraser = eraserRef.current
    if (!board || !canvas || !eraser) return
    const act = board.closest<HTMLElement>('[data-sc-act]')
    const ctx = canvas.getContext('2d')
    if (!act || !ctx) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    let drawnKey = ''
    let w = 0
    let h = 0
    const size = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawnKey = ''
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(canvas)

    let actTop = 0
    let actH = 0
    const stopMeasure = onMeasure(() => {
      actTop = docTop(act)
      actH = act.offsetHeight
    })
    const dates = issues.map((x) => day(x.date))

    let shown = -1
    let raf = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!w || !nearView(actTop, actH, 0.2)) return
      const inline = act.style.getPropertyValue('--sc-p')
      const p = reduce ? 1 : clamp01(parseFloat(inline) || 0)
      // the board is a function of progress and size alone: unchanged
      // inputs, unchanged board, so nothing is redrawn
      const key = `${p.toFixed(4)}|${w}|${h}`
      if (key === drawnKey) return
      drawnKey = key
      const len = (1 - START) / issues.length
      const k = Math.min(
        issues.length - 1,
        Math.max(0, Math.floor((p - START) / len)),
      )
      const local = clamp01((p - START - k * len) / len)
      const e = reduce ? 1 : clamp01(local / WIPE)
      if (k !== shown) {
        shown = k
        setNow(k)
      }
      const it = issues[k]

      // the slate, chalked over: dust, smudges, then the notes
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#1a1916'
      ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 7; i++) {
        const g = ctx.createRadialGradient(
          w * ((i * 0.37) % 1),
          h * ((i * 0.61) % 1),
          0,
          w * ((i * 0.37) % 1),
          h * ((i * 0.61) % 1),
          w * 0.35,
        )
        g.addColorStop(0, 'rgba(230,228,215,0.09)')
        g.addColorStop(1, 'rgba(230,228,215,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }
      const u = Math.min(w / 30, h / 16)
      ctx.textBaseline = 'alphabetic'
      chalkText(
        ctx,
        `No. ${String(k + 1).padStart(2, '0')}`,
        u * 1.4,
        u * 2.6,
        u * 1.6,
        0.7,
      )
      chalkText(ctx, it.name, u * 1.4, u * 6.4, u * 3.8)
      chalkText(ctx, dates[k], u * 1.4, u * 9.2, u * 1.7, 0.75)
      chalkText(
        ctx,
        'built by hand, before AI',
        u * 1.4,
        u * 12.6,
        u * 1.9,
        0.8,
      )
      ctx.strokeStyle = 'rgba(240,236,226,0.6)'
      ctx.lineWidth = Math.max(u * 0.18, 1.2)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(u * 1.4, u * 7.4)
      ctx.quadraticCurveTo(w * 0.35, u * 7.9, w * 0.62, u * 7.2)
      ctx.stroke()
      // the circled date, the way a teacher rings the thing that matters
      ctx.beginPath()
      ctx.ellipse(u * 7.2, u * 8.6, u * 6.6, u * 1.6, -0.04, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(226,96,64,0.75)'
      ctx.stroke()

      // the eraser's work: everything along its route so far is lifted,
      // all but a ghost of dust, which is what a wiped board really keeps
      const { pts, band } = route(w, h)
      const done = along(pts, e)
      if (e > 0) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = 'rgba(0,0,0,0.96)'
        ctx.lineWidth = band
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(done[0][0], done[0][1])
        for (const q of done.slice(1)) ctx.lineTo(q[0], q[1])
        ctx.stroke()
      }

      const head = done[done.length - 1]
      const moving = e > 0 && e < 1
      eraser.style.opacity = moving ? '1' : '0'
      eraser.style.transform = `translate(${head[0]}px, ${head[1]}px) translate(-50%, -50%) rotate(${(-8 + Math.sin(e * 40) * 4).toFixed(2)}deg)`
      board.style.setProperty('--wiped', e.toFixed(3))
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      stopMeasure()
    }
  }, [issues])

  const it = issues[now]

  return (
    <aside className="np-board-wrap" aria-labelledby="board-title">
      <header className="np-board__head">
        <p className="np-board__kicker">
          <span>The first projects</span>
          <span className="np-board__count">
            {String(now + 1).padStart(2, '0')} /{' '}
            {String(issues.length).padStart(2, '0')}
          </span>
        </p>
        <h3 className="np-board__title" id="board-title">
          Built <em>before</em> AI.
        </h3>
        <p className="np-board__sub">
          Every line typed by hand, in 2023 and 2024, before an assistant wrote
          any of it.
        </p>
      </header>

      <div className="np-board" ref={boardRef}>
        <div className="np-board__slate">
          {issues.map((x, i) =>
            x.shot ? (
              <img
                key={x.href}
                src={x.shot}
                alt={`${x.name}, as it looked on release`}
                data-on={i === now}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className="np-board__missing"
                key={x.href}
                data-on={i === now}
              >
                <b>Plate missing</b>
                <span>
                  The live build is down; the archive copy is being restored.
                </span>
              </div>
            ),
          )}
          <canvas ref={canvasRef} aria-hidden="true" />
          <span
            className="np-board__eraser"
            ref={eraserRef}
            aria-hidden="true"
          />
        </div>
        {/* the desk stamp, struck again on every project */}
        <span className="np-board__stamp" key={now} aria-hidden="true">
          <b>Before AI</b>
          <small>Typed by hand</small>
        </span>
        <span className="np-board__tray" aria-hidden="true">
          <i />
          <i />
        </span>
      </div>

      <a
        className="np-board__cap"
        href={it.href}
        target="_blank"
        rel="noreferrer noopener"
        key={it.href}
      >
        <span className="np-board__date">
          <MoonGlyph age={moonAge(it.date)} />
          {day(it.date)} · {moonPhase(it.date)}
        </span>
        <span className="np-board__name">
          {it.name}
          <i aria-hidden="true">↗</i>
        </span>
        <span className="np-board__note">{it.note}</span>
      </a>
    </aside>
  )
}

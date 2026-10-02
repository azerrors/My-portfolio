import { useEffect, useRef } from 'react'
import { worlds } from '@/data/site'
import { docTop, nearView, onMeasure, viewY } from '@/lib/measure'

/**
 * Chapter III, the peak. A system chart drawn from scroll.
 *
 * Scroll is the clock: each world swings to the front of its orbit exactly at
 * the centre of its own window, which is what makes the chapter work on a phone
 * with no pointer at all. On a mouse the signature move takes over: the cursor
 * has mass here too, so the nearest world leaves its orbit toward it and opens
 * its plate early.
 *
 * The engine is not touched. This reads --sc-p off the act element, which is
 * the contract the kit publishes for exactly this.
 */

const CENTRES = [0.22, 0.52, 0.82]
const TURNS = [1.05, 0.82, 0.6]
const CAPTURE = 190 // px: how close the pointer has to be to take a world
const MAX_PULL = 92

/* One ink, printed onto the night sheet, and the sub-editor's red. */
const NIGHT = '#0d0c0a'
const ink = (a: number) => `rgba(239,233,220,${a.toFixed(3)})`
const red = (a: number) => `rgba(226,96,64,${a.toFixed(3)})`

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Stipple for the sun's disc, fixed so every frame engraves the same plate. */
const SUN_STIPPLE = (() => {
  const rand = rng(7)
  return Array.from({ length: 70 }, () => {
    const a = rand() * Math.PI * 2
    const d = 0.25 + Math.sqrt(rand()) * 0.7
    return { u: Math.cos(a) * d, v: Math.sin(a) * d }
  })
})()

/**
 * Each exhibit gets its own surface, so the three read apart in one ink:
 * the ERP is banded like a gas giant, the task platform is cratered, the
 * storefront is stippled.
 */
const SURFACES = (() => {
  const rand = rng(43)
  const bands = Array.from({ length: 6 }, (_, k) => ({
    v: -0.78 + k * 0.3 + rand() * 0.08,
    w: 0.03 + rand() * 0.07,
  }))
  const craters = Array.from({ length: 9 }, () => {
    const a = rand() * Math.PI * 2
    const d = Math.sqrt(rand()) * 0.75
    return { u: Math.cos(a) * d, v: Math.sin(a) * d, s: 0.07 + rand() * 0.16 }
  })
  const dots = Array.from({ length: 60 }, () => {
    const a = rand() * Math.PI * 2
    const d = Math.sqrt(rand()) * 0.95
    return { u: Math.cos(a) * d, v: Math.sin(a) * d }
  })
  return { bands, craters, dots }
})()

export default function SystemChart({
  actRef,
  plateRef,
  onSelect,
}: {
  actRef: React.RefObject<HTMLElement | null>
  plateRef: React.RefObject<HTMLElement | null>
  onSelect: (index: number, byPointer: boolean) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const act = actRef.current
    if (!canvas || !act) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = matchMedia('(hover: hover) and (pointer: fine)')
    const usePointer = !reduce && fine.matches

    let w = 0
    let h = 0
    let dpr = 1
    let last = -1

    let mx = -9999
    let my = -9999

    // per-world displacement, lerped so a captured world has weight
    const off = worlds.map(() => ({
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      grip: 0,
      tgrip: 0,
    }))

    /**
     * The stage is not its final size when this effect runs: child effects fire
     * before the parent mounts the engine, and the engine is what makes the
     * stage a pinned 100vh box. Sizing the bitmap once here leaves it on a
     * different aspect ratio to the element it is stretched over, and every
     * circle on the chart renders as an ellipse. A ResizeObserver is the only
     * thing that catches it, because no window resize event ever happens.
     */
    function resize() {
      const box = canvas!.getBoundingClientRect()
      if (box.width < 1 || box.height < 1) return
      dpr = Math.min(devicePixelRatio || 1, 2)
      w = box.width
      h = box.height
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    /** One world, engraved: lit in ink, its own surface, then the night side
     *  laid over it and hatched, with a terminator that curves like a sphere. */
    function engrave(x: number, y: number, r: number, away: number, i: number) {
      const c = ctx!
      c.save()
      c.beginPath()
      c.arc(x, y, r, 0, Math.PI * 2)
      c.clip()
      c.fillStyle = ink(1)
      c.fillRect(x - r, y - r, r * 2, r * 2)

      c.strokeStyle = NIGHT
      c.fillStyle = NIGHT
      if (i === 0) {
        for (const b of SURFACES.bands) {
          c.lineWidth = b.w * r
          c.beginPath()
          c.moveTo(x - r, y + b.v * r)
          c.quadraticCurveTo(x, y + b.v * r + r * 0.12, x + r, y + b.v * r)
          c.stroke()
        }
      } else if (i === 1) {
        c.lineWidth = 0.9
        for (const k of SURFACES.craters) {
          c.beginPath()
          c.ellipse(
            x + k.u * r,
            y + k.v * r,
            k.s * r,
            k.s * r * 0.8,
            0,
            0,
            Math.PI * 2,
          )
          c.stroke()
        }
      } else {
        for (const d of SURFACES.dots) {
          c.beginPath()
          c.arc(
            x + d.u * r,
            y + d.v * r,
            Math.max(r * 0.035, 0.7),
            0,
            Math.PI * 2,
          )
          c.fill()
        }
      }

      // the night side
      c.beginPath()
      c.arc(x, y, r, away - Math.PI / 2, away + Math.PI / 2)
      c.ellipse(x, y, r * 0.32, r, away, Math.PI / 2, -Math.PI / 2, true)
      c.closePath()
      c.globalAlpha *= 0.92
      c.fill()
      c.globalAlpha /= 0.92
      c.clip()
      c.strokeStyle = ink(0.3)
      c.lineWidth = 0.7
      for (let k = -r * 2; k < r * 2; k += 2.8) {
        c.beginPath()
        c.moveTo(x + k - r, y - r)
        c.lineTo(x + k + r, y + r)
        c.stroke()
      }
      c.restore()

      c.strokeStyle = ink(0.95)
      c.lineWidth = 1
      c.beginPath()
      c.arc(x, y, r, 0, Math.PI * 2)
      c.stroke()
    }

    function progress() {
      const inline = act!.style.getPropertyValue('--sc-p')
      const v = parseFloat(
        inline || getComputedStyle(act!).getPropertyValue('--sc-p'),
      )
      return Number.isFinite(v) ? Math.min(Math.max(v, 0), 1) : 0
    }

    function frame(t: number) {
      raf = requestAnimationFrame(frame)
      // nothing to turn while the chapter is out of sight
      if (!nearView(actTop, actH, 0.2)) return
      const p = progress()

      // The camera opens: nearly edge on at the top of the act, tilted by the
      // end. The system arrives rather than simply being there.
      // On a phone the data plate owns the lower two thirds, so the system has
      // to sit above it rather than behind it, and the orbits have to fit a
      // 390px frame instead of a 1440px one.
      const narrow = w < 860
      // a phone gets more tilt from the start, or the orbits read as one line
      const inc = (narrow ? 0.2 : 0.08) + p * 0.36
      // a landscape tablet keeps the plate on the left, so the system moves
      // right to stay clear of it
      const cx = w * (narrow || w >= 1280 ? 0.5 : 0.62)
      const cy = h * (narrow ? 0.34 : 0.55)
      const unit = narrow
        ? w * (0.2 + p * 0.04)
        : Math.min(w, h) * (w < 1280 ? 0.24 + p * 0.05 : 0.3 + p * 0.06)
      const bodyScale = narrow ? 0.1 : 0.072

      // where each world is, before the pointer touches anything
      const pos = worlds.map((world, i) => {
        const a = unit * (world.radius / 0.42)
        const theta = Math.PI / 2 + (p - CENTRES[i]) * Math.PI * 2 * TURNS[i]
        return {
          a,
          theta,
          x: cx + Math.cos(theta) * a,
          y: cy + Math.sin(theta) * a * inc,
          front: Math.sin(theta) > 0,
        }
      })

      // selection. Scroll picks one; the pointer can take it.
      let scrollPick = 0
      let best = Infinity
      for (let i = 0; i < CENTRES.length; i++) {
        const d = Math.abs(p - CENTRES[i])
        if (d < best) {
          best = d
          scrollPick = i
        }
      }

      let pick = scrollPick
      let byPointer = false
      if (usePointer && mx > -9000) {
        let nearest = -1
        let nd = CAPTURE
        for (let i = 0; i < pos.length; i++) {
          const d = Math.hypot(mx - pos[i].x, my - pos[i].y)
          if (d < nd) {
            nd = d
            nearest = i
          }
        }
        if (nearest > -1) {
          pick = nearest
          byPointer = true
        }
      }

      for (let i = 0; i < off.length; i++) {
        const o = off[i]
        if (usePointer && mx > -9000) {
          const dx = mx - pos[i].x
          const dy = my - pos[i].y
          const d = Math.hypot(dx, dy) || 1
          const f = (CAPTURE * CAPTURE) / (d * d + CAPTURE * CAPTURE * 0.5)
          const pull = Math.min(f * MAX_PULL, Math.min(d * 0.82, MAX_PULL))
          o.tx = (dx / d) * pull
          o.ty = (dy / d) * pull
          o.tgrip = Math.min(pull / MAX_PULL, 1)
        } else {
          o.tx = 0
          o.ty = 0
          o.tgrip = 0
        }
        o.x += (o.tx - o.x) * 0.1
        o.y += (o.ty - o.y) * 0.1
        o.grip += (o.tgrip - o.grip) * 0.1
      }

      if (pick !== last) {
        last = pick
        onSelect(pick, byPointer)
      }

      // ---------------------------------------------------------------- draw
      // An engraved plate, not a render: one ink (the paper colour, printed
      // onto the night sheet), hairlines, hatching for shadow, and red only
      // where the sub-editor has marked the exhibit in question.
      ctx!.clearRect(0, 0, w, h)
      ctx!.lineCap = 'round'

      // the graduated ring an astronomical plate is set inside
      const ringA = unit * (narrow ? 2.1 : 2.3)
      const ringB = Math.max(ringA * inc, 1)
      ctx!.strokeStyle = ink(0.22)
      ctx!.lineWidth = 0.8
      ctx!.beginPath()
      ctx!.ellipse(cx, cy, ringA, ringB, 0, 0, Math.PI * 2)
      ctx!.stroke()
      ctx!.font = '600 9px "Libre Franklin", system-ui, sans-serif'
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      for (let d = 0; d < 360; d += 5) {
        const th = (d * Math.PI) / 180
        const major = d % 30 === 0
        const len = major ? 9 : d % 10 === 0 ? 5 : 3
        const ux = Math.cos(th)
        const uy = Math.sin(th)
        const x0 = cx + ux * ringA
        const y0 = cy + uy * ringB
        ctx!.strokeStyle = ink(major ? 0.5 : 0.24)
        ctx!.beginPath()
        ctx!.moveTo(x0, y0)
        ctx!.lineTo(x0 + ux * len, y0 + uy * len * Math.max(inc, 0.35))
        ctx!.stroke()
        if (major && !narrow) {
          ctx!.fillStyle = ink(0.42)
          ctx!.fillText(
            `${d}°`,
            x0 + ux * (len + 14),
            y0 + uy * (len + 10) * Math.max(inc, 0.5),
          )
        }
      }

      // the ecliptic, as a dimension rule
      ctx!.strokeStyle = ink(0.16)
      ctx!.lineWidth = 0.8
      ctx!.beginPath()
      ctx!.moveTo(cx - ringA - 30, cy)
      ctx!.lineTo(cx + ringA + 30, cy)
      ctx!.stroke()

      // orbits, each lettered at its far end like a figure in a textbook
      for (let i = 0; i < pos.length; i++) {
        const selected = i === pick
        const b = Math.max(pos[i].a * inc, 1)
        ctx!.save()
        ctx!.setLineDash(selected ? [] : [1, 4])
        ctx!.strokeStyle = selected ? red(0.85) : ink(0.36)
        ctx!.lineWidth = selected ? 1.3 : 0.9
        ctx!.beginPath()
        ctx!.ellipse(cx, cy, pos[i].a, b, 0, 0, Math.PI * 2)
        ctx!.stroke()
        ctx!.restore()

        const lx = cx + pos[i].a * Math.cos(-0.5)
        const ly = cy + b * Math.sin(-0.5)
        ctx!.fillStyle = selected ? red(1) : ink(0.7)
        ctx!.font = 'italic 400 17px "Libre Caslon Text", Georgia, serif'
        ctx!.textAlign = 'left'
        ctx!.fillText(worlds[i].exhibit, lx + 6, ly - 8)
      }

      // the star: a woodcut sun. Rays alternate long and short and turn with
      // the reader, slowly; the disc carries two engraved rings.
      const rStar = Math.max(unit * (narrow ? 0.1 : 0.075), 8)
      const spin = (reduce ? 0 : t * 0.00004) + p * 0.9
      ctx!.strokeStyle = ink(0.75)
      for (let k = 0; k < 56; k++) {
        const th = spin + (k / 56) * Math.PI * 2
        const long = k % 2 === 0
        const r0 = rStar * 1.32
        const r1 = rStar * (long ? 2.5 : 1.85)
        ctx!.lineWidth = long ? 1.2 : 0.8
        ctx!.beginPath()
        ctx!.moveTo(cx + Math.cos(th) * r0, cy + Math.sin(th) * r0)
        ctx!.lineTo(cx + Math.cos(th) * r1, cy + Math.sin(th) * r1)
        ctx!.stroke()
      }
      ctx!.lineWidth = 0.9
      ctx!.strokeStyle = ink(0.6)
      ctx!.beginPath()
      ctx!.arc(cx, cy, rStar * 1.16, 0, Math.PI * 2)
      ctx!.stroke()
      ctx!.fillStyle = ink(1)
      ctx!.beginPath()
      ctx!.arc(cx, cy, rStar, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.strokeStyle = NIGHT
      for (const f of [0.5, 0.74]) {
        ctx!.lineWidth = 0.9
        ctx!.beginPath()
        ctx!.arc(cx, cy, rStar * f, 0, Math.PI * 2)
        ctx!.stroke()
      }
      ctx!.fillStyle = NIGHT
      for (const s of SUN_STIPPLE) {
        ctx!.beginPath()
        ctx!.arc(cx + s.u * rStar, cy + s.v * rStar, 0.75, 0, Math.PI * 2)
        ctx!.fill()
      }

      // worlds, back ones first so the front pair overlaps correctly
      const order = pos
        .map((_, i) => i)
        .sort((a, b) => Number(pos[a].front) - Number(pos[b].front))

      for (const i of order) {
        const world = worlds[i]
        const o = off[i]
        const x = pos[i].x + o.x
        const y = pos[i].y + o.y
        const selected = i === pick
        // depth: the far half of the orbit is smaller and printed lighter
        const depth = 0.78 + (pos[i].front ? 0.34 : 0) + o.grip * 0.3
        const r = Math.max(unit * bodyScale * world.size * depth, 5)

        if (o.grip > 0.05) {
          // the tether: what the cursor is doing, drawn honestly
          ctx!.strokeStyle = ink(o.grip * 0.6)
          ctx!.setLineDash([1, 4])
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.moveTo(pos[i].x, pos[i].y)
          ctx!.lineTo(x, y)
          ctx!.stroke()
          ctx!.setLineDash([])
        }

        ctx!.globalAlpha = pos[i].front ? 1 : 0.6
        engrave(x, y, r, Math.atan2(y - cy, x - cx), i)
        ctx!.globalAlpha = 1

        if (selected) {
          // the sub-editor's ring, with registration ticks
          ctx!.strokeStyle = red(0.95)
          ctx!.lineWidth = 1.2
          ctx!.beginPath()
          ctx!.arc(x, y, r + 9, 0, Math.PI * 2)
          ctx!.stroke()
          for (let q = 0; q < 4; q++) {
            const th = (q * Math.PI) / 2
            ctx!.beginPath()
            ctx!.moveTo(
              x + Math.cos(th) * (r + 13),
              y + Math.sin(th) * (r + 13),
            )
            ctx!.lineTo(
              x + Math.cos(th) * (r + 20),
              y + Math.sin(th) * (r + 20),
            )
            ctx!.stroke()
          }
          ctx!.font = '800 9.5px "Libre Franklin", system-ui, sans-serif'
          // set on the side away from the sun, so it never prints over it
          const outward = x >= cx
          ctx!.textAlign = outward ? 'left' : 'right'
          ctx!.fillStyle = red(1)
          ctx!.fillText(
            `EXHIBIT ${world.exhibit}`,
            outward ? x + r + 24 : x - r - 24,
            y - r - 10,
          )

          // leader line to the plate, the way a callout runs on a drawing
          if (plateBox.right > plateBox.left) {
            const ax = plateBox.right
            // enter the plate at the height of the world, clamped to stay on
            // its edge: an L, the way a callout runs on a drawing
            const ay = Math.min(
              Math.max(y, plateBox.top + 20),
              plateBox.bottom - 20,
            )
            if (ax < x - r - 60) {
              ctx!.strokeStyle = ink(0.42)
              ctx!.lineWidth = 0.9
              ctx!.beginPath()
              ctx!.moveTo(x - r - 20, y)
              ctx!.lineTo(ax + 40, y)
              ctx!.lineTo(ax + 40, ay)
              ctx!.lineTo(ax + 6, ay)
              ctx!.stroke()
              ctx!.fillStyle = ink(0.8)
              ctx!.beginPath()
              ctx!.arc(ax + 6, ay, 2.2, 0, Math.PI * 2)
              ctx!.fill()
            }
          }
        }
      }
    }

    // The canvas fills the pinned stage, so its top is the stage's, worked
    // out from the act's cached position rather than measured per event.
    function stageTop() {
      const at = actTop - viewY()
      return Math.min(Math.max(at, 0), at + actH - innerHeight)
    }
    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return
      mx = e.clientX
      my = e.clientY - stageTop()
    }

    // where the act sits, and the plate relative to the canvas: both are in
    // the same pinned stage, so the offset never changes while it moves
    let actTop = 0
    let actH = 0
    let plateBox = { left: 0, right: 0, top: 0, bottom: 0 }
    const measure = () => {
      actTop = docTop(act!)
      actH = act!.offsetHeight
      const plate = plateRef.current
      if (plate) {
        const pb = plate.getBoundingClientRect()
        const cb = canvas!.getBoundingClientRect()
        plateBox = {
          left: pb.left - cb.left,
          right: pb.right - cb.left,
          top: pb.top - cb.top,
          bottom: pb.bottom - cb.top,
        }
      }
    }
    const stopMeasure = onMeasure(measure)
    const plateRo = new ResizeObserver(measure)
    if (plateRef.current) plateRo.observe(plateRef.current)

    let raf = 0
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    addEventListener('resize', resize, { passive: true })
    if (usePointer) addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      plateRo.disconnect()
      stopMeasure()
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
    }
  }, [actRef, plateRef, onSelect])

  return (
    <canvas ref={canvasRef} className="ob-system__canvas" aria-hidden="true" />
  )
}

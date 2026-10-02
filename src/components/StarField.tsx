import { useEffect, useRef } from 'react'
import { docTop, onMeasure, viewY } from '@/lib/measure'

/**
 * The signature move: the pointer is a gravitational mass.
 *
 * Every star is displaced toward the cursor with an inverse-square falloff and
 * brightens as it approaches, then relaxes back when the pointer leaves. The
 * displacement is drawn as a short trail from the star's true position, so what
 * the eye reads is light being bent rather than dots being dragged.
 *
 * Gated to (hover: hover) and (pointer: fine); inert under reduced motion,
 * where the field paints once and stays put.
 */

type Star = {
  bx: number
  by: number
  x: number
  y: number
  r: number
  mag: number
  twinkle: number
  hue: number
}

const DENSITY = 1 / 7600 // stars per css pixel of viewport area
const REACH = 215 // px: where the pull is still worth drawing
const PULL = 36 // px: maximum displacement of a single star

export default function StarField({
  settleRef,
}: {
  settleRef?: React.RefObject<HTMLElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = matchMedia('(hover: hover) and (pointer: fine)')

    let stars: Star[] = []
    let w = 0
    let h = 0
    let dpr = 1

    // pointer state, lerped so the field carries momentum instead of snapping
    let px = -9999
    let py = -9999
    let tx = -9999
    let ty = -9999
    let mass = 0 // 0..1, eased so the field does not pop on enter/leave
    let targetMass = 0

    // the close settles the sky: gravity eases out and the stars come to rest
    let settleDamp = 1

    function seed() {
      const count = Math.round(Math.min(w * h * DENSITY, 520))
      stars = new Array(count).fill(0).map(() => {
        const mag = Math.random()
        return {
          bx: Math.random() * w,
          by: Math.random() * h,
          x: 0,
          y: 0,
          // a handful of bright ones, most of them faint. A field of evenly
          // sized dots reads as noise, not as a sky.
          r: 0.35 + Math.pow(mag, 3.2) * 1.9,
          mag: 0.24 + Math.pow(mag, 1.9) * 0.76,
          twinkle: Math.random() * Math.PI * 2,
          hue: Math.random(),
        }
      })
    }

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2)
      w = innerWidth
      h = innerHeight
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
      if (reduce) draw(0)
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h)

      const g = mass * settleDamp
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        let x = s.bx
        let y = s.by
        let lit = 0

        if (g > 0.001) {
          const dx = px - s.bx
          const dy = py - s.by
          const d2 = dx * dx + dy * dy
          const d = Math.sqrt(d2) || 1
          // inverse square with a softening length, so a star sitting exactly
          // under the cursor does not fly to infinity
          const f = (REACH * REACH) / (d2 + REACH * REACH * 0.35)
          const pull = Math.min(f * PULL * g, Math.min(d * 0.72, PULL))
          x += (dx / d) * pull
          y += (dy / d) * pull
          lit = Math.min(pull / PULL, 1)
        }

        s.x = x
        s.y = y

        const tw = reduce ? 1 : 0.82 + Math.sin(t * 0.0011 + s.twinkle) * 0.18
        const alpha = Math.min(s.mag * tw + lit * 0.5, 1)
        const radius = s.r * (1 + lit * 0.75)

        // the bend: a short trail from where the star really is
        if (lit > 0.08) {
          ctx!.strokeStyle = `rgba(178,48,28,${(lit * 0.34).toFixed(3)})`
          ctx!.lineWidth = Math.max(radius * 0.7, 0.5)
          ctx!.lineCap = 'round'
          ctx!.beginPath()
          ctx!.moveTo(s.bx, s.by)
          ctx!.lineTo(x, y)
          ctx!.stroke()
        }

        // Printed, not lit: ink on newsprint. Faint enough that a column of
        // text set over the field still reads, and the caught ones go red,
        // the way a sub-editor marks a proof.
        const base = lit > 0.35 ? '178,48,28' : '21,19,15'
        const ink = Math.min(alpha * 0.34 + lit * 0.3, 0.7)
        ctx!.fillStyle = `rgba(${base},${ink.toFixed(3)})`
        ctx!.beginPath()
        ctx!.arc(x, y, radius * 0.9, 0, Math.PI * 2)
        ctx!.fill()

        // the brightest get the cross a star chart prints on them
        if (s.r > 1.5) {
          const arm = radius * 3.2
          ctx!.strokeStyle = `rgba(${base},${(ink * 0.8).toFixed(3)})`
          ctx!.lineWidth = 0.7
          ctx!.beginPath()
          ctx!.moveTo(x - arm, y)
          ctx!.lineTo(x + arm, y)
          ctx!.moveTo(x, y - arm)
          ctx!.lineTo(x, y + arm)
          ctx!.stroke()
        }
      }
    }

    // The night sheets are opaque and cover the field completely; while one
    // fills the window there is nothing of the sky to draw.
    let nights: [number, number][] = []
    const stopMeasure = onMeasure(() => {
      nights = [
        ...document.querySelectorAll<HTMLElement>('[data-np-night]'),
      ].map((el) => [docTop(el), el.offsetHeight] as [number, number])
    })
    const covered = () => {
      const y = viewY()
      const vh = innerHeight
      return nights.some(([top, hgt]) => top <= y && top + hgt >= y + vh)
    }

    let raf = 0
    let lastDraw = 0
    let lastMove = -1e9
    let hidden = false
    function frame(t: number) {
      raf = requestAnimationFrame(frame)
      px += (tx - px) * 0.14
      py += (ty - py) * 0.14
      mass += (targetMass - mass) * 0.07
      if (covered()) {
        if (!hidden) {
          ctx!.clearRect(0, 0, w, h)
          hidden = true
        }
        return
      }
      // with the pointer at rest the only motion is a slow twinkle, which
      // reads the same at 15 frames a second; full rate only while it pulls
      const settling =
        Math.abs(tx - px) + Math.abs(ty - py) > 0.5 ||
        Math.abs(targetMass - mass) > 0.002
      const pulling = settling || t - lastMove < 300
      if (!pulling && !hidden && t - lastDraw < 66) return
      hidden = false
      lastDraw = t
      draw(t)
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return
      lastMove = performance.now()
      if (px < -9000) {
        px = e.clientX
        py = e.clientY
      }
      tx = e.clientX
      ty = e.clientY
      targetMass = 1
    }
    function onLeave() {
      targetMass = 0
    }

    resize()
    addEventListener('resize', resize, { passive: true })

    if (!reduce && fine.matches) {
      addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerleave', onLeave)
      raf = requestAnimationFrame(frame)
    }

    // The last chapter resolves: as the colophon arrives, gravity fades out and
    // the field comes to rest. The page arrives somewhere and stops.
    let io: IntersectionObserver | null = null
    const settleEl = settleRef?.current
    if (settleEl && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            settleDamp = e.isIntersecting
              ? Math.max(0, 1 - e.intersectionRatio * 1.6)
              : 1
          }
        },
        { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] },
      )
      io.observe(settleEl)
    }

    return () => {
      cancelAnimationFrame(raf)
      stopMeasure()
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      io?.disconnect()
    }
  }, [settleRef])

  return (
    <div className="ob-sky" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}

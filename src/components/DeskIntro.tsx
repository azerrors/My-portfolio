import { useEffect, useRef } from 'react'

/**
 * The way in. The edition opens on its own photograph: the subject at his
 * desk, and on his monitor, the front page you are about to read. Scrolling
 * walks the camera into that monitor until the screen is the window, and the
 * page on it is the real one underneath.
 *
 * The screen does not show a picture of the page. It shows a live copy of the
 * page's own first screen, cloned from the DOM and projected onto the tilted
 * glass with a homography, so it stays sharp at any zoom. As the camera
 * arrives, the projection relaxes to the identity and lands exactly over the
 * real page, which is then simply uncovered.
 */

/** The glass of the monitor, in the portrait's own pixels (793 x 793). */
const IMG = 793
const GLASS = [
  [178, 212], // top left
  [349, 204], // top right
  [343, 368], // bottom right
  [182, 380], // bottom left
] as const

type Pt = [number, number]
type M3 = number[]

/* ----------------------------------------------- projective mapping, 3x3 */
const adj = (m: M3): M3 => [
  m[4] * m[8] - m[5] * m[7],
  m[2] * m[7] - m[1] * m[8],
  m[1] * m[5] - m[2] * m[4],
  m[5] * m[6] - m[3] * m[8],
  m[0] * m[8] - m[2] * m[6],
  m[2] * m[3] - m[0] * m[5],
  m[3] * m[7] - m[4] * m[6],
  m[1] * m[6] - m[0] * m[7],
  m[0] * m[4] - m[1] * m[3],
]
const mul = (a: M3, b: M3): M3 => {
  const c: M3 = []
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      c[i * 3 + j] =
        a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]
  return c
}
const mulV = (m: M3, v: number[]) => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
]
/** The matrix taking the unit basis onto four points (tl, tr, bl, br). */
function basis(p: Pt[]): M3 {
  const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1]
  const v = mulV(adj(m), [p[3][0], p[3][1], 1])
  return mul(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]])
}
/** CSS matrix3d mapping the w x h box onto the quad (tl, tr, br, bl). */
function project(w: number, h: number, q: Pt[]) {
  const src = basis([
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ])
  const dst = basis([q[0], q[1], q[3], q[2]])
  const t = mul(dst, adj(src))
  const k = t[8]
  const n = t.map((x) => x / k)
  return `matrix3d(${n[0]},${n[3]},0,${n[6]},${n[1]},${n[4]},0,${n[7]},0,0,1,0,${n[2]},${n[5]},0,1)`
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const smooth = (x: number) => x * x * (3 - 2 * x)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export default function DeskIntro({
  sources,
  onEnter,
}: {
  /** Selectors for the page's first screen, cloned onto the monitor. */
  sources: string[]
  /** Called once, when the reader is through the glass. */
  onEnter: () => void
}) {
  const actRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const act = actRef.current
    const scene = sceneRef.current
    const screen = screenRef.current
    const page = pageRef.current
    const stage = stageRef.current
    if (!act || !scene || !screen || !page || !stage) return

    // the real first screen, to land on exactly. Taken before the copy
    // exists: the intro comes first in the document, so afterwards the
    // first match would be the copy itself.
    const anchor = document.querySelector<HTMLElement>(sources[0])
    // the live copy of the first screen: same classes, so the same layout
    for (const sel of sources) {
      const el = document.querySelector(sel)
      if (!el) continue
      const copy = el.cloneNode(true) as HTMLElement
      copy.removeAttribute('id')
      // the real masthead is pulled up under this stage; the copy is not
      copy.classList.remove('np-mast--after-intro')
      copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'))
      // the scroll engine must never mistake the copy for a section of its own
      for (const n of [copy, ...copy.querySelectorAll<HTMLElement>('*')])
        for (const a of [...n.attributes])
          if (a.name.startsWith('data-sc')) n.removeAttribute(a.name)
      copy
        .querySelectorAll('a, button')
        .forEach((n) => n.setAttribute('tabindex', '-1'))
      page.appendChild(copy)
    }
    const photo = scene.querySelector<HTMLImageElement>('img')

    let entered = false
    let raf = 0
    const root = document.documentElement

    const frame = () => {
      raf = requestAnimationFrame(frame)
      const W = innerWidth
      const H = innerHeight
      const travel = Math.max(act.offsetHeight - H, 1)
      const p = clamp01(-act.getBoundingClientRect().top / travel)
      const e = smooth(p)

      root.dataset.intro = p < 0.995 ? 'on' : 'off'
      if (p >= 0.995 && !entered) {
        entered = true
        onEnter()
      }

      // the photograph, as printed: a square plate in the middle of the sheet
      // on a tall phone the plate is cropped larger, so the desk and the
      // monitor carry the screen rather than floating in a margin
      const S =
        W < H ? Math.min(H * 0.62, W * 1.45) : Math.min(H * 0.84, W * 0.92)
      const ox = (W - S) / 2
      const oy = (H - S) / 2 + H * 0.02
      const k = S / IMG
      if (photo) {
        photo.style.width = `${S}px`
        photo.style.left = `${ox}px`
        photo.style.top = `${oy}px`
      }
      page.style.width = `${W}px`
      page.style.height = `${H}px`
      const quad0: Pt[] = GLASS.map(([x, y]) => [ox + x * k, oy + y * k])
      const qw = quad0[1][0] - quad0[0][0]
      const qh = quad0[3][1] - quad0[0][1]
      const qc: Pt = [
        (quad0[0][0] + quad0[1][0] + quad0[2][0] + quad0[3][0]) / 4,
        (quad0[0][1] + quad0[1][1] + quad0[2][1] + quad0[3][1]) / 4,
      ]

      // the camera: zoom on the glass until it more than covers the window
      const s1 = Math.max(W / qw, H / qh) * 1.12
      const s = Math.pow(s1, e)
      const cx = lerp(qc[0], W / 2, e)
      const cy = lerp(qc[1], H / 2, e)
      const tx = cx - s * qc[0]
      const ty = cy - s * qc[1]
      scene.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`
      scene.style.opacity = String(1 - clamp01((p - 0.82) / 0.14))

      // the glass, where the camera has carried it
      const quad = quad0.map(([x, y]) => [tx + s * x, ty + s * y] as Pt)

      // the screen's crop: the glass is near square, the window is not, so
      // the copy is cropped to the glass's shape and opens out to the window
      const A = qw / qh
      const V = W / H
      let wc = W
      let hc = H
      if (V > A * 1.45) wc = H * A * 1.45
      else if (V < A / 1.25) hc = (W / A) * 1.25
      wc = lerp(wc, W, e)
      hc = lerp(hc, H, e)
      screen.style.width = `${wc}px`
      screen.style.height = `${hc}px`
      page.style.left = `${(-(W - wc) / 2).toFixed(2)}px`

      // where the real page sits right now: the copy lands there
      const top = anchor ? anchor.getBoundingClientRect().top : 0
      const land: Pt[] = [
        [0, top],
        [W, top],
        [W, top + H],
        [0, top + H],
      ]
      const pull = Math.pow(clamp01((p - 0.5) / 0.5), 1.6)
      const target = quad.map(
        ([x, y], i) =>
          [lerp(x, land[i][0], pull), lerp(y, land[i][1], pull)] as Pt,
      )
      screen.style.transform = project(wc, hc, target)
      screen.style.borderRadius = `${lerp(14, 0, e)}px`

      // the stage steps aside once the copy is over the page
      stage.style.opacity = String(1 - clamp01((p - 0.97) / 0.03))
      stage.style.visibility = p >= 1 ? 'hidden' : 'visible'
      if (hintRef.current)
        hintRef.current.style.opacity = String(1 - clamp01(p * 5))
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      delete root.dataset.intro
      page.replaceChildren()
    }
  }, [sources, onEnter])

  return (
    <section className="np-intro" ref={actRef} aria-hidden="true">
      <div className="np-intro__stage" ref={stageRef}>
        <div className="np-intro__scene" ref={sceneRef}>
          <img
            className="np-intro__photo"
            src="/plates/portrait.webp"
            width={IMG}
            height={IMG}
            alt=""
            fetchPriority="high"
          />
        </div>
        <div className="np-intro__screen" ref={screenRef}>
          <div className="np-intro__page" ref={pageRef} inert />
        </div>
        <p className="np-intro__hint" ref={hintRef}>
          <span>Fig. 0. The desk, Baku</span>
          <span>Scroll to go in</span>
        </p>
      </div>
    </section>
  )
}

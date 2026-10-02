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

/** The office plate, and the glass of its monitor, in the image's pixels. */
const IW = 1024
const IH = 572
const GLASS = [
  [423, 199], // top left
  [553, 197], // top right
  [548, 306], // bottom right
  [426, 315], // bottom left
] as const
/** How round the glass's corners are, in the same pixels. */
const GLASS_RADIUS = 7

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
  const hintRef = useRef<HTMLDivElement>(null)
  const crtRef = useRef<HTMLDivElement>(null)

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

    // a little parallax under a mouse, so the room is a room before it moves
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
    let mx = 0
    let my = 0
    let tmx = 0
    let tmy = 0
    const onMove = (ev: PointerEvent) => {
      tmx = ev.clientX / innerWidth - 0.5
      tmy = ev.clientY / innerHeight - 0.5
    }
    if (fine) addEventListener('pointermove', onMove, { passive: true })

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

      // the photograph, full bleed: covers the window, and on a narrow screen
      // slides toward the monitor so the desk is still the subject
      const k = Math.max(W / IW, H / IH) * 1.06
      const fw = IW * k
      const fh = IH * k
      const gx = ((GLASS[0][0] + GLASS[1][0]) / 2) * k
      const gy = ((GLASS[0][1] + GLASS[3][1]) / 2) * k
      const lean = clamp01((1.3 - W / H) / 0.9)
      const ox = Math.min(
        0,
        Math.max(W - fw, lerp((W - fw) / 2, W * 0.5 - gx, lean)),
      )
      const oy = Math.min(
        0,
        Math.max(H - fh, lerp((H - fh) / 2, H * 0.42 - gy, lean)),
      )
      mx += (tmx - mx) * 0.06
      my += (tmy - my) * 0.06
      const px = -mx * 18 * (1 - e)
      const py = -my * 12 * (1 - e)
      if (photo) {
        photo.style.width = `${fw}px`
        photo.style.left = `${ox}px`
        photo.style.top = `${oy}px`
      }
      page.style.width = `${W}px`
      const quad0: Pt[] = GLASS.map(([x, y]) => [
        ox + x * k + px,
        oy + y * k + py,
      ])
      const qw = quad0[1][0] - quad0[0][0]
      const qh = quad0[3][1] - quad0[0][1]
      const qc: Pt = [
        (quad0[0][0] + quad0[1][0] + quad0[2][0] + quad0[3][0]) / 4,
        (quad0[0][1] + quad0[1][1] + quad0[2][1] + quad0[3][1]) / 4,
      ]

      // Two movements. First the camera flies into the glass while the page
      // stays printed on it, bezel and all. Then, with the room faded out,
      // the glass straightens and becomes the window.
      const z = smooth(clamp01(p / 0.8))
      const pull = smooth(clamp01((p - 0.8) / 0.2))

      // the camera: zoom until the glass spans the window
      // fit the glass across the window: the whole page stays readable on a
      // phone too, and the pull then opens it to the full height
      const s1 = W / qw
      const s = Math.pow(s1, z)
      const cx = lerp(qc[0], W / 2, z)
      const cy = lerp(qc[1], H / 2, z)
      const tx = cx - s * qc[0]
      const ty = cy - s * qc[1]
      scene.style.transform = `translate3d(${tx + s * px}px, ${ty + s * py}px, 0) scale(${s})`
      scene.style.opacity = String(1 - clamp01((p - 0.78) / 0.14))

      // the glass, where the camera has carried it
      const quad = quad0.map(([x, y]) => [tx + s * x, ty + s * y] as Pt)

      // The screen box has the glass's own proportions, so nothing on it is
      // squeezed. The page inside keeps the window's width and is scaled to
      // fit the glass across, the way a monitor shows a whole page; it runs
      // on below the fold. Both open out to the window on the pull.
      const A = qw / qh
      const wide = W / H > A
      const wc = lerp(wide ? H * A : W, W, pull)
      const hc = lerp(wide ? H : W / A, H, pull)
      const ps = wc / W
      screen.style.width = `${wc}px`
      screen.style.height = `${hc}px`
      page.style.height = `${Math.max(H, hc / ps).toFixed(1)}px`
      page.style.transform = `scale(${ps})`

      // where the real page sits right now: the copy lands there
      const top = anchor ? anchor.getBoundingClientRect().top : 0
      const land: Pt[] = [
        [0, top],
        [W, top],
        [W, top + H],
        [0, top + H],
      ]
      const target = quad.map(
        ([x, y], i) =>
          [lerp(x, land[i][0], pull), lerp(y, land[i][1], pull)] as Pt,
      )
      screen.style.transform = project(wc, hc, target)

      // how small the screen is drawn right now. Scanlines are spaced in
      // drawn pixels, not page pixels, or at the desk they shrink below a
      // pixel and alias into rings
      const drawn = Math.hypot(
        target[1][0] - target[0][0],
        target[1][1] - target[0][1],
      )
      const zoom = Math.max(drawn / wc, 0.01)
      screen.style.setProperty('--scan', `${(3 / zoom).toFixed(2)}px`)

      // the glass's rounded corners, carried by the camera: a fixed radius in
      // the drawing, so in screen-box units it is divided by the zoom. They
      // square off as the glass becomes the window.
      const radius = ((GLASS_RADIUS * k * s) / zoom) * (1 - pull)
      screen.style.borderRadius = `${radius.toFixed(2)}px`

      // the stage steps aside once the copy is over the page
      stage.style.opacity = String(1 - clamp01((p - 0.97) / 0.03))
      stage.style.visibility = p >= 1 ? 'hidden' : 'visible'
      if (hintRef.current)
        hintRef.current.style.opacity = String(1 - clamp01(p * 4))
      // the tube: dim, lined and curved at the desk; clear by the time the
      // camera is close enough to read it
      if (crtRef.current)
        crtRef.current.style.opacity = String(1 - clamp01((p - 0.15) / 0.45))
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
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
            src="/plates/office.webp"
            width={IW}
            height={IH}
            alt=""
            fetchPriority="high"
          />
        </div>
        <div className="np-intro__screen" ref={screenRef}>
          <div className="np-intro__page" ref={pageRef} inert />
          <div className="np-intro__crt" ref={crtRef} />
        </div>

        {/* the plate, framed and captioned like a front-page photograph */}
        <div className="np-intro__frame" ref={hintRef}>
          <p className="np-intro__mast">
            <span>Late final</span>
            <b>The Naghiyev Observer</b>
            <span>Baku, after hours</span>
          </p>
          <div className="np-intro__foot">
            <p className="np-intro__cap">
              <b>Fig. 0.</b> The night desk. The subject at work, the edition
              already on his screen.
            </p>
            <p className="np-intro__cue">
              Scroll to go in
              <span aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

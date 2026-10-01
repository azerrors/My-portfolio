/**
 * Woodcuts for the lab report: the meteor, its strike, and the four specimen
 * medallions. Drawn the way the page's plates are engraved: one ink, line
 * weight for form, hatching for shadow, nothing lit or blurred.
 *
 * The meteor and burst print in paper colour onto the night sheet; the
 * medallions print in ink onto the cards.
 */

const PAPER = 'var(--np-night-ink)'
const NIGHT = 'var(--np-night)'
const INK = 'var(--np-ink)'

/* Deterministic, so every meteor is the same rock in every screenshot. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const ROCK = (() => {
  const rand = rng(11)
  const pts = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2
    const r = 13 + rand() * 5
    return `${(290 + Math.cos(a) * r).toFixed(1)},${(30 + Math.sin(a) * r * 0.92).toFixed(1)}`
  })
  return pts.join(' ')
})()

/** Speed lines: longest through the centre, shorter and lighter outward. */
const STREAKS = Array.from({ length: 9 }, (_, k) => {
  const off = k - 4
  const len = 250 - Math.abs(off) * 38 - (k % 2) * 22
  return { y: 30 + off * 4.1, x0: 280 - len, w: 2.4 - Math.abs(off) * 0.4 }
})

const DEBRIS = (() => {
  const rand = rng(5)
  return Array.from({ length: 14 }, () => ({
    x: 40 + rand() * 200,
    y: 30 + (rand() - 0.5) * 34,
    r: 0.6 + rand() * 1.4,
  }))
})()

export function MeteorCut({ uid }: { uid: string }) {
  const hatch = `meteor-hatch-${uid}`
  const rock = `meteor-rock-${uid}`
  return (
    <svg
      className="np-meteor-cut"
      viewBox="0 0 320 60"
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
    >
      <defs>
        <pattern
          id={hatch}
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="3" stroke={NIGHT} strokeWidth="1.3" />
        </pattern>
        <clipPath id={rock}>
          <polygon points={ROCK} />
        </clipPath>
      </defs>

      {STREAKS.map((s) => (
        <line
          key={s.y}
          x1={s.x0}
          y1={s.y}
          x2={278}
          y2={s.y}
          stroke={PAPER}
          strokeWidth={Math.max(s.w, 0.6)}
          strokeDasharray={s.w < 1.2 ? '18 6 4 6' : undefined}
        />
      ))}
      {DEBRIS.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={PAPER} />
      ))}

      {/* flames wrapping the trailing side of the head, cut as tongues */}
      <g stroke={PAPER} strokeWidth="1.4">
        <path d="M276 14 C 262 16, 258 22, 246 20 C 256 24, 262 26, 272 24" />
        <path d="M274 46 C 260 44, 256 38, 244 40 C 254 36, 262 34, 272 36" />
        <path d="M270 30 C 258 27, 250 31, 236 29" />
      </g>

      {/* the rock: lit from ahead, hatched behind, pitted */}
      <polygon points={ROCK} fill={PAPER} />
      <g clipPath={`url(#${rock})`}>
        <rect x="268" y="30" width="44" height="24" fill={`url(#${hatch})`} />
        <rect x="268" y="10" width="14" height="24" fill={`url(#${hatch})`} />
        <circle cx="294" cy="24" r="3.4" stroke={NIGHT} strokeWidth="1.1" />
        <circle cx="286" cy="34" r="2.2" stroke={NIGHT} strokeWidth="1" />
        <circle cx="299" cy="35" r="1.6" stroke={NIGHT} strokeWidth="0.9" />
      </g>
      <polygon points={ROCK} stroke={NIGHT} strokeWidth="1.2" />
    </svg>
  )
}

/** The strike, as a woodcut starburst: an outer spiked ring and rays. */
export function BurstCut() {
  const spikes = (n: number, ro: number, ri: number) =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 ? ri : ro
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`
    }).join(' ')
  return (
    <svg
      className="np-burst-cut"
      viewBox="-50 -50 100 100"
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
    >
      <polygon
        points={spikes(14, 46, 26)}
        fill={NIGHT}
        stroke="#e2603f"
        strokeWidth="2"
      />
      <polygon
        points={spikes(10, 24, 13)}
        fill={PAPER}
        stroke="#e2603f"
        strokeWidth="1.2"
      />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        return (
          <line
            key={i}
            x1={Math.cos(a) * 30}
            y1={Math.sin(a) * 30}
            x2={Math.cos(a) * (i % 2 ? 38 : 44)}
            y2={Math.sin(a) * (i % 2 ? 38 : 44)}
            stroke={PAPER}
            strokeWidth="1.2"
          />
        )
      })}
    </svg>
  )
}

/* --------------------------------------------------- specimen medallions */

function Hatch({ id }: { id: string }) {
  return (
    <pattern
      id={id}
      width="2.6"
      height="2.6"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(-45)"
    >
      <line x1="0" y1="0" x2="0" y2="2.6" stroke={INK} strokeWidth="0.9" />
    </pattern>
  )
}

function gear(cx: number, cy: number, n: number, ro: number, ri: number) {
  const pts: string[] = []
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2
    const step = (Math.PI * 2) / n
    for (const [f, r] of [
      [0, ri],
      [0.15, ro],
      [0.5, ro],
      [0.65, ri],
    ] as const) {
      const a = a0 + step * f
      pts.push(
        `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`,
      )
    }
  }
  return pts.join(' ')
}

const ICONS: Record<string, (id: string) => React.ReactNode> = {
  /* a letterpress sort, face up */
  lang: (id) => (
    <>
      <path d="M18 24 L27 15 L49 15 L40 24 Z" fill="none" />
      <path d="M40 24 L49 15 L49 45 L40 54 Z" fill={`url(#${id})`} />
      <rect x="18" y="24" width="22" height="30" fill="var(--np-paper)" />
      <line x1="18" y1="47" x2="40" y2="47" />
      <text
        x="29"
        y="42"
        textAnchor="middle"
        fontSize="17"
        fill={INK}
        stroke="none"
        style={{ fontFamily: 'var(--np-display)' }}
      >
        A
      </text>
      <path d="M30 18.5 L36 18.5 L33 21 Z" fill={INK} />
    </>
  ),
  /* two gears in mesh */
  frame: (id) => (
    <>
      <polygon points={gear(26, 27, 10, 15, 11.5)} fill="var(--np-paper)" />
      <circle cx="26" cy="27" r="4.5" fill={`url(#${id})`} />
      <circle cx="26" cy="27" r="4.5" fill="none" />
      <polygon points={gear(44.5, 44, 8, 11, 8.2)} fill={`url(#${id})`} />
      <polygon points={gear(44.5, 44, 8, 11, 8.2)} fill="none" />
      <circle cx="44.5" cy="44" r="3" fill="var(--np-paper)" />
    </>
  ),
  /* an ink brayer, mid-stroke */
  ui: (id) => (
    <>
      <rect
        x="10"
        y="50"
        width="44"
        height="5"
        fill={`url(#${id})`}
        stroke="none"
      />
      <line x1="10" y1="55" x2="54" y2="55" />
      <rect
        x="14"
        y="31"
        width="36"
        height="16"
        rx="8"
        fill="var(--np-paper)"
      />
      <path
        d="M16 41 Q32 47 48 41 L48 45 Q32 50 16 45 Z"
        fill={`url(#${id})`}
        stroke="none"
      />
      <ellipse cx="14" cy="39" rx="2.6" ry="8" fill="var(--np-paper)" />
      <path d="M50 39 L56 39 L56 22 L40 14" fill="none" strokeWidth="1.6" />
      <rect
        x="35"
        y="9"
        width="12"
        height="7"
        rx="3"
        transform="rotate(26 41 12)"
        fill={`url(#${id})`}
      />
    </>
  ),
  /* a drafting compass, drawing its arc */
  tools: (id) => (
    <>
      <path
        d="M14 50 A 24 24 0 0 1 50 50"
        fill="none"
        strokeDasharray="2 2.5"
      />
      <path d="M31 14 L17 50 L20 51 L33 17 Z" fill={`url(#${id})`} />
      <path d="M33 14 L47 50 L44 51 L31 17 Z" fill="var(--np-paper)" />
      <line x1="25" y1="33" x2="39" y2="33" />
      <circle cx="32" cy="12" r="4.4" fill="var(--np-paper)" />
      <line x1="32" y1="4" x2="32" y2="8" strokeWidth="1.8" />
      <circle cx="47" cy="51" r="1.3" fill={INK} />
    </>
  ),
}

export function SpecimenIcon({ kind }: { kind: string }) {
  const id = `hatch-${kind}`
  return (
    <svg
      className="np-specimen"
      viewBox="0 0 64 64"
      aria-hidden="true"
      stroke={INK}
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        <Hatch id={id} />
      </defs>
      {ICONS[kind]?.(id)}
    </svg>
  )
}

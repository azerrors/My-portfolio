/**
 * Chapter II's media column. An observation plate drawn from real figures:
 * 47 pages on the upper register, 46 API modules on the lower one, with the
 * dimension lines a plate would actually carry.
 *
 * Deterministic heights, not Math.random, so the drawing is the same on every
 * load and in every screenshot.
 */

const PAGES = 47
const MODULES = 46

function height(i: number, seed: number, max: number) {
  const n = Math.sin((i + 1) * seed) * 10000
  return 6 + (n - Math.floor(n)) * max
}

export default function PagePlate() {
  const left = 18
  const right = 302
  const span = right - left
  const pageStep = span / (PAGES - 1)
  const moduleStep = span / (MODULES - 1)

  return (
    <svg viewBox="0 0 320 236" role="img" aria-labelledby="plate-title">
      <title id="plate-title">
        Two registers: 47 pages above, 46 API modules below, drawn to scale
      </title>

      {/* upper register: pages */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.85">
        {Array.from({ length: PAGES }, (_, i) => {
          const x = left + i * pageStep
          const hgt = height(i, 12.9898, 52)
          return <line key={i} x1={x} y1={96} x2={x} y2={96 - hgt} />
        })}
      </g>
      <line
        x1={left}
        y1="96"
        x2={right}
        y2="96"
        stroke="currentColor"
        strokeWidth="1"
      />

      {/* dimension line over the register */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.5">
        <line x1={left} y1="24" x2={right} y2="24" />
        <line x1={left} y1="18" x2={left} y2="30" />
        <line x1={right} y1="18" x2={right} y2="30" />
      </g>
      <text x={left} y="14" className="ob-plate-t">
        47 PAGES
      </text>

      {/* lower register: api modules, as a dotted field */}
      <g fill="currentColor" opacity="0.7">
        {Array.from({ length: MODULES }, (_, i) => {
          const x = left + i * moduleStep
          const y = 132 + height(i, 78.233, 46)
          return <circle key={i} cx={x} cy={y} r="1.7" />
        })}
      </g>
      <line
        x1={left}
        y1="196"
        x2={right}
        y2="196"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
      <g stroke="currentColor" strokeWidth="1" opacity="0.5">
        <line x1={left} y1="196" x2={left} y2="202" />
        <line x1={right} y1="196" x2={right} y2="202" />
      </g>
      <text x={left} y="216" className="ob-plate-t">
        46 API MODULES
      </text>
      <text x={right} y="216" textAnchor="end" className="ob-plate-t">
        51 ROUTES
      </text>
    </svg>
  )
}

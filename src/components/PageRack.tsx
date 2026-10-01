import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Section } from '@/components/Folio'
import { useActiveSection } from '@/lib/useActiveSection'
import { useMedia } from '@/lib/useMedia'

/**
 * The page rack, on the left edge: the edition's pages as old newsprint,
 * stacked and peeking out from the margin. Each one is a miniature of its own
 * page (the front with its portrait, the night sheets black, the moon plate,
 * the orbits) so the rack reads as a contents page you can see.
 *
 * The page the reader is on slides out of the stack. Pages already read get a
 * turned-down corner, which is what a reader does to a paper. Hovering or
 * focusing a page pulls it out with its headline. Every page is a real anchor.
 */

const SPRING = { type: 'spring', stiffness: 380, damping: 30 } as const

/* Ink on newsprint, at 48 x 66. Each sketch is that page, reduced. */
const INK = 'var(--np-ink)'
const NEWS = 'var(--rack-paper)'
const NIGHT = 'var(--np-night)'

function lines(x: number, y: number, w: number, n: number, gap = 2.6) {
  return Array.from({ length: n }, (_, i) => (
    <line
      key={`${x}-${y}-${i}`}
      x1={x}
      y1={y + i * gap}
      x2={x + (i === n - 1 ? w * 0.6 : w)}
      y2={y + i * gap}
    />
  ))
}

const SKETCHES: Record<string, React.ReactNode> = {
  front: (
    <>
      <rect x="5" y="4" width="38" height="4" fill={INK} />
      <line x1="5" y1="10.5" x2="43" y2="10.5" strokeWidth="1.2" />
      <rect x="5" y="14" width="21" height="2.4" fill={INK} />
      <rect x="5" y="18" width="16" height="2.4" fill={INK} />
      <g strokeWidth="0.6">{lines(5, 24, 21, 12)}</g>
      <rect
        x="29"
        y="14"
        width="14"
        height="16"
        fill="none"
        strokeWidth="0.8"
      />
      <circle cx="37" cy="20" r="2.4" fill={INK} />
      <path d="M31 30 q6 -8 12 0" fill={INK} />
      <g strokeWidth="0.6">{lines(29, 34, 14, 9)}</g>
      <line x1="5" y1="57" x2="43" y2="57" strokeWidth="1.2" />
    </>
  ),
  instruments: (
    <>
      <rect x="3" y="3" width="42" height="60" fill={NIGHT} stroke="none" />
      <line x1="6" y1="10" x2="42" y2="10" stroke={NEWS} strokeWidth="0.6" />
      <line
        x1="10"
        y1="14"
        x2="18"
        y2="24"
        stroke="#e2603f"
        strokeWidth="0.9"
      />
      <rect
        x="7"
        y="25"
        width="10"
        height="16"
        fill={NEWS}
        stroke="none"
        transform="rotate(-4 12 33)"
      />
      <rect
        x="19"
        y="23"
        width="10"
        height="20"
        fill={NEWS}
        stroke="none"
        transform="rotate(3 24 33)"
      />
      <rect
        x="31"
        y="26"
        width="10"
        height="14"
        fill={NEWS}
        stroke="none"
        transform="rotate(-2 36 33)"
      />
      <line
        x1="30"
        y1="46"
        x2="36"
        y2="54"
        stroke="#e2603f"
        strokeWidth="0.9"
      />
      <circle cx="36.5" cy="54.5" r="1.1" fill={NEWS} stroke="none" />
    </>
  ),
  ignition: (
    <>
      <rect x="5" y="5" width="38" height="30" fill={NIGHT} stroke="none" />
      <circle cx="28" cy="20" r="9" fill={NEWS} stroke="none" />
      <circle cx="25" cy="18" r="2" fill={INK} opacity="0.5" stroke="none" />
      <circle cx="31" cy="23" r="2.6" fill={INK} opacity="0.35" stroke="none" />
      <rect x="5" y="39" width="22" height="2.4" fill={INK} />
      <g strokeWidth="0.6">{lines(5, 45, 17, 6)}</g>
      <g strokeWidth="0.6">{lines(26, 45, 17, 6)}</g>
      <line x1="24" y1="44" x2="24" y2="59" strokeWidth="0.5" />
    </>
  ),
  system: (
    <>
      <rect x="3" y="3" width="42" height="60" fill={NIGHT} stroke="none" />
      <g fill="none" stroke={NEWS} strokeWidth="0.55">
        <ellipse cx="24" cy="30" rx="8" ry="3" />
        <ellipse cx="24" cy="30" rx="14" ry="5.5" strokeDasharray="1 1.5" />
        <ellipse
          cx="24"
          cy="30"
          rx="19"
          ry="7.5"
          stroke="#e2603f"
          strokeWidth="0.8"
        />
      </g>
      <circle cx="24" cy="30" r="2.2" fill={NEWS} stroke="none" />
      <circle cx="38" cy="34" r="1.8" fill={NEWS} stroke="none" />
      <rect
        x="6"
        y="42"
        width="15"
        height="16"
        fill={NEWS}
        stroke="none"
        transform="rotate(-3 13 50)"
      />
    </>
  ),
  colophon: (
    <>
      <rect x="5" y="5" width="26" height="3" fill={INK} />
      <g strokeWidth="0.6">{lines(5, 12, 18, 7)}</g>
      <g strokeWidth="0.6">{lines(26, 12, 17, 7)}</g>
      <rect x="5" y="33" width="38" height="20" fill={NIGHT} stroke="none" />
      <ellipse
        cx="31"
        cy="43"
        rx="10"
        ry="2.4"
        fill="none"
        stroke={NEWS}
        strokeWidth="1"
      />
      <circle
        cx="31"
        cy="42"
        r="3.6"
        fill={NIGHT}
        stroke={NEWS}
        strokeWidth="0.6"
      />
      <line x1="5" y1="58" x2="43" y2="58" strokeWidth="1.2" />
    </>
  ),
}

export default function PageRack({ sections }: { sections: Section[] }) {
  const active = useActiveSection(sections.map((s) => s.id))
  const [over, setOver] = useState<number | null>(null)
  // Below a real margin the rack becomes a tray along the foot of the screen:
  // the pages peek up from the bottom edge and the one in hand rises out.
  const tray = useMedia('(max-width: 1359px)')
  const now = sections[active]

  return (
    <nav className="np-rack" data-tray={tray} aria-label="Pages">
      {tray ? (
        <motion.p
          className="np-rack__now"
          key={now.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          aria-hidden="true"
        >
          <b>P. {now.page}</b>
          {now.label}
        </motion.p>
      ) : null}
      <ol>
        {sections.map((s, i) => {
          const on = i === active
          const out = on || over === i
          const tilt = i % 2 ? 2.5 : -2
          return (
            <li key={s.id}>
              <motion.a
                href={`#${s.id}`}
                className="np-rack__page"
                data-on={on}
                data-read={i < active}
                aria-current={on ? 'page' : undefined}
                aria-label={`Page ${s.page}: ${s.label}`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setOver(i)}
                onPointerLeave={() => setOver(null)}
                onFocus={() => setOver(i)}
                onBlur={() => setOver(null)}
                initial={false}
                animate={
                  tray
                    ? {
                        x: 0,
                        y: out ? -6 : 16,
                        rotate: out ? 0 : tilt,
                        scale: on ? 1.08 : 1,
                      }
                    : {
                        x: out ? 0 : -30,
                        y: 0,
                        rotate: out ? 0 : tilt,
                        scale: on ? 1.06 : 1,
                      }
                }
                whileTap={{ scale: 0.94 }}
                transition={SPRING}
              >
                <svg
                  viewBox="0 0 48 66"
                  aria-hidden="true"
                  stroke={INK}
                  strokeLinecap="round"
                >
                  {SKETCHES[s.id]}
                </svg>
                <span className="np-rack__num" aria-hidden="true">
                  {s.page}
                </span>
              </motion.a>

              {tray ? null : (
                <motion.span
                  className="np-rack__label"
                  aria-hidden="true"
                  initial={false}
                  animate={{
                    opacity: over === i ? 1 : 0,
                    x: over === i ? 0 : -8,
                  }}
                  transition={SPRING}
                >
                  <b>P. {s.page}</b>
                  {s.label}
                </motion.span>
              )}
            </li>
          )
        })}
      </ol>
      {tray ? null : (
        <p className="np-rack__count" aria-hidden="true">
          {now.page} / {sections.length}
        </p>
      )}
    </nav>
  )
}

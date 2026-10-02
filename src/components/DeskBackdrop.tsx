import { useEffect, useRef, useState } from 'react'
import { onMeasure, viewY } from '@/lib/measure'

/**
 * The desk under the paper. Typewritten notes, index cards, a torn notebook
 * page, a receipt, a carbon copy, clips and a coffee ring, all printed faint
 * enough to read as texture until you look.
 *
 * A few sheets are still in the machine: they type themselves a key at a
 * time, sit finished for a while, then the next note is fed in. Each live
 * sheet owns its own state, so a keystroke re-renders one sheet, not the desk.
 * Under reduced motion every note is simply there, already typed.
 */

type Kind = 'memo' | 'card' | 'torn' | 'receipt' | 'carbon'

type Piece = {
  kind: Kind
  x: number
  y: number
  w: number
  rot: number
  title: string
  notes: string[][]
  live?: boolean
  clip?: boolean
  ring?: boolean
}

const PIECES: Piece[] = [
  {
    kind: 'memo',
    x: -4,
    y: 4,
    w: 30,
    rot: -5,
    title: 'MEMO / field notes',
    live: true,
    clip: true,
    notes: [
      [
        '14 OCT. Mutation factory rewritten.',
        'Cache invalidation now lives in one place.',
        '209 hooks, zero copies of the same logic.',
        'Note to self: never again by hand.',
      ],
      [
        '21 OCT. Moon rose at 18:42 over the bay.',
        'Stayed up to set the ledger page.',
        'Typed three drafts. Kept the shortest.',
      ],
    ],
  },
  {
    kind: 'card',
    x: 72,
    y: -4,
    w: 24,
    rot: 6,
    title: 'TODO',
    live: true,
    notes: [
      [
        '[x] permission codes, 25 of them',
        '[x] board + table + calendar, one source',
        '[ ] write the release notes',
        '[ ] coffee',
      ],
      [
        '[x] i18n keys: AZ / EN / RU',
        '[x] 1,529 typed, none missing',
        '[ ] sleep',
      ],
    ],
  },
  {
    kind: 'torn',
    x: 36,
    y: 58,
    w: 27,
    rot: 3,
    title: 'p. 112',
    ring: true,
    notes: [
      [
        'Sales -> procurement -> inventory.',
        'Nine movement types, one rule table.',
        'Ask accounting about posting order.',
        'Check the warehouse view again.',
      ],
    ],
  },
  {
    kind: 'receipt',
    x: 84,
    y: 48,
    w: 13,
    rot: -4,
    title: 'OBSERVATORY CAFE',
    notes: [
      [
        'BAKU  01/10',
        '--------------',
        'COFFEE   x3',
        'COFFEE   x2',
        'BISCUIT  x1',
        '--------------',
        'TOTAL  6.40',
        'THANK YOU',
      ],
    ],
  },
  {
    kind: 'carbon',
    x: -6,
    y: 70,
    w: 28,
    rot: 4,
    title: 'COPY / do not file',
    live: true,
    clip: true,
    notes: [
      [
        'To: whoever reads this next',
        'Re: the frontend',
        'Everything you need is in the',
        'query cache. Trust the cache.',
        '-- A.N.',
      ],
      [
        'To: the night desk',
        'Re: the orbit chart',
        'Scroll is the clock. The pointer',
        'has mass. Do not fix that.',
      ],
    ],
  },
  {
    kind: 'memo',
    x: 66,
    y: 86,
    w: 30,
    rot: -7,
    title: 'MEMO / letters',
    notes: [
      [
        'Reply within the day.',
        'Short answers, real figures.',
        'If it shipped, say so.',
        'If it did not, say that too.',
      ],
    ],
  },
  {
    kind: 'card',
    x: 30,
    y: -10,
    w: 22,
    rot: -3,
    title: 'STACK',
    notes: [
      ['React 19 . TypeScript', 'TanStack Query . Zod', 'Tailwind v4 . shadcn'],
    ],
  },
]

/* --------------------------------------------------------- one live sheet */

function useTyping(notes: string[][], live: boolean) {
  const reduce =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  const [note, setNote] = useState(0)
  const [n, setN] = useState(0)
  const text = notes[note].join('\n')

  useEffect(() => {
    if (!live || reduce) return
    let timer = 0
    if (n < text.length) {
      const ch = text[n]
      // a key at a time, a breath at line ends, uneven like a hand
      const wait =
        (ch === '\n' ? 520 : ch === '.' || ch === ',' ? 260 : 70) +
        Math.random() * 90
      timer = window.setTimeout(() => setN(n + 1), wait)
    } else {
      // the sheet sits finished, then the next one is fed in
      timer = window.setTimeout(() => {
        setNote((note + 1) % notes.length)
        setN(0)
      }, 6000)
    }
    return () => window.clearTimeout(timer)
  }, [n, note, text, live, reduce, notes.length])

  return live && !reduce
    ? { lines: notes[note], typed: n }
    : { lines: notes[0], typed: Infinity }
}

function Sheet({ piece, index }: { piece: Piece; index: number }) {
  const { lines, typed } = useTyping(piece.notes, !!piece.live)
  // where each line starts in the typed run, counting its line break
  const starts = lines.map((_, i) =>
    lines.slice(0, i).reduce((sum, l) => sum + l.length + 1, 0),
  )

  return (
    <div
      className={`np-desk-item np-desk-item--${piece.kind}`}
      style={
        {
          '--x': `${piece.x}vw`,
          '--y': `${piece.y}vh`,
          '--w': `${piece.w}vw`,
          '--rot': `${piece.rot}deg`,
        } as React.CSSProperties
      }
    >
      {piece.clip ? <span className="np-desk-clip" /> : null}
      {piece.ring ? <span className="np-desk-ring" /> : null}
      <p className="np-desk-item__title">
        {piece.title}
        {piece.kind === 'memo' ? <span>No. {300 + index * 17}</span> : null}
      </p>
      <div className="np-desk-item__body">
        {lines.map((line, i) => {
          const left = typed - starts[i]
          const shown = Math.max(0, Math.min(left, line.length))
          const caret = left >= 0 && left <= line.length && typed !== Infinity
          return (
            <p key={i}>
              {line.slice(0, shown)}
              {caret ? <span className="np-desk-caret" /> : null}
              <span className="np-desk-rest">{line.slice(shown)}</span>
            </p>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- the desk */

export default function DeskBackdrop() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let max = 1
    const stop = onMeasure(() => {
      max = Math.max(document.documentElement.scrollHeight - innerHeight, 1)
    })
    const drift = () => {
      raf = 0
      // slower than the page, which is what puts the desk underneath it
      el.style.transform = `translate3d(0, ${(-(viewY() / max) * 45).toFixed(3)}vh, 0)`
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(drift)
    }
    drift()
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      stop()
    }
  }, [])

  return (
    <div className="np-backdrop" aria-hidden="true">
      <div className="np-backdrop__stack" ref={ref}>
        {PIECES.map((p, i) => (
          <Sheet piece={p} index={i} key={i} />
        ))}
      </div>
    </div>
  )
}

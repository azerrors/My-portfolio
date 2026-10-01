import { useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Text that types itself the first time it is read, the way a field report
 * comes off an old machine: a strike at a time, a breath after each comma, a
 * longer one at each full stop.
 *
 * The whole text is laid out from the first frame, with the untyped remainder
 * kept invisible, so the column never reflows while it types and nothing
 * below it moves. Screen readers get the full text at once; the typing is for
 * the eye only.
 */
export default function Typewriter({
  paragraphs,
  className,
  speed = 13,
}: {
  paragraphs: string[]
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const reduce = useReducedMotion()

  const { starts, total, flat } = useMemo(() => {
    const s = paragraphs.map((_, i) =>
      paragraphs.slice(0, i).reduce((sum, q) => sum + q.length, 0),
    )
    const flat = paragraphs.join('')
    return { starts: s, total: flat.length, flat }
  }, [paragraphs])

  const [typed, setN] = useState(0)
  // under reduced motion the text is simply there, already typed
  const n = reduce ? total : typed

  useEffect(() => {
    if (!inView || reduce) return
    let i = 0
    let timer = 0
    const strike = () => {
      // two characters a strike: fast enough to read along with, slow enough
      // to still read as typing rather than as a fade
      i = Math.min(i + 2, total)
      setN(i)
      if (i >= total) return
      const ch = flat[i - 1]
      const pause = ch === '.' ? 140 : /[,:;]/.test(ch) ? 60 : 0
      timer = window.setTimeout(strike, speed + Math.random() * 14 + pause)
    }
    timer = window.setTimeout(strike, 320)
    return () => window.clearTimeout(timer)
  }, [inView, reduce, total, flat, speed])

  const typing = n > 0 && n < total

  return (
    <div className={className} ref={ref}>
      <div className="np-sr">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      <div aria-hidden="true">
        {paragraphs.map((p, pi) => {
          const shown = Math.max(0, Math.min(n - starts[pi], p.length))
          // the caret sits in whichever paragraph is being typed
          const caretHere =
            typing && n >= starts[pi] && n < starts[pi] + p.length
          return (
            <p key={p.slice(0, 24)}>
              <span className="np-typed">{p.slice(0, shown)}</span>
              {caretHere ? <span className="np-caret" /> : null}
              <span className="np-typed__rest">{p.slice(shown)}</span>
            </p>
          )
        })}
      </div>
    </div>
  )
}

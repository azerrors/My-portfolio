import { motion, useReducedMotion } from 'framer-motion'
import { PER_CHAR, STRIKE, schedule, type Tok } from '@/lib/pen'
import { usePenGate } from '@/lib/penGate'

/**
 * The editor's pen on the front page. Handwriting is written, not faded: each
 * word is uncovered left to right at the speed a hand would cross it. A wrong
 * word is scribbled out with a stroke that draws itself, and the right one is
 * written in after it.
 *
 * Every word is in the layout from the first frame, clipped to nothing, so the
 * page never reflows while the pen moves. Under reduced motion the page simply
 * arrives corrected.
 */

const HIDE = 'inset(-45% 100% -45% -6%)'
const SHOW = 'inset(-45% -6% -45% -6%)'

function Written({
  text,
  at,
  dur,
  className,
}: {
  text: string
  at: number
  dur: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const go = usePenGate()
  return (
    <motion.span
      className={className ? `np-pen ${className}` : 'np-pen'}
      initial={reduce ? false : { clipPath: HIDE }}
      animate={{ clipPath: go ? SHOW : HIDE }}
      transition={{ delay: at, duration: dur, ease: 'linear' }}
    >
      {text}
    </motion.span>
  )
}

/** The scribble: two loose passes, drawn as one stroke. */
export function Scribble({ at }: { at: number }) {
  const reduce = useReducedMotion()
  const go = usePenGate()
  return (
    <svg
      className="np-scribble"
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M1 12 C 18 7, 34 15, 52 10 S 84 13, 99 8 M97 13 C 76 10, 52 16, 28 12 S 8 14, 3 15"
        fill="none"
        vectorEffect="non-scaling-stroke"
        // a zero-length stroke still prints its round caps, so the line is
        // kept invisible until the pen actually touches the paper
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={
          go ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
        }
        transition={{
          delay: at,
          duration: STRIKE,
          ease: [0.5, 0, 0.3, 1],
          opacity: { delay: at, duration: 0.01 },
        }}
      />
    </svg>
  )
}

/**
 * A correction to printed type: the misprint sits in the line from the
 * start, the pen strikes it, and the right word is written after it.
 */
export function Correction({
  wrong,
  right,
  at,
  perChar = 0.06,
}: {
  wrong: string
  right: string
  at: number
  perChar?: number
}) {
  return (
    <span className="np-fix">
      <span className="np-fix__wrong">
        {wrong}
        <Scribble at={at} />
      </span>{' '}
      <Written
        className="np-pen--red np-fix__right"
        text={right}
        at={at + STRIKE + 0.15}
        dur={right.length * perChar}
      />
    </span>
  )
}

/** A handwritten note, mistakes and all. */
export function HandNote({
  tokens,
  start,
  className,
  perChar = PER_CHAR,
}: {
  tokens: Tok[]
  start: number
  className?: string
  perChar?: number
}) {
  const { steps } = schedule(tokens, start, perChar)
  return (
    <span className={className} aria-hidden="true">
      {steps.map((s, i) =>
        s.kind === 'word' ? (
          <span key={i}>
            <Written text={s.text} at={s.at} dur={s.dur} />{' '}
          </span>
        ) : (
          <span key={i} className="np-fix">
            <span className="np-fix__wrong">
              <Written text={s.wrong} at={s.wrongAt} dur={s.wrongDur} />
              <Scribble at={s.strikeAt} />
            </span>{' '}
            <Written text={s.right} at={s.rightAt} dur={s.rightDur} />{' '}
          </span>
        ),
      )}
    </span>
  )
}

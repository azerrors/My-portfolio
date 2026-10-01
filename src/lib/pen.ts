/**
 * Pen time for the front page: when each word is written, struck and
 * corrected. Pure, so the components that draw it stay pure.
 */

/** Seconds of pen time per character, and the lift between words. */
export const PER_CHAR = 0.026
const LIFT = 0.04
export const STRIKE = 0.38

export type Tok = string | { wrong: string; right: string }

export type Step =
  | { kind: 'word'; text: string; at: number; dur: number }
  | {
      kind: 'fix'
      wrong: string
      right: string
      wrongAt: number
      wrongDur: number
      strikeAt: number
      rightAt: number
      rightDur: number
    }

/** Lay the whole note out in pen time. Pure, so render stays pure. */
export function schedule(tokens: Tok[], start: number, perChar: number) {
  const steps: Step[] = []
  let t = start
  for (const tok of tokens) {
    if (typeof tok === 'string') {
      for (const text of tok.split(' ').filter(Boolean)) {
        const dur = text.length * perChar
        steps.push({ kind: 'word', text, at: t, dur })
        t += dur + LIFT
      }
    } else {
      const wrongDur = tok.wrong.length * perChar
      const wrongAt = t
      const strikeAt = wrongAt + wrongDur + 0.18
      const rightAt = strikeAt + STRIKE + 0.12
      const rightDur = tok.right.length * perChar
      steps.push({
        kind: 'fix',
        ...tok,
        wrongAt,
        wrongDur,
        strikeAt,
        rightAt,
        rightDur,
      })
      t = rightAt + rightDur + LIFT
    }
  }
  return { steps, end: t }
}

/** When a note that starts at `start` will have finished writing. */
export function penEnd(tokens: Tok[], start: number, perChar = PER_CHAR) {
  return schedule(tokens, start, perChar).end
}

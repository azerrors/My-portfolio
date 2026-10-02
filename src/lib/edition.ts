/**
 * The dateline. A broadsheet prints today's date and the sky over the city, so
 * this one does too: the date is the reader's, and the moon phase is computed
 * from it rather than written in, so the masthead is true on the day it is read.
 */

const SYNODIC = 29.530588853 // days, new moon to new moon
const KNOWN_NEW = Date.UTC(2000, 0, 6, 18, 14) // a new moon on record

const PHASES = [
  'New moon',
  'Waxing crescent',
  'First quarter',
  'Waxing gibbous',
  'Full moon',
  'Waning gibbous',
  'Last quarter',
  'Waning crescent',
]

export function moonPhase(at = new Date()) {
  const days = (at.getTime() - KNOWN_NEW) / 86_400_000
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC
  return PHASES[Math.round((age / SYNODIC) * 8) % 8]
}

export function dateline(at = new Date()) {
  return at
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Baku',
    })
    .replace(',', '')
}

/** Where the moon was in its cycle on a date: 0 new, 0.5 full, back to 1. */
export function moonAge(at: Date) {
  const days = (at.getTime() - KNOWN_NEW) / 86_400_000
  return (((days % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC
}

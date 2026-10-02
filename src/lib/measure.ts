/**
 * One place that says "the layout changed": a resize, the document growing
 * (an image landing, a font swapping in), or the fonts finishing. Components
 * measure here and only here, then work from cached numbers every frame.
 *
 * Reading a box inside an animation frame, after something else on the page
 * has written a style, forces the browser to recalculate style and layout on
 * the spot. On a page with a dozen moving parts that was most of the frame.
 */

const subs = new Set<() => void>()
let queued = 0
let started = false

const run = () => {
  queued = 0
  subs.forEach((f) => f())
}

export function requestMeasure() {
  if (!queued) queued = requestAnimationFrame(run)
}

function start() {
  if (started) return
  started = true
  addEventListener('resize', requestMeasure, { passive: true })
  new ResizeObserver(requestMeasure).observe(document.body)
  document.fonts?.ready.then(requestMeasure)
  addEventListener('load', requestMeasure)
}

/** Run `f` now and whenever the layout changes. Returns an unsubscribe. */
export function onMeasure(f: () => void) {
  start()
  subs.add(f)
  f()
  return () => {
    subs.delete(f)
  }
}

/** An element's top in document coordinates. Call only inside onMeasure. */
export const docTop = (el: Element) => el.getBoundingClientRect().top + scrollY

/** An act's published progress, read from the inline style: no layout. */
export function actProgress(act: HTMLElement) {
  const v = parseFloat(act.style.getPropertyValue('--sc-p'))
  return Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0
}

/** Whether a stretch of the document is within `margin` viewports of view. */
export function nearView(top: number, height: number, margin = 0.5) {
  const vh = innerHeight
  const y = viewY()
  return top < y + vh * (1 + margin) && top + height > y - vh * margin
}

/*
 * The scroll position, read once per scroll rather than by every component in
 * every frame. Reading window.scrollY after any style write in the same frame
 * makes the browser bring style and layout up to date first, so a dozen
 * readers spread through a frame meant a dozen forced recalculations.
 */
let sy = typeof scrollY === 'number' ? scrollY : 0
let listening = false
// once the smooth scroller is feeding positions, the event need not read one
let driven = false
function listen() {
  if (listening) return
  listening = true
  addEventListener(
    'scroll',
    () => {
      if (!driven) sy = scrollY
    },
    { passive: true },
  )
}
/** Where the page is scrolled to, without touching layout. */
export function viewY() {
  listen()
  return sy
}
/** For the smooth scroller, which knows the position before the event fires. */
export function setViewY(y: number) {
  driven = true
  sy = y
}

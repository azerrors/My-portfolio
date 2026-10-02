import { useEffect } from 'react'
import '@/engine/scrollcraft.js'
import { onMeasure } from '@/lib/measure'

/**
 * Mounts the scrollcraft runtime over React's markup.
 *
 * The engine generates no DOM: it reads the data-sc-* attributes off whatever
 * React rendered and drives them from one scroll value. It has no teardown by
 * design (it owns window listeners and a rAF loop for the life of the page), so
 * it is mounted exactly once even through StrictMode's double effect in dev.
 */
let mounted = false

export function useScrollcraft(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el || mounted) return
    const engine = window.ScrollCraft
    if (!engine) {
      console.warn('[ob] scrollcraft did not load; the page will not animate.')
      return
    }
    mounted = true
    const api = engine.mount(el)
    // Fonts change line boxes and therefore act heights. The engine relays out
    // on document.fonts.ready itself, but a late webfont on a slow connection
    // can land after that, so one more pass on load costs nothing.
    // The engine caches every size it needs at layout time, so it has to be
    // told when the page changes height: an image landing, a font swap.
    return onMeasure(() => api.layout())
  }, [ref])
}

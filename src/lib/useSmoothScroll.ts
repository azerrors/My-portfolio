import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'
import { setViewY } from '@/lib/measure'

/**
 * Inertial scrolling for the whole page.
 *
 * The scroll engine reads the real scroll position every frame and drives
 * every pin, pan and plate from it, so smoothing the scroll itself smooths all
 * of them at once instead of easing each animation separately. Lenis still
 * moves the native scroll position, which keeps sticky pins, anchors and the
 * scrollbar working as they always did.
 *
 * Off under reduced motion, and touch keeps its native momentum.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      // the running head is sticky, so a jump has to land below it
      anchors: { offset: -64 },
    })
    // hand the position to everything else before the scroll event fires
    lenis.on('scroll', (l: Lenis) => setViewY(l.animatedScroll))
    return () => lenis.destroy()
  }, [])
}

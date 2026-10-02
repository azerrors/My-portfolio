import { useEffect, useState } from 'react'
import { docTop, onMeasure, viewY } from '@/lib/measure'

/**
 * Which section the reader is on: the last one whose top has passed the middle
 * of the window. Shared by the running head and the page rack, so the two can
 * never disagree about where the reader is.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(0)
  const key = ids.join('|')

  useEffect(() => {
    const list = key.split('|')
    // section tops in document coordinates, measured when layout changes
    let tops: number[] = []
    let raf = 0
    const stopMeasure = onMeasure(() => {
      tops = list.map((id) => {
        const el = document.getElementById(id)
        return el ? docTop(el) : Infinity
      })
      pick()
    })
    function pick() {
      raf = 0
      const mid = viewY() + innerHeight * 0.5
      let index = 0
      tops.forEach((top, i) => {
        if (top <= mid) index = i
      })
      setActive(index)
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(pick)
    }
    pick()
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      stopMeasure()
    }
  }, [key])

  return active
}

import { useEffect, useState } from 'react'

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
    let raf = 0
    const pick = () => {
      raf = 0
      const mid = innerHeight * 0.5
      let index = 0
      list.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= mid) index = i
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
    }
  }, [key])

  return active
}

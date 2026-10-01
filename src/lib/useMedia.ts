import { useSyncExternalStore } from 'react'

/** A media query as a value that follows the window. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const mq = matchMedia(query)
      mq.addEventListener('change', notify)
      return () => mq.removeEventListener('change', notify)
    },
    () => matchMedia(query).matches,
    () => false,
  )
}

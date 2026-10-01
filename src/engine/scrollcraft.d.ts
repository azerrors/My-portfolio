export {}

declare global {
  interface ScrollCraftApi {
    layout: () => void
    read: () => void
    acts: unknown[]
    worlds: unknown[]
    clips: unknown[]
    lerp: number
  }
  interface Window {
    ScrollCraft?: {
      mount: (
        root: Element | string,
        opts?: { lerp?: number },
      ) => ScrollCraftApi
      reduce: boolean
      instances: ScrollCraftApi[]
    }
  }
}

import { createContext, useContext } from 'react'

/**
 * Whether the editor's pen may start. The front page is shown on the intro's
 * monitor first, so the corrections wait until the reader is through the
 * glass; without an intro the pen is free from the start.
 */
export const PenGate = createContext(true)
export const usePenGate = () => useContext(PenGate)

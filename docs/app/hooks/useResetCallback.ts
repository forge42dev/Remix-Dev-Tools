import { useState } from 'react'

/**
 * Thanks to Jacob Paris 🎉!
 *
 * {@link https://www.jacobparis.com/content/use-reset-callback}
 *
 * @param initialValue - The initial value of the state
 * @param resetFn - The function that will reset the state
 */
export function useResetCallback(initialValue: any, resetFn: () => any) {
  const [prevValue, setPrevValue] = useState(initialValue)
  if (prevValue !== initialValue) {
    resetFn()
    setPrevValue(initialValue)
  }
}

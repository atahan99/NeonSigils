import { useEffect, useRef } from "react"

/** Run an effect when `value` changes, with access to the previous value. */
export const useEffectOnChange = <T>(value: T, effect: (prev: T, next: T) => void): void => {
  const prev = useRef(value)
  const effectRef = useRef(effect)
  effectRef.current = effect

  useEffect(() => {
    if (prev.current !== value) {
      effectRef.current(prev.current, value)
      prev.current = value
    }
  }, [value])
}

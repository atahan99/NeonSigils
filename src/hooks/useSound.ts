import { useCallback } from "react"
import { useSettings } from "./useSettings"
import { playSound, type SoundName } from "../lib/audio"

/** Returns a `play(name)` callback that only makes noise when the Sound
 *  effects setting is enabled. Stable across renders for a given setting. */
export const useSound = () => {
  const { settings } = useSettings()
  const enabled = settings.soundEnabled

  return useCallback(
    (name: SoundName) => {
      if (!enabled) return
      playSound(name)
    },
    [enabled],
  )
}

import { useEffect, useState } from "react"
import { useSettings } from "../../hooks/useSettings"
import { createRng } from "../../utils/random"
import styles from "./HeroSigil.module.css"

// The NeonSigils "N" mark, run through the same SVG -> ASCII pipeline as the logos.
const SIGIL = [
  "-                      ",
  "#%+.               :--:",
  "#@@%-              @@@#",
  "#@@@@#-            @@@#",
  "#@@@@@@@+:         @@@#",
  "#@@@.#@@@@*.       @@@#",
  "#@@@  =#@@@#+.     @@@#",
  "#@@@    .+%@@@*-   @@@#",
  "#@@@      .*@@@@#. @@@#",
  "#@@@        :+@@@@*@@@#",
  "#@@@          .=#@@@@@#",
  "#@@@             -%@@@#",
  "+###              .+%@#",
  "                     -+"
]

const NOISE = "#%@*+=:./\\|░▒▓"
const DURATION_MS = 1400
const TICK_MS = 50

// Cells decode along a diagonal sweep; undecoded ink shows as noise.
const frameAt = (progress: number, tick: number): string => {
  const rng = createRng(tick)
  const rows = SIGIL.length
  const cols = SIGIL[0].length
  return SIGIL.map((line, y) =>
    [...line]
      .map((ch, x) => {
        if (ch === " ") return ch
        const at = (x / cols + y / rows) / 2
        return at < progress ? ch : NOISE[Math.floor(rng() * NOISE.length)]
      })
      .join(""),
  ).join("\n")
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Home-page hero art: the brand sigil "decrypting" itself once on load. */
export const HeroSigil = () => {
  const { settings } = useSettings()
  const still = settings.reducedMotion || prefersReducedMotion()
  const [tick, setTick] = useState(0)
  const steps = DURATION_MS / TICK_MS

  useEffect(() => {
    if (still) return
    const id = window.setInterval(() => {
      setTick((t) => {
        if (t >= steps) window.clearInterval(id)
        return Math.min(t + 1, steps)
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [still, steps])

  const text = still || tick >= steps ? SIGIL.join("\n") : frameAt(tick / steps, tick)
  return (
    <pre className={styles.sigil} aria-hidden="true">
      {text}
    </pre>
  )
}

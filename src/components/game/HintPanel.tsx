import { useEffect, useState } from "react"
import type { Difficulty, LogoEntry } from "../../types/logo"
import type { HintKind } from "../../types/game"
import { HINT_OPTIONS, resolveHintText, buildChoices } from "../../utils/hints"
import { NeonButton } from "../layout/NeonButton"
import styles from "./HintPanel.module.css"

type HintPanelProps = {
  logo: LogoEntry
  pool: LogoEntry[]
  usedKinds: HintKind[]
  onUseHint: (kind: HintKind) => void
  difficulty: Difficulty
}

// Harder difficulties expose fewer hints. `null` means "all hints allowed".
const ALLOWED_BY_DIFFICULTY: Record<Difficulty, HintKind[] | null> = {
  easy: null,
  medium: null,
  hard: ["text", "category", "firstLetter"],
  expert: ["text", "category"],
}

type RevealedHint = { kind: HintKind; text: string }

export const HintPanel = ({
  logo,
  pool,
  usedKinds,
  onUseHint,
  difficulty,
}: HintPanelProps) => {
  const [revealed, setRevealed] = useState<RevealedHint[]>([])
  const [choices, setChoices] = useState<string[]>([])

  // Reset the local reveal log whenever the question changes.
  useEffect(() => {
    setRevealed([])
    setChoices([])
  }, [logo.id])

  const allowed = ALLOWED_BY_DIFFICULTY[difficulty]
  const options = allowed
    ? HINT_OPTIONS.filter((o) => allowed.includes(o.kind))
    : HINT_OPTIONS

  const handleUseHint = (kind: HintKind) => {
    // Notify the session first so scoring penalties/caps apply.
    onUseHint(kind)
    if (kind === "multipleChoice") {
      setChoices(buildChoices(logo, pool, 4))
    }
    const text = resolveHintText(logo, kind)
    setRevealed((prev) =>
      prev.some((r) => r.kind === kind) ? prev : [...prev, { kind, text }],
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.buttons} role="group" aria-label="Decrypt hints">
        {options.map((option) => {
          const used = usedKinds.includes(option.kind)
          return (
            <NeonButton
              key={option.kind}
              variant="ghost"
              size="sm"
              disabled={used}
              onClick={() => handleUseHint(option.kind)}
              aria-label={`${option.label} (${option.penaltyNote})`}
            >
              <span className={styles.btnLabel}>{option.label}</span>
              <span className={styles.penalty}>{option.penaltyNote}</span>
            </NeonButton>
          )
        })}
      </div>

      {revealed.length > 0 && (
        <ul className={styles.revealList} aria-live="polite">
          {revealed.map((hint) => (
            <li key={hint.kind} className={styles.revealItem}>
              {hint.text}
            </li>
          ))}
        </ul>
      )}

      {choices.length > 0 && (
        <div className={styles.choices} role="list" aria-label="Signal options">
          {choices.map((choice) => (
            <span key={choice} role="listitem" className={styles.chip}>
              {choice}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

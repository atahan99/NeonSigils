import styles from "./StatBadge.module.css"

type LivesPanelProps = {
  lives: number
  maxLives: number
  /** Cyberpunk label, e.g. "Signal Integrity" (hangman) or "Lives" (trivia). */
  label?: string
}

export const LivesPanel = ({ lives, maxLives, label = "Lives" }: LivesPanelProps) => {
  const pips = Array.from({ length: maxLives }, (_, i) => i < lives)
  const low = lives <= 1
  return (
    <div className={styles.badge} role="group" aria-label={`${label}: ${lives} of ${maxLives}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.lives} aria-hidden="true">
        {pips.map((filled, i) => (
          <span
            key={i}
            className={[
              styles.pip,
              !filled ? styles.pipEmpty : "",
              filled && low ? styles.pipDanger : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </span>
    </div>
  )
}

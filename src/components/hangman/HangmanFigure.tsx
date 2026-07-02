import styles from "./HangmanFigure.module.css"

type HangmanFigureProps = {
  /** Number of wrong guesses so far (0..maxWrong). */
  wrong: number
  maxWrong: number
}

// Build the gallows ASCII, adding one body part per wrong guess.
const buildGallows = (wrong: number): string[] => {
  const head = wrong >= 1 ? "O" : " "
  const torso = wrong >= 2 ? "|" : " "
  const leftArm = wrong >= 3 ? "/" : " "
  const rightArm = wrong >= 4 ? "\\" : " "
  const leftLeg = wrong >= 5 ? "/" : " "
  const rightLeg = wrong >= 6 ? "\\" : " "
  return [
    "  ┌─────┐",
    "  │     │",
    "  │     " + head,
    "  │    " + leftArm + torso + rightArm,
    "  │     " + torso,
    "  │    " + leftLeg + " " + rightLeg,
    "  │",
    "══╧═══════",
  ]
}

/**
 * Classic hangman gallows, themed as a "trace lock": each wrong guess
 * (Corruption) assembles another part of the suspended operator.
 */
export const HangmanFigure = ({ wrong, maxWrong }: HangmanFigureProps) => {
  const lines = buildGallows(wrong)
  const tone = wrong >= maxWrong - 1 ? styles.danger : wrong >= 3 ? styles.warn : ""

  return (
    <div className={styles.figure}>
      <pre className={`${styles.pre} ${tone}`} aria-hidden="true">
        {lines.join("\n")}
      </pre>
      <span className={styles.caption}>Trace {wrong}/{maxWrong}</span>
      <span className="sr-only">
        Hangman trace: {wrong} of {maxWrong} wrong guesses used.
      </span>
    </div>
  )
}

import styles from "./HangmanFigure.module.css"

type HangmanFigureProps = {
  lives: number
  maxLives: number
}

const PARTS = 6

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
export const HangmanFigure = ({ lives, maxLives }: HangmanFigureProps) => {
  // Lives carry across sigils, so the figure tracks lives lost in the run and
  // scales to the six body parts whatever the starting lives are.
  const lost = Math.max(0, maxLives - lives)
  const lines = buildGallows(Math.ceil((lost / maxLives) * PARTS))
  const tone = lives <= 1 ? styles.danger : lost / maxLives >= 0.5 ? styles.warn : ""

  return (
    <div className={styles.figure}>
      <pre className={`${styles.pre} ${tone}`} aria-hidden="true">
        {lines.join("\n")}
      </pre>
      <span className={styles.caption}>Trace {lost}/{maxLives}</span>
      <span className="sr-only">
        Hangman trace: {lost} of {maxLives} lives lost.
      </span>
    </div>
  )
}

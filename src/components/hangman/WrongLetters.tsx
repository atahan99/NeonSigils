import styles from "./WrongLetters.module.css"

type WrongLettersProps = {
  letters: string[] // wrong guesses (lowercase)
}

/** Shows corrupted (wrong) guesses as danger-colored chips. */
export const WrongLetters = ({ letters }: WrongLettersProps) => (
  <div className={styles.wrap}>
    <span className={styles.label}>CORRUPTION</span>
    {letters.length === 0 ? (
      <span className={styles.placeholder}>signal clean</span>
    ) : (
      <ul className={styles.chips} aria-label="Corrupted guesses">
        {letters.map((letter) => (
          <li key={letter} className={styles.chip}>
            {letter.toUpperCase()}
          </li>
        ))}
      </ul>
    )}
  </div>
)

import styles from "./HangmanWord.module.css"

type HangmanWordProps = {
  name: string
  guessedLetters: string[] // lowercase (right or wrong)
  guessableChars: (name: string) => string[]
  solved: boolean
  /** When false (hard/expert), hide word boundaries + punctuation. */
  showLength?: boolean
}

const isAlnum = (ch: string): boolean => /[a-z0-9]/i.test(ch)

/** Renders the answer as spaced blanks / revealed characters. */
export const HangmanWord = ({
  name,
  guessedLetters,
  guessableChars,
  solved,
  showLength = true,
}: HangmanWordProps) => {
  const targets = guessableChars(name)
  const revealedCount = targets.filter((c) => guessedLetters.includes(c)).length
  const srText = solved
    ? `Sigil decoded: ${name}.`
    : showLength
      ? `Word has ${targets.length} letters, ${revealedCount} revealed.`
      : `Encrypted handle, ${revealedCount} fragments decoded.`

  // Hard/expert: collapse to a continuous run of only the alphanumeric slots,
  // dropping spaces and punctuation so word structure isn't a hint.
  const chars = showLength ? [...name] : [...name].filter(isAlnum)

  return (
    <div
      className={[styles.word, solved ? styles.solved : ""].filter(Boolean).join(" ")}
    >
      <span className="sr-only" aria-live="polite">
        {srText}
      </span>
      <span aria-hidden="true" className={styles.chars}>
        {chars.map((ch, i) => {
          if (!isAlnum(ch)) {
            const gap = ch === " "
            return (
              <span
                key={i}
                className={gap ? styles.gap : styles.symbol}
              >
                {gap ? "" : ch}
              </span>
            )
          }
          const revealed = solved || guessedLetters.includes(ch.toLowerCase())
          return (
            <span
              key={i}
              className={[styles.slot, revealed ? styles.revealed : ""]
                .filter(Boolean)
                .join(" ")}
            >
              {revealed ? ch.toUpperCase() : "_"}
            </span>
          )
        })}
      </span>
    </div>
  )
}

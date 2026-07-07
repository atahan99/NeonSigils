import { useEffect } from "react"
import { cn } from "../../utils/cn"
import styles from "./LetterKeyboard.module.css"

type LetterKeyboardProps = {
  guessedLetters: string[] // lowercase
  wrongLetters: string[] // lowercase
  onGuess: (letter: string) => void
  disabled: boolean
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("")

/** On-screen A-Z keyboard that also mirrors physical keydown input. */
export const LetterKeyboard = ({
  guessedLetters,
  wrongLetters,
  onGuess,
  disabled,
}: LetterKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const letter = event.key.toLowerCase()
      if (!/^[a-z]$/.test(letter)) return
      if (guessedLetters.includes(letter)) return
      onGuess(letter)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [disabled, guessedLetters, onGuess])

  return (
    <div className={styles.keyboard} role="group" aria-label="Letter keyboard">
      {ALPHABET.map((letter) => {
        const guessed = guessedLetters.includes(letter)
        const wrong = wrongLetters.includes(letter)
        const correct = guessed && !wrong
        const handleClick = () => onGuess(letter)
        const status = wrong ? "wrong guess" : correct ? "correct guess" : "available"
        return (
          <button
            key={letter}
            type="button"
            className={cn(styles.key, correct && styles.correct, wrong && styles.wrong)}
            onClick={handleClick}
            disabled={disabled || guessed}
            aria-label={`Letter ${letter.toUpperCase()}, ${status}`}
          >
            {letter.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}

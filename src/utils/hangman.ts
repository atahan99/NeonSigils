/**
 * Guessable characters in an answer: letters only (case-insensitive). Digits
 * and symbols are shown from the start because the keyboard is A-Z.
 */
export const guessableChars = (name: string): string[] => {
  const set = new Set<string>()
  for (const ch of name.toLowerCase()) {
    if (/[a-z]/.test(ch)) set.add(ch)
  }
  return [...set]
}

export const isSolved = (name: string, guessed: string[]): boolean =>
  guessableChars(name).every((c) => guessed.includes(c))

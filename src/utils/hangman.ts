/** Guessable characters in an answer: letters + digits (case-insensitive). */
export const guessableChars = (name: string): string[] => {
  const set = new Set<string>()
  for (const ch of name.toLowerCase()) {
    if (/[a-z0-9]/.test(ch)) set.add(ch)
  }
  return [...set]
}

export const isSolved = (name: string, guessed: string[]): boolean =>
  guessableChars(name).every((c) => guessed.includes(c))

// ponytail: assert-based self-check — fails if guessable/solved logic regresses
if (import.meta.env.DEV) {
  const chars = guessableChars("Burp Suite 2")
  console.assert(chars.includes("b") && chars.includes("2") && chars.length === 9)
  console.assert(isSolved("ab", ["a", "b"]))
  console.assert(!isSolved("ab", ["a"]))
}

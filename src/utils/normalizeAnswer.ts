import type { LogoEntry } from "../types/logo"

/**
 * Normalize a user-typed answer for comparison: lowercase, strip accents,
 * expand "&" to "and", then remove everything that isn't a-z0-9.
 * This makes "Burp Suite", "burpsuite", and "burp-suite" all collapse to
 * the same token.
 */
export const normalizeAnswer = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, "and")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritical marks
    .replace(/[^a-z0-9]/g, "")

/** All normalized accepted tokens for a logo (name + aliases). */
export const acceptedTokens = (logo: Pick<LogoEntry, "name" | "aliases">): string[] => {
  const tokens = new Set<string>()
  tokens.add(normalizeAnswer(logo.name))
  for (const alias of logo.aliases) tokens.add(normalizeAnswer(alias))
  return [...tokens].filter(Boolean)
}

/** True if the guess matches the logo's name or any alias after normalization. */
export const isAnswerCorrect = (
  guess: string,
  logo: Pick<LogoEntry, "name" | "aliases">,
): boolean => {
  const normalized = normalizeAnswer(guess)
  if (!normalized) return false
  return acceptedTokens(logo).includes(normalized)
}

/** Levenshtein edit distance between two strings (small inputs). */
const editDistance = (a: string, b: string): number => {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    prev = curr
  }
  return prev[b.length]
}

/**
 * A "near miss" is a wrong guess within `maxDistance` edits of any accepted
 * answer (and not exact) - used to give "you were 1 char off" feedback without
 * accepting it.
 */
export const isNearMiss = (
  guess: string,
  logo: Pick<LogoEntry, "name" | "aliases">,
  maxDistance = 1,
): boolean => {
  const normalized = normalizeAnswer(guess)
  if (!normalized || normalized.length < 3) return false
  const tokens = acceptedTokens(logo)
  if (tokens.includes(normalized)) return false
  return tokens.some((t) => editDistance(normalized, t) <= maxDistance)
}

import type { LogoEntry } from "../types/logo"
import type { HintKind } from "../types/game"
import { getCategory } from "../data/categories"
import { shuffle } from "./random"
import { acceptedTokens, normalizeAnswer } from "./normalizeAnswer"

export type HintOption = {
  kind: HintKind
  label: string // button label, e.g. "DECRYPT HINT"
  penaltyNote: string
}

// Trivia hint buttons and their UI copy / penalty note. Hangman has its own
// Boost Reveal button; in Trivia the logo is always fully shown.
export const HINT_OPTIONS: HintOption[] = [
  { kind: "text", label: "Decrypt Hint", penaltyNote: "-20% score" },
  { kind: "category", label: "Trace Category", penaltyNote: "no penalty" },
  { kind: "firstLetter", label: "Reveal First Char", penaltyNote: "-30% score" },
  { kind: "multipleChoice", label: "Signal Options", penaltyNote: "caps score at 40" },
  { kind: "alias", label: "Known Alias", penaltyNote: "-20% score" },
]

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** Blank out the answer if a hint names it ("Caddyfile" -> "▒▒▒▒▒file"). */
export const redactName = (text: string, name: string): string =>
  text.replace(new RegExp(escapeRegExp(name), "gi"), (m) => "▒".repeat(m.length))

/**
 * An alias that is more than the name re-spaced ("wire shark"), so the hint
 * says something new. Aliases are accepted answers, so it is shown masked.
 */
export const usefulAlias = (
  logo: Pick<LogoEntry, "name" | "aliases">,
): string | undefined => {
  const name = normalizeAnswer(logo.name)
  const accepted = acceptedTokens(logo)
  return logo.aliases.find((a) => {
    const norm = normalizeAnswer(a)
    // The masked form keeps first letters, so "node package manager" would spell "npm".
    const initials = normalizeAnswer(maskAlias(a))
    return norm.length > 0 && norm !== name && !name.includes(norm) && !accepted.includes(initials)
  })
}

/** Keep each word's first character, hide the rest: "network mapper" -> "n______ m_____". */
export const maskAlias = (alias: string): string =>
  alias.replace(/[\p{L}\p{N}]+/gu, (word) => word[0] + "_".repeat(word.length - 1))

/** Resolve the text shown for a given hint kind for a specific logo. */
export const resolveHintText = (logo: LogoEntry, kind: HintKind, index = 0): string => {
  switch (kind) {
    case "text": {
      if (logo.hints.length === 0) return "No further intel available."
      return redactName(logo.hints[Math.min(index, logo.hints.length - 1)], logo.name)
    }
    case "category":
      return `Category: ${getCategory(logo.category).name}`
    case "firstLetter":
      return `Starts with "${logo.name.charAt(0).toUpperCase()}" and has ${
        logo.name.replace(/\s/g, "").length
      } characters.`
    case "alias": {
      const alias = usefulAlias(logo)
      return alias ? `Also known as: ${maskAlias(alias)}` : "No known alias."
    }
    case "reveal":
      return "Additional sigil fragments decrypted."
    case "multipleChoice":
      return "Select from the signal options below."
    default:
      return ""
  }
}

/**
 * Build multiple-choice options: the correct answer plus decoys drawn from
 * a pool of other logos. Returns shuffled display names.
 */
export const buildChoices = (
  logo: LogoEntry,
  pool: LogoEntry[],
  count = 4,
  rng: () => number = Math.random,
): string[] => {
  const decoys = shuffle(
    pool.filter((l) => l.id !== logo.id),
    rng,
  )
    .slice(0, count - 1)
    .map((l) => l.name)
  return shuffle([logo.name, ...decoys], rng)
}

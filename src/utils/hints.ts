import type { LogoEntry } from "../types/logo"
import type { HintKind } from "../types/game"
import { getCategory } from "../data/categories"
import { shuffle } from "./random"

export type HintOption = {
  kind: HintKind
  label: string // button label, e.g. "DECRYPT HINT"
  penaltyNote: string
}

// Available hint buttons and their UI copy / penalty note.
export const HINT_OPTIONS: HintOption[] = [
  { kind: "text", label: "Decrypt Hint", penaltyNote: "-20% score" },
  { kind: "category", label: "Trace Category", penaltyNote: "no penalty" },
  { kind: "firstLetter", label: "Reveal First Char", penaltyNote: "-30% score" },
  { kind: "multipleChoice", label: "Signal Options", penaltyNote: "caps score at 40" },
  { kind: "alias", label: "Known Alias", penaltyNote: "no penalty" },
  { kind: "reveal", label: "Boost Reveal", penaltyNote: "-40% score, +20% reveal" },
]

/** Resolve the text shown for a given hint kind for a specific logo. */
export const resolveHintText = (logo: LogoEntry, kind: HintKind, index = 0): string => {
  switch (kind) {
    case "text": {
      if (logo.hints.length === 0) return "No further intel available."
      return logo.hints[Math.min(index, logo.hints.length - 1)]
    }
    case "category":
      return `Category: ${getCategory(logo.category).name}`
    case "firstLetter":
      return `Starts with "${logo.name.charAt(0).toUpperCase()}" and has ${
        logo.name.replace(/\s/g, "").length
      } characters.`
    case "alias": {
      const alias = logo.aliases[0] ?? logo.name
      return `Also known as: ${alias}`
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

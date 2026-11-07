import type { Difficulty, LogoEntry, PlayCategoryId } from "../types/logo"
import type { DifficultyScope } from "../types/game"
import { GENERATED_LOGOS } from "./logos.generated"

/** Single source of truth for logo data at runtime (built by `npm run assets`). */
export const ALL_LOGOS: LogoEntry[] = GENERATED_LOGOS

const LEVELS: Difficulty[] = ["easy", "medium", "hard", "expert"]

// Smallest pool worth playing; thinner tiers borrow from their nearest neighbours.
export const MIN_POOL = 10

/** Filter logos for a play category ("mixed" returns everything). */
export const logosForCategory = (category: PlayCategoryId): LogoEntry[] =>
  category === "mixed"
    ? ALL_LOGOS
    : ALL_LOGOS.filter((l) => l.category === category)

/**
 * The run's logo pool. When difficulty picks the logos, take the chosen tier
 * and widen to the nearest tiers (harder first on ties) until the pool has
 * MIN_POOL logos, so a thin tier never falls back to the easy ones.
 */
export const logosForCategoryAndDifficulty = (
  category: PlayCategoryId,
  difficulty: Difficulty,
  scope: DifficultyScope = "both",
): LogoEntry[] => {
  const pool = logosForCategory(category)
  if (scope === "render") return pool
  const target = LEVELS.indexOf(difficulty)
  const byDistance = [...LEVELS].sort((a, b) => {
    const da = Math.abs(LEVELS.indexOf(a) - target)
    const db = Math.abs(LEVELS.indexOf(b) - target)
    return da - db || LEVELS.indexOf(b) - LEVELS.indexOf(a)
  })
  const picked: LogoEntry[] = []
  for (const level of byDistance) {
    picked.push(...pool.filter((l) => l.difficulty === level))
    if (picked.length >= MIN_POOL) break
  }
  return picked
}

import type { Difficulty, LogoEntry, PlayCategoryId } from "../types/logo"
import { GENERATED_LOGOS } from "./logos.generated"

/** Single source of truth for logo data at runtime (built by `npm run assets`). */
export const ALL_LOGOS: LogoEntry[] = GENERATED_LOGOS

/** Filter logos for a play category ("mixed" returns everything). */
export const logosForCategory = (category: PlayCategoryId): LogoEntry[] =>
  category === "mixed"
    ? ALL_LOGOS
    : ALL_LOGOS.filter((l) => l.category === category)

/**
 * Difficulty is a soft filter: exact matches preferred, but we always keep the
 * pool non-empty by widening if too few logos match.
 */
export const logosForCategoryAndDifficulty = (
  category: PlayCategoryId,
  difficulty: Difficulty,
): LogoEntry[] => {
  const pool = logosForCategory(category)
  const exact = pool.filter((l) => l.difficulty === difficulty)
  return exact.length >= 4 ? exact : pool
}

export const countForCategory = (category: PlayCategoryId): number =>
  logosForCategory(category).length

import type { Difficulty, LogoEntry, PlayCategoryId } from "../types/logo"
import { GENERATED_LOGOS } from "./logos.generated"
import { SAMPLE_LOGOS } from "./sampleLogos"

/**
 * Single source of truth for logo data at runtime.
 * Prefers generated ASCII (real assets) and falls back to the hand-authored
 * sample set when the pipeline hasn't been run yet.
 */
export const ALL_LOGOS: LogoEntry[] =
  GENERATED_LOGOS.length > 0 ? GENERATED_LOGOS : SAMPLE_LOGOS

export const usingGeneratedData = GENERATED_LOGOS.length > 0

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

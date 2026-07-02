import type { Difficulty, PlayCategoryId } from "../types/logo"
import type { HintKind, HintState, Modifier } from "../types/game"

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1.0,
  medium: 1.2,
  hard: 1.5,
  expert: 2.0,
}

// Prestige / modifier multipliers, multiplied together with the difficulty one.
export const MIXED_MULTIPLIER = 1.15
const MODIFIER_MULTIPLIER: Record<Modifier, number> = {
  suddenDeath: 1.5,
  timeAttack: 1.0,
  daily: 1.0,
}

export const categoryMultiplier = (category: PlayCategoryId): number =>
  category === "mixed" ? MIXED_MULTIPLIER : 1

export const modifierMultiplier = (modifiers: Modifier[]): number =>
  modifiers.reduce((m, mod) => m * (MODIFIER_MULTIPLIER[mod] ?? 1), 1)

/** Combined non-difficulty multiplier (category prestige + modifiers). */
export const extraMultiplier = (
  category: PlayCategoryId,
  modifiers: Modifier[],
): number => categoryMultiplier(category) * modifierMultiplier(modifiers)

export const STREAK_BONUS_PER = 10
export const DEFAULT_STREAK_CAP = 50

/** Streak bonus: +10 per consecutive correct, capped (cap scales with difficulty). */
export const streakBonus = (streak: number, cap: number = DEFAULT_STREAK_CAP): number =>
  Math.min(Math.max(streak - 1, 0) * STREAK_BONUS_PER, cap)

/** Base trivia points from answer speed (seconds elapsed on the question). */
export const timeBucketPoints = (elapsedSeconds: number): number => {
  if (elapsedSeconds <= 5) return 100
  if (elapsedSeconds <= 15) return 80
  if (elapsedSeconds <= 30) return 60
  return 40
}

const HINT_PENALTY: Partial<Record<HintKind, number>> = {
  text: 0.2,
  firstLetter: 0.3,
  reveal: 0.4,
}

/**
 * Apply hint rules to a base score:
 *  - text -20%, first-letter -30%, reveal -40% (penalties stack, capped 60%)
 *  - multiple-choice caps the max score at 40
 */
const applyHintRules = (base: number, hint: HintState): number => {
  let score = base
  const usedMc = hint.usedKinds.includes("multipleChoice")
  let penalty = 0
  for (const kind of hint.usedKinds) penalty += HINT_PENALTY[kind] ?? 0
  penalty = Math.min(penalty, 0.6)
  score = Math.round(score * (1 - penalty))
  if (usedMc) score = Math.min(score, 40)
  return Math.max(score, 0)
}

export type TriviaScoreInput = {
  elapsedSeconds: number
  streak: number
  difficulty: Difficulty
  hint: HintState
  streakCap?: number
  extraMultiplier?: number
}

/** Full trivia score for one correct answer. */
export const scoreTriviaAnswer = ({
  elapsedSeconds,
  streak,
  difficulty,
  hint,
  streakCap = DEFAULT_STREAK_CAP,
  extraMultiplier: extra = 1,
}: TriviaScoreInput): number => {
  const base = timeBucketPoints(elapsedSeconds)
  const afterHints = applyHintRules(base, hint)
  const withStreak = afterHints + streakBonus(streak, streakCap)
  return Math.round(withStreak * DIFFICULTY_MULTIPLIER[difficulty] * extra)
}

export const HANGMAN_CORRECT_LETTER = 5
export const HANGMAN_WRONG_PENALTY = 4
export const HANGMAN_SOLVE_BASE = 100
export const HANGMAN_LIFE_BONUS = 20
export const HANGMAN_FAST_BONUS = 50
export const HANGMAN_FAST_THRESHOLD = 30

// End-of-run bonuses (scaled by difficulty).
export const PERFECT_RUN_BONUS = 150
export const CLEAN_RUN_BONUS = 100

// How steeply reveal reduces the Hangman solve bonus, per difficulty.
// A larger divisor = gentler penalty. Hard/Expert punish reveal more.
const REVEAL_PENALTY_DIVISOR: Record<Difficulty, number> = {
  easy: 200,
  medium: 200,
  hard: 130,
  expert: 110,
}

export type HangmanScoreInput = {
  livesRemaining: number
  elapsedSeconds: number
  revealPercent: number
  difficulty: Difficulty
  hint: HintState
  extraMultiplier?: number
}

/** Hangman solve bonus (correct-letter points are awarded live during play). */
export const scoreHangmanSolve = ({
  livesRemaining,
  elapsedSeconds,
  revealPercent,
  difficulty,
  hint,
  extraMultiplier: extra = 1,
}: HangmanScoreInput): number => {
  let bonus = HANGMAN_SOLVE_BASE + livesRemaining * HANGMAN_LIFE_BONUS
  if (elapsedSeconds < HANGMAN_FAST_THRESHOLD) bonus += HANGMAN_FAST_BONUS

  // More reveal used => lower bonus; the floor depends on difficulty.
  const divisor = REVEAL_PENALTY_DIVISOR[difficulty]
  const revealFactor = Math.max(
    0.35,
    1 - Math.min(Math.max(revealPercent, 0), 100) / divisor,
  )
  bonus = Math.round(bonus * revealFactor)

  bonus = applyHintRules(bonus, hint)
  return Math.round(bonus * DIFFICULTY_MULTIPLIER[difficulty] * extra)
}

export type RunBonusInput = {
  correctCount: number
  wrongCount: number
  cleanRun: boolean
  difficulty: Difficulty
  extraMultiplier?: number
}

/** Bonuses awarded once at the end of a run (perfect accuracy, no hints). */
export const runCompletionBonus = ({
  correctCount,
  wrongCount,
  cleanRun,
  difficulty,
  extraMultiplier: extra = 1,
}: RunBonusInput): number => {
  if (correctCount === 0) return 0
  let bonus = 0
  if (wrongCount === 0) bonus += PERFECT_RUN_BONUS
  if (cleanRun) bonus += CLEAN_RUN_BONUS
  return Math.round(bonus * DIFFICULTY_MULTIPLIER[difficulty] * extra)
}

export type Grade = "S" | "A" | "B" | "C" | "D"

/** Letter grade from accuracy + clean-run + difficulty. */
export const gradeRun = (
  accuracy: number,
  cleanRun: boolean,
  difficulty: Difficulty,
): Grade => {
  const acc = accuracy <= 1 ? accuracy : accuracy / 100
  const tough = difficulty === "hard" || difficulty === "expert"
  if (acc >= 0.95 && cleanRun) return "S"
  if (acc >= 0.9 || (acc >= 0.85 && cleanRun && tough)) return "A"
  if (acc >= 0.75) return "B"
  if (acc >= 0.5) return "C"
  return "D"
}

/** Accuracy as a 0..1 fraction for leaderboard stats. */
export const computeAccuracy = (correct: number, wrong: number): number => {
  const total = correct + wrong
  if (total === 0) return 0
  return Math.round((correct / total) * 100) / 100
}

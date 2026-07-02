import type { Difficulty } from "../types/logo"

/**
 * Single source of truth for how each difficulty shapes the game. Everything
 * challenge-related (timers, autocomplete generosity, Hangman reveal, scoring
 * caps) reads from here so difficulty actually changes the puzzle, not just
 * the ASCII presentation.
 */
export type DifficultyTuning = {
  /** Trivia per-question countdown, in seconds. */
  triviaSeconds: number
  /** Min normalized characters before autocomplete suggests. */
  acThreshold: number
  /** Max autocomplete suggestions shown. */
  acMax: number
  /** Whether aliases are eligible as autocomplete suggestions. */
  acAliases: boolean
  /** Hangman starting lives (Signal Integrity). */
  hmLives: number
  /** Hangman starting reveal percent. */
  hmStartReveal: number
  /** Reveal percent gained per correct Hangman letter. */
  hmRevealPerLetter: number
  /** Whether the Hangman word shows its length / word boundaries. */
  hmShowLength: boolean
  /** Whether the Hangman sigil re-encrypts (decays) while idle. */
  hmDecay: boolean
  /** Streak bonus cap. */
  streakCap: number
  /** Trivia attempts allowed per question before it's lost. */
  triviaAttempts: number
}

export const TUNING: Record<Difficulty, DifficultyTuning> = {
  easy: {
    triviaSeconds: 30,
    acThreshold: 2,
    acMax: 3,
    acAliases: true,
    hmLives: 6,
    hmStartReveal: 50,
    hmRevealPerLetter: 8,
    hmShowLength: true,
    hmDecay: false,
    streakCap: 50,
    triviaAttempts: 2,
  },
  medium: {
    triviaSeconds: 20,
    acThreshold: 3,
    acMax: 2,
    acAliases: true,
    hmLives: 6,
    hmStartReveal: 40,
    hmRevealPerLetter: 6,
    hmShowLength: true,
    hmDecay: false,
    streakCap: 50,
    triviaAttempts: 2,
  },
  hard: {
    triviaSeconds: 15,
    acThreshold: 4,
    acMax: 1,
    acAliases: false,
    hmLives: 5,
    hmStartReveal: 30,
    hmRevealPerLetter: 4,
    hmShowLength: false,
    hmDecay: false,
    streakCap: 80,
    triviaAttempts: 2,
  },
  expert: {
    triviaSeconds: 10,
    acThreshold: Number.POSITIVE_INFINITY,
    acMax: 0,
    acAliases: false,
    hmLives: 4,
    hmStartReveal: 20,
    hmRevealPerLetter: 3,
    hmShowLength: false,
    hmDecay: true,
    streakCap: 120,
    triviaAttempts: 1,
  },
}

export const tuningFor = (difficulty: Difficulty): DifficultyTuning =>
  TUNING[difficulty]

// Reveal-decay pacing (Hangman, expert): lose this much reveal per tick.
export const DECAY_PERCENT_PER_TICK = 2
export const DECAY_TICK_MS = 3000
// Time Attack run length.
export const TIME_ATTACK_MS = 60_000

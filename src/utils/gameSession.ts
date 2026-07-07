import type { GameConfig, GameSessionState, HintState } from "../types/game"
import type { LogoEntry } from "../types/logo"
import { logosForCategoryAndDifficulty } from "../data/logos"
import { tuningFor, TIME_ATTACK_MS } from "../data/difficultyTuning"
import { createRng, shuffle } from "./random"

export const TRIVIA_START_LIVES = 3
export const HANGMAN_START_LIVES = 6

const emptyHint = (): HintState => ({
  usedKinds: [],
  textHintsShown: 0,
})

export const hasModifier = (config: GameConfig, m: GameConfig["modifiers"][number]): boolean =>
  config.modifiers.includes(m)

/** Starting lives: Sudden Death forces 1; otherwise per-mode / tuning. */
export const startLivesFor = (config: GameConfig): number => {
  if (hasModifier(config, "suddenDeath")) return 1
  return config.mode === "hangman" ? tuningFor(config.difficulty).hmLives : TRIVIA_START_LIVES
}

/** Hangman starts partially decoded (per difficulty); trivia starts at 0. */
export const initialReveal = (config: GameConfig): number =>
  config.mode === "hangman" ? tuningFor(config.difficulty).hmStartReveal : 0

/** Build a fresh, shuffled session for the given config. */
export const createSession = (config: GameConfig): GameSessionState => {
  const rng = config.seed ? createRng(config.seed) : Math.random
  const pool = shuffle(logosForCategoryAndDifficulty(config.category, config.difficulty), rng)
  const now = Date.now()
  const first = pool[0] ?? null
  const deadline = hasModifier(config, "timeAttack") ? now + TIME_ATTACK_MS : null
  return {
    config,
    status: pool.length > 0 ? "playing" : "gameover",
    pool,
    currentIndex: 0,
    currentLogo: first,
    score: 0,
    lives: startLivesFor(config),
    streak: 0,
    longestStreak: 0,
    correctCount: 0,
    wrongCount: 0,
    roundNumber: 1,
    startedAt: now,
    questionStartedAt: now,
    hint: emptyHint(),
    guessedLetters: [],
    wrongLetters: [],
    revealPercent: initialReveal(config),
    lastResult: null,
    cleanRun: true,
    attempts: 0,
    deadline,
    timedOut: false,
  }
}

/** Whether this run is a Time Attack (bounded by a clock, not a round count). */
export const isTimeAttack = (state: GameSessionState): boolean => state.deadline != null

/** Total Time Attack duration in seconds from run start. */
export const timeAttackSecondsRemaining = (state: GameSessionState): number | undefined => {
  if (!isTimeAttack(state) || state.deadline == null) return undefined
  return Math.max(0, Math.round((state.deadline - state.startedAt) / 1000))
}

/** How many questions this run should include (Infinity for endless / time attack). */
export const totalRounds = (state: GameSessionState): number => {
  if (isTimeAttack(state)) return Infinity
  return state.config.roundLength === "endless"
    ? Infinity
    : Math.min(state.config.roundLength, state.pool.length)
}

/** Whether the run has more logos to serve after the current one. */
export const hasNextLogo = (state: GameSessionState): boolean => {
  if (isTimeAttack(state)) return Date.now() < (state.deadline ?? 0)
  const limit = totalRounds(state)
  if (state.roundNumber >= limit) return false
  return state.currentIndex + 1 < state.pool.length
}

/**
 * Advance to the next logo, resetting per-question fields. In Time Attack the
 * pool wraps and reshuffles so play continues until the deadline.
 */
export const advanceLogo = (state: GameSessionState): GameSessionState => {
  if (!hasNextLogo(state)) {
    return { ...state, status: "gameover" }
  }
  let pool = state.pool
  let nextIndex = state.currentIndex + 1
  if (nextIndex >= pool.length) {
    // Only reachable in Time Attack: reshuffle and wrap.
    pool = shuffle(state.pool)
    nextIndex = 0
  }
  const nextLogo = pool[nextIndex]
  return {
    ...state,
    pool,
    currentIndex: nextIndex,
    currentLogo: nextLogo,
    roundNumber: state.roundNumber + 1,
    questionStartedAt: Date.now(),
    hint: emptyHint(),
    guessedLetters: [],
    wrongLetters: [],
    revealPercent: initialReveal(state.config),
    lastResult: null,
    attempts: 0,
    timedOut: false,
    status: "playing",
  }
}

/** Seconds elapsed on the current question. */
export const elapsedSeconds = (state: GameSessionState): number =>
  (Date.now() - state.questionStartedAt) / 1000

export const currentLogoOrThrow = (state: GameSessionState): LogoEntry => {
  if (!state.currentLogo) throw new Error("No current logo in session")
  return state.currentLogo
}

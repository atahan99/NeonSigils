import type { GameSummary } from "../router"
import type { GameMode, GameSessionState } from "../types/game"
import { computeAccuracy, gradeRun, runCompletionBonus, extraMultiplier } from "./scoring"

export const buildGameSummary = (state: GameSessionState, mode: GameMode): GameSummary => {
  const { config } = state
  const accuracy = computeAccuracy(state.correctCount, state.wrongCount)
  const bonus = runCompletionBonus({
    correctCount: state.correctCount,
    wrongCount: state.wrongCount,
    cleanRun: state.cleanRun,
    difficulty: config.difficulty,
    extraMultiplier: extraMultiplier(config.category, config.modifiers),
  })
  return {
    score: state.score + bonus,
    mode,
    category: config.category,
    difficulty: config.difficulty,
    correctCount: state.correctCount,
    wrongCount: state.wrongCount,
    accuracy,
    longestStreak: state.longestStreak,
    durationSeconds: Math.round((Date.now() - state.startedAt) / 1000),
    grade: gradeRun(accuracy, state.cleanRun, config.difficulty),
    modifiers: config.modifiers,
  }
}

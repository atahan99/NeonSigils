import type { GameSummary } from "../router"
import type { GameMode, GameSessionState } from "../types/game"
import { computeAccuracy, gradeRun, runCompletionBonus, extraMultiplier } from "./scoring"

const SITE = "neonsigils.cybrsmr.xyz"

/** Wordle-style result for a Daily run: one square per sigil, no answers. */
export const dailyShareText = (summary: GameSummary): string => {
  const grid = (summary.results ?? []).map((r) => (r === "correct" ? "🟩" : "🟥")).join("")
  const mode = summary.mode === "trivia" ? "Trivia" : "Hangman"
  return [
    `NeonSigils Daily ${summary.daily ?? ""} · ${mode}`.trim(),
    grid,
    `${summary.correctCount}/${summary.correctCount + summary.wrongCount} · ${summary.score} pts${summary.grade ? ` · Rank ${summary.grade}` : ""}`,
    SITE,
  ].join("\n")
}

export const buildGameSummary = (
  state: GameSessionState,
  mode: GameMode,
  now = Date.now(),
): GameSummary => {
  const { config } = state
  const accuracy = computeAccuracy(state.correctCount, state.wrongCount)
  const bonus = runCompletionBonus({
    correctCount: state.correctCount,
    wrongCount: state.wrongCount,
    cleanRun: state.cleanRun,
    difficulty: config.difficulty,
    extraMultiplier: extraMultiplier(config),
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
    durationSeconds: Math.round((now - state.startedAt) / 1000),
    grade: gradeRun(accuracy, state.cleanRun, config.difficulty),
    modifiers: config.modifiers,
    scope: config.scope ?? "both",
    results: state.results,
    daily: config.modifiers.includes("daily") ? config.seed?.replace(/^daily-/, "") : undefined,
  }
}

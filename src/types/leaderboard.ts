import type { Difficulty, PlayCategoryId } from "./logo"
import type { GameMode, Modifier } from "./game"

export type LeaderboardEntry = {
  id: string
  playerName: string
  score: number
  mode: GameMode
  category: PlayCategoryId
  difficulty: Difficulty
  correctCount: number
  wrongCount: number
  accuracy: number
  longestStreak: number
  durationSeconds: number
  createdAt: string
  grade?: string
  modifiers?: Modifier[]
}

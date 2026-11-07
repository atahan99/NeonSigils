/** Format seconds as m:ss (Game Over uses rounded input; leaderboard uses floored). */
/** "hard", or "hard (logos only)" when difficulty drove just one axis. */
export const formatDifficulty = (difficulty: string, scope?: string): string =>
  scope === "logos" || scope === "render" ? `${difficulty} (${scope} only)` : difficulty

export const formatDuration = (totalSeconds: number, floor = false): string => {
  const safe = Math.max(0, floor ? Math.floor(totalSeconds) : Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  const pad = floor ? 2 : 0
  return `${minutes}:${String(seconds).padStart(pad + 1, "0")}`
}

/** Accuracy may arrive as a 0..1 fraction or an already-scaled percent. */
export const formatAccuracy = (accuracy: number): string =>
  `${Math.round(accuracy <= 1 ? accuracy * 100 : accuracy)}%`

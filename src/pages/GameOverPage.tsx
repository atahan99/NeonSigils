import { useEffect, useState } from "react"
import { useRouter } from "../router"
import { useSettings } from "../hooks/useSettings"
import { getPlayCategoryName } from "../data/categories"
import { addLeaderboardEntry } from "../utils/leaderboardStorage"
import { NeonPanel } from "../components/layout/NeonPanel"
import { NeonButton } from "../components/layout/NeonButton"
import styles from "./GameOverPage.module.css"

const formatDuration = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

// Accuracy may arrive as a 0..1 fraction or an already-scaled percent.
const formatAccuracy = (accuracy: number): string =>
  `${Math.round(accuracy <= 1 ? accuracy * 100 : accuracy)}%`

export const GameOverPage = () => {
  const { navigate, params } = useRouter()
  const { settings } = useSettings()
  const summary = params.summary

  const [playerName, setPlayerName] = useState(settings.playerName)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!summary) navigate("home")
  }, [summary, navigate])

  if (!summary) return null

  const handleSave = () => {
    const name = playerName.trim() || "OPERATOR"
    addLeaderboardEntry({
      playerName: name,
      score: summary.score,
      mode: summary.mode,
      category: summary.category,
      difficulty: summary.difficulty,
      correctCount: summary.correctCount,
      wrongCount: summary.wrongCount,
      accuracy: summary.accuracy,
      longestStreak: summary.longestStreak,
      durationSeconds: summary.durationSeconds,
      grade: summary.grade,
      modifiers: summary.modifiers,
    })
    setSaved(true)
  }

  const modifierLabels: Record<string, string> = {
    suddenDeath: "Sudden Death",
    timeAttack: "Time Attack",
    daily: "Daily",
  }
  const perfectRun = summary.wrongCount === 0 && summary.correctCount > 0

  const stats: { label: string; value: string }[] = [
    { label: "Mode", value: summary.mode },
    { label: "Category", value: getPlayCategoryName(summary.category) },
    { label: "Difficulty", value: summary.difficulty },
    { label: "Correct", value: String(summary.correctCount) },
    { label: "Wrong", value: String(summary.wrongCount) },
    { label: "Accuracy", value: formatAccuracy(summary.accuracy) },
    { label: "Longest Streak", value: String(summary.longestStreak) },
    { label: "Duration", value: formatDuration(summary.durationSeconds) },
  ]
  if (summary.modifiers && summary.modifiers.length > 0) {
    stats.push({
      label: "Modifiers",
      value: summary.modifiers.map((m) => modifierLabels[m] ?? m).join(", "),
    })
  }

  return (
    <div className={`${styles.page} anim-fade-in`}>
      <h1 className={`${styles.verdict} glitch`} data-text="CONNECTION TERMINATED">
        CONNECTION TERMINATED
      </h1>

      <div className={styles.scoreWrap}>
        <span className={styles.scoreLabel}>Final Score</span>
        <span className={styles.score}>{summary.score}</span>
        {summary.grade && (
          <span className={styles.grade} data-grade={summary.grade}>
            RANK {summary.grade}
          </span>
        )}
        {perfectRun && <span className={styles.perfect}>PERFECT DECODE</span>}
      </div>

      <NeonPanel title="Session Report">
        <div className={styles.grid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          ))}
        </div>
      </NeonPanel>

      <NeonPanel title="Hall of Signals" glow>
        {saved ? (
          <div className={styles.archived}>
            <p className={styles.archivedText}>SIGNAL ARCHIVED</p>
            <NeonButton variant="green" onClick={() => navigate("leaderboard")}>
              View Hall of Signals
            </NeonButton>
          </div>
        ) : (
          <div className={styles.saveRow}>
            <label className={styles.nameField}>
              <span className={styles.statLabel}>Operator Handle</span>
              <input
                className={styles.nameInput}
                type="text"
                value={playerName}
                maxLength={24}
                onChange={(e) => setPlayerName(e.target.value)}
                aria-label="Player name"
              />
            </label>
            <NeonButton variant="primary" onClick={handleSave}>
              Save to Hall of Signals
            </NeonButton>
          </div>
        )}
      </NeonPanel>

      <div className={styles.actions}>
        <NeonButton
          variant="magenta"
          onClick={() => navigate("category-select", { mode: summary.mode })}
        >
          Run Again
        </NeonButton>
        <NeonButton variant="ghost" onClick={() => navigate("home")}>
          Home
        </NeonButton>
      </div>
    </div>
  )
}

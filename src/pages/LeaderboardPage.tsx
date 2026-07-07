import { useMemo, useState } from "react"
import { useRouter } from "../router"
import { NeonPanel } from "../components/layout/NeonPanel"
import { NeonButton } from "../components/layout/NeonButton"
import { getPlayCategoryName } from "../data/categories"
import {
  loadLeaderboard,
  clearLeaderboard,
  exportLeaderboard,
  sortByScore,
  sortByRecent,
} from "../utils/leaderboardStorage"
import { formatAccuracy, formatDuration } from "../utils/format"
import type { LeaderboardEntry } from "../types/leaderboard"
import type { GameMode } from "../types/game"
import type { Difficulty, PlayCategoryId } from "../types/logo"
import styles from "./LeaderboardPage.module.css"

type ViewId =
  | "overall"
  | "byMode"
  | "byCategory"
  | "byDifficulty"
  | "recent"
  | "bestPerCategory"

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "byMode", label: "By Mode" },
  { id: "byCategory", label: "By Category" },
  { id: "byDifficulty", label: "By Difficulty" },
  { id: "recent", label: "Recent" },
  { id: "bestPerCategory", label: "Best / Category" },
]

const MODES: GameMode[] = ["trivia", "hangman"]
const CATEGORIES: PlayCategoryId[] = [
  "security-networking",
  "selfhosting-homelab",
  "general-it-tech",
  "mixed",
]
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"]

const formatDate = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, {
    year: "2-digit",
    month: "short",
    day: "numeric",
  })
}

// Highest-scoring entry per category present in the archive, ranked by score.
const bestPerCategory = (entries: LeaderboardEntry[]): LeaderboardEntry[] => {
  const best = new Map<PlayCategoryId, LeaderboardEntry>()
  for (const entry of entries) {
    const current = best.get(entry.category)
    if (!current || entry.score > current.score) best.set(entry.category, entry)
  }
  return sortByScore([...best.values()])
}

export const LeaderboardPage = () => {
  const { navigate } = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => loadLeaderboard())
  const [view, setView] = useState<ViewId>("overall")
  const [modeFilter, setModeFilter] = useState<GameMode>("trivia")
  const [categoryFilter, setCategoryFilter] = useState<PlayCategoryId>(
    "security-networking",
  )
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>("easy")
  const [confirmClear, setConfirmClear] = useState(false)

  const visibleEntries = useMemo<LeaderboardEntry[]>(() => {
    if (view === "recent") return sortByRecent(entries)
    if (view === "bestPerCategory") return bestPerCategory(entries)
    if (view === "byMode") {
      return sortByScore(entries.filter((e) => e.mode === modeFilter))
    }
    if (view === "byCategory") {
      return sortByScore(entries.filter((e) => e.category === categoryFilter))
    }
    if (view === "byDifficulty") {
      return sortByScore(entries.filter((e) => e.difficulty === difficultyFilter))
    }
    return sortByScore(entries)
  }, [entries, view, modeFilter, categoryFilter, difficultyFilter])

  const handleExport = () => {
    const blob = new Blob([exportLeaderboard()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "neonsigils-leaderboard.json"
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const handleConfirmClear = () => {
    clearLeaderboard()
    setEntries(loadLeaderboard())
    setConfirmClear(false)
  }

  const isEmpty = entries.length === 0

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>HALL OF SIGNALS</h1>
          <p className={styles.subtitle}>
            Archived runs decoded from the neon grid.
          </p>
        </div>
        {!isEmpty && (
          <div className={styles.actions}>
            <NeonButton variant="green" size="sm" onClick={handleExport}>
              Export JSON
            </NeonButton>
            {confirmClear ? (
              <div className={styles.confirm} role="group" aria-label="Confirm wipe">
                <span className={styles.confirmText}>Confirm wipe?</span>
                <NeonButton variant="danger" size="sm" onClick={handleConfirmClear}>
                  Yes
                </NeonButton>
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmClear(false)}
                >
                  No
                </NeonButton>
              </div>
            ) : (
              <NeonButton
                variant="danger"
                size="sm"
                onClick={() => setConfirmClear(true)}
              >
                Clear
              </NeonButton>
            )}
          </div>
        )}
      </header>

      {isEmpty ? (
        <NeonPanel glow>
          <div className={styles.empty}>
            <pre className={styles.emptyGlyph} aria-hidden="true">
{`  ▓▓▓▓▓▓▓▓▓▓
  ▓  ░░░░  ▓
  ▓  ████  ▓
  ▓▓▓▓▓▓▓▓▓▓`}
            </pre>
            <h2 className={styles.emptyTitle}>NO SIGNALS ARCHIVED YET</h2>
            <p className={styles.emptyText}>
              The grid is silent. Decode some sigils to etch your name into the
              hall.
            </p>
            <NeonButton variant="primary" onClick={() => navigate("home")}>
              Enter the Grid
            </NeonButton>
          </div>
        </NeonPanel>
      ) : (
        <NeonPanel>
          <nav className={styles.views} aria-label="Leaderboard views">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view === v.id}
                className={view === v.id ? styles.viewTabActive : styles.viewTab}
                onClick={() => setView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </nav>

          {view === "byMode" && (
            <FilterRow
              label="Mode"
              value={modeFilter}
              options={MODES.map((m) => ({ value: m, label: m }))}
              onSelect={setModeFilter}
            />
          )}
          {view === "byCategory" && (
            <FilterRow
              label="Category"
              value={categoryFilter}
              options={CATEGORIES.map((c) => ({
                value: c,
                label: getPlayCategoryName(c),
              }))}
              onSelect={setCategoryFilter}
            />
          )}
          {view === "byDifficulty" && (
            <FilterRow
              label="Difficulty"
              value={difficultyFilter}
              options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
              onSelect={setDifficultyFilter}
            />
          )}

          {visibleEntries.length === 0 ? (
            <p className={styles.noMatch}>No runs match this filter yet.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Operator</th>
                    <th scope="col">Score</th>
                    <th scope="col">Mode</th>
                    <th scope="col">Category</th>
                    <th scope="col">Diff</th>
                    <th scope="col">Acc</th>
                    <th scope="col">Streak</th>
                    <th scope="col">Time</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEntries.map((entry, index) => (
                    <tr key={entry.id}>
                      <td className={styles.rank} data-label="#">
                        {index + 1}
                      </td>
                      <td className={styles.player} data-label="Operator">
                        {entry.playerName}
                      </td>
                      <td className={styles.score} data-label="Score">
                        {entry.score}
                      </td>
                      <td data-label="Mode">{entry.mode}</td>
                      <td data-label="Category">
                        {getPlayCategoryName(entry.category)}
                      </td>
                      <td data-label="Diff">{entry.difficulty}</td>
                      <td data-label="Acc">{formatAccuracy(entry.accuracy)}</td>
                      <td data-label="Streak">{entry.longestStreak}</td>
                      <td data-label="Time">
                        {formatDuration(entry.durationSeconds, true)}
                      </td>
                      <td className={styles.date} data-label="Date">
                        {formatDate(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NeonPanel>
      )}
    </div>
  )
}

type FilterOption<T extends string> = { value: T; label: string }

type FilterRowProps<T extends string> = {
  label: string
  value: T
  options: FilterOption<T>[]
  onSelect: (value: T) => void
}

const FilterRow = <T extends string>({
  label,
  value,
  options,
  onSelect,
}: FilterRowProps<T>) => (
  <div className={styles.filterRow} role="group" aria-label={label}>
    <span className={styles.filterLabel}>{label}:</span>
    <div className={styles.filterOptions}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          className={
            value === option.value ? styles.filterChipActive : styles.filterChip
          }
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
)

import type { LeaderboardEntry } from "../types/leaderboard"
import { CATEGORIES } from "../data/categories"

const STORAGE_KEY = "neonsigils.leaderboard.v1"
const MAX_ENTRIES = 500
const MAX_NAME_LENGTH = 24

const CATEGORY_IDS = new Set<string>([...CATEGORIES.map((c) => c.id), "mixed"])
const MODES = new Set(["trivia", "hangman"])
const DIFFICULTIES = new Set(["easy", "medium", "hard", "expert"])

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0

// localStorage is user-editable, so a stored entry is untrusted until it has
// the exact shape the leaderboard renders. Bad entries are dropped, not fatal.
const isEntry = (e: unknown): e is LeaderboardEntry => {
  if (typeof e !== "object" || e === null) return false
  const r = e as Record<string, unknown>
  return (
    typeof r.id === "string" &&
    typeof r.playerName === "string" &&
    typeof r.createdAt === "string" &&
    !Number.isNaN(Date.parse(r.createdAt)) &&
    MODES.has(r.mode as string) &&
    CATEGORY_IDS.has(r.category as string) &&
    DIFFICULTIES.has(r.difficulty as string) &&
    [r.score, r.correctCount, r.wrongCount, r.accuracy, r.longestStreak, r.durationSeconds].every(isCount) &&
    (r.grade === undefined || typeof r.grade === "string") &&
    (r.modifiers === undefined || Array.isArray(r.modifiers))
  )
}

const safeParse = (raw: string | null): LeaderboardEntry[] => {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isEntry)
      .map((e) => ({ ...e, playerName: e.playerName.slice(0, MAX_NAME_LENGTH) }))
  } catch {
    return []
  }
}

// Access can throw (storage blocked, quota full, private mode); the game keeps
// working without a saved leaderboard rather than crashing.
export const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return []
  }
}

const persist = (entries: LeaderboardEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* storage unavailable; entry is lost but the run summary still shows */
  }
}

const createId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const addLeaderboardEntry = (
  entry: Omit<LeaderboardEntry, "id" | "createdAt">,
): LeaderboardEntry => {
  const full: LeaderboardEntry = {
    ...entry,
    id: createId(),
    createdAt: new Date().toISOString(),
  }
  persist(sortByScore([...loadLeaderboard(), full]).slice(0, MAX_ENTRIES))
  return full
}

export const clearLeaderboard = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable */
  }
}

export const exportLeaderboard = (): string =>
  JSON.stringify(loadLeaderboard(), null, 2)

export const sortByScore = (entries: LeaderboardEntry[]): LeaderboardEntry[] =>
  [...entries].sort((a, b) => b.score - a.score)

export const sortByRecent = (entries: LeaderboardEntry[]): LeaderboardEntry[] =>
  [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

import type { LeaderboardEntry } from "../types/leaderboard"

const STORAGE_KEY = "neonsigils.leaderboard.v1"

const safeParse = (raw: string | null): LeaderboardEntry[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as LeaderboardEntry[]) : []
  } catch {
    return []
  }
}

export const loadLeaderboard = (): LeaderboardEntry[] => {
  if (typeof localStorage === "undefined") return []
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

const persist = (entries: LeaderboardEntry[]): void => {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
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
  const entries = loadLeaderboard()
  entries.push(full)
  persist(entries)
  return full
}

export const clearLeaderboard = (): void => {
  if (typeof localStorage === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export const exportLeaderboard = (): string =>
  JSON.stringify(loadLeaderboard(), null, 2)

/** Import a JSON string of entries, merging with existing ones (dedup by id). */
export const importLeaderboard = (json: string): number => {
  const incoming = safeParse(json)
  if (incoming.length === 0) return 0
  const existing = loadLeaderboard()
  const byId = new Map(existing.map((e) => [e.id, e]))
  for (const entry of incoming) byId.set(entry.id, entry)
  persist([...byId.values()])
  return incoming.length
}

export const sortByScore = (entries: LeaderboardEntry[]): LeaderboardEntry[] =>
  [...entries].sort((a, b) => b.score - a.score)

export const sortByRecent = (entries: LeaderboardEntry[]): LeaderboardEntry[] =>
  [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

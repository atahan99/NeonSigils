import { beforeEach, describe, expect, it, vi } from "vitest"
import { addLeaderboardEntry, loadLeaderboard } from "./leaderboardStorage"

const KEY = "neonsigils.leaderboard.v1"

const memoryStorage = () => {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  }
}

const entry = {
  playerName: "GHOST",
  score: 120,
  mode: "trivia" as const,
  category: "mixed" as const,
  difficulty: "easy" as const,
  correctCount: 3,
  wrongCount: 1,
  accuracy: 0.75,
  longestStreak: 2,
  durationSeconds: 40,
}

beforeEach(() => {
  vi.stubGlobal("localStorage", memoryStorage())
})

describe("leaderboard storage", () => {
  it("round-trips a saved entry", () => {
    const saved = addLeaderboardEntry(entry)
    expect(loadLeaderboard()).toEqual([saved])
  })

  it("drops malformed entries instead of crashing", () => {
    const good = { ...entry, id: "a", createdAt: new Date().toISOString() }
    localStorage.setItem(
      KEY,
      JSON.stringify([null, { playerName: {} }, { ...good, category: "nope" }, { ...good, score: "9" }, good]),
    )
    expect(loadLeaderboard()).toEqual([good])
  })

  it("returns nothing for invalid JSON or a non-array", () => {
    localStorage.setItem(KEY, "{not json")
    expect(loadLeaderboard()).toEqual([])
    localStorage.setItem(KEY, '{"a":1}')
    expect(loadLeaderboard()).toEqual([])
  })

  it("truncates oversized names", () => {
    const good = { ...entry, id: "a", createdAt: new Date().toISOString(), playerName: "X".repeat(500) }
    localStorage.setItem(KEY, JSON.stringify([good]))
    expect(loadLeaderboard()[0].playerName).toHaveLength(24)
  })

  it("keeps the game running when storage throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("SecurityError")
      },
      setItem: () => {
        throw new Error("QuotaExceededError")
      },
    })
    expect(loadLeaderboard()).toEqual([])
    expect(() => addLeaderboardEntry(entry)).not.toThrow()
  })
})

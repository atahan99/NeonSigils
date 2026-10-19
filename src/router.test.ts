import { describe, expect, it } from "vitest"
import { hashFor, parseHash, type RouteName } from "./router"

describe("hash routes", () => {
  it("round-trips every route", () => {
    const routes: RouteName[] = ["home", "trivia", "hangman", "game-over", "leaderboard", "settings", "about"]
    for (const route of routes) expect(parseHash(hashFor(route)).route).toBe(route)
  })

  it("keeps the play mode in the URL", () => {
    expect(hashFor("category-select", { mode: "hangman" })).toBe("#/play/hangman")
    expect(parseHash("#/play/hangman")).toEqual({ route: "category-select", params: { mode: "hangman" } })
  })

  it("falls back to home for empty or unknown hashes", () => {
    expect(parseHash("").route).toBe("home")
    expect(parseHash("#/nope").route).toBe("home")
    expect(parseHash("#/play/chess").route).toBe("home")
  })
})

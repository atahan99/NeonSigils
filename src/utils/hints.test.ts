import { describe, expect, it } from "vitest"
import { ALL_LOGOS, MIN_POOL, logosForCategoryAndDifficulty } from "../data/logos"
import { isAnswerCorrect } from "./normalizeAnswer"
import { maskAlias, redactName, resolveHintText, usefulAlias } from "./hints"
import { dailyShareText } from "./runSummary"
import { scopeFactor } from "./scoring"

describe("alias hint", () => {
  it("skips aliases that are just the name re-spaced", () => {
    expect(usefulAlias({ name: "Wireshark", aliases: ["wire shark"] })).toBeUndefined()
    expect(usefulAlias({ name: "Nmap", aliases: ["nmap", "network mapper"] })).toBe("network mapper")
  })

  it("never shows an accepted answer in full", () => {
    for (const logo of ALL_LOGOS) {
      expect(isAnswerCorrect(resolveHintText(logo, "alias").replace(/^Also known as: /, ""), logo)).toBe(false)
    }
  })

  it("masks all but each word's first character", () => {
    expect(maskAlias("network mapper")).toBe("n______ m_____")
  })
})

describe("text hints", () => {
  it("redact the answer's name", () => {
    expect(redactName("Configured with a simple Caddyfile.", "Caddy")).toBe("Configured with a simple ▒▒▒▒▒file.")
  })
})

describe("logo pool", () => {
  it("widens a thin tier to neighbours instead of falling back to everything", () => {
    const pool = logosForCategoryAndDifficulty("general-it-tech", "expert")
    expect(pool.length).toBeGreaterThanOrEqual(MIN_POOL)
    expect(pool.some((l) => l.difficulty === "easy")).toBe(false)
  })

  it("ignores logo difficulty when difficulty only affects rendering", () => {
    expect(logosForCategoryAndDifficulty("mixed", "expert", "render")).toHaveLength(ALL_LOGOS.length)
  })
})

describe("scope scoring", () => {
  it("gives half the difficulty bonus when only one axis is hard", () => {
    expect(scopeFactor({ difficulty: "expert", scope: "both" })).toBe(1)
    expect(2 * scopeFactor({ difficulty: "expert", scope: "logos" })).toBeCloseTo(1.5)
  })
})

describe("daily share", () => {
  it("prints one square per sigil and no answers", () => {
    const text = dailyShareText({
      score: 420, mode: "trivia", category: "mixed", difficulty: "medium",
      correctCount: 2, wrongCount: 1, accuracy: 0.67, longestStreak: 2,
      durationSeconds: 60, grade: "C", results: ["correct", "wrong", "correct"], daily: "2026-11-07",
    })
    expect(text).toContain("NeonSigils Daily 2026-11-07 · Trivia")
    expect(text).toContain("🟩🟥🟩")
    expect(text).toContain("2/3 · 420 pts · Rank C")
  })
})

import { describe, expect, it } from "vitest"
import { computeAccuracy, gradeRun, runCompletionBonus, streakBonus } from "./scoring"

describe("computeAccuracy", () => {
  it("is correct / total, rounded to two places", () => {
    expect(computeAccuracy(2, 1)).toBe(0.67)
    expect(computeAccuracy(0, 0)).toBe(0)
  })
})

describe("gradeRun", () => {
  it("needs a clean run for S", () => {
    expect(gradeRun(1, true, "easy")).toBe("S")
    expect(gradeRun(1, false, "easy")).toBe("A")
    expect(gradeRun(0.4, false, "easy")).toBe("D")
  })
})

describe("streakBonus", () => {
  it("is capped", () => {
    expect(streakBonus(100, 50)).toBeLessThanOrEqual(50)
  })
})

describe("runCompletionBonus", () => {
  it("gives nothing to a run with no correct answers", () => {
    expect(runCompletionBonus({ correctCount: 0, wrongCount: 0, cleanRun: true, difficulty: "easy" })).toBe(0)
  })

  it("scales with difficulty", () => {
    const easy = runCompletionBonus({ correctCount: 5, wrongCount: 0, cleanRun: true, difficulty: "easy" })
    const expert = runCompletionBonus({ correctCount: 5, wrongCount: 0, cleanRun: true, difficulty: "expert" })
    expect(expert).toBe(easy * 2)
  })
})

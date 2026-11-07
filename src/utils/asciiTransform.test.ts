import { describe, expect, it } from "vitest"
import { ALL_LOGOS } from "../data/logos"
import {
  DIFFICULTY_COLS,
  RAMP_SHORT,
  asciiFrame,
  padLines,
  renderAt,
  renderDifficulty,
  resampleAscii,
} from "./asciiTransform"

const logo = ALL_LOGOS[0]

describe("asciiFrame", () => {
  it("returns the given art for the clean frame", () => {
    expect(asciiFrame(logo.ascii, logo.id, "clean")).toBe(logo.ascii)
  })

  it("derives the same glitched frame every time (seeded by logo id)", () => {
    const a = asciiFrame(logo.ascii, logo.id, "glitched")
    expect(a).toEqual(asciiFrame(logo.ascii, logo.id, "glitched"))
    expect(a).not.toEqual(logo.ascii)
  })

  it("crops to fewer rows", () => {
    expect(asciiFrame(logo.ascii, logo.id, "cropped").length).toBeLessThan(logo.ascii.length)
  })
})

describe("resampleAscii", () => {
  it("halves a solid block and keeps it solid", () => {
    expect(resampleAscii(["@@@@", "@@@@"], 0.5, RAMP_SHORT)).toEqual(["@@"])
  })

  it("averages ink: half-filled cells land mid-ramp", () => {
    expect(resampleAscii(["@ ", "@ "], 0.5, " .:-=+*#%@")).toEqual(["+"])
  })

  it("never renders wider than the difficulty's column budget", () => {
    for (const l of ALL_LOGOS) {
      expect(renderAt(l, "expert")[0].length).toBeLessThanOrEqual(DIFFICULTY_COLS.expert)
      expect(l.ascii[0].length).toBeLessThanOrEqual(DIFFICULTY_COLS.easy)
    }
  })

  it("uses only ramp characters on hard and expert", () => {
    const chars = new Set(renderAt(logo, "hard").join(""))
    for (const ch of chars) expect(RAMP_SHORT).toContain(ch)
  })
})

describe("renderDifficulty", () => {
  it("shows clean easy-width art when difficulty only picks the logos", () => {
    expect(renderDifficulty("expert", "logos")).toBe("easy")
    expect(renderDifficulty("expert", "render")).toBe("expert")
    expect(renderDifficulty("hard")).toBe("hard")
  })
})

describe("padLines", () => {
  it("makes every line the same width", () => {
    expect(padLines(["ab", "abcd", ""])).toEqual(["ab  ", "abcd", "    "])
  })
})

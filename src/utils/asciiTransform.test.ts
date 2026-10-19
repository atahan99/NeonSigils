import { describe, expect, it } from "vitest"
import { ALL_LOGOS } from "../data/logos"
import { asciiFrame, padLines } from "./asciiTransform"

const logo = ALL_LOGOS[0]

describe("asciiFrame", () => {
  it("returns the shipped art for the clean frame", () => {
    expect(asciiFrame(logo, "clean")).toBe(logo.ascii)
  })

  it("derives the same glitched frame every time (seeded by logo id)", () => {
    expect(asciiFrame(logo, "glitched")).toEqual(asciiFrame(logo, "glitched"))
    expect(asciiFrame(logo, "glitched")).not.toEqual(logo.ascii)
  })

  it("crops to fewer rows", () => {
    expect(asciiFrame(logo, "cropped").length).toBeLessThan(logo.ascii.length)
  })
})

describe("padLines", () => {
  it("makes every line the same width", () => {
    expect(padLines(["ab", "abcd", ""])).toEqual(["ab  ", "abcd", "    "])
  })
})

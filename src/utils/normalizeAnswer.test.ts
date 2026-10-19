import { describe, expect, it } from "vitest"
import { isAnswerCorrect, isNearMiss, normalizeAnswer } from "./normalizeAnswer"

const cpp = { name: "C++", aliases: ["cpp", "cplusplus"] }
const burp = { name: "Burp Suite", aliases: ["burp"] }

describe("normalizeAnswer", () => {
  it("collapses case, spacing and punctuation", () => {
    expect(normalizeAnswer("Burp-Suite")).toBe("burpsuite")
    expect(normalizeAnswer("  burp suite ")).toBe("burpsuite")
  })

  it("strips accents and spells out &, + and #", () => {
    expect(normalizeAnswer("Pokémon")).toBe("pokemon")
    expect(normalizeAnswer("AT&T")).toBe("atandt")
    expect(normalizeAnswer("C++")).toBe("cplusplus")
    expect(normalizeAnswer("C#")).toBe("csharp")
  })
})

describe("isAnswerCorrect", () => {
  it("accepts the name and aliases", () => {
    expect(isAnswerCorrect("burp suite", burp)).toBe(true)
    expect(isAnswerCorrect("BURP", burp)).toBe(true)
    expect(isAnswerCorrect("c++", cpp)).toBe(true)
    expect(isAnswerCorrect("cpp", cpp)).toBe(true)
  })

  it("rejects a bare prefix that symbols used to collapse into", () => {
    expect(isAnswerCorrect("C", cpp)).toBe(false)
  })

  it("rejects empty input", () => {
    expect(isAnswerCorrect("  ", burp)).toBe(false)
  })
})

describe("isNearMiss", () => {
  it("flags guesses one edit away, but not exact or short ones", () => {
    expect(isNearMiss("burpsuit", burp)).toBe(true)
    expect(isNearMiss("burp suite", burp)).toBe(false)
    expect(isNearMiss("bu", burp)).toBe(false)
    expect(isNearMiss("wireshark", burp)).toBe(false)
  })
})

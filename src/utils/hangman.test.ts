import { describe, expect, it } from "vitest"
import { guessableChars, isSolved } from "./hangman"

describe("guessableChars", () => {
  it("returns unique lowercase letters only", () => {
    expect(guessableChars("Burp Suite")).toEqual(["b", "u", "r", "p", "s", "i", "t", "e"])
  })

  it("skips digits, which the A-Z keyboard cannot type", () => {
    expect(guessableChars("Hak5")).toEqual(["h", "a", "k"])
    expect(guessableChars("Zigbee2MQTT")).not.toContain("2")
  })
})

describe("isSolved", () => {
  it("is solved once every letter is guessed, digits included for free", () => {
    expect(isSolved("F5", ["f"])).toBe(true)
    expect(isSolved("Auth0", ["a", "u", "t"])).toBe(false)
    expect(isSolved("Auth0", ["a", "u", "t", "h"])).toBe(true)
  })
})

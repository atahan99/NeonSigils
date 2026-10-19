import { describe, expect, it } from "vitest"
import { createRng, shuffle } from "./random"

describe("createRng", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = createRng("daily-2026-10-19")
    const b = createRng("daily-2026-10-19")
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it("differs between seeds and stays in [0, 1)", () => {
    const a = createRng("x")()
    const b = createRng("y")()
    expect(a).not.toBe(b)
    for (const v of [a, b]) expect(v >= 0 && v < 1).toBe(true)
  })
})

describe("shuffle", () => {
  it("returns a permutation without mutating the input", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const out = shuffle(input, createRng(1))
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect([...out].sort()).toEqual(input)
  })

  it("is deterministic with a seeded rng", () => {
    expect(shuffle([1, 2, 3, 4, 5], createRng("s"))).toEqual(shuffle([1, 2, 3, 4, 5], createRng("s")))
  })
})

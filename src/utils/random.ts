/**
 * Deterministic PRNG utilities. A string seed produces a repeatable sequence,
 * so shuffles and build-time generation can be reproducible when desired.
 */

// FNV-1a hash -> 32-bit seed from a string.
const hashSeed = (seed: string): number => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32: tiny, fast seeded PRNG returning floats in [0, 1).
export const createRng = (seed: string | number): (() => number) => {
  let a = typeof seed === "number" ? seed >>> 0 : hashSeed(seed)
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher-Yates shuffle. Pass an rng for deterministic output, or omit for Math.random. */
export const shuffle = <T>(items: T[], rng: () => number = Math.random): T[] => {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

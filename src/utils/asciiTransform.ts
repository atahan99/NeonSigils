import type { Difficulty, LogoEntry } from "../types/logo"
import type { DifficultyScope } from "../types/game"
import { createRng } from "./random"

// ASCII ramps: index 0 = background (space), last = densest ink.
export const RAMP_FULL = " .:-=+*#%@"
export const RAMP_SHORT = " .:+#@"

// Render width per difficulty. Every logo ships at the easy width and is
// resampled down in the browser, so any logo can be shown at any difficulty.
export const DIFFICULTY_COLS: Record<Difficulty, number> = {
  easy: 56,
  medium: 46,
  hard: 36,
  expert: 28,
}
export const SOURCE_COLS = DIFFICULTY_COLS.easy

export const rampFor = (difficulty: Difficulty): string =>
  difficulty === "hard" || difficulty === "expert" ? RAMP_SHORT : RAMP_FULL

const GLITCH_CHARS = "#%@*+=:.░▒▓/\\|"

/** Pad every line to the same width so <pre> blocks stay rectangular. */
export const padLines = (lines: string[]): string[] => {
  const width = lines.reduce((m, l) => Math.max(m, l.length), 0)
  return lines.map((l) => l.padEnd(width, " "))
}

/** Corrupt a fraction of non-space characters and jitter some rows sideways. */
export const glitchLines = (
  lines: string[],
  amount = 0.18,
  seed = "glitch",
): string[] => {
  const rng = createRng(seed)
  const padded = padLines(lines)
  return padded.map((line, row) => {
    let chars = line.split("")
    // Occasionally shift the whole row by 1 to simulate signal tearing.
    if (rng() < 0.25) {
      if (rng() < 0.5) chars = [" ", ...chars.slice(0, -1)]
      else chars = [...chars.slice(1), " "]
    }
    return chars
      .map((ch) => {
        if (ch === " ") return ch
        if (rng() < amount) {
          return GLITCH_CHARS[Math.floor(rng() * GLITCH_CHARS.length) || 0]
        }
        // small chance to blank out (dropout)
        if (rng() < amount * 0.4) return " "
        return ch
      })
      .join("")
    void row
  })
}

/** Keep only a central window of the art. */
export const cropLines = (lines: string[], keep = 0.6): string[] => {
  const padded = padLines(lines)
  const rows = padded.length
  const startRow = Math.floor((rows * (1 - keep)) / 2)
  const endRow = Math.min(rows, startRow + Math.ceil(rows * keep))
  return padded.slice(startRow, endRow)
}

/**
 * Shrink full-ramp art by `scale` (0..1] with a box filter, then re-map ink
 * density onto `ramp`. Rows scale by the same factor, so aspect is kept.
 */
export const resampleAscii = (lines: string[], scale: number, ramp: string): string[] => {
  const src = padLines(lines)
  const srcH = src.length
  const srcW = src[0]?.length ?? 0
  if (srcW === 0) return lines
  const w = Math.max(1, Math.round(srcW * scale))
  const h = Math.max(1, Math.round(srcH * scale))
  const ink = (ch: string): number => Math.max(0, RAMP_FULL.indexOf(ch)) / (RAMP_FULL.length - 1)
  const out: string[] = []
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor((y * srcH) / h)
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * srcH) / h))
    let row = ""
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor((x * srcW) / w)
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * srcW) / w))
      let sum = 0
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) sum += ink(src[yy][xx])
      const avg = sum / ((y1 - y0) * (x1 - x0))
      row += ramp[Math.min(ramp.length - 1, Math.round(avg * (ramp.length - 1)))]
    }
    out.push(row.trimEnd())
  }
  while (out.length > 1 && out[0] === "") out.shift()
  while (out.length > 1 && out[out.length - 1] === "") out.pop()
  return padLines(out)
}

/** Difficulty that decides how degraded the art looks, given the scope toggle. */
export const renderDifficulty = (difficulty: Difficulty, scope: DifficultyScope = "both"): Difficulty =>
  scope === "logos" ? "easy" : difficulty

/** Clean art at the width and ramp of `difficulty`. */
export const renderAt = (logo: Pick<LogoEntry, "ascii">, difficulty: Difficulty): string[] =>
  difficulty === "easy"
    ? logo.ascii
    : resampleAscii(logo.ascii, DIFFICULTY_COLS[difficulty] / SOURCE_COLS, rampFor(difficulty))

export type AsciiFrame = "clean" | "glitched" | "cropped"

/**
 * The frame a difficulty shows. Only clean art ships in the bundle; the
 * glitched and cropped frames are derived here, seeded by logo id so they are
 * identical on every render and for every player.
 */
export const asciiFrame = (lines: string[], id: string, frame: AsciiFrame): string[] => {
  if (frame === "glitched") return glitchLines(lines, 0.2, `${id}:g`)
  if (frame === "cropped") return cropLines(lines, 0.62)
  return lines
}

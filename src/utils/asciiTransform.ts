import type { LogoEntry } from "../types/logo"
import { createRng } from "./random"

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

export type AsciiFrame = "clean" | "glitched" | "cropped"

/**
 * The frame a difficulty shows. Only clean art ships in the bundle; the
 * glitched and cropped frames are derived here, seeded by logo id so they are
 * identical on every render and for every player.
 */
export const asciiFrame = (logo: Pick<LogoEntry, "id" | "ascii">, frame: AsciiFrame): string[] => {
  if (frame === "glitched") return glitchLines(logo.ascii, 0.2, `${logo.id}:g`)
  if (frame === "cropped") return cropLines(logo.ascii, 0.62)
  return logo.ascii
}

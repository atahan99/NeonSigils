import type { AsciiVariants } from "../types/logo"
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

/** Downsample by skipping rows/columns for a chunky, low-res look. */
export const lowResLines = (lines: string[], step = 2): string[] => {
  const padded = padLines(lines)
  const out: string[] = []
  for (let r = 0; r < padded.length; r += step) {
    let row = ""
    for (let c = 0; c < padded[r].length; c += step) row += padded[r][c]
    out.push(row)
  }
  return out
}

/**
 * Progressive reveal stages: start almost fully corrupted, end fully clean.
 * `stageCount` frames are produced; frame i reveals ~i/(n-1) of the pixels,
 * corrupting the rest. Deterministic per seed so the reveal is stable.
 */
export const buildRevealStages = (
  lines: string[],
  stageCount = 6,
  seed = "reveal",
): string[][] => {
  const padded = padLines(lines)
  const stages: string[][] = []
  for (let s = 0; s < stageCount; s++) {
    const revealFraction = s / (stageCount - 1)
    const rng = createRng(`${seed}:${s}`)
    stages.push(
      padded.map((line) =>
        line
          .split("")
          .map((ch) => {
            if (ch === " ") return ch
            if (rng() < revealFraction) return ch
            return GLITCH_CHARS[Math.floor(rng() * GLITCH_CHARS.length) || 0]
          })
          .join(""),
      ),
    )
  }
  return stages
}

/** Build all ASCII variants from clean art. Shared by sample data and tooling. */
export const buildAsciiVariants = (clean: string[], seed = "sigil"): AsciiVariants => {
  const padded = padLines(clean)
  return {
    clean: padded,
    glitched: glitchLines(padded, 0.2, `${seed}:g`),
    cropped: cropLines(padded, 0.62),
    lowRes: lowResLines(padded, 2),
    revealStages: buildRevealStages(padded, 6, `${seed}:r`),
  }
}

// Dense noise used to fully occlude hidden cells (fills spaces too, so the
// logo's silhouette is genuinely hidden rather than just character-glitched).
const NOISE_CHARS = "#%@*+=:.:/\\|<>x▓▒░"

export type RevealMode = "diagonal" | "vertical" | "horizontal"

/**
 * Spatially reveal a clean ASCII logo based on revealPercent (0..100).
 * Revealed cells show the real glyph; hidden cells are replaced with solid
 * static noise so the logo is progressively "decoded" (wiped in) rather than
 * shown all at once. Deterministic per seed so the static doesn't reshuffle.
 */
export const maskReveal = (
  clean: string[],
  revealPercent: number,
  seed = "mask",
  mode: RevealMode = "diagonal",
): string[] => {
  const padded = padLines(clean)
  const fraction = Math.min(Math.max(revealPercent, 0), 100) / 100
  const height = padded.length
  const width = padded[0]?.length ?? 0
  const rng = createRng(seed)
  const denom = (a: number) => (a <= 0 ? 1 : a)

  return padded.map((line, y) =>
    [...line]
      .map((ch, x) => {
        // Advance the RNG for every cell (fixed order) so each position keeps
        // a stable noise glyph regardless of how much is currently revealed.
        const noise = NOISE_CHARS[Math.floor(rng() * NOISE_CHARS.length) || 0]
        let progress: number
        if (mode === "vertical") progress = y / denom(height - 1)
        else if (mode === "horizontal") progress = x / denom(width - 1)
        else progress = (x / denom(width - 1) + y / denom(height - 1)) / 2
        return progress <= fraction ? ch : noise
      })
      .join(""),
  )
}

/**
 * Merge a clean frame with a corrupted frame based on revealPercent (0..100).
 * Used by AsciiLogo to render a partially-decoded sigil deterministically.
 */
export const revealBlend = (
  clean: string[],
  glitched: string[],
  revealPercent: number,
  seed = "blend",
): string[] => {
  const fraction = Math.min(Math.max(revealPercent, 0), 100) / 100
  const rng = createRng(seed)
  const cleanP = padLines(clean)
  const glitchP = padLines(glitched)
  return cleanP.map((line, r) =>
    line
      .split("")
      .map((ch, c) => {
        if (ch === " ") return ch
        if (rng() < fraction) return ch
        return glitchP[r]?.[c] ?? ch
      })
      .join(""),
  )
}

import sharp from "sharp"
import type { Difficulty } from "../../src/types/logo"

// ASCII ramps: index 0 = background (space), last = densest ink.
export const RAMP_FULL = " .:-=+*#%@"
export const RAMP_SHORT = " .:+#@"

// Target column widths per difficulty (rows derived from aspect ratio).
export const DIFFICULTY_COLS: Record<Difficulty, number> = {
  easy: 56,
  medium: 46,
  hard: 36,
  expert: 28,
}

const rampFor = (difficulty: Difficulty): string =>
  difficulty === "hard" || difficulty === "expert" ? RAMP_SHORT : RAMP_FULL

/**
 * Rasterize a monochrome SVG and convert it to ASCII art.
 *
 * The source SVGs are single-color shapes on a transparent background, so the
 * alpha channel is the shape coverage ("ink"). We render onto a white canvas,
 * read grayscale, and invert so dark ink maps to the densest ramp characters.
 */
export const svgToAsciiLines = async (
  svg: string | Buffer,
  difficulty: Difficulty,
): Promise<string[]> => {
  const cols = DIFFICULTY_COLS[difficulty]
  const ramp = rampFor(difficulty)

  // Monospace glyphs are ~2x taller than wide; halve the row count so the
  // rendered art keeps its real aspect ratio.
  const cellAspect = 0.5

  const input = Buffer.isBuffer(svg) ? svg : Buffer.from(svg)

  // First read intrinsic size to compute a proportional row count.
  const meta = await sharp(input, { density: 384 }).metadata()
  const srcW = meta.width ?? 24
  const srcH = meta.height ?? 24
  const rows = Math.max(6, Math.round((cols * (srcH / srcW)) * cellAspect))

  const { data, info } = await sharp(input, { density: 384 })
    .resize(cols, rows, { fit: "fill" })
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // composite ink on white
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const channels = info.channels
  const lines: string[] = []
  for (let y = 0; y < info.height; y++) {
    let line = ""
    for (let x = 0; x < info.width; x++) {
      const lum = data[(y * info.width + x) * channels] // 0..255, white bg = 255
      const ink = 1 - lum / 255 // dark shape => ~1
      const idx = Math.min(ramp.length - 1, Math.round(ink * (ramp.length - 1)))
      line += ramp[idx]
    }
    lines.push(line.replace(/\s+$/g, "")) // trim trailing spaces
  }

  // Drop fully-empty leading/trailing rows for a tighter crop.
  while (lines.length && lines[0].trim() === "") lines.shift()
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop()
  return lines.length ? lines : [" "]
}

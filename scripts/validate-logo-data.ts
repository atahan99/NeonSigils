/**
 * validate-logo-data.ts — data-integrity checks for the generated dataset.
 * Exits non-zero if any rule fails so it can gate CI / builds.
 */
import { GENERATED_LOGOS } from "../src/data/logos.generated"
import type { LogoEntry } from "../src/types/logo"
import { acceptedTokens, normalizeAnswer } from "../src/utils/normalizeAnswer"
import { guessableChars } from "../src/utils/hangman"

const errors: string[] = []
const warnings: string[] = []

const dataset: LogoEntry[] = GENERATED_LOGOS

const seenIds = new Set<string>()
const namesByCategory = new Map<string, Set<string>>()
// Every accepted answer must identify exactly one logo, or typing it scores
// for the wrong one.
const tokenOwner = new Map<string, string>()

for (const logo of dataset) {
  const tag = logo.id || "<no-id>"

  if (!logo.id) errors.push(`${tag}: missing id`)
  if (seenIds.has(logo.id)) errors.push(`${tag}: duplicate id`)
  seenIds.add(logo.id)

  if (!logo.name) errors.push(`${tag}: missing name`)
  if (!logo.aliases || logo.aliases.length < 1)
    errors.push(`${tag}: needs at least one alias`)
  if (!logo.category) errors.push(`${tag}: missing category`)
  if (!logo.difficulty) errors.push(`${tag}: missing difficulty`)

  // Reject entries with no art or only blank lines.
  if (!logo.ascii?.some((l) => l.trim().length > 0))
    errors.push(`${tag}: ASCII art is missing or blank`)

  if (!logo.hints || logo.hints.length < 2)
    errors.push(`${tag}: needs at least two hints`)

  // Source metadata required when generated from the pipeline.
  if (!logo.source?.provider)
    warnings.push(`${tag}: missing source.provider metadata`)

  // Alias normalization must be non-empty and self-consistent.
  const tokens = acceptedTokens(logo)
  if (tokens.some((t) => t.length === 0))
    errors.push(`${tag}: an alias normalizes to empty`)
  if (normalizeAnswer(logo.name).length === 0)
    errors.push(`${tag}: name normalizes to empty`)
  for (const t of tokens) {
    const owner = tokenOwner.get(t)
    if (owner && owner !== logo.id) errors.push(`${tag}: answer "${t}" also accepted for ${owner}`)
    else tokenOwner.set(t, logo.id)
  }

  // Hangman needs at least one letter to guess (digits are pre-revealed).
  if (guessableChars(logo.name).length === 0)
    errors.push(`${tag}: name has no letters to guess in Hangman`)

  // Track category name duplicates.
  const set = namesByCategory.get(logo.category) ?? new Set<string>()
  const norm = normalizeAnswer(logo.name)
  if (set.has(norm)) errors.push(`${tag}: duplicate name within ${logo.category}`)
  set.add(norm)
  namesByCategory.set(logo.category, set)
}

console.log(`Validating ${dataset.length} logos…`)
for (const w of warnings) console.warn(`  ⚠ ${w}`)

if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`\n✓ All checks passed (${warnings.length} warning(s)).`)

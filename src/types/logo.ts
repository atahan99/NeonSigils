// Core content types for NeonSigils logo data.
// LogoSource = authoring/build-time metadata. LogoEntry = game-ready runtime data.

export type CategoryId =
  | "security-networking"
  | "selfhosting-homelab"
  | "general-it-tech"

// "mixed" only appears in leaderboard/mode selection, never as a logo's own category.
export type PlayCategoryId = CategoryId | "mixed"

export type Difficulty = "easy" | "medium" | "hard" | "expert"

export type IconProvider =
  | "theSVG"
  | "simpleicons"
  | "dashboard-icons"
  | "selfhst"
  | "manual"

export type SvgVariant = "default" | "mono" | "light" | "dark" | "wordmark" | "color"

// One entry in a source's ordered fallback chain. The resolver tries each in order.
export type SourceCandidate = {
  provider: IconProvider
  slug: string
  variant?: SvgVariant
}

export type LogoSource = {
  id: string
  name: string
  aliases: string[]
  category: CategoryId
  difficulty: Difficulty
  tags: string[]
  // Ordered list of where to look for this logo at build time (theSVG -> Simple Icons -> ...).
  sourceCandidates?: SourceCandidate[]
  thesvgSlug?: string
  thesvgVariant?: SvgVariant
  svgPath?: string
  license?: string
  trademarkNote?: string
  hints: string[]
}

export type AsciiVariants = {
  clean: string[]
  glitched: string[]
  cropped: string[]
  // Optional legacy variants. Hangman now uses a CSS mask over `clean`, so these
  // are no longer emitted by the generator (kept optional for sample data / tools).
  lowRes?: string[]
  revealStages?: string[][]
}

export type LogoSourceInfo = {
  provider?: IconProvider
  slug?: string
  variant?: string
  license?: string
  trademarkNote?: string
}

export type LogoEntry = {
  id: string
  name: string
  aliases: string[]
  category: CategoryId
  difficulty: Difficulty
  tags: string[]
  ascii: AsciiVariants
  hints: string[]
  source?: LogoSourceInfo
}

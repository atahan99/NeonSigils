import type { Difficulty, LogoEntry, PlayCategoryId } from "./logo"

export type GameMode = "trivia" | "hangman"

export type RoundLength = 10 | 20 | "endless"

// Optional run modifiers, layered on top of a mode + difficulty.
export type Modifier = "suddenDeath" | "timeAttack" | "daily"

// What difficulty changes: which logos appear, how degraded they render, or both.
// Timers, lives and hint limits always follow difficulty.
export type DifficultyScope = "both" | "logos" | "render"

export type AnimationIntensity = "low" | "normal" | "high"

// Which kind of hint was used, for scoring penalties.
export type HintKind =
  | "text"
  | "category"
  | "firstLetter"
  | "multipleChoice"
  | "alias"
  | "reveal"

export type GameConfig = {
  mode: GameMode
  category: PlayCategoryId
  difficulty: Difficulty
  roundLength: RoundLength
  modifiers: Modifier[]
  // Missing on configs saved before the toggle existed; treated as "both".
  scope?: DifficultyScope
  // Deterministic shuffle seed (used by the Daily challenge).
  seed?: string
}

// Per-question tracking of hints used (drives scoring penalties).
export type HintState = {
  usedKinds: HintKind[]
  textHintsShown: number
}

export type GameStatus = "idle" | "playing" | "won" | "lost" | "gameover"

export type GameSessionState = {
  config: GameConfig
  status: GameStatus
  pool: LogoEntry[] // shuffled logos for this run
  currentIndex: number
  currentLogo: LogoEntry | null
  score: number
  lives: number
  streak: number
  longestStreak: number
  correctCount: number
  wrongCount: number
  roundNumber: number
  startedAt: number
  questionStartedAt: number
  hint: HintState
  // Hangman-specific
  guessedLetters: string[]
  wrongLetters: string[]
  revealPercent: number
  lastResult: "correct" | "wrong" | null
  // True until any hint/boost is used; drives the "clean run" bonus.
  cleanRun: boolean
  // Attempts used on the current trivia question (allows a second try).
  attempts: number
  // Time Attack end timestamp (ms), or null when not in Time Attack.
  deadline: number | null
  // Set when the current question was lost to the countdown running out.
  timedOut: boolean
  // Outcome of every resolved sigil, in order (drives the Daily share grid).
  results: RoundResult[]
}

export type RoundResult = "correct" | "wrong"

export type Settings = {
  playerName: string
  soundEnabled: boolean
  animationIntensity: AnimationIntensity
  scanlines: boolean
  reducedMotion: boolean
  autocomplete: boolean
  difficulty: Difficulty
  roundLength: RoundLength
}

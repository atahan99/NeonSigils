import { useCallback, useReducer } from "react"
import type { GameConfig, GameSessionState, HintKind, RoundResult } from "../types/game"
import { isAnswerCorrect } from "../utils/normalizeAnswer"
import { guessableChars, isSolved } from "../utils/hangman"
import {
  scoreHangmanSolve,
  scoreTriviaAnswer,
  extraMultiplier,
  HANGMAN_CORRECT_LETTER,
  HANGMAN_WRONG_PENALTY,
} from "../utils/scoring"
import { tuningFor, DECAY_PERCENT_PER_TICK } from "../data/difficultyTuning"
import {
  advanceLogo,
  createSession,
  elapsedSeconds,
  hasNextLogo,
} from "../utils/gameSession"

// Reveal never decays below this (keeps the puzzle from going fully dark).
const DECAY_FLOOR = 15
const HINT_REVEAL_BUMP = 20

// Time-dependent actions carry `now` so the reducer stays pure (StrictMode
// replays reducers, and tests can pin the clock).
export type Action =
  | { type: "reset"; config: GameConfig; now: number }
  | { type: "trivia-answer"; guess: string; now: number }
  | { type: "trivia-timeout" }
  | { type: "hangman-letter"; letter: string; now: number }
  | { type: "hint"; kind: HintKind }
  | { type: "decay" }
  | { type: "forfeit" }
  | { type: "next"; now: number }

const record = (state: GameSessionState, result: RoundResult): RoundResult[] => [
  ...state.results,
  result,
]

const clampReveal = (v: number): number => Math.min(100, Math.max(0, v))

const loseLife = (
  state: GameSessionState,
  extra: Partial<GameSessionState> = {},
): GameSessionState => {
  const lives = state.lives - 1
  return {
    ...state,
    lives,
    streak: 0,
    wrongCount: state.wrongCount + 1,
    lastResult: "wrong",
    status: lives <= 0 ? "gameover" : "lost",
    results: record(state, "wrong"),
    ...extra,
  }
}

export const reducer = (state: GameSessionState, action: Action): GameSessionState => {
  switch (action.type) {
    case "reset":
      return createSession(action.config, action.now)

    case "trivia-answer": {
      if (state.status !== "playing" || !state.currentLogo) return state
      const tuning = tuningFor(state.config.difficulty)
      const extra = extraMultiplier(state.config)
      const correct = isAnswerCorrect(action.guess, state.currentLogo)
      if (correct) {
        const streak = state.streak + 1
        const points = scoreTriviaAnswer({
          elapsedSeconds: elapsedSeconds(state, action.now),
          streak,
          difficulty: state.config.difficulty,
          hint: state.hint,
          streakCap: tuning.streakCap,
          extraMultiplier: extra,
        })
        return {
          ...state,
          score: state.score + points,
          streak,
          longestStreak: Math.max(state.longestStreak, streak),
          correctCount: state.correctCount + 1,
          lastResult: "correct",
          status: "won",
          results: record(state, "correct"),
        }
      }
      // Wrong: allow a second attempt on lower difficulties before resolving.
      const attempts = state.attempts + 1
      if (attempts < tuning.triviaAttempts) {
        return { ...state, attempts, lastResult: "wrong", status: "playing" }
      }
      return loseLife(state, { attempts })
    }

    case "trivia-timeout": {
      if (state.status !== "playing" || !state.currentLogo) return state
      return loseLife(state, { timedOut: true })
    }

    case "hangman-letter": {
      if (state.status !== "playing" || !state.currentLogo) return state
      const letter = action.letter.toLowerCase()
      if (state.guessedLetters.includes(letter)) return state
      const guessedLetters = [...state.guessedLetters, letter]
      const inWord = guessableChars(state.currentLogo.name).includes(letter)

      const tuning = tuningFor(state.config.difficulty)
      const extra = extraMultiplier(state.config)

      if (inWord) {
        const reveal = clampReveal(state.revealPercent + tuning.hmRevealPerLetter)
        const solved = isSolved(state.currentLogo.name, guessedLetters)
        const base = {
          ...state,
          guessedLetters,
          revealPercent: solved ? 100 : reveal,
          score: state.score + HANGMAN_CORRECT_LETTER,
          lastResult: "correct" as const,
        }
        if (!solved) return base
        const streak = state.streak + 1
        const bonus = scoreHangmanSolve({
          livesRemaining: state.lives,
          elapsedSeconds: elapsedSeconds(state, action.now),
          revealPercent: state.revealPercent,
          difficulty: state.config.difficulty,
          hint: state.hint,
          extraMultiplier: extra,
        })
        return {
          ...base,
          score: base.score + bonus,
          streak,
          longestStreak: Math.max(state.longestStreak, streak),
          correctCount: state.correctCount + 1,
          status: "won",
          results: record(state, "correct"),
        }
      }

      // wrong letter: costs a life + a small score penalty, reveals nothing.
      // wrongCount counts failed sigils (as in trivia), not wrong letters.
      const lives = state.lives - 1
      return {
        ...state,
        guessedLetters,
        wrongLetters: [...state.wrongLetters, letter],
        lives,
        score: Math.max(0, state.score - HANGMAN_WRONG_PENALTY),
        streak: 0,
        wrongCount: lives <= 0 ? state.wrongCount + 1 : state.wrongCount,
        lastResult: "wrong",
        status: lives <= 0 ? "gameover" : "playing",
        results: lives <= 0 ? record(state, "wrong") : state.results,
      }
    }

    case "hint": {
      if (state.status !== "playing" || !state.currentLogo) return state
      const usedKinds = state.hint.usedKinds.includes(action.kind)
        ? state.hint.usedKinds
        : [...state.hint.usedKinds, action.kind]
      const isReveal = action.kind === "reveal"
      return {
        ...state,
        revealPercent: isReveal ? clampReveal(state.revealPercent + HINT_REVEAL_BUMP) : state.revealPercent,
        // Any hint/boost breaks the "clean run" bonus (category hint is free of penalty
        // but still counts as assistance).
        cleanRun: false,
        hint: {
          usedKinds,
          textHintsShown:
            action.kind === "text"
              ? state.hint.textHintsShown + 1
              : state.hint.textHintsShown,
        },
      }
    }

    case "decay": {
      // Idle re-encryption (expert Hangman). Never drops below the floor.
      if (state.status !== "playing") return state
      const next = Math.max(DECAY_FLOOR, state.revealPercent - DECAY_PERCENT_PER_TICK)
      if (next === state.revealPercent) return state
      return { ...state, revealPercent: next }
    }

    case "forfeit":
      // Quitting mid-question counts as a miss and ends the run.
      if (state.status !== "playing") return { ...state, status: "gameover" }
      return {
        ...state,
        streak: 0,
        wrongCount: state.wrongCount + 1,
        lastResult: "wrong",
        status: "gameover",
        results: record(state, "wrong"),
      }

    case "next":
      return advanceLogo(state, action.now)

    default:
      return state
  }
}

export const useGameSession = (config: GameConfig) => {
  const [state, dispatch] = useReducer(reducer, config, (c) => createSession(c, Date.now()))

  const submitAnswer = useCallback(
    (guess: string) => dispatch({ type: "trivia-answer", guess, now: Date.now() }),
    [],
  )
  const guessLetter = useCallback(
    (letter: string) => dispatch({ type: "hangman-letter", letter, now: Date.now() }),
    [],
  )
  const useHint = useCallback((kind: HintKind) => dispatch({ type: "hint", kind }), [])
  const timeout = useCallback(() => dispatch({ type: "trivia-timeout" }), [])
  const decay = useCallback(() => dispatch({ type: "decay" }), [])
  const next = useCallback(() => dispatch({ type: "next", now: Date.now() }), [])
  const forfeit = useCallback(() => dispatch({ type: "forfeit" }), [])

  // Read at render time; in Time Attack this goes false once the clock runs out.
  const canContinue = hasNextLogo(state, Date.now())

  return {
    state,
    currentLogo: state.currentLogo,
    submitAnswer,
    guessLetter,
    useHint,
    timeout,
    decay,
    next,
    forfeit,
    canContinue,
  }
}

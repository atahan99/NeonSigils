import { useCallback, useMemo, useReducer } from "react"
import type { GameConfig, GameSessionState, HintKind } from "../types/game"
import { isAnswerCorrect } from "../utils/normalizeAnswer"
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
  currentLogoOrThrow,
  elapsedSeconds,
  hasNextLogo,
} from "../utils/gameSession"

// Reveal never decays below this (keeps the puzzle from going fully dark).
const DECAY_FLOOR = 15

/** Guessable characters in an answer: letters + digits (case-insensitive). */
const guessableChars = (name: string): string[] => {
  const set = new Set<string>()
  for (const ch of name.toLowerCase()) {
    if (/[a-z0-9]/.test(ch)) set.add(ch)
  }
  return [...set]
}

const isSolved = (name: string, guessed: string[]): boolean =>
  guessableChars(name).every((c) => guessed.includes(c))

type Action =
  | { type: "reset"; config: GameConfig }
  | { type: "trivia-answer"; guess: string }
  | { type: "trivia-timeout" }
  | { type: "hangman-letter"; letter: string }
  | { type: "hint"; kind: HintKind }
  | { type: "decay" }
  | { type: "next" }

const clampReveal = (v: number): number => Math.min(100, Math.max(0, v))

const reducer = (state: GameSessionState, action: Action): GameSessionState => {
  switch (action.type) {
    case "reset":
      return createSession(action.config)

    case "trivia-answer": {
      if (state.status !== "playing" || !state.currentLogo) return state
      const tuning = tuningFor(state.config.difficulty)
      const extra = extraMultiplier(state.config.category, state.config.modifiers)
      const correct = isAnswerCorrect(action.guess, state.currentLogo)
      if (correct) {
        const streak = state.streak + 1
        const points = scoreTriviaAnswer({
          elapsedSeconds: elapsedSeconds(state),
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
        }
      }
      // Wrong: allow a second attempt on lower difficulties before resolving.
      const attempts = state.attempts + 1
      if (attempts < tuning.triviaAttempts) {
        return { ...state, attempts, lastResult: "wrong", status: "playing" }
      }
      const lives = state.lives - 1
      return {
        ...state,
        attempts,
        lives,
        streak: 0,
        wrongCount: state.wrongCount + 1,
        lastResult: "wrong",
        status: lives <= 0 ? "gameover" : "lost",
      }
    }

    case "trivia-timeout": {
      if (state.status !== "playing" || !state.currentLogo) return state
      // Timeout ends the question immediately, regardless of attempts left.
      const lives = state.lives - 1
      return {
        ...state,
        lives,
        streak: 0,
        wrongCount: state.wrongCount + 1,
        lastResult: "wrong",
        timedOut: true,
        status: lives <= 0 ? "gameover" : "lost",
      }
    }

    case "hangman-letter": {
      if (state.status !== "playing" || !state.currentLogo) return state
      const letter = action.letter.toLowerCase()
      if (state.guessedLetters.includes(letter)) return state
      const guessedLetters = [...state.guessedLetters, letter]
      const inWord = guessableChars(state.currentLogo.name).includes(letter)

      const tuning = tuningFor(state.config.difficulty)
      const extra = extraMultiplier(state.config.category, state.config.modifiers)

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
          elapsedSeconds: elapsedSeconds(state),
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
        }
      }

      // wrong letter: costs a life + a small score penalty, reveals nothing
      const lives = state.lives - 1
      return {
        ...state,
        guessedLetters,
        wrongLetters: [...state.wrongLetters, letter],
        lives,
        score: Math.max(0, state.score - HANGMAN_WRONG_PENALTY),
        streak: 0,
        wrongCount: state.wrongCount + 1,
        lastResult: "wrong",
        status: lives <= 0 ? "gameover" : "playing",
      }
    }

    case "hint": {
      if (!state.currentLogo) return state
      const usedKinds = state.hint.usedKinds.includes(action.kind)
        ? state.hint.usedKinds
        : [...state.hint.usedKinds, action.kind]
      const isReveal = action.kind === "reveal"
      return {
        ...state,
        revealPercent: isReveal ? clampReveal(state.revealPercent + 20) : state.revealPercent,
        // Any hint/boost breaks the "clean run" bonus (category hint is free of penalty
        // but still counts as assistance).
        cleanRun: false,
        hint: {
          usedKinds,
          textHintsShown:
            action.kind === "text"
              ? state.hint.textHintsShown + 1
              : state.hint.textHintsShown,
          revealBoost: isReveal ? state.hint.revealBoost + 0.2 : state.hint.revealBoost,
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

    case "next":
      return advanceLogo(state)

    default:
      return state
  }
}

export type UseGameSession = ReturnType<typeof useGameSession>

export const useGameSession = (config: GameConfig) => {
  const [state, dispatch] = useReducer(reducer, config, createSession)

  const submitAnswer = useCallback(
    (guess: string) => dispatch({ type: "trivia-answer", guess }),
    [],
  )
  const guessLetter = useCallback(
    (letter: string) => dispatch({ type: "hangman-letter", letter }),
    [],
  )
  const useHint = useCallback((kind: HintKind) => dispatch({ type: "hint", kind }), [])
  const timeout = useCallback(() => dispatch({ type: "trivia-timeout" }), [])
  const decay = useCallback(() => dispatch({ type: "decay" }), [])
  const next = useCallback(() => dispatch({ type: "next" }), [])
  const restart = useCallback(
    (nextConfig?: GameConfig) => dispatch({ type: "reset", config: nextConfig ?? config }),
    [config],
  )

  const canContinue = useMemo(() => hasNextLogo(state), [state])

  return {
    state,
    currentLogo: state.currentLogo,
    submitAnswer,
    guessLetter,
    useHint,
    timeout,
    decay,
    next,
    restart,
    canContinue,
    getElapsedSeconds: () => elapsedSeconds(state),
    guessableChars,
  }
}

export { currentLogoOrThrow }

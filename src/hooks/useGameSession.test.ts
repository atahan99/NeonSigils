import { describe, expect, it } from "vitest"
import type { GameConfig, GameSessionState } from "../types/game"
import { createSession } from "../utils/gameSession"
import { guessableChars } from "../utils/hangman"
import { reducer, type Action } from "./useGameSession"

const config = (mode: GameConfig["mode"]): GameConfig => ({
  mode,
  category: "mixed",
  difficulty: "easy",
  roundLength: 10,
  modifiers: [],
  seed: "test-seed",
})

const run = (state: GameSessionState, actions: Action[]) => actions.reduce(reducer, state)
const letters = "abcdefghijklmnopqrstuvwxyz".split("")

describe("hangman", () => {
  it("solving a sigil scores it and counts one correct", () => {
    const start = createSession(config("hangman"))
    const name = start.currentLogo!.name
    const end = run(start, guessableChars(name).map((letter) => ({ type: "hangman-letter", letter })))
    expect(end.status).toBe("won")
    expect(end.correctCount).toBe(1)
    expect(end.score).toBeGreaterThan(0)
  })

  it("wrong letters cost lives but only a lost sigil counts as wrong", () => {
    const start = createSession(config("hangman"))
    const misses = letters.filter((l) => !guessableChars(start.currentLogo!.name).includes(l))
    const oneMiss = run(start, [{ type: "hangman-letter", letter: misses[0] }])
    expect(oneMiss.lives).toBe(start.lives - 1)
    expect(oneMiss.wrongCount).toBe(0)

    const dead = run(start, misses.slice(0, start.lives).map((letter) => ({ type: "hangman-letter", letter })))
    expect(dead.status).toBe("gameover")
    expect(dead.wrongCount).toBe(1)
  })

  it("ignores a letter guessed twice", () => {
    const start = createSession(config("hangman"))
    const once = run(start, [{ type: "hangman-letter", letter: "q" }])
    expect(run(once, [{ type: "hangman-letter", letter: "q" }])).toBe(once)
  })
})

describe("trivia", () => {
  it("a correct answer wins the question", () => {
    const start = createSession(config("trivia"))
    const end = run(start, [{ type: "trivia-answer", guess: start.currentLogo!.name }])
    expect(end.status).toBe("won")
    expect(end.streak).toBe(1)
  })

  it("easy allows a retry before the question is lost", () => {
    const start = createSession(config("trivia"))
    const first = run(start, [{ type: "trivia-answer", guess: "definitely wrong" }])
    expect(first.status).toBe("playing")
    const second = run(first, [{ type: "trivia-answer", guess: "still wrong" }])
    expect(second.status).toBe("lost")
    expect(second.wrongCount).toBe(1)
    expect(second.lives).toBe(start.lives - 1)
  })
})

describe("forfeit", () => {
  it("ends the run and counts the current sigil as missed", () => {
    const start = createSession(config("trivia"))
    const end = run(start, [{ type: "forfeit" }])
    expect(end.status).toBe("gameover")
    expect(end.wrongCount).toBe(1)
    expect(end.lastResult).toBe("wrong")
  })
})

describe("daily seed", () => {
  it("gives every player the same order", () => {
    const a = createSession(config("trivia")).pool.map((l) => l.id)
    const b = createSession(config("trivia")).pool.map((l) => l.id)
    expect(a).toEqual(b)
  })
})

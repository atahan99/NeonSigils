import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { useRouter, type GameSummary } from "../router"
import { useSettings } from "../hooks/useSettings"
import { useGameSession } from "../hooks/useGameSession"
import type { GameConfig } from "../types/game"
import type { Difficulty } from "../types/logo"
import { TRIVIA_START_LIVES } from "../utils/gameSession"
import { isNearMiss } from "../utils/normalizeAnswer"
import { computeAccuracy, gradeRun, runCompletionBonus, extraMultiplier } from "../utils/scoring"
import { tuningFor } from "../data/difficultyTuning"
import { getPlayCategoryName } from "../data/categories"
import { NeonPanel } from "../components/layout/NeonPanel"
import { NeonButton } from "../components/layout/NeonButton"
import { AsciiLogo } from "../components/game/AsciiLogo"
import { ResultModal } from "../components/game/ResultModal"
import { GameHUD } from "../components/game/GameHUD"
import { AnswerInput } from "../components/game/AnswerInput"
import { HintPanel } from "../components/game/HintPanel"
type Frame = { key: "clean" | "glitched" | "cropped"; variant: "clean" | "glitched" | "cropped"; animated: boolean }

// Which ASCII rendering each difficulty gets.
const FRAME_BY_DIFFICULTY: Record<Difficulty, Frame> = {
  easy: { key: "clean", variant: "clean", animated: false },
  medium: { key: "glitched", variant: "glitched", animated: false },
  hard: { key: "cropped", variant: "cropped", animated: false },
  expert: { key: "glitched", variant: "glitched", animated: true },
}

const layoutStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-5)",
}

const asciiStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
}

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
}

/** Inner game screen; only mounted once a valid config is present. */
const TriviaGame = ({ config }: { config: GameConfig }) => {
  const { navigate } = useRouter()
  const { settings } = useSettings()
  const g = useGameSession(config)
  const { state, currentLogo } = g

  // Track the score right before an answer resolves, to compute the points delta.
  const preAnswerScore = useRef(state.score)
  useEffect(() => {
    if (state.status === "playing") preAnswerScore.current = state.score
  }, [state.status, state.score])

  const isPlaying = state.status === "playing"
  const modalOpen = state.status === "won" || state.status === "lost" || state.status === "gameover"
  const isLast = state.status === "gameover" || !g.canContinue
  const result = state.lastResult ?? "wrong"
  const pointsDelta = state.score - preAnswerScore.current

  const tuning = tuningFor(config.difficulty)
  const isTimeAttack = config.modifiers.includes("timeAttack")
  // Per-question countdown, except in Time Attack (that uses a global clock).
  const countdownSeconds = isTimeAttack ? undefined : tuning.triviaSeconds

  // Retry state: a wrong first guess keeps us playing with attempts remaining.
  const retrying = isPlaying && state.lastResult === "wrong" && state.attempts > 0
  const attemptsLeft = Math.max(0, tuning.triviaAttempts - state.attempts)
  const [nearMiss, setNearMiss] = useState(false)

  const handleSubmit = (value: string) => {
    setNearMiss(currentLogo ? isNearMiss(value, currentLogo) : false)
    g.submitAnswer(value)
  }

  // Build the final summary (with end-of-run bonuses + grade) and finish.
  const finishRun = () => {
    const accuracy = computeAccuracy(state.correctCount, state.wrongCount)
    const bonus = runCompletionBonus({
      correctCount: state.correctCount,
      wrongCount: state.wrongCount,
      cleanRun: state.cleanRun,
      difficulty: config.difficulty,
      extraMultiplier: extraMultiplier(config.category, config.modifiers),
    })
    const summary: GameSummary = {
      score: state.score + bonus,
      mode: "trivia",
      category: config.category,
      difficulty: config.difficulty,
      correctCount: state.correctCount,
      wrongCount: state.wrongCount,
      accuracy,
      longestStreak: state.longestStreak,
      durationSeconds: Math.round((Date.now() - state.startedAt) / 1000),
      grade: gradeRun(accuracy, state.cleanRun, config.difficulty),
      modifiers: config.modifiers,
    }
    navigate("game-over", { summary })
  }

  const handleNext = () => {
    if (isLast) {
      finishRun()
      return
    }
    g.next()
  }

  const handleQuit = () => navigate("home")

  // Time Attack: one global countdown for the whole run; expiry ends it.
  const timeAttackSeconds =
    isTimeAttack && state.deadline != null
      ? Math.max(0, Math.round((state.deadline - state.startedAt) / 1000))
      : undefined
  const hudCountdown = isTimeAttack ? timeAttackSeconds : countdownSeconds
  const hudTimerStart = isTimeAttack ? state.startedAt : undefined
  const hudOnTimeout = isTimeAttack ? finishRun : g.timeout

  const frame = FRAME_BY_DIFFICULTY[config.difficulty]
  const title = `${getPlayCategoryName(config.category)} // Trivia`

  return (
    <NeonPanel title={title} glow>
      <div style={layoutStyle}>
        <GameHUD
          state={state}
          maxLives={state.config.modifiers.includes("suddenDeath") ? 1 : TRIVIA_START_LIVES}
          livesLabel="Lives"
          countdownSeconds={hudCountdown}
          timerStartedAt={hudTimerStart}
          onTimeout={hudOnTimeout}
        />

        {config.difficulty === "easy" && (
          <div className="sr-only" aria-live="polite">
            Score {state.score}
          </div>
        )}

        {retrying && (
          <p className="text-danger" role="status" aria-live="assertive" style={{ margin: 0, textAlign: "center" }}>
            {nearMiss ? "SO CLOSE // 1 char off — " : "SIGNAL MISALIGNED // "}
            retry ({attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} left)
          </p>
        )}

        {currentLogo ? (
          <>
            <div style={asciiStyle}>
              <AsciiLogo
                lines={currentLogo.ascii[frame.key]}
                variant={frame.variant}
                animated={frame.animated}
                size="lg"
                label="Decode this ASCII sigil."
              />
            </div>

            <AnswerInput
              onSubmit={handleSubmit}
              disabled={!isPlaying}
              autocompleteEnabled={settings.autocomplete}
              difficulty={config.difficulty}
            />

            <HintPanel
              logo={currentLogo}
              pool={state.pool}
              usedKinds={state.hint.usedKinds}
              onUseHint={g.useHint}
              difficulty={config.difficulty}
            />
          </>
        ) : (
          <p className="text-muted">No sigils available for this run.</p>
        )}

        <div style={footerStyle}>
          <NeonButton variant="ghost" size="sm" onClick={handleQuit}>
            Quit
          </NeonButton>
        </div>
      </div>

      <ResultModal
        open={modalOpen}
        result={result}
        answerName={currentLogo?.name ?? "Unknown"}
        points={result === "correct" ? pointsDelta : undefined}
        isLast={isLast}
        onNext={handleNext}
      />
    </NeonPanel>
  )
}

export const TriviaGamePage = () => {
  const { params, navigate } = useRouter()
  const config = params.config

  useEffect(() => {
    if (!config) navigate("home")
  }, [config, navigate])

  if (!config) return null

  // Remount the session when the config identity changes (new run).
  return <TriviaGame key={`${config.category}-${config.difficulty}-${config.roundLength}`} config={config} />
}

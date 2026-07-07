import { useEffect, useRef, useState } from "react"
import { useRouter } from "../router"
import { useSettings } from "../hooks/useSettings"
import { useSound } from "../hooks/useSound"
import { useGameSession } from "../hooks/useGameSession"
import { useRequireConfig } from "../hooks/useRequireConfig"
import { useEffectOnChange } from "../hooks/useEffectOnChange"
import type { GameConfig } from "../types/game"
import type { Difficulty } from "../types/logo"
import {
  isTimeAttack,
  startLivesFor,
  timeAttackSecondsRemaining,
} from "../utils/gameSession"
import { isNearMiss } from "../utils/normalizeAnswer"
import { buildGameSummary } from "../utils/runSummary"
import { tuningFor } from "../data/difficultyTuning"
import { getPlayCategoryName } from "../data/categories"
import { NeonPanel } from "../components/layout/NeonPanel"
import { NeonButton } from "../components/layout/NeonButton"
import { AsciiLogo } from "../components/game/AsciiLogo"
import { ResultModal } from "../components/game/ResultModal"
import { GameHUD } from "../components/game/GameHUD"
import { AnswerInput } from "../components/game/AnswerInput"
import { HintPanel } from "../components/game/HintPanel"
import styles from "./TriviaGamePage.module.css"

type Frame = { variant: "clean" | "glitched" | "cropped"; animated: boolean }

const FRAME_BY_DIFFICULTY: Record<Difficulty, Frame> = {
  easy: { variant: "clean", animated: false },
  medium: { variant: "glitched", animated: false },
  hard: { variant: "cropped", animated: false },
  expert: { variant: "glitched", animated: true },
}

const TriviaGame = ({ config }: { config: GameConfig }) => {
  const { navigate } = useRouter()
  const { settings } = useSettings()
  const play = useSound()
  const g = useGameSession(config)
  const { state, currentLogo } = g

  const preAnswerScore = useRef(state.score)
  useEffect(() => {
    if (state.status === "playing") preAnswerScore.current = state.score
  }, [state.status, state.score])

  useEffectOnChange(state.status, (_prev, next) => {
    if (next === "won") play("correct")
    else if (next === "gameover") play("gameover")
    else if (next === "lost") play("wrong")
  })

  useEffectOnChange(state.attempts, (prev, next) => {
    if (next > prev && state.status === "playing") play("wrong")
  })

  const isPlaying = state.status === "playing"
  const modalOpen = state.status === "won" || state.status === "lost" || state.status === "gameover"
  const isLast = state.status === "gameover" || !g.canContinue
  const result = state.lastResult ?? "wrong"
  const pointsDelta = state.score - preAnswerScore.current

  const tuning = tuningFor(config.difficulty)
  const timeAttack = isTimeAttack(state)
  const countdownSeconds = timeAttack ? undefined : tuning.triviaSeconds

  const retrying = isPlaying && state.lastResult === "wrong" && state.attempts > 0
  const attemptsLeft = Math.max(0, tuning.triviaAttempts - state.attempts)
  const [nearMiss, setNearMiss] = useState(false)

  const handleSubmit = (value: string) => {
    setNearMiss(currentLogo ? isNearMiss(value, currentLogo) : false)
    g.submitAnswer(value)
  }

  const finishRun = () => navigate("game-over", { summary: buildGameSummary(state, "trivia") })

  const handleNext = () => {
    if (isLast) {
      finishRun()
      return
    }
    g.next()
  }

  const handleQuit = () => navigate("home")

  const timeAttackSeconds = timeAttackSecondsRemaining(state)
  const hudCountdown = timeAttack ? timeAttackSeconds : countdownSeconds
  const hudTimerStart = timeAttack ? state.startedAt : undefined
  const hudOnTimeout = timeAttack ? finishRun : g.timeout

  const frame = FRAME_BY_DIFFICULTY[config.difficulty]
  const title = `${getPlayCategoryName(config.category)} // Trivia`

  return (
    <NeonPanel title={title} glow>
      <div className={styles.page}>
        <GameHUD
          state={state}
          maxLives={startLivesFor(config)}
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
          <p className={`text-danger ${styles.retry}`} role="status" aria-live="assertive">
            {nearMiss ? "SO CLOSE // 1 char off — " : "SIGNAL MISALIGNED // "}
            retry ({attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} left)
          </p>
        )}

        {currentLogo ? (
          <>
            <div className={styles.ascii}>
              <AsciiLogo
                lines={currentLogo.ascii[frame.variant]}
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

        <div className={styles.footer}>
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
  const config = useRequireConfig()
  if (!config) return null

  return (
    <TriviaGame
      key={`${config.category}-${config.difficulty}-${config.roundLength}-${config.modifiers.join(",")}`}
      config={config}
    />
  )
}

import { useEffect, useRef } from "react"
import { useGameSession } from "../hooks/useGameSession"
import { useRouter } from "../router"
import { useSettings } from "../hooks/useSettings"
import { useSound } from "../hooks/useSound"
import { useRequireConfig } from "../hooks/useRequireConfig"
import { useEffectOnChange } from "../hooks/useEffectOnChange"
import type { GameConfig } from "../types/game"
import { AsciiLogo } from "../components/game/AsciiLogo"
import { ScorePanel } from "../components/game/ScorePanel"
import { LivesPanel } from "../components/game/LivesPanel"
import { Timer } from "../components/game/Timer"
import { ResultModal } from "../components/game/ResultModal"
import { NeonPanel } from "../components/layout/NeonPanel"
import { NeonButton } from "../components/layout/NeonButton"
import { RevealMeter } from "../components/hangman/RevealMeter"
import { HangmanWord } from "../components/hangman/HangmanWord"
import { WrongLetters } from "../components/hangman/WrongLetters"
import { LetterKeyboard } from "../components/hangman/LetterKeyboard"
import { HangmanFigure } from "../components/hangman/HangmanFigure"
import {
  isTimeAttack,
  startLivesFor,
  timeAttackSecondsRemaining,
  totalRounds,
} from "../utils/gameSession"
import { resolveHintText } from "../utils/hints"
import { buildGameSummary } from "../utils/runSummary"
import { tuningFor, DECAY_TICK_MS } from "../data/difficultyTuning"
import { getPlayCategoryName } from "../data/categories"
import styles from "./HangmanGamePage.module.css"

type HangmanGameProps = {
  config: GameConfig
}

const HangmanGame = ({ config }: HangmanGameProps) => {
  const { navigate } = useRouter()
  const { settings } = useSettings()
  const play = useSound()
  const g = useGameSession(config)
  const { state } = g
  const logo = state.currentLogo

  useEffectOnChange(state.guessedLetters.length, (prev, next) => {
    if (next <= prev || state.status !== "playing") return
    const last = state.guessedLetters[state.guessedLetters.length - 1]
    play(last && state.wrongLetters.includes(last) ? "wrong" : "correct")
  })

  useEffectOnChange(state.status, (_prev, next) => {
    if (next === "won") play("win")
    else if (next === "gameover") play("gameover")
  })

  const tuning = tuningFor(config.difficulty)
  const maxLives = startLivesFor(config)

  const roundBaseScore = useRef(0)
  useEffect(() => {
    roundBaseScore.current = state.score
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.roundNumber])

  const decay = g.decay
  const decayActive =
    tuning.hmDecay &&
    state.status === "playing" &&
    !settings.reducedMotion &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  useEffect(() => {
    if (!decayActive) return
    const id = window.setInterval(() => decay(), DECAY_TICK_MS)
    return () => window.clearInterval(id)
  }, [decayActive, decay])

  if (!logo) return null

  const solved = state.status === "won"
  const isOver = state.status === "gameover"
  const modalOpen = solved || isOver
  const isLast = isOver || !g.canContinue
  const pointsDelta = Math.max(0, state.score - roundBaseScore.current)

  const asciiLines = logo.ascii.clean
  const revealPct = solved ? 100 : state.revealPercent
  const maskBackground = [
    `linear-gradient(135deg, transparent ${revealPct - 1}%, rgba(0,245,255,0.6) ${revealPct}%, transparent ${revealPct + 2}%)`,
    `linear-gradient(135deg, rgba(157,78,221,0) 0 ${revealPct}%, rgba(157,78,221,0.16) ${revealPct}% 100%)`,
    `linear-gradient(135deg, rgba(10,14,32,0) 0 ${revealPct}%, rgb(10,14,32) ${revealPct}% 100%)`,
  ].join(", ")
  const wrongCount = state.wrongLetters.length

  const lastGuess = state.guessedLetters[state.guessedLetters.length - 1]
  const feedback = lastGuess
    ? state.wrongLetters.includes(lastGuess)
      ? `Corruption detected: ${lastGuess.toUpperCase()} is not in the sigil.`
      : `Fragment decoded: ${lastGuess.toUpperCase()} accepted.`
    : ""

  const revealUsed = state.hint.usedKinds.includes("reveal")
  const noMoreIntel = state.hint.textHintsShown >= logo.hints.length
  const textHint =
    state.hint.textHintsShown > 0
      ? resolveHintText(logo, "text", state.hint.textHintsShown - 1)
      : ""

  const handleBoostReveal = () => g.useHint("reveal")
  const handleDecryptHint = () => g.useHint("text")
  const handleQuit = () => navigate("home")

  const finishRun = () => navigate("game-over", { summary: buildGameSummary(state, "hangman") })

  const handleNext = () => {
    if (isLast) {
      finishRun()
      return
    }
    g.next()
  }

  const timeAttack = isTimeAttack(state)
  const timeAttackSeconds = timeAttackSecondsRemaining(state)

  return (
    <div className={styles.page}>
      <NeonPanel title={`${getPlayCategoryName(config.category)} // Hangman`}>
        <div className={styles.grid}>
          <div className={styles.stats}>
            <ScorePanel
              score={state.score}
              streak={state.streak}
              round={state.roundNumber}
              totalRounds={totalRounds(state)}
            />
            <Timer
              startedAt={timeAttack ? state.startedAt : state.questionStartedAt}
              running={state.status === "playing"}
              countdownFrom={timeAttackSeconds}
              onExpire={timeAttack ? finishRun : undefined}
            />
            <LivesPanel
              lives={state.lives}
              maxLives={maxLives}
              label="Signal Integrity"
            />
          </div>

          <div className={styles.mid}>
            <div className={styles.sigilFrame}>
              <div className={styles.sigilArea}>
                <AsciiLogo
                  lines={asciiLines}
                  variant="clean"
                  animated={!solved}
                  size="md"
                  label={`Encrypted sigil, ${Math.round(revealPct)} percent decoded.`}
                />
                {!solved && (
                  <div
                    className={styles.mask}
                    style={{ background: maskBackground }}
                    aria-hidden="true"
                  />
                )}
              </div>
              <RevealMeter percent={state.revealPercent} />
            </div>

            <HangmanFigure wrong={wrongCount} maxWrong={maxLives} />
          </div>

          <div className={styles.controls}>
            <HangmanWord
              name={logo.name}
              guessedLetters={state.guessedLetters}
              solved={solved}
              showLength={tuning.hmShowLength}
            />

            <WrongLetters letters={state.wrongLetters} />

            <span className="sr-only" role="status" aria-live="polite">
              {feedback}
            </span>

            <LetterKeyboard
              guessedLetters={state.guessedLetters}
              wrongLetters={state.wrongLetters}
              onGuess={g.guessLetter}
              disabled={state.status !== "playing"}
            />

            {textHint && <p className={`text-yellow ${styles.hint}`}>{textHint}</p>}

            <div className={styles.actions}>
              <NeonButton
                variant="magenta"
                onClick={handleBoostReveal}
                disabled={revealUsed || state.status !== "playing"}
              >
                Boost Reveal
              </NeonButton>
              <NeonButton
                variant="primary"
                onClick={handleDecryptHint}
                disabled={noMoreIntel || state.status !== "playing"}
              >
                Decrypt Hint
              </NeonButton>
              <NeonButton variant="ghost" onClick={handleQuit}>
                Quit
              </NeonButton>
            </div>
          </div>
        </div>
      </NeonPanel>

      <ResultModal
        open={modalOpen}
        result={solved ? "correct" : "wrong"}
        answerName={logo.name}
        points={solved ? pointsDelta : undefined}
        isLast={isLast}
        onNext={handleNext}
      />
    </div>
  )
}

export const HangmanGamePage = () => {
  const config = useRequireConfig()
  if (!config) return null

  return (
    <HangmanGame
      key={`${config.category}-${config.difficulty}-${config.roundLength}-${config.modifiers.join(",")}`}
      config={config}
    />
  )
}

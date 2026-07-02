import { useEffect, useRef } from "react"
import { useGameSession } from "../hooks/useGameSession"
import { useRouter, type GameSummary } from "../router"
import { useSettings } from "../hooks/useSettings"
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
import { totalRounds, startLivesFor } from "../utils/gameSession"
import { resolveHintText } from "../utils/hints"
import { computeAccuracy, gradeRun, runCompletionBonus, extraMultiplier } from "../utils/scoring"
import { tuningFor, DECAY_TICK_MS } from "../data/difficultyTuning"
import { getPlayCategoryName } from "../data/categories"
import styles from "./HangmanGamePage.module.css"

type HangmanGameProps = {
  config: GameConfig
}

const HangmanGame = ({ config }: HangmanGameProps) => {
  const { navigate } = useRouter()
  const { settings } = useSettings()
  const g = useGameSession(config)
  const { state } = g
  const logo = state.currentLogo

  const tuning = tuningFor(config.difficulty)
  const maxLives = startLivesFor(config)

  // Baseline score at the start of the round, used to compute the solve delta.
  const roundBaseScore = useRef(0)
  useEffect(() => {
    roundBaseScore.current = state.score
    // Reset only when a new sigil loads; score changes within a round are the delta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.roundNumber])

  // Expert reveal-decay: the sigil slowly re-encrypts while idle. Disabled for
  // reduced motion (OS or setting) since it's a moving, distracting effect.
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

  // The clean ASCII logo is always rendered; a plain black diagonal mask
  // (below) hides the still-encrypted portion and recedes as it's decoded.
  const asciiLines = logo.ascii.clean
  const revealPct = solved ? 100 : state.revealPercent
  // Theme-matched diagonal cover for the undecoded (bottom-right) region:
  // a glowing cyan edge, a faint purple sheen, over a deep-navy panel fill.
  const maskBackground = [
    `linear-gradient(135deg, transparent ${revealPct - 1}%, rgba(0,245,255,0.6) ${revealPct}%, transparent ${revealPct + 2}%)`,
    `linear-gradient(135deg, rgba(157,78,221,0) 0 ${revealPct}%, rgba(157,78,221,0.16) ${revealPct}% 100%)`,
    // Fully opaque themed navy fill so no ASCII bleeds through the covered area.
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
      ? resolveHintText(logo, "text", state.hint.textHintsShown)
      : ""

  const handleBoostReveal = () => g.useHint("reveal")
  const handleDecryptHint = () => g.useHint("text")
  const handleQuit = () => navigate("home")

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
      mode: "hangman",
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

  // Time Attack: one global countdown for the whole run; expiry ends it.
  const isTimeAttack = config.modifiers.includes("timeAttack")
  const timeAttackSeconds =
    isTimeAttack && state.deadline != null
      ? Math.max(0, Math.round((state.deadline - state.startedAt) / 1000))
      : undefined

  return (
    <div className={styles.page}>
      <NeonPanel title={`${getPlayCategoryName(config.category)} // Hangman`}>
        <div className={styles.grid}>
          {/* Row 1: stats */}
          <div className={styles.stats}>
            <ScorePanel
              score={state.score}
              streak={state.streak}
              round={state.roundNumber}
              totalRounds={totalRounds(state)}
            />
            <Timer
              startedAt={isTimeAttack ? state.startedAt : state.questionStartedAt}
              running={state.status === "playing"}
              countdownFrom={timeAttackSeconds}
              onExpire={isTimeAttack ? finishRun : undefined}
            />
            <LivesPanel
              lives={state.lives}
              maxLives={maxLives}
              label="Signal Integrity"
            />
          </div>

          {/* Row 2: sigil (left) | hangman figure (right) — equal height */}
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

          {/* Row 3: word, corruption, keyboard, actions */}
          <div className={styles.controls}>
            <HangmanWord
              name={logo.name}
              guessedLetters={state.guessedLetters}
              guessableChars={g.guessableChars}
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
  const { params, navigate } = useRouter()
  const config = params.config

  useEffect(() => {
    if (!config) navigate("home")
  }, [config, navigate])

  if (!config) return null

  return <HangmanGame config={config} />
}

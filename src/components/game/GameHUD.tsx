import type { GameSessionState } from "../../types/game"
import { totalRounds } from "../../utils/gameSession"
import { ScorePanel } from "./ScorePanel"
import { Timer } from "./Timer"
import { LivesPanel } from "./LivesPanel"
import styles from "./GameHUD.module.css"

type GameHUDProps = {
  state: GameSessionState
  maxLives: number
  livesLabel?: string
  /** When set, the timer counts down from this many seconds (Trivia). */
  countdownSeconds?: number
  onTimeout?: () => void
  /** Override the timer's start (e.g. run start for a global Time Attack clock). */
  timerStartedAt?: number
}

/** Horizontal status bar: score + trace time + lives. Wraps on small screens. */
export const GameHUD = ({
  state,
  maxLives,
  livesLabel = "Lives",
  countdownSeconds,
  onTimeout,
  timerStartedAt,
}: GameHUDProps) => (
  <div className={styles.hud} role="group" aria-label="Game status">
    <div className={styles.group}>
      <ScorePanel
        score={state.score}
        streak={state.streak}
        round={state.roundNumber}
        totalRounds={totalRounds(state)}
      />
    </div>
    <div className={styles.group}>
      <Timer
        startedAt={timerStartedAt ?? state.questionStartedAt}
        running={state.status === "playing"}
        countdownFrom={countdownSeconds}
        onExpire={onTimeout}
      />
      <LivesPanel lives={state.lives} maxLives={maxLives} label={livesLabel} />
    </div>
  </div>
)

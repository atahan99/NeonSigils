import styles from "./StatBadge.module.css"

type ScorePanelProps = {
  score: number
  streak: number
  round: number
  totalRounds: number
}

const Badge = ({ label, value }: { label: string; value: string | number }) => (
  <div className={styles.badge}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{value}</span>
  </div>
)

export const ScorePanel = ({ score, streak, round, totalRounds }: ScorePanelProps) => (
  <div className={styles.row} role="group" aria-label="Score status">
    <Badge label="Score" value={score} />
    <Badge label="Streak" value={`x${streak}`} />
    <Badge
      label="Sigil"
      value={Number.isFinite(totalRounds) ? `${round}/${totalRounds}` : `${round}/∞`}
    />
  </div>
)

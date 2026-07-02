import styles from "./RevealMeter.module.css"

type RevealMeterProps = {
  percent: number // 0..100
}

const clamp = (v: number): number => Math.min(100, Math.max(0, Math.round(v)))

/** Horizontal neon progress bar for how much of the sigil is decoded. */
export const RevealMeter = ({ percent }: RevealMeterProps) => {
  const value = clamp(percent)
  return (
    <div className={styles.wrap}>
      <div className={styles.labelRow}>
        <span className={styles.label}>SIGIL DECODED</span>
        <span className={styles.value}>{value}%</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Sigil decoded"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.fill} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

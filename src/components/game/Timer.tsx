import { useEffect, useRef, useState } from "react"
import { cn } from "../../utils/cn"
import styles from "./StatBadge.module.css"

type TimerProps = {
  /** Timestamp (ms) the current question started. */
  startedAt: number
  running: boolean
  /** When set, count DOWN from this many seconds and show a bar. */
  countdownFrom?: number
  /** Fired once when a countdown reaches 0 while running. */
  onExpire?: () => void
}

/**
 * Counts up from the question start, or (when `countdownFrom` is set) counts
 * down and fires `onExpire` once at zero. Pauses when `running` is false.
 */
export const Timer = ({ startedAt, running, countdownFrom, onExpire }: TimerProps) => {
  const [elapsed, setElapsed] = useState(0)
  const firedRef = useRef(false)

  // Reset the "expired" latch whenever a new question begins.
  useEffect(() => {
    firedRef.current = false
    setElapsed(0)
  }, [startedAt])

  useEffect(() => {
    if (!running) return
    const tick = () => setElapsed((Date.now() - startedAt) / 1000)
    tick()
    const id = window.setInterval(tick, 200)
    return () => window.clearInterval(id)
  }, [startedAt, running])

  const isCountdown = countdownFrom != null
  const remaining = isCountdown ? Math.max(0, countdownFrom - elapsed) : 0

  // Fire onExpire exactly once when the countdown hits zero.
  useEffect(() => {
    if (!isCountdown || !running || firedRef.current) return
    if (remaining <= 0) {
      firedRef.current = true
      onExpire?.()
    }
  }, [isCountdown, running, remaining, onExpire])

  if (isCountdown) {
    const ratio = countdownFrom > 0 ? remaining / countdownFrom : 0
    const fillClass = cn(
      styles.countdownFill,
      ratio <= 0.25 && styles.danger,
      ratio <= 0.5 && ratio > 0.25 && styles.warn,
    )
    return (
      <div className={styles.badge}>
        <span className={styles.label}>Trace Window</span>
        <span className={styles.value} aria-live="off">
          {Math.ceil(remaining)}s
        </span>
        <span className={styles.countdownBar} aria-hidden="true">
          <span className={fillClass} style={{ width: `${ratio * 100}%` }} />
        </span>
      </div>
    )
  }

  return (
    <div className={styles.badge}>
      <span className={styles.label}>Trace Time</span>
      <span className={styles.value} aria-live="off">
        {Math.floor(elapsed)}s
      </span>
    </div>
  )
}

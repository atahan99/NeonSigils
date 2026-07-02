import { useEffect, useRef } from "react"
import { NeonPanel } from "../layout/NeonPanel"
import { NeonButton } from "../layout/NeonButton"
import styles from "./ResultModal.module.css"

type ResultModalProps = {
  open: boolean
  result: "correct" | "wrong"
  answerName: string
  points?: number
  isLast: boolean
  onNext: () => void
}

/** Per-question verdict overlay: ACCESS GRANTED / SIGNAL CORRUPTED. */
export const ResultModal = ({
  open,
  result,
  answerName,
  points,
  isLast,
  onNext,
}: ResultModalProps) => {
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) nextRef.current?.focus()
  }, [open])

  if (!open) return null

  const granted = result === "correct"
  return (
    <div
      className={styles.overlay}
      role="alertdialog"
      aria-modal="true"
      aria-label={granted ? "Access granted" : "Signal corrupted"}
    >
      <NeonPanel glow className={`${styles.modal} anim-pop-in`}>
        <div className={`${styles.verdict} ${granted ? styles.granted : styles.denied}`}>
          {granted ? "ACCESS GRANTED" : "SIGNAL CORRUPTED"}
        </div>
        <p className={styles.answer}>
          The sigil was <b>{answerName}</b>
        </p>
        {granted && points != null && (
          <p className={styles.points}>+{points} pts</p>
        )}
        <div className={styles.actions}>
          <NeonButton
            ref={nextRef}
            variant={granted ? "green" : "primary"}
            onClick={onNext}
          >
            {isLast ? "View Results" : "Load Next Sigil"}
          </NeonButton>
        </div>
      </NeonPanel>
    </div>
  )
}

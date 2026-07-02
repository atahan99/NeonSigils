import type { CSSProperties } from "react"
import styles from "./ModeCard.module.css"

type ModeCardProps = {
  title: string
  tagline: string
  accent: string
  onSelect: () => void
  badge?: string
}

export const ModeCard = ({ title, tagline, accent, onSelect, badge }: ModeCardProps) => {
  // Expose the accent as a local custom property so the CSS can drive border,
  // glow, and text color from a single value.
  const accentStyle = { "--accent": `var(${accent})` } as CSSProperties

  return (
    <button
      type="button"
      className={styles.card}
      style={accentStyle}
      onClick={onSelect}
      aria-label={`${title}. ${tagline}`}
    >
      {badge && <span className={styles.badge}>{badge}</span>}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.tagline}>{tagline}</p>
      <span className={styles.enter}>Initialize &gt;&gt;</span>
    </button>
  )
}

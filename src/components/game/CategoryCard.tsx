import type { CSSProperties } from "react"
import styles from "./CategoryCard.module.css"

type CategoryCardProps = {
  name: string
  shortName: string
  tagline: string
  accent: string
  count: number
  onSelect: () => void
}

export const CategoryCard = ({
  name,
  shortName,
  tagline,
  accent,
  count,
  onSelect,
}: CategoryCardProps) => {
  const accentStyle = { "--accent": `var(${accent})` } as CSSProperties

  return (
    <button
      type="button"
      className={styles.card}
      style={accentStyle}
      onClick={onSelect}
      aria-label={`${name}. ${tagline}. ${count} sigils`}
    >
      <span className={styles.tag}>{shortName}</span>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.tagline}>{tagline}</p>
      <span className={styles.count}>{count} sigils</span>
    </button>
  )
}

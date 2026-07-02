import type { ReactNode } from "react"
import styles from "./NeonPanel.module.css"

type NeonPanelProps = {
  title?: string
  headerRight?: ReactNode
  glow?: boolean
  className?: string
  children: ReactNode
}

export const NeonPanel = ({
  title,
  headerRight,
  glow = false,
  className,
  children,
}: NeonPanelProps) => {
  const classes = [styles.panel, glow ? styles.glow : "", className ?? ""]
    .filter(Boolean)
    .join(" ")

  return (
    <section className={classes}>
      {(title || headerRight) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {headerRight}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  )
}

import { useMemo } from "react"
import styles from "./AsciiLogo.module.css"

export type AsciiLogoProps = {
  lines: string[]
  variant?: "clean" | "glitched" | "cropped" | "lowRes"
  /** 0..100, used for the accessible status label. */
  revealPercent?: number
  animated?: boolean
  size?: "sm" | "md" | "lg"
  /** Accessible description; defaults to a generic challenge label. */
  label?: string
}

const variantClass: Record<NonNullable<AsciiLogoProps["variant"]>, string> = {
  clean: "",
  glitched: styles.glitched,
  cropped: styles.cropped,
  lowRes: "",
}

/**
 * Renders ASCII art in a whitespace-preserving <pre>. Purely presentational:
 * the parent decides which frame (clean / glitched / a reveal stage) to pass.
 */
export const AsciiLogo = ({
  lines,
  variant = "clean",
  revealPercent,
  animated = false,
  size = "md",
  label,
}: AsciiLogoProps) => {
  const text = useMemo(() => lines.join("\n"), [lines])

  const preClass = [
    styles.pre,
    styles[size],
    variantClass[variant],
    animated ? "anim-flicker" : "",
  ]
    .filter(Boolean)
    .join(" ")

  const srText =
    label ??
    `ASCII logo challenge displayed${
      revealPercent != null ? `, ${Math.round(revealPercent)}% decoded` : ""
    }.`

  return (
    <div className={styles.wrap}>
      <span className="sr-only">{srText}</span>
      <pre className={preClass} aria-hidden="true">
        {text}
      </pre>
    </div>
  )
}

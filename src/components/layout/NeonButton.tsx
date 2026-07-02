import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"
import styles from "./NeonButton.module.css"

type Variant = "primary" | "magenta" | "green" | "danger" | "ghost"
type Size = "sm" | "md" | "lg"

type NeonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: styles.primary,
  magenta: styles.magenta,
  green: styles.green,
  danger: styles.danger,
  ghost: styles.ghost,
}

const sizeClass: Record<Size, string> = {
  sm: styles.sm,
  md: "",
  lg: styles.lg,
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  (
    { variant = "primary", size = "md", fullWidth = false, className, children, type = "button", ...rest },
    ref,
  ) => {
    const classes = [
      styles.btn,
      variantClass[variant],
      sizeClass[size],
      fullWidth ? styles.fullWidth : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ")

    return (
      <button ref={ref} type={type} className={classes} {...rest}>
        {children}
      </button>
    )
  },
)
NeonButton.displayName = "NeonButton"

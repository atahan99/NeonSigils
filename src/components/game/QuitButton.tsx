import { useState } from "react"
import { NeonButton } from "../layout/NeonButton"

type QuitButtonProps = {
  onQuit: () => void
  size?: "sm" | "md"
}

/** Quit with an inline two-step confirm, so a stray click can't end a run. */
export const QuitButton = ({ onQuit, size = "md" }: QuitButtonProps) => {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <NeonButton variant="ghost" size={size} onClick={() => setConfirming(true)}>
        Quit
      </NeonButton>
    )
  }

  return (
    <span role="group" aria-label="End this run?" style={{ display: "inline-flex", gap: "var(--space-2)" }}>
      <NeonButton variant="ghost" size={size} onClick={() => setConfirming(false)} autoFocus>
        Keep playing
      </NeonButton>
      <NeonButton variant="danger" size={size} onClick={onQuit}>
        End run
      </NeonButton>
    </span>
  )
}

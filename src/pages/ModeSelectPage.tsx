import { useRouter } from "../router"
import { ModeCard } from "../components/game/ModeCard"
import { NeonButton } from "../components/layout/NeonButton"
import styles from "./ModeSelectPage.module.css"

export const ModeSelectPage = () => {
  const { navigate } = useRouter()

  const handleTrivia = () => navigate("category-select", { mode: "trivia" })
  const handleHangman = () => navigate("category-select", { mode: "hangman" })

  return (
    <div className={`${styles.page} anim-fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>SELECT PROTOCOL</h1>
        <NeonButton variant="ghost" onClick={() => navigate("home")}>
          &lt; Back
        </NeonButton>
      </div>

      <div className={styles.modes}>
        <ModeCard
          title="Trivia Mode"
          tagline="Type the sigil name. Fast, arcade, addictive."
          accent="--neon-cyan"
          badge="Protocol 01"
          onSelect={handleTrivia}
        />
        <ModeCard
          title="Hangman Mode"
          tagline="Decode the corrupted sigil letter by letter."
          accent="--neon-magenta"
          badge="Protocol 02"
          onSelect={handleHangman}
        />
      </div>
    </div>
  )
}

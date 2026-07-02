import { useRouter } from "../router"
import { usingGeneratedData } from "../data/logos"
import { ModeCard } from "../components/game/ModeCard"
import { NeonButton } from "../components/layout/NeonButton"
import styles from "./HomePage.module.css"

export const HomePage = () => {
  const { navigate } = useRouter()

  const handleTrivia = () => navigate("category-select", { mode: "trivia" })
  const handleHangman = () => navigate("category-select", { mode: "hangman" })

  return (
    <div className={`${styles.home} anim-fade-in`}>
      <header className={styles.hero}>
        <h1 className={`glitch ${styles.title} anim-flicker`} data-text="NeonSigils">
          NeonSigils
        </h1>
        <p className={styles.subtitle}>
          Decode glitched glyphs from security, networking, self-hosting, homelabbing, and
          general tech.
        </p>
        <p className={styles.tagline}>A cyberpunk ASCII tech-logo guessing game.</p>
      </header>

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

      <div className={styles.secondary}>
        <NeonButton variant="ghost" onClick={() => navigate("leaderboard")}>
          Hall of Signals
        </NeonButton>
        <NeonButton variant="ghost" onClick={() => navigate("settings")}>
          System Config
        </NeonButton>
        <NeonButton variant="ghost" onClick={() => navigate("about")}>
          Archive
        </NeonButton>
      </div>

      {!usingGeneratedData && (
        <p className={styles.note}>
          Running sample sigils — run the asset pipeline for the full archive.
        </p>
      )}
    </div>
  )
}

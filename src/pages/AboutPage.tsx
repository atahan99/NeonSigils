import { useRouter } from "../router"
import { NeonPanel } from "../components/layout/NeonPanel"
import { NeonButton } from "../components/layout/NeonButton"
import styles from "./AboutPage.module.css"

const LEGAL_POINTS: string[] = [
  "All brand names, logos, and trademarks are the property of their respective owners.",
  "NeonSigils is not affiliated with, endorsed by, or sponsored by any of the brands featured.",
  "Logos are transformed into ASCII art purely for quiz, recognition, and educational purposes.",
  "Per-icon license and trademark metadata is stored alongside each sigil where available.",
  "Brand logos are never used as the app icon, on merchandise, or as a branding identity.",
  "The NeonSigils brand uses its own original sigil symbol, not any third-party logo.",
  'Assets marked "No Derivatives" (or similar restrictions) are avoided entirely.',
]

const CREDITS: { source: string; note: string }[] = [
  { source: "theSVG", note: "Primary vector source, resolved at build time." },
  { source: "Simple Icons", note: "CC0-licensed brand marks." },
  { source: "dashboard-icons", note: "Selfhosting & homelab coverage." },
  { source: "selfh.st/icons", note: "Extended self-hosted app icon set." },
]

export const AboutPage = () => {
  const { navigate } = useRouter()

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>ARCHIVE INFO</h1>
          <p className={styles.subtitle}>
            Provenance, legal signals, and how to decode the grid.
          </p>
        </div>
        <NeonButton variant="primary" onClick={() => navigate("home")}>
          Back to Play
        </NeonButton>
      </header>

      <NeonPanel title="What is NeonSigils?" glow>
        <p className={styles.lead}>
          NeonSigils is an educational, fan-made tech-logo guessing game. It takes
          the logos of tools, languages, clouds, and services from across the IT
          world and renders them as glowing ASCII{" "}
          <span className={styles.accent}>sigils</span> for you to decode.
        </p>
        <p className={styles.body}>
          Every sigil is generated from open icon sources and shipped as static
          ASCII art, so the whole archive runs entirely offline once loaded.
        </p>
      </NeonPanel>

      <NeonPanel title="How to Play">
        <div className={styles.modes}>
          <div className={styles.mode}>
            <h3 className={styles.modeTitle}>Trivia</h3>
            <p className={styles.body}>
              A sigil flickers onto the grid. Type the name of the brand behind
              it before your signal decays. Faster, cleaner answers score higher.
            </p>
          </div>
          <div className={styles.mode}>
            <h3 className={styles.modeTitle}>Hangman</h3>
            <p className={styles.body}>
              Guess letters one at a time to progressively decode the sigil. Each
              correct letter sharpens the ASCII art; too many misses and the
              signal is lost.
            </p>
          </div>
        </div>
      </NeonPanel>

      <NeonPanel title="Legal & Trademarks">
        <p className={styles.body}>
          NeonSigils celebrates the tools of the trade while respecting the
          people and companies who make them. In plain terms:
        </p>
        <ul className={styles.legalList}>
          {LEGAL_POINTS.map((point) => (
            <li key={point} className={styles.legalItem}>
              {point}
            </li>
          ))}
        </ul>
      </NeonPanel>

      <NeonPanel title="Credits & Sources">
        <p className={styles.body}>
          Icon artwork is sourced from open projects and resolved at build time.
          The game itself ships only the resulting static ASCII sigils.
        </p>
        <ul className={styles.creditList}>
          {CREDITS.map((credit) => (
            <li key={credit.source} className={styles.creditItem}>
              <span className={styles.creditSource}>{credit.source}</span>
              <span className={styles.creditNote}>{credit.note}</span>
            </li>
          ))}
        </ul>
      </NeonPanel>

      <footer className={styles.footer}>
        <NeonButton variant="green" onClick={() => navigate("home")}>
          Back to Play
        </NeonButton>
      </footer>
    </div>
  )
}

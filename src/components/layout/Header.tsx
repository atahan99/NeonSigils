import { useRouter, type RouteName } from "../../router"
import { REPO_URL } from "../../config"
import { NeonButton } from "./NeonButton"
import styles from "./Header.module.css"

const GithubMark = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)

const NAV: { label: string; route: RouteName }[] = [
  { label: "Play", route: "home" },
  { label: "Hall of Signals", route: "leaderboard" },
  { label: "System Config", route: "settings" },
  { label: "Archive", route: "about" },
]

export const Header = () => {
  const { navigate, route } = useRouter()

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.brand}
        onClick={() => navigate("home")}
        aria-label="NeonSigils home"
      >
        <img className={styles.mark} src="./favicon.svg" alt="" aria-hidden="true" />
        <span className={styles.wordmark}>
          Neon<b>Sigils</b>
        </span>
      </button>

      <nav className={styles.nav} aria-label="Primary">
        {NAV.map((item) => (
          <NeonButton
            key={item.route}
            variant="ghost"
            size="sm"
            aria-current={route === item.route ? "page" : undefined}
            onClick={() => navigate(item.route)}
          >
            {item.label}
          </NeonButton>
        ))}
        <a
          className={styles.github}
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="View NeonSigils source on GitHub"
        >
          <GithubMark />
        </a>
      </nav>
    </header>
  )
}

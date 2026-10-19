import { lazy, Suspense } from "react"
import { RouterProvider, useRouter } from "./router"
import { SettingsProvider } from "./hooks/useSettings"
import { AppShell } from "./components/layout/AppShell"
import { HomePage } from "./pages/HomePage"
import { GameOverPage } from "./pages/GameOverPage"
import { LeaderboardPage } from "./pages/LeaderboardPage"
import { SettingsPage } from "./pages/SettingsPage"
import { AboutPage } from "./pages/AboutPage"

// Pages that need the logo archive load it on demand, so the home page,
// leaderboard and settings don't download ~600 kB of ASCII art up front.
const CategorySelectPage = lazy(() =>
  import("./pages/CategorySelectPage").then((m) => ({ default: m.CategorySelectPage })),
)
const TriviaGamePage = lazy(() =>
  import("./pages/TriviaGamePage").then((m) => ({ default: m.TriviaGamePage })),
)
const HangmanGamePage = lazy(() =>
  import("./pages/HangmanGamePage").then((m) => ({ default: m.HangmanGamePage })),
)

const CurrentPage = () => {
  const { route } = useRouter()
  switch (route) {
    case "home":
      return <HomePage />
    case "category-select":
      return <CategorySelectPage />
    case "trivia":
      return <TriviaGamePage />
    case "hangman":
      return <HangmanGamePage />
    case "game-over":
      return <GameOverPage />
    case "leaderboard":
      return <LeaderboardPage />
    case "settings":
      return <SettingsPage />
    case "about":
      return <AboutPage />
    default:
      return <HomePage />
  }
}

export const App = () => (
  <SettingsProvider>
    <RouterProvider>
      <AppShell>
        <Suspense fallback={null}>
          <CurrentPage />
        </Suspense>
      </AppShell>
    </RouterProvider>
  </SettingsProvider>
)

export default App

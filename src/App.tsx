import { RouterProvider, useRouter } from "./router"
import { SettingsProvider } from "./hooks/useSettings"
import { AppShell } from "./components/layout/AppShell"
import { HomePage } from "./pages/HomePage"
import { CategorySelectPage } from "./pages/CategorySelectPage"
import { TriviaGamePage } from "./pages/TriviaGamePage"
import { HangmanGamePage } from "./pages/HangmanGamePage"
import { GameOverPage } from "./pages/GameOverPage"
import { LeaderboardPage } from "./pages/LeaderboardPage"
import { SettingsPage } from "./pages/SettingsPage"
import { AboutPage } from "./pages/AboutPage"

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
        <CurrentPage />
      </AppShell>
    </RouterProvider>
  </SettingsProvider>
)

export default App

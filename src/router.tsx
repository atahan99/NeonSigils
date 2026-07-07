import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { GameConfig, GameMode } from "./types/game"
import type { LeaderboardEntry } from "./types/leaderboard"

export type RouteName =
  | "home"
  | "category-select"
  | "trivia"
  | "hangman"
  | "game-over"
  | "leaderboard"
  | "settings"
  | "about"

// Summary passed to the Game Over screen (everything the leaderboard needs
// except the player-chosen name + generated id/timestamp).
export type GameSummary = Omit<LeaderboardEntry, "id" | "createdAt" | "playerName">

export type RouteParams = {
  mode?: GameMode
  config?: GameConfig
  summary?: GameSummary
  savedEntryId?: string
}

type HistoryEntry = { route: RouteName; params: RouteParams }

type RouterContextValue = {
  route: RouteName
  params: RouteParams
  navigate: (route: RouteName, params?: RouteParams) => void
  back: () => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const [route, setRoute] = useState<RouteName>("home")
  const [params, setParams] = useState<RouteParams>({})
  const [, setHistory] = useState<HistoryEntry[]>([])
  const currentRef = useRef({ route, params })
  currentRef.current = { route, params }

  const navigate = useCallback((next: RouteName, nextParams: RouteParams = {}) => {
    setHistory((h) => [...h, currentRef.current])
    setRoute(next)
    setParams(nextParams)
    window.scrollTo({ top: 0 })
  }, [])

  const back = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) {
        setRoute("home")
        setParams({})
        return h
      }
      const prev = h[h.length - 1]
      setRoute(prev.route)
      setParams(prev.params)
      return h.slice(0, -1)
    })
  }, [])

  const value = useMemo(
    () => ({ route, params, navigate, back }),
    [route, params, navigate, back],
  )

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export const useRouter = (): RouterContextValue => {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error("useRouter must be used within RouterProvider")
  return ctx
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
}

type Location = { route: RouteName; params: RouteParams }

type NavigateOptions = {
  /** Replace the current history entry instead of adding one (redirects). */
  replace?: boolean
}

type RouterContextValue = Location & {
  navigate: (route: RouteName, params?: RouteParams, options?: NavigateOptions) => void
}

// Hash paths keep the site a static bundle with no server rewrite rules.
// Only the route and play mode live in the URL; game config and results ride
// in history.state, so refresh and Back keep them but a shared link starts clean.
const PATHS: Record<RouteName, string> = {
  home: "/",
  "category-select": "/play",
  trivia: "/trivia",
  hangman: "/hangman",
  "game-over": "/results",
  leaderboard: "/leaderboard",
  settings: "/settings",
  about: "/about",
}

export const hashFor = (route: RouteName, params: RouteParams = {}): string =>
  route === "category-select" && params.mode
    ? `#/play/${params.mode}`
    : `#${PATHS[route]}`

export const parseHash = (hash: string): Location => {
  const path = hash.replace(/^#/, "") || "/"
  const play = /^\/play\/(trivia|hangman)$/.exec(path)
  if (play) return { route: "category-select", params: { mode: play[1] as GameMode } }
  const route = (Object.keys(PATHS) as RouteName[]).find((r) => PATHS[r] === path)
  return { route: route ?? "home", params: {} }
}

const isLocation = (value: unknown): value is Location =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Location).route === "string" &&
  (value as Location).route in PATHS

// history.state wins when it belongs to the current hash (refresh, Back);
// otherwise the hash alone decides (typed or shared links).
const readLocation = (): Location => {
  const fromHash = parseHash(window.location.hash)
  const state: unknown = window.history.state
  return isLocation(state) && state.route === fromHash.route ? state : fromHash
}

const RouterContext = createContext<RouterContextValue | null>(null)

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location>(readLocation)

  useEffect(() => {
    const onPop = () => setLocation(readLocation())
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const navigate = useCallback(
    (route: RouteName, params: RouteParams = {}, options: NavigateOptions = {}) => {
      const next = { route, params }
      const url = hashFor(route, params)
      if (options.replace) window.history.replaceState(next, "", url)
      else window.history.pushState(next, "", url)
      setLocation(next)
      window.scrollTo({ top: 0 })
    },
    [],
  )

  const value = useMemo(() => ({ ...location, navigate }), [location, navigate])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export const useRouter = (): RouterContextValue => {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error("useRouter must be used within RouterProvider")
  return ctx
}

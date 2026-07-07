import { useEffect } from "react"
import { useRouter } from "../router"
import type { GameConfig } from "../types/game"

/** Redirect home when route params lack a game config. */
export const useRequireConfig = (): GameConfig | undefined => {
  const { params, navigate } = useRouter()
  const config = params.config

  useEffect(() => {
    if (!config) navigate("home")
  }, [config, navigate])

  return config
}

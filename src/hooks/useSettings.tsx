import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Settings } from "../types/game"

const STORAGE_KEY = "neonsigils.settings.v1"

export const DEFAULT_SETTINGS: Settings = {
  playerName: "OPERATOR",
  soundEnabled: false,
  animationIntensity: "normal",
  scanlines: true,
  reducedMotion: false,
  autocomplete: true,
  difficulty: "easy",
  roundLength: 10,
}

const loadSettings = (): Settings => {
  if (typeof localStorage === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

type SettingsContextValue = {
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const MOTION_SCALE: Record<Settings["animationIntensity"], number> = {
  low: 0.5,
  normal: 1,
  high: 1.6,
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* storage unavailable; keep in-memory */
      }
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
    } catch {
      /* ignore */
    }
  }, [])

  // Reflect motion/scanline settings onto the document root.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty(
      "--motion-scale",
      String(MOTION_SCALE[settings.animationIntensity]),
    )
    root.classList.toggle("reduced-motion", settings.reducedMotion)
  }, [settings.animationIntensity, settings.reducedMotion])

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}

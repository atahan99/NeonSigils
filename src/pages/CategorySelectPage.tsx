import { useState } from "react"
import { useRouter } from "../router"
import { useSettings } from "../hooks/useSettings"
import { CATEGORIES, MIXED_CATEGORY } from "../data/categories"
import { countForCategory } from "../data/logos"
import { CategoryCard } from "../components/game/CategoryCard"
import { NeonButton } from "../components/layout/NeonButton"
import type { GameConfig, GameMode, Modifier, RoundLength } from "../types/game"
import type { Difficulty, PlayCategoryId } from "../types/logo"
import styles from "./CategorySelectPage.module.css"

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"]

const MODIFIER_OPTIONS: { value: Modifier; label: string; note: string }[] = [
  { value: "suddenDeath", label: "Sudden Death", note: "1 life, x1.5 score" },
  { value: "timeAttack", label: "Time Attack", note: "60s, endless sigils" },
]

const todaySeed = (): string => `daily-${new Date().toISOString().slice(0, 10)}`

const ROUND_LENGTHS: { value: RoundLength; label: string }[] = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: "endless", label: "Endless" },
]

// Real categories plus the "mixed" pseudo-category, all sharing one card shape.
const CATEGORY_OPTIONS: {
  id: PlayCategoryId
  name: string
  shortName: string
  tagline: string
  accent: string
}[] = [...CATEGORIES, MIXED_CATEGORY]

export const CategorySelectPage = () => {
  const { navigate, params } = useRouter()
  const { settings } = useSettings()

  const mode: GameMode = params.mode ?? "trivia"

  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty)
  const [roundLength, setRoundLength] = useState<RoundLength>(settings.roundLength)
  const [modifiers, setModifiers] = useState<Modifier[]>([])

  const toggleModifier = (value: Modifier) =>
    setModifiers((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value],
    )

  const handleSelectCategory = (category: PlayCategoryId) => {
    const config: GameConfig = { mode, category, difficulty, roundLength, modifiers }
    navigate(config.mode, { config })
  }

  // Daily: everyone gets the same fixed run (mixed / medium / 10) for the day.
  const handleDaily = () => {
    const config: GameConfig = {
      mode,
      category: "mixed",
      difficulty: "medium",
      roundLength: 10,
      modifiers: ["daily"],
      seed: todaySeed(),
    }
    navigate(config.mode, { config })
  }

  return (
    <div className={`${styles.page} anim-fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>SELECT ARCHIVE // {mode.toUpperCase()}</h1>
        <NeonButton variant="ghost" onClick={() => navigate("home")}>
          &lt; Back
        </NeonButton>
      </div>

      <div className={styles.config}>
        <div className={styles.field}>
          <span className={styles.label} id="difficulty-label">
            Difficulty
          </span>
          <div className={styles.toggleRow} role="group" aria-labelledby="difficulty-label">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                className={`${styles.toggle} ${
                  difficulty === level ? styles.toggleActive : ""
                }`}
                aria-pressed={difficulty === level}
                onClick={() => setDifficulty(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label} id="round-label">
            Round Length
          </span>
          <div className={styles.toggleRow} role="group" aria-labelledby="round-label">
            {ROUND_LENGTHS.map((option) => (
              <button
                key={String(option.value)}
                type="button"
                className={`${styles.toggle} ${
                  roundLength === option.value ? styles.toggleActive : ""
                }`}
                aria-pressed={roundLength === option.value}
                onClick={() => setRoundLength(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label} id="modifiers-label">
            Modifiers
          </span>
          <div className={styles.toggleRow} role="group" aria-labelledby="modifiers-label">
            {MODIFIER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.toggle} ${
                  modifiers.includes(option.value) ? styles.toggleActive : ""
                }`}
                aria-pressed={modifiers.includes(option.value)}
                title={option.note}
                onClick={() => toggleModifier(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.dailyRow}>
        <NeonButton variant="green" onClick={handleDaily}>
          Start Daily Challenge
        </NeonButton>
        <span className={styles.dailyNote}>
          Fixed mixed archive, medium difficulty, same sigils for everyone today.
        </span>
      </div>

      <div className={styles.grid}>
        {CATEGORY_OPTIONS.map((cat) => (
          <CategoryCard
            key={cat.id}
            name={cat.name}
            shortName={cat.shortName}
            tagline={cat.tagline}
            accent={cat.accent}
            count={countForCategory(cat.id)}
            onSelect={() => handleSelectCategory(cat.id)}
          />
        ))}
      </div>
    </div>
  )
}

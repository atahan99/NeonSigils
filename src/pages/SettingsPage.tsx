import { useId, type ChangeEvent } from "react"
import { useSettings } from "../hooks/useSettings"
import { NeonPanel } from "../components/layout/NeonPanel"
import { NeonButton } from "../components/layout/NeonButton"
import type { AnimationIntensity, RoundLength, Settings } from "../types/game"
import type { Difficulty } from "../types/logo"
import styles from "./SettingsPage.module.css"

type ToggleProps = {
  label: string
  description?: string
  checked: boolean
  onToggle: (next: boolean) => void
}

const Toggle = ({ label, description, checked, onToggle }: ToggleProps) => (
  <div className={styles.field}>
    <div className={styles.fieldText}>
      <span className={styles.fieldLabel}>{label}</span>
      {description && <span className={styles.fieldHint}>{description}</span>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={checked ? styles.switchOn : styles.switch}
      onClick={() => onToggle(!checked)}
    >
      <span className={styles.knob} aria-hidden="true" />
      <span className={styles.switchText}>{checked ? "ON" : "OFF"}</span>
    </button>
  </div>
)

type SegmentOption<T extends string | number> = { value: T; label: string }

type SegmentedProps<T extends string | number> = {
  label: string
  hint?: string
  value: T
  options: SegmentOption<T>[]
  onSelect: (value: T) => void
}

const Segmented = <T extends string | number>({
  label,
  hint,
  value,
  options,
  onSelect,
}: SegmentedProps<T>) => (
  <div className={styles.field}>
    <div className={styles.fieldText}>
      <span className={styles.fieldLabel}>{label}</span>
      {hint && <span className={styles.fieldHint}>{hint}</span>}
    </div>
    <div className={styles.segmented} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          aria-pressed={value === option.value}
          className={value === option.value ? styles.segActive : styles.seg}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
)

const INTENSITY_OPTIONS: SegmentOption<AnimationIntensity>[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
]

const DIFFICULTY_OPTIONS: SegmentOption<Difficulty>[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
]

const ROUND_OPTIONS: SegmentOption<RoundLength>[] = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: "endless", label: "Endless" },
]

export const SettingsPage = () => {
  const { settings, updateSettings, resetSettings } = useSettings()
  const nameId = useId()

  const handleName = (event: ChangeEvent<HTMLInputElement>) => {
    updateSettings({ playerName: event.target.value })
  }

  const set = <K extends keyof Settings>(key: K) => (value: Settings[K]) => {
    updateSettings({ [key]: value } as Partial<Settings>)
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <h1 className={styles.title}>SYSTEM CONFIG</h1>
        <p className={styles.subtitle}>Tune the grid to your operator profile.</p>
      </header>

      <div className={styles.panels}>
        <NeonPanel title="Profile">
          <div className={styles.field}>
            <div className={styles.fieldText}>
              <label className={styles.fieldLabel} htmlFor={nameId}>
                Player name
              </label>
              <span className={styles.fieldHint}>
                Etched onto the Hall of Signals.
              </span>
            </div>
            <input
              id={nameId}
              type="text"
              className={styles.textInput}
              value={settings.playerName}
              onChange={handleName}
              maxLength={24}
              autoComplete="off"
              spellCheck={false}
              placeholder="OPERATOR"
            />
          </div>
        </NeonPanel>

        <NeonPanel title="Interface">
          <Toggle
            label="Sound effects"
            description="Blips, glitches, and confirms."
            checked={settings.soundEnabled}
            onToggle={set("soundEnabled")}
          />
          <Segmented
            label="Animation intensity"
            hint="Controls glow and glitch strength."
            value={settings.animationIntensity}
            options={INTENSITY_OPTIONS}
            onSelect={set("animationIntensity")}
          />
          <Toggle
            label="Scanlines"
            description="CRT overlay across the interface."
            checked={settings.scanlines}
            onToggle={set("scanlines")}
          />
          <Toggle
            label="Reduced motion"
            description="Also respects your OS 'reduce motion' setting."
            checked={settings.reducedMotion}
            onToggle={set("reducedMotion")}
          />
        </NeonPanel>

        <NeonPanel title="Gameplay">
          <Toggle
            label="Autocomplete"
            description="Suggest sigil names as you type."
            checked={settings.autocomplete}
            onToggle={set("autocomplete")}
          />
          <Segmented
            label="Difficulty"
            hint="Default challenge for new runs."
            value={settings.difficulty}
            options={DIFFICULTY_OPTIONS}
            onSelect={set("difficulty")}
          />
          <Segmented
            label="Round length"
            hint="Questions per run, or endless."
            value={settings.roundLength}
            options={ROUND_OPTIONS}
            onSelect={set("roundLength")}
          />
        </NeonPanel>

        <div className={styles.footerRow}>
          <NeonButton variant="ghost" onClick={resetSettings}>
            Restore Defaults
          </NeonButton>
        </div>
      </div>
    </div>
  )
}

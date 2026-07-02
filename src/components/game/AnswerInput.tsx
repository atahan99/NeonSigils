import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import type { Difficulty } from "../../types/logo"
import { ALL_LOGOS } from "../../data/logos"
import { normalizeAnswer } from "../../utils/normalizeAnswer"
import { tuningFor } from "../../data/difficultyTuning"
import { NeonButton } from "../layout/NeonButton"
import styles from "./AnswerInput.module.css"

type AnswerInputProps = {
  onSubmit: (value: string) => void
  disabled: boolean
  autocompleteEnabled: boolean
  difficulty: Difficulty
}

type Candidate = { display: string; norm: string }

const buildCandidates = (includeAliases: boolean): Candidate[] => {
  const seen = new Set<string>()
  const out: Candidate[] = []
  for (const logo of ALL_LOGOS) {
    const displays = includeAliases ? [logo.name, ...logo.aliases] : [logo.name]
    for (const display of displays) {
      const norm = normalizeAnswer(display)
      if (!norm || seen.has(norm)) continue
      seen.add(norm)
      out.push({ display, norm })
    }
  }
  return out
}

// Two static pools: names-only (harder) and names+aliases (easier).
const CANDIDATES_WITH_ALIASES = buildCandidates(true)
const CANDIDATES_NAMES_ONLY = buildCandidates(false)

const optionId = (index: number): string => `sigil-option-${index}`

export const AnswerInput = ({
  onSubmit,
  disabled,
  autocompleteEnabled,
  difficulty,
}: AnswerInputProps) => {
  const [value, setValue] = useState("")
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showList, setShowList] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => {
    if (!autocompleteEnabled) return []
    const tuning = tuningFor(difficulty)
    if (tuning.acMax <= 0) return []
    const norm = normalizeAnswer(value)
    if (norm.length < tuning.acThreshold) return []
    const pool = tuning.acAliases ? CANDIDATES_WITH_ALIASES : CANDIDATES_NAMES_ONLY
    const matches: string[] = []
    for (const candidate of pool) {
      if (candidate.norm.startsWith(norm)) {
        matches.push(candidate.display)
        if (matches.length >= tuning.acMax) break
      }
    }
    return matches
  }, [value, autocompleteEnabled, difficulty])

  const listVisible = showList && !disabled && suggestions.length > 0

  // Re-focus the field when a new question re-enables it (modal releases focus).
  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  const clear = () => {
    setValue("")
    setActiveIndex(-1)
    setShowList(false)
  }

  const submitTyped = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    clear()
  }

  const selectSuggestion = (suggestion: string) => {
    onSubmit(suggestion)
    clear()
  }

  const handleChange = (next: string) => {
    setValue(next)
    setActiveIndex(-1)
    setShowList(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    const len = suggestions.length
    if (event.key === "ArrowDown" && len > 0) {
      event.preventDefault()
      setShowList(true)
      setActiveIndex((i) => (i + 1) % len)
      return
    }
    if (event.key === "ArrowUp" && len > 0) {
      event.preventDefault()
      setShowList(true)
      setActiveIndex((i) => (i - 1 + len) % len)
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      if (listVisible && activeIndex >= 0 && suggestions[activeIndex]) {
        selectSuggestion(suggestions[activeIndex])
        return
      }
      submitTyped()
      return
    }
    if (event.key === "Escape") {
      setShowList(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="answer-input">
        Decode the sigil
      </label>
      <div className={styles.field}>
        <input
          ref={inputRef}
          id="answer-input"
          className={styles.input}
          type="text"
          value={value}
          placeholder="type the sigil name…"
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          role="combobox"
          aria-expanded={listVisible}
          aria-controls="answer-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            listVisible && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-label="Decode the sigil"
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowList(true)}
        />
        <NeonButton variant="primary" disabled={disabled} onClick={submitTyped}>
          Decode
        </NeonButton>
      </div>

      {listVisible && (
        <ul
          id="answer-suggestions"
          className={styles.listbox}
          role="listbox"
          aria-label="Sigil suggestions"
        >
          {suggestions.map((suggestion, index) => {
            const active = index === activeIndex
            return (
              <li
                key={suggestion}
                id={optionId(index)}
                role="option"
                aria-selected={active}
                className={active ? `${styles.option} ${styles.optionActive}` : styles.option}
                // Prevent the input from blurring before the click registers.
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectSuggestion(suggestion)
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {suggestion}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

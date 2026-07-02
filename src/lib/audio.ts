// Tiny Web Audio synth for the UI blips, glitches, and confirms.
// No audio assets: every sound is generated on the fly from oscillators so the
// bundle stays tiny and the palette matches the cyberpunk aesthetic.

export type SoundName =
  | "click"
  | "hint"
  | "correct"
  | "wrong"
  | "win"
  | "gameover"

// A single oscillator "voice" inside a sound recipe.
type Tone = {
  freq: number
  start: number // seconds offset from playback time
  duration: number
  type?: OscillatorType
  gain?: number // 0..1 peak before the master gain
  slideTo?: number // optional pitch glide target (Hz)
}

// Master volume keeps the synth blips subtle even when several stack up.
const MASTER_GAIN = 0.14

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null

const getCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null
  const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  return ctx
}

// Browsers only let audio start from a user gesture. Resume the (possibly
// suspended) context on the first interaction so later, effect-driven sounds
// (e.g. a correct answer resolving after a keypress) are allowed to play.
const unlock = () => {
  const c = getCtx()
  if (c && c.state === "suspended") void c.resume()
  window.removeEventListener("pointerdown", unlock)
  window.removeEventListener("keydown", unlock)
}

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", unlock)
  window.addEventListener("keydown", unlock)
}

const playTone = (c: AudioContext, master: GainNode, tone: Tone): void => {
  const osc = c.createOscillator()
  const gain = c.createGain()
  const t0 = c.currentTime + tone.start
  const peak = tone.gain ?? 1

  osc.type = tone.type ?? "triangle"
  osc.frequency.setValueAtTime(tone.freq, t0)
  if (tone.slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.slideTo), t0 + tone.duration)
  }

  // Fast attack, exponential decay: gives each voice a snappy "blip" envelope.
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + tone.duration)

  osc.connect(gain)
  gain.connect(master)
  osc.start(t0)
  osc.stop(t0 + tone.duration + 0.02)
}

const RECIPES: Record<SoundName, Tone[]> = {
  // Short, dry UI tick.
  click: [{ freq: 880, start: 0, duration: 0.05, type: "square", gain: 0.5 }],
  // Two-note rising chirp for revealing a hint.
  hint: [
    { freq: 620, start: 0, duration: 0.08, gain: 0.7 },
    { freq: 820, start: 0.06, duration: 0.1, gain: 0.7 },
  ],
  // Bright ascending confirm.
  correct: [
    { freq: 660, start: 0, duration: 0.09, gain: 0.8 },
    { freq: 990, start: 0.08, duration: 0.14, gain: 0.8 },
  ],
  // Detuned descending buzz — the "signal corrupted" glitch.
  wrong: [
    { freq: 240, start: 0, duration: 0.22, type: "sawtooth", gain: 0.7, slideTo: 150 },
    { freq: 180, start: 0.04, duration: 0.2, type: "square", gain: 0.35 },
  ],
  // Four-note major arpeggio for solving a sigil.
  win: [
    { freq: 523, start: 0, duration: 0.12, gain: 0.8 },
    { freq: 659, start: 0.1, duration: 0.12, gain: 0.8 },
    { freq: 784, start: 0.2, duration: 0.14, gain: 0.8 },
    { freq: 1047, start: 0.3, duration: 0.24, gain: 0.85 },
  ],
  // Somber descending sweep for running out of lives.
  gameover: [
    { freq: 392, start: 0, duration: 0.22, type: "sawtooth", gain: 0.7, slideTo: 300 },
    { freq: 294, start: 0.2, duration: 0.26, type: "sawtooth", gain: 0.7, slideTo: 210 },
    { freq: 196, start: 0.44, duration: 0.38, gain: 0.7, slideTo: 130 },
  ],
}

/** Synthesize and play a named sound effect. Safe to call anywhere; no-ops if
 *  Web Audio is unavailable. Callers gate this on the sound setting. */
export const playSound = (name: SoundName): void => {
  const c = getCtx()
  if (!c) return
  if (c.state === "suspended") void c.resume()

  const master = c.createGain()
  master.gain.value = MASTER_GAIN
  master.connect(c.destination)

  for (const tone of RECIPES[name]) playTone(c, master, tone)
}

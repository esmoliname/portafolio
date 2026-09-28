import type { Accent } from '../types'

/** Accent rotation order for the `K` keycap. */
export const ACCENT_CYCLE: readonly Accent[] = ['neon', 'cyan', 'violet', 'amber']

interface AccentDefinition {
  /** Raw hex, used to drive the GLSL uniforms and the CSS custom property. */
  readonly hex: string
  /** Tailwind colour token, used for text / border utilities. */
  readonly text: string
  readonly border: string
  readonly bg: string
  readonly ring: string
  readonly shadow: string
  readonly glow: string
}

export const ACCENTS: Record<Accent, AccentDefinition> = {
  neon: {
    hex: '#39ff9e',
    text: 'text-neon',
    border: 'border-neon/40',
    bg: 'bg-neon/10',
    ring: 'ring-neon/40',
    shadow: 'shadow-neon/25',
    glow: 'shadow-[0_0_30px_-4px_var(--color-neon)]',
  },
  cyan: {
    hex: '#22d3ee',
    text: 'text-cyan',
    border: 'border-cyan/40',
    bg: 'bg-cyan/10',
    ring: 'ring-cyan/40',
    shadow: 'shadow-cyan/25',
    glow: 'shadow-[0_0_30px_-4px_var(--color-cyan)]',
  },
  violet: {
    hex: '#a855f7',
    text: 'text-violet',
    border: 'border-violet/40',
    bg: 'bg-violet/10',
    ring: 'ring-violet/40',
    shadow: 'shadow-violet/25',
    glow: 'shadow-[0_0_30px_-4px_var(--color-violet)]',
  },
  amber: {
    hex: '#fbbf24',
    text: 'text-amber',
    border: 'border-amber/40',
    bg: 'bg-amber/10',
    ring: 'ring-amber/40',
    shadow: 'shadow-amber/25',
    glow: 'shadow-[0_0_30px_-4px_var(--color-amber)]',
  },
}

export function nextAccent(current: Accent): Accent {
  const index = ACCENT_CYCLE.indexOf(current)
  // An unknown accent yields -1, so `(-1 + 1) % length` lands on 0 and the call
  // degrades to the first accent instead of returning `undefined`. The trailing
  // `?? current` only matters if the cycle list were ever emptied.
  const next = ACCENT_CYCLE[(index + 1) % ACCENT_CYCLE.length]
  return next ?? current
}

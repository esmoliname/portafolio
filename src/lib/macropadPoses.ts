import type { MacropadPose, SectionId } from '../types'

/**
 * Where the pad sits per scroll section, and how present it is.
 *
 * Hero: Macropad on the right side (x: 2.5), isometric angle for hero display
 * About: Slightly to the right and back
 * Projects: Pushed back as ambient element
 * Stack: Front and center (x: 0), larger scale for interaction
 * Contact: Left side, angled
 */
export const MACROPAD_POSES: Readonly<Record<SectionId, MacropadPose>> = {
  hero: { position: [2.5, -0.2, 0], rotation: [-0.35, -0.45, 0], scale: 1.1, dim: 0 },
  about: { position: [1.8, -0.2, -0.5], rotation: [-0.25, 0.3, 0], scale: 0.85, dim: 0.3 },
  projects: { position: [0, -0.5, -2.0], rotation: [-0.15, 0, 0], scale: 0.6, dim: 0.6 },
  stack: { position: [0, -0.1, 0.3], rotation: [-0.4, 0, 0], scale: 1.2, dim: 0 },
  contact: { position: [-2.0, -0.3, 0.5], rotation: [-0.25, -0.6, 0], scale: 0.85, dim: 0.3 },
}

/** Background colour of the scene; every `dim` lerp fades toward it. */
export const SCENE_BACKGROUND = '#050608'

/**
 * Fades a material colour toward the background.
 *
 * `dim` is clamped because a lerp past 1 would extrapolate into garbage
 * colours, and a negative one would oversaturate.
 */
export function dimColor(hex: string, dim: number): string {
  const amount = Math.min(Math.max(dim, 0), 1)
  if (amount === 0) return hex
  return mix(hex, SCENE_BACKGROUND, amount)
}

/** Perceptual-ish RGB mix. Good enough for a background fade, no color science. */
function mix(from: string, to: string, amount: number): string {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  const channel = (from_: number, to_: number): number => Math.round(from_ + (to_ - from_) * amount)
  return `rgb(${channel(a.r, b.r)}, ${channel(a.g, b.g)}, ${channel(a.b, b.b)})`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  }
}

import type { MacropadPose, SectionId } from '../types'

/**
 * Where the pad sits per scroll section, and how present it is.
 *
 * World-space x is chosen against the camera frustum: at z ~ 4.9 with fov 42 on
 * a 16:9 viewport the visible half-width is ~3.35, so x = 1.9 lands at NDC +0.57
 * (clearly right of centre) and x = -2.6 lands at NDC -0.78 (left edge).
 *
 * `stack` keeps the pad front-and-right because the info panel owns the left
 * half of that section. `projects` pushes it back in z so it reads as scenery
 * rather than a competing focal point.
 */
export const MACROPAD_POSES: Readonly<Record<SectionId, MacropadPose>> = {
  hero: { position: [0, -0.15, 0], rotation: [-0.42, 0, 0], scale: 1, dim: 0 },
  about: { position: [2.1, -0.2, -0.5], rotation: [-0.28, 0.55, 0], scale: 0.78, dim: 0.45 },
  projects: { position: [2.9, -0.55, -1.6], rotation: [-0.12, 0.95, 0.22], scale: 0.6, dim: 0.72 },
  stack: { position: [1.9, -0.05, 0.2], rotation: [-0.5, -0.38, 0], scale: 1.06, dim: 0 },
  contact: { position: [-2.6, -0.35, 0.3], rotation: [-0.26, -0.8, 0.12], scale: 0.8, dim: 0.3 },
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

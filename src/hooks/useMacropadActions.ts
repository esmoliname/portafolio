import confetti from 'canvas-confetti'

import { macropadLayout } from '../data/portfolio'
import { useAudioStore } from '../store/useAudioStore'
import { usePortfolioStore } from '../store/usePortfolioStore'
import type { KeycapAction, SectionId } from '../types'

/** `KeyboardEvent.key` -> keycap id, derived from the layout so it stays in sync. */
export const KEY_BINDINGS: ReadonlyMap<string, string> = new Map(
  macropadLayout
    .filter((key) => key.key !== undefined)
    .map((key) => [key.key as string, key.id]),
)

/** Keys that must never trigger a shortcut, even though they carry a letter. */
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || EDITABLE_TAGS.has(target.tagName)
}

const ACTION_SECTION: Partial<Record<KeycapAction, SectionId>> = {
  'scroll-top': 'hero',
  'scroll-about': 'about',
  'scroll-projects': 'projects',
  'scroll-stack': 'stack',
  'scroll-contact': 'contact',
}

export interface MacropadActions {
  readonly run: (action: KeycapAction) => void
}

/**
 * Single execution path for every keycap action, so a pointer press and a
 * keyboard press can never diverge.
 */
export function useMacropadActions(): MacropadActions {
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection)
  const pulseOrb = usePortfolioStore((s) => s.pulseOrb)
  const cycleAccent = usePortfolioStore((s) => s.cycleAccent)
  const toggleMuted = useAudioStore((s) => s.toggleMuted)
  const play = useAudioStore((s) => s.play)

  const run = (action: KeycapAction): void => {
    const section = ACTION_SECTION[action]
    if (section !== undefined) {
      setActiveSection(section)
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      play('keyDown')
      return
    }

    switch (action) {
      case 'burst-confetti': {
        play('switch')
        const end = Date.now() + 700
        const palette = ['#39ff9e', '#22d3ee', '#a855f7', '#fbbf24']
        const frame = (): void => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 65,
            origin: { x: 0, y: 0.72 },
            colors: palette,
            disableForReducedMotion: true,
          })
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 65,
            origin: { x: 1, y: 0.72 },
            colors: palette,
            disableForReducedMotion: true,
          })
          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        }
        frame()
        break
      }
      case 'pulse-orb': {
        pulseOrb()
        play('orb')
        break
      }
      case 'toggle-audio': {
        toggleMuted()
        // The toggle itself must be audible, so bypass the mute check.
        window.setTimeout(() => useAudioStore.getState().play('keyDown'), 0)
        break
      }
      case 'cycle-accent': {
        cycleAccent()
        play('success')
        break
      }
      default: {
        play('keyDown')
        break
      }
    }
  }

  return { run }
}

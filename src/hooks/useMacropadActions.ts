import confetti from 'canvas-confetti'

import { skills } from '../data/portfolio'
import { useAudioStore } from '../store/useAudioStore'
import { usePortfolioStore } from '../store/usePortfolioStore'
import type { SectionId } from '../types'

/**
 * Section navigation on the keyboard.
 *
 * The keycaps are spoken for: every physical key now carries a technology, so
 * navigation lives here instead. T/A/P/S/C are mnemonics of the section names,
 * which is why they are the obvious fallback when a keycap is unavailable.
 */
export const SECTION_SHORTCUTS: Readonly<Record<string, SectionId>> = {
  t: 'hero',
  a: 'about',
  p: 'projects',
  s: 'stack',
  c: 'contact',
}

/** `KeyboardEvent.key` -> skill id, derived from `skills` so it stays in sync. */
export const SKILL_BINDINGS: ReadonlyMap<string, string> = new Map(
  skills.map((skill) => [skill.key, skill.id]),
)

/** Keys that must never trigger a shortcut, even though they carry a character. */
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || EDITABLE_TAGS.has(target.tagName)
}

export interface MacropadActions {
  readonly goToSection: (section: SectionId) => void
  readonly selectSkill: (skillId: string) => void
  readonly burstConfetti: () => void
  readonly pulseOrb: () => void
  readonly toggleMuted: () => void
  readonly cycleAccent: () => void
}

/**
 * Single execution path for every shortcut, so a pointer press and a keyboard
 * press can never diverge.
 */
export function useMacropadActions(): MacropadActions {
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection)
  const selectSkillInStore = usePortfolioStore((s) => s.selectSkill)
  const pulseOrbInStore = usePortfolioStore((s) => s.pulseOrb)
  const cycleAccentInStore = usePortfolioStore((s) => s.cycleAccent)
  const toggleMuted = useAudioStore((s) => s.toggleMuted)
  const play = useAudioStore((s) => s.play)

  const goToSection = (section: SectionId): void => {
    setActiveSection(section)
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    play('keyDown')
  }

  const selectSkill = (skillId: string): void => {
    // The keycap already played its own switch sound; the action path stays
    // silent here so a press is not doubled.
    selectSkillInStore(skillId)
  }

  const burstConfetti = (): void => {
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
  }

  const pulseOrb = (): void => {
    pulseOrbInStore()
    play('orb')
  }

  const cycleAccent = (): void => {
    cycleAccentInStore()
    play('success')
  }

  return {
    goToSection,
    selectSkill,
    burstConfetti,
    pulseOrb,
    toggleMuted,
    cycleAccent,
  }
}

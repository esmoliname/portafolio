import { create } from 'zustand'

import { nextAccent } from '../lib/accents'
import { skills } from '../data/portfolio'
import type { Accent, SectionId } from '../types'

interface PortfolioState {
  /** Section currently occupying the viewport. */
  readonly activeSection: SectionId
  /** Keycap whose skill is being shown in the info panel. `null` = panel closed. */
  readonly activeSkillId: string | null
  /** Keycap under the pointer, for the hover lift. */
  readonly hoveredSkillId: string | null
  /** Bumped on every orb pulse; the shader subscribes to it as a trigger. */
  readonly orbPulse: number
  /**
   * Bumped on every keypress. The mascot subscribes to it as a one-shot
   * trigger — a counter, not a boolean, so two fast presses never collapse into
   * one reaction.
   */
  readonly mascotHit: number
  /** Live theme accent, rotated by the accent control. */
  readonly accent: Accent
  readonly setActiveSection: (section: SectionId) => void
  /** Pressing the already-active keycap closes the panel again. */
  readonly selectSkill: (skillId: string) => void
  readonly clearSkill: () => void
  readonly setHoveredSkill: (skillId: string | null) => void
  readonly pulseOrb: () => void
  readonly cycleAccent: () => void
}

export const usePortfolioStore = create<PortfolioState>()((set) => ({
  activeSection: 'hero',
  activeSkillId: null,
  hoveredSkillId: null,
  orbPulse: 0,
  mascotHit: 0,
  accent: 'neon',
  setActiveSection: (activeSection) => set({ activeSection }),
  selectSkill: (skillId) =>
    set((state) => ({
      activeSkillId: state.activeSkillId === skillId ? null : skillId,
      mascotHit: state.mascotHit + 1,
    })),
  clearSkill: () => set({ activeSkillId: null }),
  setHoveredSkill: (hoveredSkillId) => set({ hoveredSkillId }),
  pulseOrb: () => set((state) => ({ orbPulse: state.orbPulse + 1 })),
  cycleAccent: () => set((state) => ({ accent: nextAccent(state.accent) })),
}))

/** Convenience selector: the active skill object, or `null` when the panel is closed. */
export function useActiveSkill() {
  return usePortfolioStore((state) =>
    state.activeSkillId === null ? null : (skills.find((skill) => skill.id === state.activeSkillId) ?? null),
  )
}

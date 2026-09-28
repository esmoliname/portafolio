import { create } from 'zustand'

import { nextAccent } from '../lib/accents'
import type { Accent, SectionId } from '../types'

interface PortfolioState {
  /** Section currently occupying the viewport. */
  readonly activeSection: SectionId
  /** Bumped on every orb pulse; the shader subscribes to it as a trigger. */
  readonly orbPulse: number
  /** Live theme accent, rotated by the `K` keycap. */
  readonly accent: Accent
  readonly setActiveSection: (section: SectionId) => void
  readonly pulseOrb: () => void
  readonly cycleAccent: () => void
}

export const usePortfolioStore = create<PortfolioState>()((set) => ({
  activeSection: 'hero',
  orbPulse: 0,
  accent: 'neon',
  setActiveSection: (activeSection) => set({ activeSection }),
  pulseOrb: () => set((state) => ({ orbPulse: state.orbPulse + 1 })),
  cycleAccent: () => set((state) => ({ accent: nextAccent(state.accent) })),
}))

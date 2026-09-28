import { useEffect } from 'react'

import { getSynthEngine, useAudioStore } from '../store/useAudioStore'
import {
  isTypingTarget,
  SECTION_SHORTCUTS,
  SKILL_BINDINGS,
  useMacropadActions,
} from './useMacropadActions'

/**
 * Global keymap.
 *
 * Two independent maps that cannot collide: `1`-`9` select a keycap skill,
 * `T`/`A`/`P`/`S`/`C` navigate. `B`/`O`/`M`/`K` keep the effects that used to
 * live on keycaps, so nothing is lost in the reorganisation.
 *
 * Also performs the one-time audio unlock: browsers refuse to start an
 * `AudioContext` outside a user gesture, and a `keydown` is a valid one.
 */
export function useKeyboard(): void {
  const { goToSection, selectSkill, burstConfetti, pulseOrb, toggleMuted, cycleAccent } =
    useMacropadActions()
  const muted = useAudioStore((state) => state.muted)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return

      const key = event.key.toLowerCase()

      const skillId = SKILL_BINDINGS.get(key)
      if (skillId !== undefined) {
        event.preventDefault()
        selectSkill(skillId)
        return
      }

      const section = SECTION_SHORTCUTS[key]
      if (section !== undefined) {
        event.preventDefault()
        goToSection(section)
        return
      }

      switch (key) {
        case 'b':
          event.preventDefault()
          burstConfetti()
          break
        case 'o':
          event.preventDefault()
          pulseOrb()
          break
        case 'm':
          event.preventDefault()
          toggleMuted()
          break
        case 'k':
          event.preventDefault()
          cycleAccent()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [burstConfetti, cycleAccent, goToSection, pulseOrb, selectSkill, toggleMuted])

  useEffect(() => {
    void getSynthEngine().unlock()
  }, [muted])
}

import { useEffect } from 'react'

import { macropadLayout } from '../data/portfolio'
import { getSynthEngine, useAudioStore } from '../store/useAudioStore'
import { KEY_BINDINGS, isTypingTarget, useMacropadActions } from './useMacropadActions'

/**
 * Global keymap.
 *
 * Also performs the one-time audio unlock: browsers refuse to start an
 * `AudioContext` outside a user gesture, and a `keydown` is a valid one.
 */
export function useKeyboard(): void {
  const { run } = useMacropadActions()
  const muted = useAudioStore((state) => state.muted)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return

      const keycapId = KEY_BINDINGS.get(event.key.toLowerCase())
      if (keycapId === undefined) return

      const keycap = macropadLayout.find((entry) => entry.id === keycapId)
      if (keycap === undefined) return

      event.preventDefault()
      run(keycap.action)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [run])

  useEffect(() => {
    void getSynthEngine().unlock()
  }, [muted])
}

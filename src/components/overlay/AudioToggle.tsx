import { Volume2, VolumeX } from 'lucide-react'
import type { JSX } from 'react'

import { useAudioStore } from '../../store/useAudioStore'

/** Fixed bottom-right mute switch for the synth layer. */
export function AudioToggle(): JSX.Element {
  const muted = useAudioStore((s) => s.muted)
  const toggleMuted = useAudioStore((s) => s.toggleMuted)
  const enabled = !muted

  return (
    <button
      type="button"
      onClick={() => {
        toggleMuted()
      }}
      aria-pressed={enabled}
      aria-label={enabled ? 'Silenciar sonido' : 'Activar sonido'}
      className="glass-strong neon-edge fixed right-6 bottom-6 z-50 inline-flex size-11 items-center justify-center rounded-full text-neon transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      {enabled ? (
        <Volume2 className="size-5" aria-hidden="true" />
      ) : (
        <VolumeX className="size-5" aria-hidden="true" />
      )}
    </button>
  )
}

import { create } from 'zustand'

import { createSynthEngine, type SynthEngine, type SynthVoice } from '../lib/synthAudio'

/**
 * Audio state plus the singleton engine.
 *
 * The engine lives outside the React tree so a voice can be triggered from a
 * `useFrame` loop, a keyboard listener, or a pointer handler without any of
 * them owning the audio graph.
 */
const engine: SynthEngine = createSynthEngine()

export function getSynthEngine(): SynthEngine {
  return engine
}

interface AudioState {
  /** Muted flag. Audio is armed by default but silent until unmuted. */
  readonly muted: boolean
  /** 0..1 */
  readonly volume: number
  readonly setMuted: (muted: boolean) => void
  readonly toggleMuted: () => void
  readonly setVolume: (volume: number) => void
  readonly play: (voice: SynthVoice, gain?: number) => void
}

export const useAudioStore = create<AudioState>()((set, get) => ({
  muted: false,
  volume: 0.5,

  setMuted: (muted) => {
    engine.setVolume(muted ? 0 : get().volume)
    set({ muted })
  },

  toggleMuted: () => {
    const { muted } = get()
    const next = !muted
    engine.setVolume(next ? 0 : get().volume)
    set({ muted: next })
  },

  setVolume: (volume) => {
    const clamped = Math.min(Math.max(volume, 0), 1)
    if (!get().muted) {
      engine.setVolume(clamped)
    }
    set({ volume: clamped })
  },

  play: (voice, gain) => {
    if (get().muted) return
    engine.play(voice, gain === undefined ? undefined : { gain })
  },
}))

/**
 * Release the audio graph. Called once on app unmount so browsers do not keep a
 * suspended context alive for the lifetime of the tab.
 */
export function disposeSynthEngine(): void {
  engine.dispose()
}

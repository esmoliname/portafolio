/**
 * Synthetic audio engine.
 *
 * Every sound is generated at runtime with the Web Audio API — the portfolio
 * ships zero audio files. A mechanical switch click is modelled as a short
 * filtered noise burst (the contact snap) layered over a low sine thump (the
 * bottom-out on the plate).
 */

export type SynthVoice =
  | 'keyDown'
  | 'keyUp'
  | 'hover'
  | 'switch'
  | 'orb'
  | 'success'
  | 'error'

export interface PlayOptions {
  /** Linear gain multiplier applied on top of the voice's internal level. */
  readonly gain?: number
  /** Random pitch offset in cents, used to de-timbre repeated presses. */
  readonly detune?: number
}

export interface SynthEngine {
  /** True once a user gesture has started the context. */
  readonly isRunning: () => boolean
  /** Resume the context. Must be called from inside a user gesture. */
  readonly unlock: () => Promise<boolean>
  readonly play: (voice: SynthVoice, options?: PlayOptions) => void
  readonly setVolume: (volume: number) => void
  readonly dispose: () => void
}

const NOISE_SECONDS = 1
const MIN_GAIN = 0
const MAX_GAIN = 1

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Deterministic-ish jitter so repeated presses never sound machine-cloned. */
function jitter(spread: number): number {
  return (Math.random() - 0.5) * spread
}

export function createSynthEngine(): SynthEngine {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let noiseBuffer: AudioBuffer | null = null
  let volume = 0.5
  let disposed = false

  function ensureContext(): AudioContext | null {
    if (disposed) return null
    if (ctx) return ctx

    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!Ctor) return null

    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = volume
    master.connect(ctx.destination)

    // One second of white noise, reused by every percussive voice.
    const frames = Math.floor(ctx.sampleRate * NOISE_SECONDS)
    noiseBuffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const channel = noiseBuffer.getChannelData(0)
    for (let i = 0; i < frames; i += 1) {
      channel[i] = Math.random() * 2 - 1
    }

    return ctx
  }

  /** Short noise transient shaped by a band-pass — the "snap" of the contact. */
  function noiseHit(
    context: AudioContext,
    destination: AudioNode,
    opts: {
      readonly frequency: number
      readonly q: number
      readonly type: BiquadFilterType
      readonly attack: number
      readonly decay: number
      readonly level: number
    },
  ): void {
    if (!noiseBuffer) return

    const source = context.createBufferSource()
    source.buffer = noiseBuffer
    source.loop = true
    source.playbackRate.value = 1 + Math.random() * 0.1

    const filter = context.createBiquadFilter()
    filter.type = opts.type
    filter.frequency.value = opts.frequency
    filter.Q.value = opts.q

    const envelope = context.createGain()
    const now = context.currentTime
    const peak = clamp(opts.level, MIN_GAIN, MAX_GAIN)

    envelope.gain.setValueAtTime(0.0001, now)
    envelope.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), now + opts.attack)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + opts.attack + opts.decay)

    source.connect(filter).connect(envelope).connect(destination)
    source.start(now, Math.random() * 0.5)
    source.stop(now + opts.attack + opts.decay + 0.02)
  }

  /** Tonal body: the plate resonance under the keycap. */
  function tone(
    context: AudioContext,
    destination: AudioNode,
    opts: {
      readonly type: OscillatorType
      readonly frequency: number
      readonly attack: number
      readonly decay: number
      readonly level: number
      readonly detune?: number
    },
  ): void {
    const osc = context.createOscillator()
    osc.type = opts.type
    osc.frequency.value = opts.frequency * Math.pow(2, (opts.detune ?? 0) / 1200)
    osc.detune.value = opts.detune ?? 0

    const envelope = context.createGain()
    const now = context.currentTime
    const peak = clamp(opts.level, MIN_GAIN, MAX_GAIN)

    envelope.gain.setValueAtTime(0.0001, now)
    envelope.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), now + opts.attack)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + opts.attack + opts.decay)

    osc.connect(envelope).connect(destination)
    osc.start(now)
    osc.stop(now + opts.attack + opts.decay + 0.02)
  }

  function play(voice: SynthVoice, options: PlayOptions = {}): void {
    const context = ensureContext()
    if (!context || !master) return

    // Browsers keep a fresh context suspended until a real gesture. Rather than
    // throwing, skip: the sound simply lands on the next interaction.
    if (context.state !== 'running') return

    const level = clamp(options.gain ?? 1, 0, 2)
    if (level === 0) return

    const bus = context.createGain()
    bus.gain.value = level
    bus.connect(master)

    switch (voice) {
      case 'keyDown': {
        noiseHit(context, bus, {
          frequency: 2100 + jitter(500),
          q: 1.1,
          type: 'bandpass',
          attack: 0.001,
          decay: 0.045,
          level: 0.5,
        })
        tone(context, bus, {
          type: 'triangle',
          frequency: 190 + jitter(20),
          attack: 0.002,
          decay: 0.07,
          level: 0.22,
        })
        break
      }
      case 'keyUp': {
        noiseHit(context, bus, {
          frequency: 3400 + jitter(600),
          q: 0.8,
          type: 'bandpass',
          attack: 0.001,
          decay: 0.028,
          level: 0.2,
        })
        break
      }
      case 'hover': {
        tone(context, bus, {
          type: 'sine',
          frequency: 2600 + jitter(240),
          attack: 0.001,
          decay: 0.016,
          level: 0.055,
        })
        break
      }
      case 'switch': {
        noiseHit(context, bus, {
          frequency: 1500 + jitter(300),
          q: 0.9,
          type: 'lowpass',
          attack: 0.001,
          decay: 0.075,
          level: 0.6,
        })
        tone(context, bus, {
          type: 'sine',
          frequency: 92 + jitter(8),
          attack: 0.003,
          decay: 0.16,
          level: 0.34,
        })
        break
      }
      case 'orb': {
        tone(context, bus, {
          type: 'sine',
          frequency: 320,
          attack: 0.02,
          decay: 0.5,
          level: 0.16,
        })
        tone(context, bus, {
          type: 'sine',
          frequency: 480,
          attack: 0.02,
          decay: 0.42,
          level: 0.1,
        })
        break
      }
      case 'success': {
        // Rising major triad, each note offset in time.
        ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
          const osc = context.createOscillator()
          osc.type = 'triangle'
          osc.frequency.value = frequency

          const envelope = context.createGain()
          const start = context.currentTime + index * 0.06
          envelope.gain.setValueAtTime(0.0001, start)
          envelope.gain.exponentialRampToValueAtTime(0.2, start + 0.01)
          envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.24)

          osc.connect(envelope).connect(bus)
          osc.start(start)
          osc.stop(start + 0.26)
        })
        break
      }
      case 'error': {
        tone(context, bus, {
          type: 'square',
          frequency: 150,
          attack: 0.005,
          decay: 0.16,
          level: 0.14,
        })
        break
      }
    }
  }

  return {
    isRunning: () => ctx?.state === 'running',

    unlock: async () => {
      const context = ensureContext()
      if (!context) return false
      try {
        if (context.state !== 'running') {
          await context.resume()
        }
        return context.state === 'running'
      } catch {
        return false
      }
    },

    play,

    setVolume: (next: number) => {
      volume = clamp(next, 0, 1)
      if (master && ctx) {
        master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02)
      }
    },

    dispose: () => {
      disposed = true
      if (ctx) {
        void ctx.close().catch(() => undefined)
      }
      ctx = null
      master = null
      noiseBuffer = null
    },
  }
}

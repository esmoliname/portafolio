import '@testing-library/jest-dom/vitest'

import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * jsdom ships neither `IntersectionObserver` (required by framer-motion's
 * `whileInView`) nor `matchMedia` (required by `useReducedMotion`). Both are
 * stubbed here so component tests exercise real render paths.
 */
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly scrollMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  // Declared as a plain field, not a parameter property: `erasableSyntaxOnly`
  // forbids `constructor(private x)`.
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(): void {
    // Report the target as fully visible so `whileInView` resolves immediately.
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

if (!('IntersectionObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    value: IntersectionObserverStub,
  })
}

if (typeof globalThis.matchMedia !== 'function') {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  })
}

/** The synth engine touches `window.AudioContext`, which jsdom does not provide. */
if (typeof globalThis.AudioContext === 'undefined') {
  Object.defineProperty(globalThis, 'AudioContext', {
    writable: true,
    value: class AudioContextStub {
      readonly state = 'running'
      readonly currentTime = 0
      readonly sampleRate = 44100
      readonly destination = {}
      createGain() {
        return {
          gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() },
          connect: vi.fn(),
        }
      }
      createBufferSource() {
        return { buffer: null, loop: false, playbackRate: { value: 1 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
      }
      createBuffer() {
        return { getChannelData: () => new Float32Array(44100) }
      }
      createBiquadFilter() {
        return { type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn() }
      }
      createOscillator() {
        return { type: '', frequency: { value: 0 }, detune: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
      }
      resume = vi.fn().mockResolvedValue(undefined)
      close = vi.fn().mockResolvedValue(undefined)
    },
  })
}

afterEach(() => {
  cleanup()
})

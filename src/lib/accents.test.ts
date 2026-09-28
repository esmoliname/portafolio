import { describe, expect, it } from 'vitest'

import { ACCENTS, ACCENT_CYCLE, nextAccent } from './accents'

describe('nextAccent', () => {
  it('advances through the cycle in order', () => {
    expect(nextAccent('neon')).toBe('cyan')
    expect(nextAccent('cyan')).toBe('violet')
    expect(nextAccent('violet')).toBe('amber')
  })

  it('wraps from the last accent back to the first', () => {
    expect(nextAccent('amber')).toBe(ACCENT_CYCLE[0])
  })

  it('is a total function: a full lap returns the starting accent', () => {
    const start = ACCENT_CYCLE[0]!
    let current: (typeof ACCENT_CYCLE)[number] = start
    for (let i = 0; i < ACCENT_CYCLE.length; i += 1) {
      current = nextAccent(current)
    }
    expect(current).toBe(start)
  })

  it('degrades to the first accent for a value outside the cycle', () => {
    // The signature only accepts `Accent`, so reaching this branch needs a cast.
    const unknownAccent = 'chartreuse' as unknown as (typeof ACCENT_CYCLE)[number]
    expect(nextAccent(unknownAccent)).toBe(ACCENT_CYCLE[0])
  })
})

describe('ACCENTS', () => {
  it('defines a palette entry for every accent in the cycle', () => {
    for (const accent of ACCENT_CYCLE) {
      expect(ACCENTS[accent]).toBeDefined()
    }
  })

  it('exposes a valid hex colour for each accent', () => {
    for (const accent of ACCENT_CYCLE) {
      expect(ACCENTS[accent].hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

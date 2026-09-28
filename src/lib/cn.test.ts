import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('supports conditional objects and arrays', () => {
    expect(cn(['a', { b: true, c: false }])).toBe('a b')
  })

  it('lets a later Tailwind utility win a conflict', () => {
    // Without tailwind-merge both would survive and CSS order would decide.
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-neon', 'text-cyan')).toBe('text-cyan')
  })

  it('keeps non-conflicting utilities together', () => {
    expect(cn('flex items-center', 'gap-2')).toBe('flex items-center gap-2')
  })

  it('preserves custom utilities that Tailwind does not know about', () => {
    expect(cn('glass', 'rounded-glass')).toBe('glass rounded-glass')
  })
})

import { describe, expect, it } from 'vitest'

import { macropadLayout } from '../data/portfolio'
import { KEY_BINDINGS, isTypingTarget } from './useMacropadActions'

describe('KEY_BINDINGS', () => {
  it('exposes one binding per keycap that declares a key', () => {
    const withKeys = macropadLayout.filter((key) => key.key !== undefined)
    expect(KEY_BINDINGS.size).toBe(withKeys.length)
  })

  it('resolves every binding to a real keycap id', () => {
    const ids = new Set(macropadLayout.map((key) => key.id))
    for (const [, keycapId] of KEY_BINDINGS) {
      expect(ids.has(keycapId)).toBe(true)
    }
  })

  it('is keyed by the lowercase physical key', () => {
    for (const [key] of KEY_BINDINGS) {
      expect(key).toBe(key.toLowerCase())
    }
  })
})

describe('isTypingTarget', () => {
  it('detects editable form fields', () => {
    const input = document.createElement('input')
    const textarea = document.createElement('textarea')
    expect(isTypingTarget(input)).toBe(true)
    expect(isTypingTarget(textarea)).toBe(true)
  })

  it('detects contenteditable elements', () => {
    const div = document.createElement('div')
    div.contentEditable = 'true'
    Object.defineProperty(div, 'isContentEditable', { value: true })
    expect(isTypingTarget(div)).toBe(true)
  })

  it('ignores ordinary elements and non-element targets', () => {
    expect(isTypingTarget(document.createElement('div'))).toBe(false)
    expect(isTypingTarget(document.createElement('a'))).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
    expect(isTypingTarget(window)).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'

import { skills } from '../data/portfolio'
import { SECTION_IDS } from '../types'
import { isTypingTarget, SECTION_SHORTCUTS, SKILL_BINDINGS } from './useMacropadActions'

describe('SKILL_BINDINGS', () => {
  it('exposes one binding per skill', () => {
    expect(SKILL_BINDINGS.size).toBe(skills.length)
  })

  it('resolves every binding to a real skill id', () => {
    const ids = new Set(skills.map((skill) => skill.id))
    for (const [, skillId] of SKILL_BINDINGS) {
      expect(ids.has(skillId)).toBe(true)
    }
  })

  it('is keyed by a single lowercase character', () => {
    for (const [key] of SKILL_BINDINGS) {
      expect(key).toBe(key.toLowerCase())
      expect(key).toHaveLength(1)
    }
  })
})

describe('SECTION_SHORTCUTS', () => {
  it('covers every section exactly once', () => {
    const targets = Object.values(SECTION_SHORTCUTS)
    expect(new Set(targets).size).toBe(targets.length)
    expect([...targets].sort()).toEqual([...SECTION_IDS].sort())
  })

  it('uses letter mnemonics, so it can never collide with the digit skillmap', () => {
    for (const [key, target] of Object.entries(SECTION_SHORTCUTS)) {
      expect(key).toMatch(/^[a-z]$/)
      expect(SECTION_IDS).toContain(target)
    }
  })

  it('shares no key with the skill bindings', () => {
    for (const key of Object.keys(SECTION_SHORTCUTS)) {
      expect(SKILL_BINDINGS.has(key)).toBe(false)
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

import { describe, expect, it } from 'vitest'

import { ACCENT_CYCLE } from '../lib/accents'
import { SECTION_IDS } from '../types'
import {
  capabilities,
  CONTACT_EMAIL,
  credentials,
  macropadLayout,
  profile,
  projects,
  sections,
} from './portfolio'

describe('profile', () => {
  it('exposes at least one social link with an absolute https URL', () => {
    expect(profile.socials.length).toBeGreaterThan(0)
    for (const social of profile.socials) {
      expect(social.href).toMatch(/^https:\/\//)
    }
  })

  it('resolves to a contactable email address', () => {
    expect(CONTACT_EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
  })
})

describe('projects', () => {
  it('has unique ids', () => {
    const ids = projects.map((project) => project.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every project real content, a stack and a path', () => {
    for (const project of projects) {
      expect(project.name.length).toBeGreaterThan(0)
      expect(project.tagline.length).toBeGreaterThan(0)
      expect(project.description.length).toBeGreaterThan(0)
      expect(project.stack.length).toBeGreaterThan(0)
      expect(project.highlights.length).toBeGreaterThan(0)
      expect(project.path).toMatch(/^~\//)
    }
  })

  it('only references accents that the palette can actually render', () => {
    for (const project of projects) {
      expect(ACCENT_CYCLE).toContain(project.accent)
    }
  })

  it('links out safely', () => {
    for (const project of projects) {
      for (const link of project.links) {
        expect(link.href).toMatch(/^https:\/\//)
      }
    }
  })
})

describe('credentials', () => {
  it('has unique ids and a year on every entry', () => {
    const ids = credentials.map((credential) => credential.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const credential of credentials) {
      expect(credential.year).toMatch(/^\d{4}$/)
    }
  })
})

describe('capabilities', () => {
  it('has unique ids and no empty groups', () => {
    const ids = capabilities.map((group) => group.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const group of capabilities) {
      expect(group.items.length).toBeGreaterThan(0)
    }
  })
})

describe('macropadLayout', () => {
  it('is exactly the 3x3 pad', () => {
    expect(macropadLayout).toHaveLength(9)
  })

  it('has unique ids and a keyboard binding for every key', () => {
    const ids = macropadLayout.map((key) => key.id)
    expect(new Set(ids).size).toBe(ids.length)

    const keys = macropadLayout.map((key) => key.key)
    expect(keys.every((key) => key !== undefined)).toBe(true)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('maps every navigation keycap to a distinct scroll target', () => {
    const scrollActions = macropadLayout
      .map((key) => key.action)
      .filter((action) => action.startsWith('scroll-'))

    expect(new Set(scrollActions).size).toBe(scrollActions.length)
    expect(scrollActions).toHaveLength(SECTION_IDS.length)
  })
})

describe('sections', () => {
  it('covers every section id exactly once, in order, with a label', () => {
    expect(sections.map((section) => section.id)).toEqual([...SECTION_IDS])
    for (const section of sections) {
      expect(section.label.length).toBeGreaterThan(0)
    }
  })
})

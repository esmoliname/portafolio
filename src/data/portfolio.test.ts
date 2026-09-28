import { describe, expect, it } from 'vitest'

import { ACCENT_CYCLE } from '../lib/accents'
import { SECTION_IDS } from '../types'
import {
  capabilities,
  CONTACT_EMAIL,
  credentials,
  profile,
  projects,
  projectsForSkill,
  sections,
  skills,
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

describe('skills', () => {
  it('is exactly the 3x3 pad', () => {
    expect(skills).toHaveLength(9)
  })

  it('has unique ids, legends and keyboard bindings', () => {
    const ids = skills.map((skill) => skill.id)
    const legends = skills.map((skill) => skill.legend)
    const keys = skills.map((skill) => skill.key)

    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(legends).size).toBe(legends.length)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('binds every keycap to 1-9, since the pad is the only digit surface', () => {
    expect(skills.map((skill) => skill.key).sort()).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
    ])
  })

  it('can never collide with the section navigation keymap', () => {
    // Navigation is T/A/P/S/C on the keyboard. A skill bound to a letter would
    // make the two keymaps ambiguous, so digits are mandatory.
    for (const skill of skills) {
      expect(skill.key).toMatch(/^[0-9]$/)
    }
  })

  it('gives every skill a real slogan, description and category', () => {
    for (const skill of skills) {
      expect(skill.name.length).toBeGreaterThan(0)
      expect(skill.slogan.length).toBeGreaterThan(10)
      expect(skill.description.length).toBeGreaterThan(40)
      expect(skill.category.length).toBeGreaterThan(0)
      expect(skill.legend.length).toBeLessThanOrEqual(3)
    }
  })

  it('only references accents the palette can render', () => {
    for (const skill of skills) {
      expect(ACCENT_CYCLE).toContain(skill.accent)
    }
  })

  it('only points usedIn at projects that actually exist', () => {
    const ids = new Set(projects.map((project) => project.id))
    for (const skill of skills) {
      for (const id of skill.usedIn) {
        expect(ids.has(id)).toBe(true)
      }
    }
  })
})

describe('projectsForSkill', () => {
  it('resolves every usedIn id to a project object', () => {
    for (const skill of skills) {
      const resolved = projectsForSkill(skill)
      expect(resolved).toHaveLength(skill.usedIn.length)
      for (const project of resolved) {
        expect(project.name.length).toBeGreaterThan(0)
      }
    }
  })

  it('drops dangling ids instead of rendering a broken reference', () => {
    const ghost = { ...skills[0]!, id: 'ghost', usedIn: ['does-not-exist'] }
    expect(projectsForSkill(ghost)).toHaveLength(0)
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

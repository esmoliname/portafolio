import { describe, expect, it } from 'vitest'

import { SECTION_IDS } from '../types'
import { dimColor, MACROPAD_POSES, SCENE_BACKGROUND } from './macropadPoses'

describe('MACROPAD_POSES', () => {
  it('defines a pose for every section, so the pad can never lose its transform', () => {
    for (const id of SECTION_IDS) {
      expect(MACROPAD_POSES[id]).toBeDefined()
    }
  })

  it('gives every pose three position and three rotation components', () => {
    for (const pose of Object.values(MACROPAD_POSES)) {
      expect(pose.position).toHaveLength(3)
      expect(pose.rotation).toHaveLength(3)
      for (const n of [...pose.position, ...pose.rotation]) {
        expect(Number.isFinite(n)).toBe(true)
      }
    }
  })

  it('keeps every dim inside 0..1 and every scale positive', () => {
    for (const pose of Object.values(MACROPAD_POSES)) {
      expect(pose.dim).toBeGreaterThanOrEqual(0)
      expect(pose.dim).toBeLessThanOrEqual(1)
      expect(pose.scale).toBeGreaterThan(0)
    }
  })

  it('puts the pad in the right half for the skills section, leaving room for the panel', () => {
    expect(MACROPAD_POSES.stack.position[0]).toBeGreaterThan(0)
    expect(MACROPAD_POSES.stack.dim).toBe(0)
  })

  it('recedes the pad into the background for the projects section', () => {
    // Behind the camera-facing plane, and dimmer than the skills pose.
    expect(MACROPAD_POSES.projects.position[2]).toBeLessThan(MACROPAD_POSES.stack.position[2])
    expect(MACROPAD_POSES.projects.dim).toBeGreaterThan(MACROPAD_POSES.stack.dim)
  })

  it('mirrors the pad to the opposite side for the contact section', () => {
    // Panel right / form left means the pad crosses the axis.
    expect(MACROPAD_POSES.contact.position[0]).toBeLessThan(0)
  })
})

describe('dimColor', () => {
  it('returns the input untouched at dim 0', () => {
    expect(dimColor('#ff0000', 0)).toBe('#ff0000')
  })

  it('fades toward the background at dim 1', () => {
    expect(dimColor('#ff0000', 1)).toBe(hexToRgbString(SCENE_BACKGROUND))
  })

  it('clamps out-of-range input instead of extrapolating into garbage', () => {
    // A lerp past 1 would invent colours outside the endpoint; a negative one
    // would oversaturate. Both must collapse to a valid endpoint.
    expect(dimColor('#ff0000', 5)).toBe(dimColor('#ff0000', 1))
    expect(dimColor('#ff0000', -3)).toBe('#ff0000')
  })

  it('always returns a parseable colour', () => {
    for (const dim of [0, 0.25, 0.5, 0.75, 1]) {
      expect(dimColor('#39ff9e', dim)).toMatch(/^#?[0-9a-f]{3}([0-9a-f]{3})?$|^rgb\(/)
    }
  })
})

function hexToRgbString(hex: string): string {
  const clean = hex.replace('#', '')
  return `rgb(${Number.parseInt(clean.slice(0, 2), 16)}, ${Number.parseInt(clean.slice(2, 4), 16)}, ${Number.parseInt(clean.slice(4, 6), 16)})`
}

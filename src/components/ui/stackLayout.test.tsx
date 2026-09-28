import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StackSection } from './StackSection'

/**
 * Regression guard for a real bug: the WebGL canvas sits behind
 * `<main class="relative z-10">`, and every `<section>` is a full-width block.
 * The sections therefore swallowed every click and the macropad keycaps had
 * never been clickable at all — invisible to typecheck, invisible to build,
 * invisible to every other test in the suite.
 *
 * The contract these assertions protect: the skills section must let pointer
 * events fall through to the canvas everywhere except the panel and the cards.
 */
describe('StackSection pointer-events contract', () => {
  it('keeps its id, which is what the scroll observer and the T/A/P/S/C keymap target', () => {
    render(<StackSection />)
    expect(document.getElementById('stack')).not.toBeNull()
    expect(document.getElementById('stack')?.tagName).toBe('SECTION')
  })

  it('keeps the max-width wrapper transparent so clicks reach the canvas', () => {
    const { container } = render(<StackSection />)
    const wrapper = container.querySelector('#stack > div')

    // Without this, the hit test falls through the transparent grid straight
    // onto this wrapper, which `main > section > *` in index.css re-enables.
    expect(wrapper?.className).toContain('pointer-events-none')
  })

  it('re-enables the pointer only on the panel column and the capability cards', () => {
    const { container } = render(<StackSection />)
    const auto = [...container.querySelectorAll('.pointer-events-auto')]

    // One column holding the panel, plus the capability list.
    expect(auto.length).toBeGreaterThanOrEqual(2)
    for (const element of auto) {
      expect(element.className).not.toContain('pointer-events-none')
    }
  })

  it('leaves the right-hand cell empty so the keycaps underneath stay clickable', () => {
    const { container } = render(<StackSection />)
    // A populated right cell would sit on top of the pad and eat its clicks.
    const spacers = [...container.querySelectorAll('div[aria-hidden="true"]')]
    expect(spacers.length).toBeGreaterThan(0)
    for (const spacer of spacers) {
      expect(spacer.childElementCount).toBe(0)
      expect(spacer.textContent).toBe('')
    }
  })

  it('exposes the panel readout, so a non-3D visitor can still reach every skill', () => {
    render(<StackSection />)
    // aria-live is what makes the selection audible instead of purely visual.
    expect(document.querySelectorAll('[aria-live="polite"]').length).toBeGreaterThan(0)
  })
})

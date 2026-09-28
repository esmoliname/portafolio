import { describe, expect, it } from 'vitest'

// `?raw` is resolved by Vite, so this needs no Node types in the app tsconfig.
import appSource from '../../App.tsx?raw'

/**
 * Regression guard for a bug that typecheck, build and the whole test suite
 * happily passed while shipping a completely invisible WebGL layer.
 *
 * Why a source-level assertion is the honest test here: jsdom has no layout
 * engine, no stacking contexts and no paint order, so the failure is
 * structurally unobservable from the DOM. The only thing a test can actually
 * pin is the invariant that caused it.
 */

/**
 * Comments are stripped before any assertion. App.tsx documents this very bug
 * in prose, and a naive source scan matches its own explanation — the first
 * version of this test failed on the comment that explained the fix.
 */
const code = appSource
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/.*$/gm, '$1')

/** Class lists actually applied to elements, never prose about them. */
const appliedClasses: string[] = [...code.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)].map(
  (match) => `${match[1] ?? ''} ${match[2] ?? ''}`,
)

/** Every Tailwind negative z-index utility, in both notations. */
const NEGATIVE_Z_UTILITY = /-z-\[\d+\]|-z-\d+/

describe('WebGL layer stacking contract', () => {
  it('never applies a negative z-index to any element', () => {
    // `position: relative` + `z-index: auto` establishes no stacking context, so
    // a negative z-index child stacks against the DOCUMENT root (paint step 2)
    // and is covered by the root's opaque background (paint step 6). The scene
    // rendered perfectly and was hidden behind a solid #050608 rectangle.
    for (const classList of appliedClasses) {
      expect(classList, `negative z-index in: ${classList}`).not.toMatch(NEGATIVE_Z_UTILITY)
    }
  })

  it('mounts the scene as a full-viewport fixed layer', () => {
    const sceneTag = code.match(/<Scene\b[^>]*\/>/)
    expect(sceneTag).not.toBeNull()

    const className = sceneTag?.[0] ?? ''
    expect(className).toContain('fixed')
    expect(className).toContain('inset-0')
    expect(className).toContain('h-screen')
    expect(className).toContain('w-full')
    expect(className).toContain('z-0')
  })

  it('keeps the layer explicitly hit-testable', () => {
    // The scene host now uses `pointer-events-none` on the container div,
    // but the inner Canvas receives `style={{ pointerEvents: 'auto' }}`,
    // so hit-testing works. This is more explicit than relying on R3F's
    // internal inline style, and works with the CSS rule
    // `main > section { pointer-events: none }` in index.css.
    const sceneTag = code.match(/<Scene\b[^>]*\/>/)?.[0] ?? ''
    expect(sceneTag).toContain('pointer-events-none')
  })

  it('keeps <main> stacked above the scene', () => {
    const mainTag = code.match(/<main\b[^>]*>/)?.[0] ?? ''
    expect(mainTag).toContain('z-10')
  })

  it('keeps the root wrapper from creating a stacking context over the layer', () => {
    // If this div ever gains `isolate` or an explicit z-index, the layer's
    // stacking parent changes and the contract above must be re-derived.
    const rootTag = code.match(/<div className="relative min-h-screen[^"]*"/)?.[0] ?? ''
    expect(rootTag).not.toMatch(/isolate|z-\[?-?\d/)
  })

  it('uses the same stacking on the Suspense fallback, not just the scene', () => {
    // A fallback that disagrees with the real layer flashes a full-screen
    // opaque div over the page on every cold load.
    const fallbackTag = code.match(/fallback=\{([\s\S]*?)\n\s*\}/)?.[1] ?? ''
    expect(fallbackTag).toContain('z-0')
    expect(fallbackTag).not.toMatch(NEGATIVE_Z_UTILITY)
  })
})

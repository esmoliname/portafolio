import { Suspense, lazy, useEffect } from 'react'

import { AudioToggle } from './components/overlay/AudioToggle'
import { ScrollHint } from './components/overlay/ScrollHint'
import { About } from './components/ui/About'
import { BentoGrid } from './components/ui/BentoGrid'
import { Contact } from './components/ui/Contact'
import { Footer } from './components/ui/Footer'
import { Hero } from './components/ui/Hero'
import { Nav } from './components/ui/Nav'
import { SkillPanel } from './components/ui/SkillPanel'
import { StackSection } from './components/ui/StackSection'
import { useKeyboard } from './hooks/useKeyboard'
import { useSectionObserver } from './hooks/useSectionObserver'
import { ACCENTS } from './lib/accents'
import { usePortfolioStore } from './store/usePortfolioStore'

/**
 * The WebGL layer pulls in ~1.1 MB (min) of three.js. Loading it lazily lets the
 * DOM content paint while that chunk streams in, instead of blocking first
 * paint on the whole 3D runtime.
 */
const Scene = lazy(async () => {
  const module = await import('./components/canvas/Scene')
  return { default: module.Scene }
})

/** Shared page shell: fixed WebGL backdrop, scrollable glassmorphic content. */
export default function App(): React.JSX.Element {
  const accent = usePortfolioStore((state) => state.accent)

  useKeyboard()
  useSectionObserver()

  // Publish the live accent as a custom property so CSS-only effects (page
  // glow, scrollbar) track the macropad's accent key.
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-live', ACCENTS[accent].hex)
  }, [accent])

  return (
    <div className="relative min-h-screen bg-void">
      {/*
        The WebGL layer is `z-0`, NOT `-z-10`. A negative z-index child of this
        root div stacks against the DOCUMENT root, not against this div, because
        `relative` + `z-index: auto` establishes no stacking context — so the
        layer landed in step 2 of the paint order while this div's opaque
        `bg-void` painted in step 6, on top of it. The scene rendered and was
        completely hidden. `z-0` puts it after the page background and below
        `main`'s `z-10`, which is the sandwich a fixed backdrop needs.
      */}
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="fixed inset-0 z-0 grid-lines bg-void"
          />
        }
      >
        <Scene className="pointer-events-none fixed inset-0 z-0 h-screen w-full" />
      </Suspense>

      <a
        href="#projects"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-elevated focus:px-4 focus:py-2 focus:text-neon"
      >
        Saltar al contenido
      </a>

      <Nav />

      <main className="relative z-10">
        <Hero />
        <About />

        <section id="projects" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <header className="mb-10">
            <p className="font-mono text-sm text-neon">~/projects</p>
            <h2 className="mt-2 font-mono text-3xl font-bold text-ink sm:text-4xl">
              Proyectos destacados
            </h2>
          </header>
          <BentoGrid />
        </section>

        <StackSection />
        <Contact />
      </main>

      {/* Global SkillPanel - accessible from all sections via keyboard (1-9) or click */}
      <SkillPanel className="fixed left-6 bottom-6 z-40 w-80 max-w-[90vw] lg:left-auto lg:right-6 lg:bottom-6" />

      <Footer />

      <AudioToggle />
      <ScrollHint />
    </div>
  )
}

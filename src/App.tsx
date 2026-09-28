import { Suspense, lazy, useEffect } from 'react'

import { AudioToggle } from './components/overlay/AudioToggle'
import { ScrollHint } from './components/overlay/ScrollHint'
import { About } from './components/ui/About'
import { BentoGrid } from './components/ui/BentoGrid'
import { Contact } from './components/ui/Contact'
import { Footer } from './components/ui/Footer'
import { Hero } from './components/ui/Hero'
import { Nav } from './components/ui/Nav'
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
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="fixed inset-0 -z-10 grid-lines bg-void"
          />
        }
      >
        <Scene className="fixed inset-0 -z-10 h-full w-full" />
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

      <Footer />

      <AudioToggle />
      <ScrollHint />
    </div>
  )
}

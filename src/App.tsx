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
 * Spline 3D scene loaded lazily for optimal performance.
 * The Spline runtime is loaded on demand, allowing the DOM content
 * to paint first while the 3D scene streams in.
 */
const SplineScene = lazy(async () => {
  const module = await import('./components/canvas/SplineScene')
  return { default: module.SplineScene }
})

/** Shared page shell: fixed Spline 3D backdrop, scrollable glassmorphic content. */
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
        The Spline layer sits at z-0 as a fixed backdrop behind all content.
        The main content at z-10 sits on top, with sections opting out of
        pointer events so the 3D scene remains interactive.
      */}
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="fixed inset-0 z-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_#0d1117_0%,_#050508_100%)]"
          >
            <div className="text-center space-y-4 text-zinc-500 font-mono">
              <div className="inline-flex items-center gap-2 animate-pulse">
                <svg className="size-6 text-neon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span className="text-sm">Cargando motor 3D...</span>
              </div>
              <p className="text-xs text-zinc-600">Inicializando escena Spline</p>
            </div>
          </div>
        }
      >
        <SplineScene className="pointer-events-none fixed inset-0 z-0 h-screen w-full" />
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

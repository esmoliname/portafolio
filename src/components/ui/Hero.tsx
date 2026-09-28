import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { JSX } from 'react'

import { profile } from '../../data/portfolio'
import { ACCENTS } from '../../lib/accents'
import { cn } from '../../lib/cn'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import type { SectionId } from '../../types'

/** Smooth-scroll to a section and mark it active. */
function scrollToSection(id: SectionId): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  usePortfolioStore.getState().setActiveSection(id)
}

/** Full-viewport intro: terminal prompt, identity and the two primary CTAs. */
export function Hero(): JSX.Element {
  const accent = usePortfolioStore((s) => s.accent)
  const theme = ACCENTS[accent]
  const reduceMotion = useReducedMotion()
  const surname = profile.name.slice(profile.firstName.length).trim()

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24 pb-32"
    >
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0" />
      {/*
        Legibility veil for the headline, not a scene mask. It used to end at a
        fully opaque `to-void`, which hid the lower half of the WebGL layer once
        the z-index bug was fixed. Capped at 80% so the centred macropad stays
        readable through it while the copy keeps its contrast.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/25 via-void/45 to-void/80"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={cn('font-mono text-sm tracking-wide', theme.text)}
        >
          <span aria-hidden="true">&gt;</span> ./initialize --profile
          <span aria-hidden="true" className="ml-1 inline-block animate-blink">
            _
          </span>
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08, ease: 'easeOut' }}
          className="mt-6 font-mono text-5xl font-bold leading-tight tracking-tight text-glow sm:text-6xl lg:text-7xl"
        >
          <span className={theme.text}>{profile.firstName}</span>{' '}
          <span className="text-ink">{surname}</span>
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.16, ease: 'easeOut' }}
          className="mt-5 max-w-2xl font-mono text-sm text-ink-dim sm:text-base"
        >
          {profile.role}
        </motion.p>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-ink-dim"
        >
          {profile.tagline}
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.32, ease: 'easeOut' }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <button
            type="button"
            onClick={() => scrollToSection('projects')}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-mono text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5',
              theme.bg,
              theme.border,
              theme.text,
            )}
          >
            Ver proyectos
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('contact')}
            className={cn(
              'glass inline-flex items-center gap-2 rounded-xl px-6 py-3',
              'font-mono text-sm font-semibold transition-colors duration-200',
              theme.text,
            )}
          >
            Contactame
          </button>
        </motion.div>
      </div>
    </section>
  )
}

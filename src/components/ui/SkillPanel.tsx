import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import type { JSX } from 'react'

import { projectsForSkill } from '../../data/portfolio'
import { ACCENTS } from '../../lib/accents'
import { cn } from '../../lib/cn'
import { useActiveSkill, usePortfolioStore } from '../../store/usePortfolioStore'

/** Shown while no keycap is selected, so the affordance is never hidden. */
const IDLE_HINT = 'Presioná una tecla del macropad · 1–9'
const IDLE_TITLE = 'Explorador de stack'
const IDLE_BODY = 'Cada tecla es una tecnología. Elegí una para ver en qué proyectos la usé.'

/** Read out when a skill has no project behind it. */
const NO_PROJECTS = 'Uso transversal a todos los proyectos'

/**
 * Left-hand readout for the selected keycap.
 *
 * The panel is about the selected technology, so it wears that technology's
 * accent rather than the global theme accent — the only place the global accent
 * shows up is the idle hint, which is not about any skill.
 *
 * Purely a readout: nothing here takes focus, and the changing content sits in
 * an `aria-live` region so a screen reader announces the new selection instead
 * of leaving the visitor guessing what the 3D scene just did.
 */
export function SkillPanel(): JSX.Element {
  const skill = useActiveSkill()
  const themeAccent = usePortfolioStore((state) => state.accent)
  const clearSkill = usePortfolioStore((state) => state.clearSkill)
  const reduceMotion = useReducedMotion()

  const theme = ACCENTS[themeAccent]
  // The skill owns the panel's colour; the theme accent is only a fallback.
  const palette = ACCENTS[skill?.accent ?? themeAccent]
  const projects = skill ? projectsForSkill(skill) : []

  const slide = reduceMotion ? 0 : 14

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {skill ? (
          <motion.aside
            key={skill.id}
            initial={{ opacity: 0, x: -slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slide }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={cn('glass rounded-2xl p-6', palette.border)}
          >
            <div className="flex items-start justify-between gap-4">
              <p
                className={cn(
                  'font-mono text-[11px] uppercase tracking-[0.2em]',
                  palette.text,
                )}
              >
                {skill.category}
              </p>

              <button
                type="button"
                onClick={clearSkill}
                aria-label={`Cerrar el detalle de ${skill.name}`}
                className={cn(
                  '-mt-1 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
                  'transition-colors duration-200 hover:bg-ink/10',
                  palette.text,
                )}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* The live region wraps the whole changing body so a new selection
                is announced as one utterance instead of six fragments. */}
            <div role="status" aria-live="polite" aria-atomic="true">
              <h3
                className={cn(
                  'mt-2 font-mono text-4xl font-bold leading-none tracking-tight',
                  palette.text,
                  'text-glow',
                )}
              >
                {skill.name}
              </h3>

              <p className="mt-4 text-lg font-semibold leading-snug text-ink">{skill.slogan}</p>

              <p className="mt-3 text-sm leading-relaxed text-ink-dim">{skill.description}</p>

              <p className="mt-5 font-mono text-xs text-ink-faint">
                Tecla{' '}
                <span className={cn('rounded border px-1.5 py-0.5', palette.border, palette.text)}>
                  {skill.key}
                </span>
              </p>

              <p className="mt-5 font-mono text-xs text-ink-faint">
                <span className="text-ink-dim">Usada en</span>{' '}
                {projects.length > 0
                  ? projects.map((project) => project.name).join(' · ')
                  : NO_PROJECTS}
              </p>
            </div>
          </motion.aside>
        ) : (
          <motion.aside
            key="idle"
            initial={{ opacity: 0, x: -slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slide }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="glass rounded-2xl p-6"
          >
            <div role="status" aria-live="polite" aria-atomic="true">
              <p className={cn('font-mono text-[11px] uppercase tracking-[0.2em]', theme.text)}>
                ~/stack
              </p>
              <h3 className="mt-2 font-mono text-xl font-semibold text-ink">{IDLE_TITLE}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-dim">{IDLE_BODY}</p>
              <p className="mt-4 font-mono text-xs text-ink-faint">{IDLE_HINT}</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { JSX } from 'react'

import { ACCENTS } from '../../lib/accents'
import { usePortfolioStore } from '../../store/usePortfolioStore'

/** Bottom-center "keep scrolling" chevron, visible only on the hero. */
export function ScrollHint(): JSX.Element | null {
  const activeSection = usePortfolioStore((s) => s.activeSection)
  const accent = usePortfolioStore((s) => s.accent)
  const theme = ACCENTS[accent]
  const reduceMotion = useReducedMotion()

  if (activeSection !== 'hero') return null

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 text-center">
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
        transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-flex flex-col items-center gap-1"
      >
        <span className={theme.text} role="presentation" aria-hidden="true">
          <ChevronDown className="size-5" />
        </span>
        <span className="font-mono text-xs text-ink-faint">Scroll</span>
      </motion.div>
      <span className="sr-only">Scroll down</span>
    </div>
  )
}

import { GitBranch } from 'lucide-react'
import type { JSX } from 'react'

import { profile, sections } from '../../data/portfolio'
import { ACCENTS } from '../../lib/accents'
import { cn } from '../../lib/cn'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import type { SectionId } from '../../types'

/**
 * Smooth-scroll a section into view and mark it active.
 *
 * `getElementById` returns `| null`, so the optional call is the guard: the
 * section may not be mounted yet when the handler runs.
 */
function scrollToSection(id: SectionId): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  usePortfolioStore.getState().setActiveSection(id)
}

/** Fixed top bar: brand, section links and a GitHub shortcut. */
export function Nav(): JSX.Element {
  const activeSection = usePortfolioStore((s) => s.activeSection)
  const accent = usePortfolioStore((s) => s.accent)
  const theme = ACCENTS[accent]
  const github = profile.socials[0]

  return (
    <nav aria-label="Navegación principal" className="glass fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <span className="shrink-0 font-mono text-sm tracking-tight text-ink">
          {profile.name}
        </span>

        <ul className="flex items-center gap-1">
          {sections.map((section) => {
            const isActive = section.id === activeSection
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    scrollToSection(section.id)
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative block px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors',
                    isActive ? theme.text : 'text-ink-dim hover:text-ink',
                  )}
                >
                  {section.label}
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-2 bottom-0 h-px"
                      style={{ backgroundColor: theme.hex }}
                    />
                  ) : null}
                </a>
              </li>
            )
          })}
        </ul>

        {github ? (
          <a
            href={github.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${github.label} — ${github.handle}`}
            className={cn(
              'shrink-0 rounded-lg border p-2 transition-colors',
              theme.border,
              theme.bg,
              theme.text,
            )}
          >
            <GitBranch className="size-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </nav>
  )
}

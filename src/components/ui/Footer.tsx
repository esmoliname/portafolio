import { Briefcase, CircleUser, GitBranch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

import { profile } from '../../data/portfolio'
import { cn } from '../../lib/cn'

/**
 * Icon per social label, lowercased.
 *
 * lucide v1 has no brand icons, so the labels map to metaphors. The lookup is
 * `| undefined` under `noUncheckedIndexedAccess` — `CircleUser` covers it.
 */
const SOCIAL_ICONS: Readonly<Record<string, LucideIcon>> = {
  github: GitBranch,
  linkedin: Briefcase,
}

/** Site footer: attribution, year, socials and the stack credit. */
export function Footer(): JSX.Element {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-neon/15 px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <p className="font-mono text-xs text-ink-faint">
          © {year} {profile.name}
        </p>

        <ul className="flex items-center gap-2">
          {profile.socials.map((social) => {
            const Icon = SOCIAL_ICONS[social.label.toLowerCase()] ?? CircleUser

            return (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${social.label} — ${social.handle}`}
                  className={cn(
                    'inline-flex items-center justify-center rounded-lg border border-neon/20 p-2',
                    'text-ink-dim transition-colors hover:bg-neon/10 hover:text-neon',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="mt-6 text-center font-mono text-xs text-ink-faint">
        Built with React 19, Three.js, WebGL &amp; Tailwind CSS
      </p>
    </footer>
  )
}

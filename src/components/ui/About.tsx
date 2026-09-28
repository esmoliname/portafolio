import { BadgeCheck, FlaskConical, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

import { credentials, profile } from '../../data/portfolio'
import { ACCENTS } from '../../lib/accents'
import { cn } from '../../lib/cn'
import type { Accent, CredentialKind } from '../../types'

interface CredentialTheme {
  readonly Icon: LucideIcon
  readonly accent: Accent
}

/**
 * Icon + accent per credential kind.
 *
 * `Record<CredentialKind, …>` uses literal keys, so the lookup stays a total
 * `CredentialTheme` — `noUncheckedIndexedAccess` never widens it.
 */
const KIND_THEME: Record<CredentialKind, CredentialTheme> = {
  certification: { Icon: BadgeCheck, accent: 'neon' },
  role: { Icon: Users, accent: 'cyan' },
  membership: { Icon: FlaskConical, accent: 'violet' },
}

/** Profile narrative plus the credential wall. */
export function About(): JSX.Element {
  return (
    <section id="about" className="relative px-6 py-24">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="font-mono text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          <span className="text-neon">01</span> // Perfil
        </h2>

        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ink-dim">{profile.bio}</p>

        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {credentials.map((credential) => {
            const { Icon, accent } = KIND_THEME[credential.kind]
            const theme = ACCENTS[accent]

            return (
              <li
                key={credential.id}
                className={cn(
                  'flex flex-col gap-3 rounded-2xl border p-6 transition-transform duration-300 hover:-translate-y-1',
                  'bg-zinc-900/95 backdrop-blur-md border-zinc-800/80 shadow-2xl',
                  theme.border,
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      'inline-flex size-10 items-center justify-center rounded-xl',
                      theme.bg,
                      theme.text,
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className={cn('font-mono text-xs', theme.text)}>{credential.year}</span>
                </div>

                <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
                  {credential.issuer}
                </p>
                <h3 className="font-mono text-base font-semibold text-ink">{credential.title}</h3>
                <p className="text-sm leading-relaxed text-ink-dim">{credential.detail}</p>

                {credential.verifiedId ? (
                  <span
                    className={cn(
                      'mt-1 w-fit rounded-full border px-2.5 py-1 font-mono text-xs',
                      theme.border,
                      theme.text,
                    )}
                  >
                    {credential.verifiedId}
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

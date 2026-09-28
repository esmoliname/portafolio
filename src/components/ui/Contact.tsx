import { Briefcase, CircleUser, GitBranch, GraduationCap, Mail, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

import { CONTACT_EMAIL, profile } from '../../data/portfolio'

/**
 * Icon per social label, lowercased.
 *
 * lucide v1 dropped every brand icon, so `github` / `linkedin` map to
 * metaphors. The `Record<string, …>` index is `| undefined` under
 * `noUncheckedIndexedAccess`, hence the `CircleUser` fallback at the call site.
 */
const SOCIAL_ICONS: Readonly<Record<string, LucideIcon>> = {
  github: GitBranch,
  linkedin: Briefcase,
}

/** Contact section: social cards, e-mail and where the work happens. */
export function Contact(): JSX.Element {
  return (
    <section id="contact" className="relative px-6 py-24">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="font-mono text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          <span className="text-violet">04</span> // Contacto
        </h2>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-8 flex items-center gap-4 rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 shadow-2xl"
        >
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-violet/10 text-violet">
            <Mail className="size-6" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block font-mono text-xs uppercase tracking-widest text-ink-faint">
              Email
            </span>
            <span className="block truncate font-mono text-sm text-ink sm:text-base">
              {CONTACT_EMAIL}
            </span>
          </span>
        </a>

        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profile.socials.map((social) => {
            const Icon = SOCIAL_ICONS[social.label.toLowerCase()] ?? CircleUser

            return (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${social.label} — ${social.handle}`}
                  className="group flex items-center gap-4 rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 shadow-2xl"
                >
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-neon/10 text-neon transition-colors group-hover:bg-neon/20">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-xs uppercase tracking-widest text-ink-faint">
                      {social.label}
                    </span>
                    <span className="block truncate font-mono text-sm text-ink">
                      {social.handle}
                    </span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>

        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl p-5 bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 shadow-2xl">
            <MapPin className="size-5 shrink-0 text-neon" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="font-mono text-xs uppercase tracking-widest text-ink-faint">
                Ubicación
              </dt>
              <dd className="truncate text-sm text-ink">{profile.location}</dd>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl p-5 bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 shadow-2xl">
            <GraduationCap className="size-5 shrink-0 text-cyan" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="font-mono text-xs uppercase tracking-widest text-ink-faint">
                Institución
              </dt>
              <dd className="truncate text-sm text-ink">{profile.institution}</dd>
            </div>
          </div>
        </dl>
      </div>
    </section>
  )
}

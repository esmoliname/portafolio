import { Boxes } from 'lucide-react'
import type { JSX } from 'react'

import { capabilities } from '../../data/portfolio'
import { cn } from '../../lib/cn'

/** Capability groups rendered as three glass panels of mono chips. */
export function StackSection(): JSX.Element {
  return (
    <section id="stack" className="relative px-6 py-24">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="font-mono text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          <span className="text-cyan">03</span> // Stack
        </h2>

        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {capabilities.map((group) => (
            <li key={group.id} className="glass flex flex-col gap-4 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <Boxes className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-mono text-base font-semibold text-ink">{group.label}</h3>
              </div>

              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className={cn(
                      'rounded-lg border border-cyan/20 bg-cyan/5 px-2.5 py-1',
                      'font-mono text-xs text-ink-dim',
                    )}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

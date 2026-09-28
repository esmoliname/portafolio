import { Boxes } from 'lucide-react'
import type { JSX } from 'react'

import { capabilities } from '../../data/portfolio'
import { cn } from '../../lib/cn'
import { SkillPanel } from './SkillPanel'

/** How to drive the pad, in the same mono register as the rest of the page. */
const INSTRUCTIONS = [
  'Hacé clic en una tecla o presioná 1–9 para ver la tecnología.',
  'T / A / P / S / C navegan entre secciones.',
]

/**
 * Skills section: the info panel owns the left column, the 3D pad owns the right.
 *
 * Pointer-events plumbing, because the WebGL layer sits *behind* the DOM and
 * would otherwise be unclickable: `src/index.css` makes every `<section>` in
 * `<main>` transparent to the pointer and re-enables it on direct children. That
 * rule alone is not enough here — the hit test falls through the transparent grid
 * to this wrapper, which the rule re-enabled, so the wrapper has to opt back out
 * and only the genuinely interactive parts opt in.
 *
 * The capability cards deliberately keep the pointer: they are real content, and
 * when one of them happens to sit over the pad, content wins over scenery.
 */
export function StackSection(): JSX.Element {
  return (
    <section id="stack" className="relative px-6 py-24">
      <div className="pointer-events-none mx-auto w-full max-w-6xl">
        <header className="pointer-events-auto">
          <h2 className="font-mono text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            <span className="text-cyan">03</span> // Stack
          </h2>

          <ul className="mt-4 space-y-1 font-mono text-xs leading-relaxed text-ink-faint">
            {INSTRUCTIONS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </header>

        {/* Row 1: panel left, pad right. The right cell is a deliberately empty
            spacer so the keycaps underneath stay clickable. */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[26rem_1fr]">
          <div className="pointer-events-auto">
            <SkillPanel />
          </div>

          <div aria-hidden="true" className="hidden lg:block" />
        </div>

        {/* Row 2: full width, so the chips keep a readable measure instead of
            being crushed into the 26rem column above. */}
        <ul className="pointer-events-auto mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
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

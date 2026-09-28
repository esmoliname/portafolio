import type { JSX } from 'react'

import { projects } from '../../data/portfolio'
import { cn } from '../../lib/cn'
import type { BentoSpan } from '../../types'
import { ProjectCard } from './ProjectCard'

/**
 * Deterministic bento footprints, keyed by `BentoSpan`.
 *
 * Keying on the span (not the array index) keeps the layout stable if the
 * project order ever changes. These footprints tile the grid with zero holes at
 * every breakpoint, which is why `wide` widens to two columns on `lg`:
 *
 * - `md` (3 cols): feature takes c1-c2, wide takes c3 across r1-r2, so the two
 *   compacts land on r2 c1 and r2 c2 — a full 3x2 block.
 * - `lg` (4 cols): feature takes c1-c2, wide takes c3-c4 across r1-r2, and the
 *   compacts land on r2 c1 and r2 c2 — a full 4x2 block.
 */
const BENTO_SPAN: Record<BentoSpan, string> = {
  compact: '',
  feature: 'md:col-span-2',
  wide: 'md:col-span-1 md:row-span-2 lg:col-span-2',
}

/** Responsive bento grid of {@link ProjectCard}s, one per project. */
export function BentoGrid(): JSX.Element {
  return (
    <div className="grid grid-cols-1 auto-rows-[minmax(0,auto)] gap-4 md:grid-cols-3 lg:grid-cols-4">
      {projects.map((project, index) => (
        <div key={project.id} className={cn(BENTO_SPAN[project.span])}>
          <ProjectCard project={project} index={index} />
        </div>
      ))}
    </div>
  )
}

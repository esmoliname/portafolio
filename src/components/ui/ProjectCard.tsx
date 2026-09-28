import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { JSX } from 'react'

import { ACCENTS } from '../../lib/accents'
import { cn } from '../../lib/cn'
import type { Project } from '../../types'

interface ProjectCardProps {
  readonly project: Project
  /** Position in the bento grid — drives the staggered entrance. */
  readonly index: number
}

/** A single project: path, narrative, highlights, stack and outbound links. */
export function ProjectCard({ project, index }: ProjectCardProps): JSX.Element {
  const reduceMotion = useReducedMotion()
  const theme = ACCENTS[project.accent]

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay: reduceMotion ? 0 : index * 0.08,
        ease: 'easeOut',
      }}
      className={cn(
        'glass group flex h-full flex-col gap-4 rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1',
        theme.border,
        theme.glow,
      )}
    >
      <p className={cn('font-mono text-xs', theme.text)}>{project.path}</p>

      <div>
        <h3 className="font-mono text-lg font-semibold text-ink">{project.name}</h3>
        <p className={cn('mt-1 text-sm font-medium', theme.text)}>{project.tagline}</p>
      </div>

      <p className="text-sm leading-relaxed text-ink-dim">{project.description}</p>

      <ul className="flex flex-wrap gap-2">
        {project.highlights.map((highlight) => (
          <li
            key={highlight}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs text-ink-dim',
              theme.border,
              theme.bg,
            )}
          >
            {highlight}
          </li>
        ))}
      </ul>

      <ul className={cn('flex flex-wrap gap-2 border-t pt-4', theme.border)}>
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-md bg-neon/5 px-2 py-1 font-mono text-xs text-ink-faint"
          >
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap gap-3 pt-2">
        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              'inline-flex items-center gap-1.5 font-mono text-xs underline-offset-4 transition-colors hover:underline',
              theme.text,
            )}
          >
            {link.label}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        ))}
      </div>
    </motion.article>
  )
}

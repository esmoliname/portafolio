import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 *
 * `twMerge` runs last so a later utility always wins over an earlier one, which
 * lets components accept a `className` override without fighting specificity.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

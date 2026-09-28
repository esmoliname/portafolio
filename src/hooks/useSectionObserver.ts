import { useEffect } from 'react'

import { usePortfolioStore } from '../store/usePortfolioStore'
import { SECTION_IDS, type SectionId } from '../types'

/**
 * Mirrors the section currently owning the viewport into the portfolio store,
 * so the nav and the 3D camera stay in sync with the scroll position.
 */
export function useSectionObserver(): void {
  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    )

    if (elements.length === 0) return

    const ratios = new Map<Element, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0)
        }

        let best: { id: SectionId; ratio: number } | null = null
        for (const [element, ratio] of ratios) {
          if (ratio > (best?.ratio ?? 0)) {
            best = { id: element.id as SectionId, ratio }
          }
        }

        if (best !== null) {
          usePortfolioStore.getState().setActiveSection(best.id)
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    for (const element of elements) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])
}

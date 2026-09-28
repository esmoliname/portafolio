import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { capabilities, projects } from '../../data/portfolio'
import { useAudioStore } from '../../store/useAudioStore'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { SECTION_IDS } from '../../types'
import { AudioToggle } from '../overlay/AudioToggle'
import { ScrollHint } from '../overlay/ScrollHint'
import { About } from './About'
import { BentoGrid } from './BentoGrid'
import { Contact } from './Contact'
import { Footer } from './Footer'
import { Nav } from './Nav'
import { StackSection } from './StackSection'

beforeEach(() => {
  usePortfolioStore.setState({ activeSection: 'hero', orbPulse: 0, accent: 'neon' })
  useAudioStore.setState({ muted: false, volume: 0.5 })
})

describe('Nav', () => {
  it('renders one link per section', () => {
    render(<Nav />)
    for (const id of SECTION_IDS) {
      expect(document.querySelector(`a[href="#${id}"]`)).not.toBeNull()
    }
  })

  it('marks the active section for assistive technology', () => {
    usePortfolioStore.setState({ activeSection: 'projects' })
    render(<Nav />)
    const active = screen.getAllByRole('link').filter((link) => link.getAttribute('aria-current'))
    expect(active).toHaveLength(1)
    expect(active[0]).toHaveAttribute('href', '#projects')
  })

  it('is exposed as a navigation landmark', () => {
    render(<Nav />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})

describe('BentoGrid', () => {
  it('renders a card per project, each with its name and path', () => {
    render(<BentoGrid />)
    for (const project of projects) {
      expect(screen.getByText(project.name)).toBeInTheDocument()
      expect(screen.getByText(project.path)).toBeInTheDocument()
    }
  })

  it('links out with safe rel attributes', () => {
    render(<BentoGrid />)
    const external = document.querySelectorAll('a[target="_blank"]')
    expect(external.length).toBeGreaterThan(0)
    for (const anchor of external) {
      expect(anchor.getAttribute('rel')).toContain('noreferrer')
      expect(anchor.getAttribute('rel')).toContain('noopener')
    }
  })
})

describe('StackSection', () => {
  it('renders every capability group and all of its items', () => {
    render(<StackSection />)
    for (const group of capabilities) {
      expect(screen.getByText(group.label)).toBeInTheDocument()
      for (const item of group.items) {
        expect(screen.getByText(item)).toBeInTheDocument()
      }
    }
  })
})

describe('About', () => {
  it('renders the lead biography and the certification badge', () => {
    render(<About />)
    expect(screen.getByText('GitHub Foundations Certified')).toBeInTheDocument()
    expect(screen.getByText('GH-900')).toBeInTheDocument()
  })
})

describe('Contact', () => {
  it('exposes a mailto link', () => {
    render(<Contact />)
    const mail = document.querySelector('a[href^="mailto:"]')
    expect(mail).not.toBeNull()
  })
})

describe('Footer', () => {
  it('shows the current year', () => {
    render(<Footer />)
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
  })
})

describe('ScrollHint', () => {
  it('is hidden once the user has left the hero', () => {
    usePortfolioStore.setState({ activeSection: 'projects' })
    const { container } = render(<ScrollHint />)
    expect(container).toBeEmptyDOMElement()
  })

  it('is visible on the hero', () => {
    const { container } = render(<ScrollHint />)
    expect(container).not.toBeEmptyDOMElement()
  })
})

describe('AudioToggle', () => {
  it('reflects the unmuted state via aria-pressed', () => {
    render(<AudioToggle />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('reflects the muted state via aria-pressed', () => {
    useAudioStore.setState({ muted: true })
    render(<AudioToggle />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('carries an accessible name in both states', () => {
    const { unmount } = render(<AudioToggle />)
    expect(screen.getByRole('button').getAttribute('aria-label')).toBeTruthy()
    unmount()

    useAudioStore.setState({ muted: true })
    render(<AudioToggle />)
    expect(screen.getByRole('button').getAttribute('aria-label')).toBeTruthy()
  })
})

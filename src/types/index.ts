/**
 * Domain types for the portfolio.
 *
 * `erasableSyntaxOnly` is enabled project-wide, so unions + const objects are
 * used instead of TypeScript `enum`s.
 */

/* ------------------------------------------------------------------ *
 * Projects
 * ------------------------------------------------------------------ */

/** Accent colour token used for the glow / border of a project card. */
export type Accent = 'neon' | 'cyan' | 'violet' | 'amber'

/** Bento-grid footprint. `feature` spans two columns, `wide` spans two rows. */
export type BentoSpan = 'compact' | 'feature' | 'wide'

export interface ProjectLink {
  readonly label: string
  readonly href: string
}

export interface Project {
  readonly id: string
  readonly name: string
  readonly tagline: string
  readonly description: string
  readonly stack: readonly string[]
  readonly highlights: readonly string[]
  readonly accent: Accent
  readonly span: BentoSpan
  /** Terminal-style handle printed in the card footer, e.g. `~/projects/signal`. */
  readonly path: string
  readonly links: readonly ProjectLink[]
}

/* ------------------------------------------------------------------ *
 * Credentials
 * ------------------------------------------------------------------ */

export type CredentialKind = 'certification' | 'membership' | 'role'

export interface Credential {
  readonly id: string
  readonly kind: CredentialKind
  readonly issuer: string
  readonly title: string
  readonly detail: string
  readonly year: string
  readonly verifiedId?: string
}

/* ------------------------------------------------------------------ *
 * Profile
 * ------------------------------------------------------------------ */

export interface SocialLink {
  readonly label: string
  readonly href: string
  readonly handle: string
}

export interface Profile {
  readonly name: string
  readonly firstName: string
  readonly role: string
  readonly institution: string
  readonly location: string
  readonly bio: string
  readonly tagline: string
  readonly socials: readonly SocialLink[]
}

/* ------------------------------------------------------------------ *
 * Capabilities
 * ------------------------------------------------------------------ */

export interface CapabilityGroup {
  readonly id: string
  readonly label: string
  readonly items: readonly string[]
}

/* ------------------------------------------------------------------ *
 * Macropad
 * ------------------------------------------------------------------ */

export type KeycapKind = 'alpha' | 'symbol' | 'accent' | 'command'

/** What a physical key triggers inside the experience. */
export type KeycapAction =
  | 'scroll-top'
  | 'scroll-about'
  | 'scroll-projects'
  | 'scroll-stack'
  | 'scroll-contact'
  | 'burst-confetti'
  | 'toggle-audio'
  | 'cycle-accent'
  | 'pulse-orb'

/** Maps a real `KeyboardEvent.key` to a keycap id. `null` = not bound. */
export type KeyboardBinding = Readonly<Record<string, string>>

export interface KeycapLayout {
  readonly id: string
  readonly label: string
  /** Secondary glyph printed on the keycap legend. */
  readonly hint?: string
  /** `KeyboardEvent.key` that activates it; undefined = pointer only. */
  readonly key?: string
  readonly kind: KeycapKind
  readonly action: KeycapAction
}

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

export const SECTION_IDS = ['hero', 'about', 'projects', 'stack', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]

export interface SectionMeta {
  readonly id: SectionId
  readonly label: string
}

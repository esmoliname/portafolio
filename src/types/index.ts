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
 * Navigation
 * ------------------------------------------------------------------ */

export const SECTION_IDS = ['hero', 'about', 'projects', 'stack', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]

export interface SectionMeta {
  readonly id: SectionId
  readonly label: string
}

/* ------------------------------------------------------------------ *
 * Skills + macropad
 * ------------------------------------------------------------------ */

/**
 * One keycap. The macropad stopped being a navigation remote: every physical key
 * now carries a technology, and section navigation lives on the keyboard only
 * (`T`/`A`/`P`/`S`/`C`) so the two keymaps can never collide.
 */
export interface Skill {
  readonly id: string
  readonly name: string
  /** Short text printed on the keycap face, e.g. `TS`. */
  readonly legend: string
  /** One-line punchline shown as the headline of the info panel. */
  readonly slogan: string
  readonly description: string
  readonly category: string
  readonly accent: Accent
  /** `KeyboardEvent.key` that activates it. */
  readonly key: string
  /** Project ids this technology was actually used in. */
  readonly usedIn: readonly string[]
}

/**
 * Where the pad sits for a given scroll section. `dim` runs 0 (full presence,
 * foreground) to 1 (recessed into the background) and is applied by lerping
 * every material colour toward the background colour.
 */
export interface MacropadPose {
  readonly position: readonly [number, number, number]
  readonly rotation: readonly [number, number, number]
  readonly scale: number
  readonly dim: number
}

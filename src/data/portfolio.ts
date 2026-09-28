/**
 * Portfolio content — single source of truth.
 *
 * Everything rendered on the site comes from this module, so copy changes never
 * require touching a component.
 */

import type {
  CapabilityGroup,
  Credential,
  KeycapLayout,
  Profile,
  Project,
  SectionMeta,
  SocialLink,
} from '../types'
import { SECTION_IDS } from '../types'

/* ------------------------------------------------------------------ *
 * Profile
 * ------------------------------------------------------------------ */

export const profile: Profile = {
  name: 'Esteban Molina Meza',
  firstName: 'Esteban',
  role: 'Full-Stack Engineer & IT Engineering Student',
  institution: 'Universidad Técnica Nacional',
  location: 'Argentina',
  tagline: 'Arquitectura web escalable, simulación 3D e interfaces de alto rendimiento.',
  bio: 'Desarrollador de software apasionado por la ingeniería de sistemas, la arquitectura web escalable, la simulación 3D y las interfaces de alto rendimiento. Construyo sistemas que se sostienen bajo carga real y las herramientas para pensarlos mejor.',
  socials: [
    { label: 'GitHub', handle: '@esmoliname', href: 'https://github.com/esmoliname' },
    { label: 'LinkedIn', handle: 'in/esmoliname', href: 'https://www.linkedin.com/in/esmoliname' },
  ] satisfies readonly SocialLink[],
}

/**
 * Contact address. Override with `VITE_CONTACT_EMAIL` at build time; the default
 * keeps the contact section functional out of the box.
 */
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? 'contacto@esmoliname.dev'

/* ------------------------------------------------------------------ *
 * Credentials
 * ------------------------------------------------------------------ */

export const credentials: readonly Credential[] = [
  {
    id: 'gh-900',
    kind: 'certification',
    issuer: 'GitHub',
    title: 'GitHub Foundations Certified',
    detail: 'Credential ID GH-900. Workflows, seguridad y colaboración sobre GitHub.',
    year: '2025',
    verifiedId: 'GH-900',
  },
  {
    id: 'codein-lead',
    kind: 'role',
    issuer: 'CODEIN',
    title: 'Community Lead',
    detail: 'Liderazgo de la comunidad CODEIN: organización de meetups y mentorship a estudiantes.',
    year: '2025',
  },
  {
    id: 'c4a-labs',
    kind: 'membership',
    issuer: 'C4A LABS',
    title: 'Co-founder',
    detail: 'Cofundador en C4A LABS: construcción de productos y experimentación con IA aplicada.',
    year: '2025',
  },
]

/* ------------------------------------------------------------------ *
 * Projects
 * ------------------------------------------------------------------ */

export const projects: readonly Project[] = [
  {
    id: 'signal',
    name: 'SIGNAL Intelligence',
    tagline: 'Streaming de datos con un orbe de inteligencia en WebGL.',
    description:
      'Plataforma de streaming de datos con shaders 3D WebGL que visualizan el flujo en tiempo real, endpoints de baja latencia, internacionalización (i18n) y CI/CD automatizado.',
    stack: ['Vue 3', 'Django', 'Celery', 'Redis', 'WebGL'],
    highlights: ['Shaders 3D WebGL', 'Endpoints de baja latencia', 'i18n', 'CI/CD automatizado'],
    accent: 'neon',
    span: 'feature',
    path: '~/projects/signal',
    links: [{ label: 'Repositorio', href: 'https://github.com/esmoliname' }],
  },
  {
    id: 'dreamup',
    name: 'DreamUp VR',
    tagline: 'Prototipado inmobiliario WebXR con cambio de escala en vivo.',
    description:
      'Plataforma WebXR para prototipado inmobiliario 3D: cambio de escala en tiempo real y flujo de handover móvil vía QR para pasar del render al dispositivo del cliente.',
    stack: ['React', 'Three.js', 'WebXR', 'TypeScript'],
    highlights: ['WebXR', 'Cambio de escala en tiempo real', 'Handover vía QR'],
    accent: 'cyan',
    span: 'wide',
    path: '~/projects/dreamup',
    links: [{ label: 'Repositorio', href: 'https://github.com/esmoliname' }],
  },
  {
    id: 'novatienda',
    name: 'NovaTienda',
    tagline: 'E-commerce transaccional con facturación PDF en tiempo real.',
    description:
      'Plataforma e-commerce transaccional con motor de descuentos, facturación electrónica en PDF generada en tiempo real y dashboard analítico de ventas.',
    stack: ['Next.js', 'Tailwind', 'PostgreSQL'],
    highlights: ['Motor de descuentos', 'Facturación PDF en tiempo real', 'Dashboard analítico'],
    accent: 'violet',
    span: 'compact',
    path: '~/projects/novatienda',
    links: [{ label: 'Repositorio', href: 'https://github.com/esmoliname' }],
  },
  {
    id: 'canchaflow',
    name: 'CanchaFlow',
    tagline: 'Marketplace de reserva de recintos deportivos.',
    description:
      'Marketplace interactivo para reserva de recintos deportivos, con formateo multimoneda y gestión integral de disponibilidad.',
    stack: ['Next.js', 'PostgreSQL'],
    highlights: ['Reserva de recintos', 'Formateo multimoneda', 'Gestión de disponibilidad'],
    accent: 'amber',
    span: 'compact',
    path: '~/projects/canchaflow',
    links: [{ label: 'Repositorio', href: 'https://github.com/esmoliname' }],
  },
]

/* ------------------------------------------------------------------ *
 * Stack / capabilities
 * ------------------------------------------------------------------ */

export const capabilities: readonly CapabilityGroup[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    items: ['React 19', 'TypeScript', 'Next.js', 'Vue 3', 'Tailwind CSS', 'Three.js', 'WebGL / WebXR', 'GSAP'],
  },
  {
    id: 'backend',
    label: 'Backend',
    items: ['Django', 'Node.js', 'Celery', 'Redis', 'REST APIs', 'WebSockets'],
  },
  {
    id: 'data',
    label: 'Datos e infraestructura',
    items: ['PostgreSQL', 'CI/CD', 'GitHub Actions', 'Docker', 'i18n'],
  },
]

/* ------------------------------------------------------------------ *
 * Macropad layout — 3x3 grid of mechanical keycaps
 * ------------------------------------------------------------------ */

export const macropadLayout: readonly KeycapLayout[] = [
  { id: 'k-t', label: 'T', key: 't', kind: 'alpha', action: 'scroll-top' },
  { id: 'k-a', label: 'A', key: 'a', kind: 'alpha', action: 'scroll-about' },
  { id: 'k-p', label: 'P', key: 'p', kind: 'alpha', action: 'scroll-projects' },
  { id: 'k-s', label: 'S', key: 's', kind: 'alpha', action: 'scroll-stack' },
  { id: 'k-c', label: 'C', key: 'c', kind: 'alpha', action: 'scroll-contact' },
  { id: 'k-burst', label: '*', hint: 'B', key: 'b', kind: 'accent', action: 'burst-confetti' },
  { id: 'k-orb', label: 'O', hint: 'O', key: 'o', kind: 'command', action: 'pulse-orb' },
  { id: 'k-mute', label: 'M', hint: 'M', key: 'm', kind: 'command', action: 'toggle-audio' },
  { id: 'k-accent', label: 'K', hint: 'K', key: 'k', kind: 'symbol', action: 'cycle-accent' },
]

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

const SECTION_LABELS: Record<(typeof SECTION_IDS)[number], string> = {
  hero: 'Inicio',
  about: 'Perfil',
  projects: 'Proyectos',
  stack: 'Stack',
  contact: 'Contacto',
}

export const sections: readonly SectionMeta[] = SECTION_IDS.map((id) => ({
  id,
  label: SECTION_LABELS[id],
}))

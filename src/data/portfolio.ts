/**
 * Portfolio content — single source of truth.
 *
 * Everything rendered on the site comes from this module, so copy changes never
 * require touching a component.
 */

import type {
  CapabilityGroup,
  Credential,
  Profile,
  Project,
  SectionMeta,
  Skill,
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
  location: 'Costa Rica',
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
 * Skills — one per macropad keycap, in physical 3x3 reading order
 * ------------------------------------------------------------------ */

export const skills: readonly Skill[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    legend: 'TS',
    slogan: 'El tipo no miente. El comentario sí.',
    description:
      'Todo el proyecto corre con strict, noUncheckedIndexedAccess y verbatimModuleSyntax. Los errores que en runtime te costaban un ticket, acá los paga el editor antes de que exista el ticket.',
    category: 'Lenguaje',
    accent: 'cyan',
    key: '1',
    usedIn: ['dreamup'],
  },
  {
    id: 'react',
    name: 'React',
    legend: 'RX',
    slogan: 'Componente, estado, efecto. En ese orden.',
    description:
      'React 19 con una sola fuente de verdad en zustand y la escena WebGL cargada en diferido, para que el contenido pinte sin esperarla. Un write por frame en el canvas, nunca un re-render.',
    category: 'Frontend',
    accent: 'cyan',
    key: '2',
    usedIn: ['dreamup'],
  },
  {
    id: 'three',
    name: 'Three.js',
    legend: '3D',
    slogan: 'Donde la interfaz deja de ser DOM.',
    description:
      'Shaders GLSL propios, WebXR y escenas con física de resorte. Fresnel, desplazamiento fbm y un presupuesto de performance que manda: por eso el orbe actualiza uniforms y no estado.',
    category: '3D / WebGL',
    accent: 'neon',
    key: '3',
    usedIn: ['dreamup', 'signal'],
  },
  {
    id: 'python',
    name: 'Python',
    legend: 'PY',
    slogan: 'Django y Celery: la parte que nunca se duerme.',
    description:
      'El backend de SIGNAL: streaming, colas asíncronas y workers que procesan en paralelo. Si algo tiene que seguir corriendo cuando el request termina, corre acá.',
    category: 'Backend',
    accent: 'violet',
    key: '4',
    usedIn: ['signal'],
  },
  {
    id: 'docker',
    name: 'Docker',
    legend: 'DK',
    slogan: 'Si anda en tu máquina y no en la mía, te faltaba esto.',
    description:
      'Contenedores reproducibles para dejar de discutir versiones entre servicios. La infraestructura deja de ser un documento y pasa a ser código que se versiona junto al proyecto.',
    category: 'Infraestructura',
    accent: 'amber',
    key: '5',
    usedIn: ['signal'],
  },
  {
    id: 'linux',
    name: 'Linux',
    legend: 'LX',
    slogan: 'Linux: donde chmod 777 es el arreglo definitivo.',
    description:
      'Entornos, procesos, permisos y logs. Diagnosticar en la terminal antes de tocar una línea de código es el hábito que más tiempo devuelve en todo el proyecto.',
    category: 'Sistema',
    accent: 'amber',
    key: '6',
    usedIn: [],
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    legend: 'TW',
    slogan: 'El diseño vive en el componente, no en un archivo aparte.',
    description:
      'Utility-first sobre tokens propios: cambiar una variable de acento redibuja la interfaz entera sin tocar un solo componente. Ese es el punto.',
    category: 'Frontend',
    accent: 'cyan',
    key: '7',
    usedIn: ['novatienda'],
  },
  {
    id: 'git',
    name: 'Git',
    legend: 'GT',
    slogan: 'Commit temprano, commit seguido, rebase con miedo.',
    description:
      'Ramas cortas, mensajes convencionales y PRs que se pueden revisar de verdad. El historial es documentación ejecutable: dentro de dos semanas se lee solo.',
    category: 'Flujo',
    accent: 'neon',
    key: '8',
    usedIn: [],
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    legend: 'PG',
    slogan: 'El índice que no creaste te va a cobrar factura.',
    description:
      'Modelado relacional, índices compuestos y consultas que no se rompen cuando la tabla crece. El schema es la parte difícil de cualquier producto, y casi siempre se decide al principio.',
    category: 'Datos',
    accent: 'violet',
    key: '9',
    usedIn: ['novatienda', 'canchaflow'],
  },
]

/**
 * Resolves a skill's `usedIn` ids to project names, dropping any id that no
 * longer matches a project so the panel can never show a dangling reference.
 */
export function projectsForSkill(skill: Skill): readonly Project[] {
  return skill.usedIn
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is Project => project !== undefined)
}

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

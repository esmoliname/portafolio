# Portafolio 3D — Esteban Molina Meza

Portafolio interactivo con una capa WebGL (Three.js / React Three Fiber) detrás de
una UI glassmorphic en Tailwind CSS v4.

**Full-Stack Engineer & IT Engineering Student — Universidad Técnica Nacional.**

## Stack

| Capa            | Tecnología                                                          |
| --------------- | ------------------------------------------------------------------ |
| Build           | Vite 8                                                             |
| UI              | React 19, TypeScript 6 (strict), Tailwind CSS v4                    |
| 3D              | three, `@react-three/fiber`, `@react-three/drei`                    |
| Animación       | `@react-spring/three`, framer-motion, gsap                         |
| Estado          | zustand                                                            |
| Audio           | Web Audio API **sintético** — el repo no contiene archivos de audio |
| Testing         | Vitest 5, Testing Library, jsdom                                    |

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # tsc -b && vite build
npm run preview    # sirve el build de producción
npm test           # vitest run
npm run typecheck  # tsc -b --force
npm run lint       # oxlint
npm run verify     # lint + typecheck + test + build
```

## Estructura

```text
src/
├── components/
│   ├── canvas/        # Escena 3D
│   │   ├── Scene.tsx        Canvas, luces, sombras, rig de cámara por scroll
│   │   ├── Macropad.tsx     Chasis 3x3 + poses por sección + mascota
│   │   ├── Keycap.tsx       Keycap individual (spring + puntero)
│   │   ├── Mascot.tsx       Gato blocky que reacciona al press
│   │   ├── IntelOrb.tsx     Orbe con shader GLSL propio
│   │   └── shaders/         GLSL del orbe y del piso de datos
│   ├── ui/            # Nav, Hero, About, BentoGrid, ProjectCard, SkillPanel, Stack, Contact, Footer
│   └── overlay/       # AudioToggle, ScrollHint
├── data/portfolio.ts  # Única fuente de contenido del sitio
├── hooks/             # useKeyboard, useMacropadActions, useSectionObserver
├── lib/               # cn, accents, synthAudio, macropadPoses
├── store/             # zustand: usePortfolioStore, useAudioStore
├── types/             # Tipos del dominio
└── test/setup.ts      # Polyfills para jsdom
```

Todo el contenido (nombre, bio, proyectos, certificaciones, stack, socials, las
nueve skills del pad) vive en `src/data/portfolio.ts`. Cambiar textos nunca
requiere tocar un componente.

## Atajos de teclado

El macropad 3D y el teclado comparten **una única ruta de ejecución**
(`useMacropadActions`), así que nunca pueden divergir.

El macropad dejó de ser un control remoto de navegación: **cada tecla física
es una tecnología**. Como consecuencia hay dos keymaps disjuntos, y un test
verifica que no puedan colisionar.

| Tecla     | Acción                          |
| --------- | ------------------------------- |
| `1`–`9`   | Seleccionar la skill del keycap |
| `T`       | Ir al inicio                    |
| `A`       | Ir a Perfil                     |
| `P`       | Ir a Proyectos                  |
| `S`       | Ir a Stack                      |
| `C`       | Ir a Contacto                   |
| `B`       | Confeti                         |
| `O`       | Pulso del orbe                  |
| `M`       | Silenciar / activar audio       |
| `K`       | Rotar acento de tema            |

## Macropad scroll-driven

`src/lib/macropadPoses.ts` define una pose del pad por sección — posición,
rotación, escala y un factor `dim` — y el resorte interpola entre ellas. El pad
es **un solo objeto que se mueve a lo largo de la página**, no cinco estados
sueltos.

| Sección   | Comportamiento                                            |
| --------- | --------------------------------------------------------- |
| Hero      | Centrado e isométrico, escala completa                    |
| Perfil    | Se corre a la derecha y se atenúa                         |
| Proyectos | Gira, se desplaza al fondo a la derecha, muy atenuado      |
| Stack     | A la derecha en primer plano — el panel-info ocupa la izquierda |
| Contacto  | Pasa al lado izquierdo, en ángulo                         |

`dim` no es opacidad: interpola **cada color de material hacia el color de
fondo**, así el pad se hunde en la escena en vez de volverse una calcomanía
translúcida.

La presión de una tecla dispara a la mascota (un gato blocky tipo Bongo Cat
hecho solo con primitivas): los brazos bajan al bombo, el bombo se aplasta, la
cabeza se inclina y parpadea. El gatillo es un contador monotónico
(`mascotHit`) comparado contra un `ref` dentro de `useFrame`, así que dos
presiones rápidas nunca se colapsan en una sola reacción.

### El detalle que hace que esto funcione

La capa WebGL es `fixed inset-0 -z-10`, detrás de `<main class="relative z-10">`.
Como cada `<section>` es un bloque de ancho completo, **tapaba todos los clics y
los keycaps nunca fueron clickeables** — un bug invisible para el typecheck, el
build y el resto de los tests. `src/index.css` deja los `<section>` transparentes
al puntero y lo re-habilita en su contenido, y `StackSection` opta explícitamente
porque la regla por sí sola no basta: el hit test cae en el wrapper. Hay un test
dedicado (`stackLayout.test.tsx`) que protege este contrato.

## Motor de audio sintético

`src/lib/synthAudio.ts` genera cada sonido en runtime con la Web Audio API. Un click
de switch mecánico se modela como un burst de ruido filtrado (el snap del contacto)
superpuesto a un seno grave (el bottom-out sobre la placa). No hay ni un `.mp3` ni
un `.wav` en el repo.

El `AudioContext` se crea de forma perezosa y se reanuda dentro de un gesto del
usuario, como exigen los navegadores; si el contexto sigue suspendido, el sonido se
omite en vez de tirar.

## Notas de implementación

- **R3F v9 + react-spring v10:** los tipos de `animated.*` de `@react-spring/three`
  colapsan las uniones de props de transform de R3F v9 y no compilan. La física la
  sigue dando el spring, pero el transform se escribe una vez por frame en
  `useFrame` con `.get()`. Ver el comentario en `Keycap.tsx`.
- **Los uniforms del shader** se declaran con una interfaz concreta que extiende
  `Record<string, THREE.IUniform>` y se mutan directamente, en lugar de indexar
  `ShaderMaterial.uniforms` (que con `noUncheckedIndexedAccess` es `| undefined`).
- **Leyenda de los keycaps:** se renderiza con drei `<Html>` en vez de `<Text>`, para
  usar la webfont real del sitio en vez de cargar una fuente 3D desde un CDN.
- **Warnings de oxlint:** los 5 restantes son `react(immutability)` sobre mutaciones
  dentro de `useFrame`. Es el patrón imperativo propio de three.js; no existe
  alternativa declarativa para `camera.position` o los uniforms de un shader.
- **Code splitting:** la escena WebGL (~1.1 MB min de three.js) se carga con
  `React.lazy` para que el contenido DOM pinte sin esperarla.
- **`prefers-reduced-motion`:** todas las animaciones CSS se desactivan y el confeti
  usa `disableForReducedMotion`.

## Configuración

| Variable               | Default                  | Para qué                        |
| ---------------------- | ------------------------ | ------------------------------- |
| `VITE_CONTACT_EMAIL`   | `contacto@esmoliname.dev`| Dirección de contacto del hero  |

## Accesibilidad

- Landmarks semánticos, `aria-current` en la navegación, skip-link al contenido.
- `aria-pressed` y `aria-label` en el toggle de audio, que cambia con el estado.
- Todos los enlaces externos con `target="_blank" rel="noreferrer noopener"`.
- Foco visible global, texto de scroll oculto para lectores de pantalla.
- `<Canvas>` con `aria-hidden` y `fallback` para cuando WebGL no está disponible.

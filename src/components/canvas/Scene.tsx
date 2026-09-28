import { Component, Suspense, useCallback, useMemo, useRef, type ReactNode } from 'react'
import { AdaptiveDpr, ContactShadows, Preload } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { ACCENTS } from '../../lib/accents'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { useMacropadActions } from '../../hooks/useMacropadActions'
import { IntelOrb } from './IntelOrb'
import { Macropad } from './Macropad'
import { GRID_FRAGMENT_SHADER, GRID_VERTEX_SHADER } from './shaders/intelligence'

/**
 * Camera keyframes, one per scroll section, in world space.
 *
 * The `stack` frame moves in and to the right because that section's macropad
 * pose sits at x = 1.9; the `contact` frame pulls back to hold the angled pose
 * at x = -2.6 without clipping it off the left edge.
 */
const CAMERA_FRAMES: readonly { readonly position: [number, number, number] }[] = [
  { position: [0, 1.15, 5.4] },
  { position: [-1.9, 0.35, 5.0] },
  { position: [1.9, 0.2, 4.6] },
  { position: [0.7, 0.9, 4.6] },
  { position: [0.4, 0.6, 5.2] },
]

const SECTION_INDEX: Record<string, number> = {
  hero: 0,
  about: 1,
  projects: 2,
  stack: 3,
  contact: 4,
}

/**
 * Damps the camera toward the keyframe for the active section, plus a subtle
 * pointer parallax. Damping (not snapping) is what sells the weight.
 */
function CameraRig(): null {
  const camera = useThree((state) => state.camera)
  const activeSection = usePortfolioStore((state) => state.activeSection)
  const target = useRef(new THREE.Vector3(...CAMERA_FRAMES[0]!.position))

  useFrame((state, delta) => {
    const frame = CAMERA_FRAMES[SECTION_INDEX[activeSection] ?? 0] ?? CAMERA_FRAMES[0]!
    target.current.set(...frame.position)

    const pointer = state.pointer
    target.current.x += pointer.x * 0.42
    target.current.y += pointer.y * 0.28

    // Frame-rate independent exponential damping.
    const lambda = 3.2
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x, lambda, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.current.y, lambda, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.current.z, lambda, delta)
    camera.lookAt(0, -0.1, 0)
  })

  return null
}

/** Concrete uniform shape for the floor shader — see IntelOrb.tsx. */
interface GridUniforms extends Record<string, THREE.IUniform> {
  uTime: { value: number }
  uColor: { value: THREE.Color }
}

/** Animated data-grid floor. */
function GridFloor(): React.JSX.Element {
  const accent = usePortfolioStore((state) => state.accent)

  const uniforms = useMemo<GridUniforms>(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(ACCENTS.neon.hex) },
    }),
    [],
  )

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    uniforms.uColor.value.set(ACCENTS[accent].hex)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
      <planeGeometry args={[40, 40]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={GRID_VERTEX_SHADER}
        fragmentShader={GRID_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ------------------------------------------------------------------ *
 * Failure surfacing
 *
 * A dead WebGL layer is indistinguishable from a black page, which is exactly
 * how the original `z-index: -10` bug hid for so long: everything typechecked,
 * built and tested while rendering nothing visible. These two pieces make a
 * future failure loud instead — a crashed scene paints a diagnostic, and a
 * shader that fails to compile reports its actual GLSL log.
 * ------------------------------------------------------------------ */

interface SceneBoundaryProps {
  readonly children: ReactNode
  readonly onFailure: (error: Error) => void
}

interface SceneBoundaryState {
  readonly error: Error | null
}

/**
 * A class component on purpose: there is no hook equivalent of
 * `componentDidCatch`, and `erasableSyntaxOnly` bans parameter properties, so
 * the constructor assigns state explicitly.
 */
class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  override state: SceneBoundaryState = { error: null }

  static getDerivedStateFromError(error: unknown): SceneBoundaryState {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }

  override componentDidCatch(error: Error): void {
    this.props.onFailure(error)
  }

  override render(): ReactNode {
    const { error } = this.state
    if (error === null) return this.props.children

    return (
      <div className="p-6 font-mono text-xs">
        <p className="text-danger">// escena 3D no disponible</p>
        <p className="mt-2 break-words text-ink-dim">{error.message}</p>
      </div>
    )
  }
}

/** True when the browser can actually give us a WebGL context. */
function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const probe = document.createElement('canvas')
    return Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'))
  } catch {
    return false
  }
}

function SceneContents(): React.JSX.Element {
  const { selectSkill } = useMacropadActions()

  return (
    <>
      <color attach="background" args={['#050608']} />
      <fog attach="fog" args={['#050608', 6, 18]} />

      <CameraRig />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 7, 5]}
        intensity={1.5}
        color="#cfe8ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-5, 1.5, 3]} intensity={9} distance={16} decay={2} color="#22d3ee" />
      <pointLight position={[5, -1, 2]} intensity={6} distance={14} decay={2} color="#a855f7" />

      <GridFloor />
      <IntelOrb />
      <Macropad onSelect={selectSkill} />

      <ContactShadows
        position={[0, -1.95, 0]}
        opacity={0.42}
        scale={14}
        blur={2.6}
        far={5}
        resolution={512}
        color="#000000"
      />

      <AdaptiveDpr pixelated />
      <Preload all />
    </>
  )
}

export interface SceneProps {
  readonly className?: string
}

/**
 * Fixed, full-viewport WebGL layer behind the DOM content.
 *
 * Stacking note, and the reason this layer used to be invisible:
 *
 * `position: relative` with `z-index: auto` does NOT establish a stacking
 * context, so a `z-index: -10` child does not stack against this page's root
 * element — it stacks against the document root, landing in step 2 of the paint
 * order, while the root element's own opaque background paints in step 6. The
 * canvas rendered perfectly and was covered by a solid `#050608` rectangle.
 *
 * `z-0` is the fix: the layer becomes a normal positioned element, painted after
 * the root background and before `<main class="z-10">`, which is exactly the
 * sandwich this backdrop needs.
 *
 * This container deliberately does NOT set `pointer-events: none`. The canvas
 * host must stay hit-testable or the keycaps can never be pressed, and
 * `src/index.css` already punches holes in the DOM above it via
 * `main > section { pointer-events: none }`.
 */
export function Scene({ className }: SceneProps): React.JSX.Element {
  const supportsWebGL = useMemo(detectWebGL, [])
  const failureRef = useRef<string | null>(null)

  const onFailure = useCallback((error: Error) => {
    failureRef.current = error.message
    console.error('[scene] crashed', error)
  }, [])

  const onCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    console.info('[scene] WebGL renderer ready', gl.capabilities.isWebGL2 ? 'webgl2' : 'webgl1')
    // three.js swallows shader compile failures into a console warning that is
    // easy to miss; a broken GLSL program just renders as nothing. Echo the real
    // compiler log so a bad shader is impossible to confuse with bad layout.
    gl.debug.onShaderError = (context, program, vertexShader, fragmentShader) => {
      console.error('[scene] shader compile failed', {
        program: context.getProgramInfoLog(program) ?? 'no program log',
        vertex: context.getShaderInfoLog(vertexShader) ?? 'no vertex log',
        fragment: context.getShaderInfoLog(fragmentShader) ?? 'no fragment log',
      })
    }
  }, [])

  if (!supportsWebGL) {
    return (
      <div className={className} aria-hidden="true">
        <div className="grid h-full w-full place-items-center font-mono text-xs text-ink-faint">
          // este navegador no expone WebGL — el sitio funciona igual sin la escena
        </div>
      </div>
    )
  }

  return (
    <div className={className} aria-hidden="true">
      <SceneBoundary onFailure={onFailure}>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          camera={{ position: [0, 1.15, 5.4], fov: 42, near: 0.1, far: 100 }}
          onCreated={onCreated}
          fallback={
            <div className="grid h-full w-full place-items-center font-mono text-xs text-ink-faint">
              // WebGL no se pudo inicializar
            </div>
          }
        >
          <Suspense fallback={null}>
            <SceneContents />
          </Suspense>
        </Canvas>
      </SceneBoundary>
    </div>
  )
}

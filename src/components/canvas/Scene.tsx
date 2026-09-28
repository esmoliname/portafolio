import { Suspense, useMemo, useRef } from 'react'
import { AdaptiveDpr, ContactShadows, Preload } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { ACCENTS } from '../../lib/accents'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { useMacropadActions } from '../../hooks/useMacropadActions'
import { IntelOrb } from './IntelOrb'
import { Macropad } from './Macropad'
import { GRID_FRAGMENT_SHADER, GRID_VERTEX_SHADER } from './shaders/intelligence'

/** Camera keyframes, one per scroll section, in world space. */
const CAMERA_FRAMES: readonly { readonly position: [number, number, number] }[] = [
  { position: [0, 1.15, 5.4] },
  { position: [-1.9, 0.35, 5.0] },
  { position: [1.9, 0.2, 4.6] },
  { position: [-1.2, 1.0, 4.9] },
  { position: [0, 0.6, 5.2] },
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

function SceneContents(): React.JSX.Element {
  const { run } = useMacropadActions()

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
      <Macropad onTrigger={run} />

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
 * Fixed, full-viewport WebGL layer sitting behind the DOM content.
 */
export function Scene({ className }: SceneProps): React.JSX.Element {
  return (
    <div className={className} aria-hidden="true">
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
        fallback={
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(57,255,158,0.09),transparent_65%)]" />
        }
      >
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
    </div>
  )
}

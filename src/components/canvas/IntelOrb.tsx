import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { ACCENTS } from '../../lib/accents'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { ORB_FRAGMENT_SHADER, ORB_VERTEX_SHADER } from './shaders/intelligence'

const RADIUS = 1.35
const PULSE_DECAY = 1.9

interface OrbUniforms extends Record<string, THREE.IUniform> {
  uTime: { value: number }
  uPulse: { value: number }
  uColorA: { value: THREE.Color }
  uColorB: { value: THREE.Color }
}

/**
 * The "intelligence orb" — a displaced, Fresnel-lit sphere running a custom
 * fragment shader. It is the visual anchor of the hero and reacts to the store
 * accent and to `pulseOrb()` from the macropad.
 */
export function IntelOrb(): React.JSX.Element {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)

  const accent = usePortfolioStore((state) => state.accent)
  const orbPulse = usePortfolioStore((state) => state.orbPulse)

  // `pulse` is the live 0..1 value the shader reads; the store counter is only
  // the trigger that resets it.
  const pulse = useRef(0)
  const uTimeRef = useRef(0)
  const uPulseRef = useRef(0)
  const uColorARef = useRef(new THREE.Color(ACCENTS.neon.hex))
  const uColorBRef = useRef(new THREE.Color('#0b2a5b'))

  // Uniforms object created once - we'll update the material's uniforms directly in useFrame
  const uniforms = useMemo<OrbUniforms>(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uColorA: { value: new THREE.Color(ACCENTS.neon.hex) },
      uColorB: { value: new THREE.Color('#0b2a5b') },
    }),
    [],
  )

  useEffect(() => {
    pulse.current = 1
  }, [orbPulse])

  useEffect(() => {
    const palette = ACCENTS[accent]
    uColorARef.current.set(palette.hex)
    uColorBRef.current.set(palette.hex).multiplyScalar(0.22)
    // Update via material ref to avoid mutating hook-created object
    const material = materialRef.current
    if (material?.uniforms) {
      const mats = material.uniforms as OrbUniforms
      mats.uColorA.value.copy(uColorARef.current)
      mats.uColorB.value.copy(uColorBRef.current)
    }
  }, [accent])

  useFrame((_, delta) => {
    uTimeRef.current += delta
    uPulseRef.current = Math.max(0, uPulseRef.current - delta * PULSE_DECAY)

    // Update via material ref to avoid mutating hook-created object
    const material = materialRef.current
    if (material?.uniforms) {
      const mats = material.uniforms as OrbUniforms
      mats.uTime.value = uTimeRef.current
      mats.uPulse.value = uPulseRef.current
    }

    const group = groupRef.current
    if (group) {
      group.rotation.y += delta * 0.14
      group.rotation.x = Math.sin(uTimeRef.current * 0.5) * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[RADIUS, 128, 128]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={ORB_VERTEX_SHADER}
          fragmentShader={ORB_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner solid core keeps the orb from reading as a hollow shell. */}
      <mesh>
        <icosahedronGeometry args={[RADIUS * 0.52, 4]} />
        <meshStandardMaterial
          color={ACCENTS[accent].hex}
          emissive={ACCENTS[accent].hex}
          emissiveIntensity={0.55}
          roughness={0.32}
          metalness={0.65}
          wireframe
          transparent
          opacity={0.42}
        />
      </mesh>

      <pointLight color={ACCENTS[accent].hex} intensity={6} distance={9} decay={2} />
    </group>
  )
}

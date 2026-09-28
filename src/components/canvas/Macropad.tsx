import { useEffect, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useSpring } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { macropadLayout } from '../../data/portfolio'
import type { KeycapAction } from '../../types'
import { Keycap } from './Keycap'

const GAP = 0.7
const PLATE_Y = -0.22
const PLATE_THICKNESS = 0.16
const TILT = -0.42

function slotFor(index: number): readonly [number, number, number] {
  const column = index % 3
  const row = Math.floor(index / 3)
  return [(column - 1) * GAP, 0, (row - 1) * GAP]
}

export interface MacropadProps {
  readonly onTrigger: (action: KeycapAction) => void
}

/**
 * 3x3 macropad: a milled aluminium plate carrying nine mechanical keycaps.
 *
 * The idle float is written straight to the transform in `useFrame` rather than
 * through an `animated.*` wrapper — see the note in Keycap.tsx for why.
 */
export function Macropad({ onTrigger }: MacropadProps): React.JSX.Element {
  const groupRef = useRef<THREE.Group>(null)

  const spring = useSpring({
    tilt: TILT,
    config: { mass: 1, tension: 60, friction: 14 },
  })

  useEffect(() => {
    spring.tilt.set(TILT)
  }, [spring])

  useFrame((state) => {
    const group = groupRef.current
    if (!group) return
    const t = state.clock.elapsedTime
    group.position.set(0, -0.15 + Math.sin(t * 0.6) * 0.035, 0)
    group.rotation.set(spring.tilt.get(), 0, Math.sin(t * 0.4) * 0.012)
  })

  return (
    <group ref={groupRef}>
      {/* Plate */}
      <RoundedBox
        args={[GAP * 2 + 0.78, PLATE_THICKNESS, GAP * 2 + 0.78]}
        radius={0.09}
        smoothness={5}
        position={[0, PLATE_Y, 0]}
      >
        <meshStandardMaterial color="#161b26" roughness={0.34} metalness={0.85} />
      </RoundedBox>

      {/* Chamfered under-case */}
      <RoundedBox
        args={[GAP * 2 + 0.5, 0.34, GAP * 2 + 0.5]}
        radius={0.07}
        smoothness={4}
        position={[0, PLATE_Y - 0.24, 0]}
      >
        <meshStandardMaterial color="#0a0d14" roughness={0.7} metalness={0.4} />
      </RoundedBox>

      {macropadLayout.map((layout, index) => (
        <Keycap
          key={layout.id}
          layout={layout}
          position={slotFor(index)}
          onTrigger={onTrigger}
        />
      ))}

      {/* Status LED strip along the front edge. */}
      <mesh position={[0, PLATE_Y + 0.09, GAP + 0.33]}>
        <boxGeometry args={[GAP * 1.5, 0.022, 0.022]} />
        <meshStandardMaterial
          color="#39ff9e"
          emissive="#39ff9e"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

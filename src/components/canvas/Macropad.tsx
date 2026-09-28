import { useEffect, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useSpring } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { skills } from '../../data/portfolio'
import { ACCENTS } from '../../lib/accents'
import { dimColor, MACROPAD_POSES } from '../../lib/macropadPoses'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { Keycap } from './Keycap'
import { Mascot } from './Mascot'

const GAP = 0.7
const PLATE_Y = -0.22
const PLATE_THICKNESS = 0.16

/** Where the mascot hovers, above the back edge of the plate. */
const MASCOT_ANCHOR: readonly [number, number, number] = [0, 0.46, -1.02]

function slotFor(index: number): readonly [number, number, number] {
  const column = index % 3
  const row = Math.floor(index / 3)
  return [(column - 1) * GAP, 0, (row - 1) * GAP]
}

export interface MacropadProps {
  readonly onSelect: (skillId: string) => void
}

/**
 * 3x3 macropad: a milled aluminium plate carrying nine keycaps, one per
 * technology.
 *
 * The pad is a scroll-driven object. `MACROPAD_POSES` gives it a pose per
 * section and the spring interpolates between them, so scrolling reads as one
 * continuous object moving through the page rather than five separate states.
 *
 * As in Keycap.tsx, the transform is written once per frame instead of through
 * an `animated.*` wrapper.
 */
export function Macropad({ onSelect }: MacropadProps): React.JSX.Element {
  const groupRef = useRef<THREE.Group>(null)

  const activeSection = usePortfolioStore((state) => state.activeSection)
  const activeSkillId = usePortfolioStore((state) => state.activeSkillId)
  const themeAccent = usePortfolioStore((state) => state.accent)

  const pose = MACROPAD_POSES[activeSection]
  const activeSkill = skills.find((skill) => skill.id === activeSkillId)
  const stripAccent = activeSkill ? ACCENTS[activeSkill.accent] : ACCENTS[themeAccent]

  const spring = useSpring({
    px: pose.position[0],
    py: pose.position[1],
    pz: pose.position[2],
    rx: pose.rotation[0],
    ry: pose.rotation[1],
    rz: pose.rotation[2],
    scale: pose.scale,
    config: { mass: 1.4, tension: 42, friction: 13 },
  })

  useEffect(() => {
    spring.px.set(pose.position[0])
    spring.py.set(pose.position[1])
    spring.pz.set(pose.position[2])
    spring.rx.set(pose.rotation[0])
    spring.ry.set(pose.rotation[1])
    spring.rz.set(pose.rotation[2])
    spring.scale.set(pose.scale)
  }, [pose, spring])

  useFrame((state) => {
    const group = groupRef.current
    if (!group) return
    const t = state.clock.elapsedTime
    const s = spring.scale.get()

    // Idle float scales with the pose so a distant, recessed pad does not bob
    // as hard as the foreground one.
    const float = Math.sin(t * 0.6) * 0.035 * s
    const sway = Math.sin(t * 0.4) * 0.012 * s

    group.position.set(spring.px.get(), spring.py.get() + float, spring.pz.get())
    group.rotation.set(spring.rx.get(), spring.ry.get(), spring.rz.get() + sway)
    group.scale.setScalar(s)
  })

  // `dim` is read straight from the pose, not from the spring: a spring value
  // sampled during render would be frozen at mount and never re-render. The
  // transform is what needs smoothing; a one-frame material colour change is
  // imperceptible while scrolling.
  const dim = pose.dim
  const plate = dimColor('#161b26', dim)
  const caseColor = dimColor('#0a0d14', dim)
  const stripHex = dimColor(stripAccent.hex, dim)

  return (
    <group ref={groupRef}>
      {/* Plate */}
      <RoundedBox
        args={[GAP * 2 + 0.78, PLATE_THICKNESS, GAP * 2 + 0.78]}
        radius={0.09}
        smoothness={5}
        position={[0, PLATE_Y, 0]}
      >
        <meshStandardMaterial color={plate} roughness={0.34} metalness={0.85} />
      </RoundedBox>

      {/* Chamfered under-case */}
      <RoundedBox
        args={[GAP * 2 + 0.5, 0.34, GAP * 2 + 0.5]}
        radius={0.07}
        smoothness={4}
        position={[0, PLATE_Y - 0.24, 0]}
      >
        <meshStandardMaterial color={caseColor} roughness={0.7} metalness={0.4} />
      </RoundedBox>

      {skills.map((skill, index) => (
        <Keycap
          key={skill.id}
          skill={skill}
          position={slotFor(index)}
          dim={dim}
          onSelect={onSelect}
        />
      ))}

      <Mascot position={MASCOT_ANCHOR} dim={dim} />

      {/* Status LED strip along the front edge. */}
      <mesh position={[0, PLATE_Y + 0.09, GAP + 0.33]}>
        <boxGeometry args={[GAP * 1.5, 0.022, 0.022]} />
        <meshStandardMaterial
          color={stripHex}
          emissive={stripHex}
          emissiveIntensity={activeSkill ? 3.2 : 2.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Html, RoundedBox, useCursor } from '@react-three/drei'
import { useSpring } from '@react-spring/three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'

import { ACCENTS } from '../../lib/accents'
import { dimColor } from '../../lib/macropadPoses'
import { useAudioStore } from '../../store/useAudioStore'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import type { Skill } from '../../types'
import { getBrandIcon } from './brandIconMap'

const PRESS_DEPTH = 0.075
const HOVER_LIFT = 0.05
const WIDTH = 0.62
const HEIGHT = 0.3
const DEPTH = 0.62

export interface KeycapProps {
  readonly skill: Skill
  /** Slot centre in the pad's local space. */
  readonly position: readonly [number, number, number]
  /** 0 = foreground, 1 = recessed into the background. */
  readonly dim: number
  readonly onSelect: (skillId: string) => void
}

/**
 * A single mechanical keycap carrying one technology.
 *
 * Geometry + emissive fill only; the legend is a DOM node anchored to the
 * keycap via drei `<Html>`, so the type stays crisp and uses the real webfont
 * instead of loading a 3D font from a CDN.
 *
 * The spring drives two scalars and the transform is written once per frame in
 * `useFrame`. `@react-spring/three`'s `animated.*` wrappers are deliberately
 * not used: their `AnimatedProps` mapping collapses R3F v9's transform prop
 * unions, so it does not typecheck, and one write per frame is cheaper anyway.
 */
export function Keycap({ skill, position, dim, onSelect }: KeycapProps): React.JSX.Element {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const groupRef = useRef<import('three').Group>(null)
  useCursor(hovered)

  const palette = ACCENTS[skill.accent]
  const isActive = usePortfolioStore((state) => state.activeSkillId === skill.id)
  const setHoveredSkill = usePortfolioStore((state) => state.setHoveredSkill)

  const [baseX, baseY, baseZ] = position

  const spring = useSpring({
    y: baseY,
    scale: 1,
    config: { mass: 0.6, tension: 320, friction: 18 },
  })

  const play = useAudioStore((state) => state.play)

  // Re-target the spring on interaction change. Kept in an effect so the render
  // body stays pure.
  useEffect(() => {
    spring.y.set(baseY + (pressed ? -PRESS_DEPTH : hovered || isActive ? HOVER_LIFT : 0))
    spring.scale.set(pressed ? 0.97 : hovered || isActive ? 1.03 : 1)
  }, [baseY, hovered, isActive, pressed, spring])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    group.position.set(baseX, spring.y.get(), baseZ)
    group.scale.setScalar(spring.scale.get())
  })

  // A selected key stays lit so the pad doubles as a "what am I looking at"
  // indicator when the info panel is off-screen (small viewports).
  const lit = hovered || isActive
  const emissiveIntensity = (isActive ? 1.1 : hovered ? 0.7 : 0) * (1 - dim)

  return (
    <group
      ref={groupRef}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        setHovered(true)
        setHoveredSkill(skill.id)
        play('hover')
      }}
      onPointerOut={() => {
        setHovered(false)
        setHoveredSkill(null)
      }}
      onPointerDown={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        setPressed(true)
        play('switch')
        onSelect(skill.id)
      }}
      onPointerUp={() => {
        setPressed(false)
        play('keyUp')
      }}
    >
      <RoundedBox args={[WIDTH, HEIGHT, DEPTH]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={dimColor(isActive ? palette.hex : '#0f1520', dim)}
          emissive={dimColor(palette.hex, dim)}
          emissiveIntensity={emissiveIntensity}
          roughness={0.45}
          metalness={0.55}
        />
      </RoundedBox>

      {/* Skirt that reads as the switch housing under the cap. */}
      <mesh position={[0, -HEIGHT / 2 - 0.045, 0]}>
        <boxGeometry args={[WIDTH * 0.62, 0.09, DEPTH * 0.62]} />
        <meshStandardMaterial color={dimColor('#05070b', dim)} roughness={0.9} metalness={0.2} />
      </mesh>

      <Html center position={[0, 0.02, DEPTH / 2 + 0.01]} style={{ pointerEvents: 'none' }}>
        <div
          className={`select-none transition-opacity ${
            lit ? '' : 'opacity-70'
          }`}
          style={{
            color: dimColor(palette.text, dim * 0.85),
            width: '0.45rem',
            height: '0.45rem',
            margin: '0 auto',
          }}
        >
          {getBrandIcon(skill)}
        </div>
        <span
          className="mt-0.5 block text-center font-mono text-[9px] leading-none"
          style={{ color: dimColor('#6b7a94', dim) }}
        >
          {skill.key}
        </span>
      </Html>
    </group>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Html, RoundedBox, useCursor } from '@react-three/drei'
import { useSpring } from '@react-spring/three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'

import { ACCENTS } from '../../lib/accents'
import { useAudioStore } from '../../store/useAudioStore'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import type { KeycapLayout } from '../../types'

const PRESS_DEPTH = 0.075
const HOVER_LIFT = 0.05
const WIDTH = 0.62
const HEIGHT = 0.3
const DEPTH = 0.62

export interface KeycapProps {
  readonly layout: KeycapLayout
  /** Slot centre in the pad's local space. */
  readonly position: readonly [number, number, number]
  readonly onTrigger: (action: KeycapLayout['action']) => void
}

/**
 * A single mechanical keycap.
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
export function Keycap({ layout, position, onTrigger }: KeycapProps): React.JSX.Element {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const groupRef = useRef<import('three').Group>(null)
  useCursor(hovered)

  const accent = usePortfolioStore((state) => state.accent)
  const palette = ACCENTS[accent]

  const isAccentKey = layout.kind === 'accent'
  const fill = isAccentKey ? palette.hex : layout.kind === 'command' ? '#1b2233' : '#0f1520'

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
    spring.y.set(baseY + (pressed ? -PRESS_DEPTH : hovered ? HOVER_LIFT : 0))
    spring.scale.set(pressed ? 0.97 : hovered ? 1.03 : 1)
  }, [baseY, hovered, pressed, spring])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    group.position.set(baseX, spring.y.get(), baseZ)
    group.scale.setScalar(spring.scale.get())
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        setHovered(true)
        play('hover')
      }}
      onPointerOut={() => setHovered(false)}
      onPointerDown={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        setPressed(true)
        onTrigger(layout.action)
      }}
      onPointerUp={() => {
        setPressed(false)
        play('keyUp')
      }}
    >
      <RoundedBox args={[WIDTH, HEIGHT, DEPTH]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={fill}
          emissive={hovered || isAccentKey ? palette.hex : '#000000'}
          emissiveIntensity={hovered ? 0.7 : isAccentKey ? 0.35 : 0}
          roughness={0.45}
          metalness={0.55}
        />
      </RoundedBox>

      {/* Skirt that reads as the switch housing under the cap. */}
      <mesh position={[0, -HEIGHT / 2 - 0.045, 0]}>
        <boxGeometry args={[WIDTH * 0.62, 0.09, DEPTH * 0.62]} />
        <meshStandardMaterial color="#05070b" roughness={0.9} metalness={0.2} />
      </mesh>

      <Html center position={[0, 0.02, DEPTH / 2 + 0.01]} style={{ pointerEvents: 'none' }}>
        <span
          className={`select-none font-mono text-sm leading-none transition-colors ${
            hovered || isAccentKey ? palette.text : 'text-ink-dim'
          }`}
        >
          {layout.label}
        </span>
        {layout.hint !== undefined ? (
          <span className="mt-0.5 block text-center font-mono text-[9px] leading-none text-ink-faint">
            {layout.hint}
          </span>
        ) : null}
      </Html>
    </group>
  )
}

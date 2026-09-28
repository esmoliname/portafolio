import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import type { Group, Mesh } from 'three'

import { dimColor } from '../../lib/macropadPoses'
import { usePortfolioStore } from '../../store/usePortfolioStore'

/* ------------------------------------------------------------------ *
 * Palette — every one of these is routed through `dimColor` so the cat
 * recedes into the background together with the rest of the pad.
 * ------------------------------------------------------------------ */
const FUR = '#cbd5e8'
const FUR_DARK = '#8b98b2'
const EAR_INNER = '#ff7b9c'
const INK = '#12161f'
const DRUM_SHELL = '#2b1a2a'
const DRUM_SKIN = '#efe2cd'
const DRUM_HOOP = '#5b6478'

/* ------------------------------------------------------------------ *
 * Anatomy, in the cat's local space.
 *
 * The group the caller anchors carries the bob and the lean; the anatomy
 * hangs off a child group shifted down by `CENTER_OFFSET` so the figure's
 * visual centre lands on the anchor instead of its feet. The whole cat is
 * ~0.53 units tall, a little under twice a keycap.
 * ------------------------------------------------------------------ */
const CENTER_OFFSET = -0.05
const HEAD_Y = 0.16

/** Head details, in the head group's space (the skull is 0.165 tall). */
const EYE_SIZE: readonly [number, number, number] = [0.036, 0.05, 0.02]
const EYE_X = 0.048
const EYE_Y = 0.02
const EYE_Z = 0.079
const EAR_X = 0.062
const EAR_Y = 0.098
const EAR_SIZE = 0.048
const EAR_HEIGHT = 0.075

/** Shoulder pivot, mirrored per side, and the reach from it to the paw. */
const ARM_X = 0.098
const ARM_Y = 0.055
const ARM_Z = 0.09
const ARM_LENGTH = 0.115
const PAW_SIZE: readonly [number, number, number] = [0.042, 0.042, 0.05]

/** The drum, pushed forward so the body never intersects it. */
const DRUM_Y = -0.13
const DRUM_Z = 0.175
const DRUM_RADIUS = 0.115
const DRUM_HEIGHT = 0.07

/* ------------------------------------------------------------------ *
 * Motion constants
 * ------------------------------------------------------------------ */

/** Idle bob: a slow sine, deliberately tiny so it reads as breathing. */
const BOB_SPEED = 1.35
const BOB_AMOUNT = 0.018

/** Idle blink: a fresh random gap in this window between blinks. */
const BLINK_GAP_MIN = 3
const BLINK_GAP_MAX = 6
const BLINK_DURATION = 0.12
const BLINK_RAMP = 0.3
const EYE_SHUT = 0.08

/** Reaction envelope: a fast strike, then a damped fall back to rest. */
const STRIKE_TIME = 0.085
const DECAY = 5.4
/** The off hand trails the lead hand so a press reads as a bounce, not a pose. */
const HAND_LAG = 0.05

/**
 * Arm rest angle (paw up and inboard, ready) and strike angle (paw straight
 * down on the drum head).
 *
 * The rest angle is what makes the motion read as *down*: a rotation about z
 * lifts the paw as `cos(theta)` falls off, so an angle past a right angle buys
 * a mostly-vertical travel with only a small lateral sweep. Past ~1.15 rad the
 * paws would cross at the centre, so 0.72 is as far as this reach allows.
 */
const ARM_REST = 0.72
const HEAD_TILT = 0.2
const DRUM_SQUASH = 0.22
const DRUM_DROP = 0.008

/**
 * One-shot reaction envelope in 0..1 over the time since the last keypress.
 *
 * A near-instant attack followed by an exponential fall is what sells "hit"
 * versus "pose": the cat snaps onto the drum and settles, instead of easing
 * into a new resting state. Negative time (the trailing hand) is clamped to 0
 * so the second arm simply starts late.
 */
function reactionAt(age: number): number {
  if (age < 0) return 0
  if (age < STRIKE_TIME) return age / STRIKE_TIME
  return Math.exp(-(age - STRIKE_TIME) * DECAY)
}

/**
 * Eye openness across a blink: wide at the edges, shut through the middle,
 * with a symmetric ramp so it reads as a lid instead of a linear squash.
 */
function eyeOpenness(age: number): number {
  if (age >= BLINK_DURATION) return 1
  const progress = age / BLINK_DURATION
  const edgeDistance = Math.min(progress, 1 - progress) * 2
  const lid = Math.min(1, edgeDistance / BLINK_RAMP)
  return EYE_SHUT + (1 - EYE_SHUT) * lid
}

export interface MascotProps {
  /** Anchor in the pad's local space. */
  readonly position: readonly [number, number, number]
  /** 0 = foreground, 1 = recessed into the background. */
  readonly dim: number
}

/**
 * Bongo-Cat-style drummer: a blocky cat sitting behind a small drum.
 *
 * Built from primitives only — boxes, cones, cylinders, one torus hoop — so it
 * costs a handful of draw calls and needs no assets.
 *
 * As in Keycap.tsx and Macropad.tsx, nothing is animated through state or a
 * re-render: every transform is written exactly once per frame in `useFrame`,
 * read from plain numbers and refs. `mascotHit` is a monotonic counter, so the
 * trigger is a ref comparison inside the frame loop and two fast presses can
 * never collapse into a single reaction.
 */
export function Mascot({ position, dim }: MascotProps): React.JSX.Element {
  const mascotHit = usePortfolioStore((state) => state.mascotHit)
  const reduceMotion = useReducedMotion()

  const groupRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)
  const armLeftRef = useRef<Group>(null)
  const armRightRef = useRef<Group>(null)
  const drumRef = useRef<Group>(null)
  const eyeLeftRef = useRef<Mesh>(null)
  const eyeRightRef = useRef<Mesh>(null)

  // Animation bookkeeping lives in refs, never in state: none of it may
  // trigger a render.
  const lastHitRef = useRef(mascotHit)
  const hitAgeRef = useRef(Number.POSITIVE_INFINITY)
  // `blinkAgeRef` doubles as the gap timer and the blink progress: a blink is
  // simply the first `BLINK_DURATION` of each gap.
  const blinkAgeRef = useRef(BLINK_DURATION)
  const blinkGapRef = useRef(BLINK_GAP_MIN)

  const [anchorX, anchorY, anchorZ] = position

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    // --- trigger ---------------------------------------------------------
    // Compared here, not in an effect: a ref write cannot restart a running
    // animation the way a state reset would, and every press — however fast —
    // re-arms the accumulator.
    if (mascotHit !== lastHitRef.current) {
      lastHitRef.current = mascotHit
      hitAgeRef.current = 0
    }
    hitAgeRef.current += delta

    // --- idle blink cadence ---------------------------------------------
    blinkAgeRef.current += delta
    if (blinkAgeRef.current >= blinkGapRef.current) {
      blinkAgeRef.current = 0
      blinkGapRef.current = BLINK_GAP_MIN + Math.random() * (BLINK_GAP_MAX - BLINK_GAP_MIN)
    }

    // --- reaction --------------------------------------------------------
    const strike = reduceMotion ? 0 : reactionAt(hitAgeRef.current)
    const trail = reduceMotion ? 0 : reactionAt(hitAgeRef.current - HAND_LAG)

    // --- bob + lean ------------------------------------------------------
    const bob = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * BOB_SPEED) * BOB_AMOUNT
    group.position.set(anchorX, anchorY + bob, anchorZ)
    group.rotation.z = -strike * 0.06

    // --- head ------------------------------------------------------------
    const head = headRef.current
    if (head) {
      head.rotation.z = -strike * HEAD_TILT
      head.position.y = HEAD_Y - strike * 0.012
    }

    // --- arms ------------------------------------------------------------
    // A positive z-rotation lifts a hanging paw and pulls it inboard, so the
    // rest angle holds them ready and relaxing it to zero is the strike: the
    // paw falls the rest of the way down onto the drum head.
    const leftArm = armLeftRef.current
    if (leftArm) leftArm.rotation.z = ARM_REST * (1 - strike)

    const rightArm = armRightRef.current
    if (rightArm) rightArm.rotation.z = -ARM_REST * (1 - trail)

    // --- drum ------------------------------------------------------------
    // Squashing the group sinks the top skin with it, which is the whole point:
    // the paw visibly meets a drum that recoils under the blow.
    const drum = drumRef.current
    if (drum) {
      drum.scale.y = 1 - DRUM_SQUASH * strike
      drum.position.y = DRUM_Y - DRUM_DROP * strike
    }

    // --- eyes ------------------------------------------------------------
    // A press blinks on top of whatever the idle cadence is doing; taking the
    // minimum means a blink always wins over a wide-open eye.
    const openness = reduceMotion
      ? 1
      : Math.min(eyeOpenness(blinkAgeRef.current), eyeOpenness(hitAgeRef.current))

    eyeLeftRef.current?.scale.set(1, openness, 1)
    eyeRightRef.current?.scale.set(1, openness, 1)
  })

  const fur = dimColor(FUR, dim)
  const furDark = dimColor(FUR_DARK, dim)
  const earInner = dimColor(EAR_INNER, dim)
  const ink = dimColor(INK, dim)
  const shell = dimColor(DRUM_SHELL, dim)
  const skin = dimColor(DRUM_SKIN, dim)
  const hoop = dimColor(DRUM_HOOP, dim)

  return (
    <group ref={groupRef} position={position}>
      <group position={[0, CENTER_OFFSET, 0]}>
        {/* Torso + chest bib */}
        <mesh>
          <boxGeometry args={[0.175, 0.16, 0.135]} />
          <meshStandardMaterial color={fur} roughness={0.85} metalness={0.05} />
        </mesh>
        <mesh position={[0, -0.015, 0.07]}>
          <boxGeometry args={[0.11, 0.075, 0.02]} />
          <meshStandardMaterial color={furDark} roughness={0.9} metalness={0.05} />
        </mesh>

        {/* Head: skull, muzzle, nose, eyes, ears */}
        <group ref={headRef} position={[0, HEAD_Y, 0.01]}>
          <mesh>
            <boxGeometry args={[0.19, 0.165, 0.155]} />
            <meshStandardMaterial color={fur} roughness={0.85} metalness={0.05} />
          </mesh>
          <mesh position={[0, -0.055, 0.082]}>
            <boxGeometry args={[0.1, 0.055, 0.045]} />
            <meshStandardMaterial color={furDark} roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh position={[0, -0.042, 0.108]}>
            <boxGeometry args={[0.028, 0.02, 0.018]} />
            <meshStandardMaterial color={ink} roughness={0.5} metalness={0.1} />
          </mesh>

          <mesh ref={eyeLeftRef} position={[-EYE_X, EYE_Y, EYE_Z]}>
            <boxGeometry args={EYE_SIZE} />
            <meshStandardMaterial color={ink} roughness={0.4} metalness={0.1} />
          </mesh>
          <mesh ref={eyeRightRef} position={[EYE_X, EYE_Y, EYE_Z]}>
            <boxGeometry args={EYE_SIZE} />
            <meshStandardMaterial color={ink} roughness={0.4} metalness={0.1} />
          </mesh>

          {/* Four-segment cones read as low-poly triangular ears. */}
          <group position={[-EAR_X, EAR_Y, -0.005]} rotation={[0, 0, 0.22]}>
            <mesh position={[0, 0.018, 0]}>
              <coneGeometry args={[EAR_SIZE, EAR_HEIGHT, 4]} />
              <meshStandardMaterial color={fur} roughness={0.85} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.012, 0.026]} rotation={[0.18, 0, 0]}>
              <coneGeometry args={[0.027, 0.044, 4]} />
              <meshStandardMaterial color={earInner} roughness={0.9} metalness={0.05} />
            </mesh>
          </group>
          <group position={[EAR_X, EAR_Y, -0.005]} rotation={[0, 0, -0.22]}>
            <mesh position={[0, 0.018, 0]}>
              <coneGeometry args={[EAR_SIZE, EAR_HEIGHT, 4]} />
              <meshStandardMaterial color={fur} roughness={0.85} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.012, 0.026]} rotation={[0.18, 0, 0]}>
              <coneGeometry args={[0.027, 0.044, 4]} />
              <meshStandardMaterial color={earInner} roughness={0.9} metalness={0.05} />
            </mesh>
          </group>
        </group>

        {/* Arms. The shoulder pads bridge the torso to a pivot that sits in
            front of the chest, so the paws swing clear of the body. */}
        <mesh position={[-0.075, 0.05, 0.03]}>
          <boxGeometry args={[0.055, 0.06, 0.1]} />
          <meshStandardMaterial color={fur} roughness={0.85} metalness={0.05} />
        </mesh>
        <mesh position={[0.075, 0.05, 0.03]}>
          <boxGeometry args={[0.055, 0.06, 0.1]} />
          <meshStandardMaterial color={fur} roughness={0.85} metalness={0.05} />
        </mesh>

        {/* Pivoted at the shoulder so a z-rotation swings the paw down */}
        <group ref={armLeftRef} position={[-ARM_X, ARM_Y, ARM_Z]}>
          <mesh position={[0, -ARM_LENGTH * 0.495, 0.005]}>
            <boxGeometry args={[0.042, ARM_LENGTH * 0.88, 0.042]} />
            <meshStandardMaterial color={fur} roughness={0.85} metalness={0.05} />
          </mesh>
          <mesh position={[0, -ARM_LENGTH, 0.012]}>
            <boxGeometry args={PAW_SIZE} />
            <meshStandardMaterial color={furDark} roughness={0.9} metalness={0.05} />
          </mesh>
        </group>
        <group ref={armRightRef} position={[ARM_X, ARM_Y, ARM_Z]}>
          <mesh position={[0, -ARM_LENGTH * 0.495, 0.005]}>
            <boxGeometry args={[0.042, ARM_LENGTH * 0.88, 0.042]} />
            <meshStandardMaterial color={fur} roughness={0.85} metalness={0.05} />
          </mesh>
          <mesh position={[0, -ARM_LENGTH, 0.012]}>
            <boxGeometry args={PAW_SIZE} />
            <meshStandardMaterial color={furDark} roughness={0.9} metalness={0.05} />
          </mesh>
        </group>

        {/* Drum: shell, two skins, a hoop, two legs */}
        <group ref={drumRef} position={[0, DRUM_Y, DRUM_Z]}>
          <mesh>
            <cylinderGeometry args={[DRUM_RADIUS, DRUM_RADIUS, DRUM_HEIGHT, 16]} />
            <meshStandardMaterial color={shell} roughness={0.6} metalness={0.2} />
          </mesh>
          <mesh position={[0, DRUM_HEIGHT / 2, 0]}>
            <cylinderGeometry args={[DRUM_RADIUS + 0.003, DRUM_RADIUS + 0.003, 0.012, 16]} />
            <meshStandardMaterial color={skin} roughness={0.75} metalness={0.1} />
          </mesh>
          <mesh position={[0, -DRUM_HEIGHT / 2, 0]}>
            <cylinderGeometry args={[DRUM_RADIUS + 0.003, DRUM_RADIUS + 0.003, 0.012, 16]} />
            <meshStandardMaterial color={skin} roughness={0.75} metalness={0.1} />
          </mesh>
          <mesh position={[0, DRUM_HEIGHT / 2 - 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[DRUM_RADIUS + 0.003, 0.008, 6, 16]} />
            <meshStandardMaterial color={hoop} roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[-0.085, -DRUM_HEIGHT / 2 - 0.023, 0.02]}>
            <boxGeometry args={[0.022, 0.05, 0.022]} />
            <meshStandardMaterial color={shell} roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[0.085, -DRUM_HEIGHT / 2 - 0.023, 0.02]}>
            <boxGeometry args={[0.022, 0.05, 0.022]} />
            <meshStandardMaterial color={shell} roughness={0.7} metalness={0.2} />
          </mesh>
        </group>

        {/* Feet + a curled tail so the silhouette is not a plain stack. */}
        <mesh position={[-0.055, -0.075, 0.045]}>
          <boxGeometry args={[0.05, 0.03, 0.06]} />
          <meshStandardMaterial color={furDark} roughness={0.9} metalness={0.05} />
        </mesh>
        <mesh position={[0.055, -0.075, 0.045]}>
          <boxGeometry args={[0.05, 0.03, 0.06]} />
          <meshStandardMaterial color={furDark} roughness={0.9} metalness={0.05} />
        </mesh>
        <mesh position={[0.078, -0.05, -0.075]} rotation={[0.5, 0, 0.3]}>
          <boxGeometry args={[0.04, 0.04, 0.14]} />
          <meshStandardMaterial color={fur} roughness={0.85} metalness={0.05} />
        </mesh>
      </group>
    </group>
  )
}

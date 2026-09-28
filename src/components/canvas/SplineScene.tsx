import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { skills } from '../../data/portfolio'

/**
 * Spline scene URL - configure via environment variable or provide a default
 * To use your own Spline scene:
 * 1. Create a scene at https://spline.design
 * 2. Publish it and copy the scene URL
 * 3. Set VITE_SPLINE_SCENE_URL in your .env file
 * 
 * Default: Public Spline demo scene (floating geometric shapes)
 */
const SPLINE_SCENE_URL = import.meta.env.VITE_SPLINE_SCENE_URL ?? 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode'

interface SplineSceneProps {
  readonly className?: string
  readonly onSkillSelect?: (skillId: string) => void
}

/**
 * Loading fallback with antigravity floating keycaps animation.
 * Displayed while the Spline scene is loading.
 */
function LoadingFallback(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-full flex items-center justify-center bg-zinc-950"
      style={{ background: 'radial-gradient(ellipse at center, #0d1117 0%, #050508 100%)' }}
    >
      <div className="text-center space-y-6">
        {/* Floating keycaps animation */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="grid grid-cols-3 gap-3 max-w-xs mx-auto"
        >
          {skills.slice(0, 9).map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              whileHover={{ y: -5, scale: 1.1, transition: { duration: 0.2 } }}
              className="relative aspect-square rounded-xl bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm flex items-center justify-center group"
              style={{ background: `linear-gradient(135deg, ${skill.accent === 'neon' ? '#39ff9e' : skill.accent === 'cyan' ? '#22d3ee' : skill.accent === 'violet' ? '#a855f7' : '#fbbf24'}15, transparent), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), transparent)` }}
            >
              <span className="font-mono text-lg font-bold text-zinc-400 group-hover:text-white transition-colors">
                {skill.key}
              </span>
              <span className="absolute bottom-1 right-1 text-[8px] text-zinc-600 font-mono">
                {skill.legend}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-2 text-zinc-500 font-mono text-sm"
        >
          <p>Cargando escena 3D...</p>
          <p className="text-xs text-zinc-600">Presiona 1-9 para explorar tecnologías</p>
        </motion.div>

        {/* Ambient particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.3, 0], scale: [0, 1, 0] }}
              transition={{
                duration: gsap.utils.random(4, 8),
                repeat: Infinity,
                delay: gsap.utils.random(0, 4),
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                left: `${gsap.utils.random(10, 90)}%`,
                top: `${gsap.utils.random(10, 90)}%`,
                width: `${gsap.utils.random(2, 6)}px`,
                height: `${gsap.utils.random(2, 6)}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${['#39ff9e', '#22d3ee', '#a855f7', '#fbbf24'][gsap.utils.random(0, 3, 1)]}66, transparent)`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Error fallback displayed when the Spline scene fails to load.
 */
function ErrorFallback(): React.JSX.Element {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-400 font-mono text-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-3"
      >
        <p className="text-lg font-semibold text-white">No se pudo cargar la escena 3D</p>
        <p className="text-xs text-zinc-500 max-w-xs">
          La escena de Spline no está disponible. Verifica tu conexión o configura <code className="font-mono bg-zinc-800 px-1 rounded">VITE_SPLINE_SCENE_URL</code> en tu archivo <code className="font-mono bg-zinc-800 px-1 rounded">.env</code>.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 transition-colors text-sm"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M21 12a9 9 0 1 1-9 9 9.75 9.75 0 0 1 6.74-2.74L21 16" />
          </svg>
          Reintentar
        </button>
      </motion.div>
    </div>
  )
}

/**
 * Floating keyboard 3D scene using Spline.
 * Implements antigravity effect with lazy loading and smooth animations.
 */
export function SplineScene({ className, onSkillSelect }: SplineSceneProps): React.JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const splineRef = useRef<HTMLDivElement>(null)
  const activeSection = usePortfolioStore((state) => state.activeSection)
  const activeSkillId = usePortfolioStore((state) => state.activeSkillId)
  const selectSkill = usePortfolioStore((state) => state.selectSkill)

  // Animate entrance when loaded
  useEffect(() => {
    if (isLoaded && splineRef.current) {
      gsap.fromTo(
        splineRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
        }
      )
    }
  }, [isLoaded])

  // Handle section changes - could trigger camera transitions in Spline
  useEffect(() => {
    if (splineRef.current) {
      // Spline scene would handle camera transitions based on section
      console.debug('[SplineScene] Section changed:', activeSection)
    }
  }, [activeSection])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setHasError(false)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoaded(false)
  }, [])

  // Keyboard interaction handler - memoized to avoid useEffect re-runs
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key
    if (key >= '1' && key <= '9') {
      const skillIndex = parseInt(key, 10) - 1
      const skill = skills[skillIndex]
      if (skill) {
        event.preventDefault()
        selectSkill(skill.id)
        onSkillSelect?.(skill.id)
      }
    }
  }, [selectSkill, onSkillSelect])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={<LoadingFallback />}>
        {hasError ? (
          <ErrorFallback />
        ) : (
          <Spline
            ref={splineRef}
            scene={SPLINE_SCENE_URL}
            onLoad={handleLoad}
            onError={handleError}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </Suspense>

      {/* Skill indicator overlay */}
      {isLoaded && activeSkillId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div className="glass rounded-2xl px-6 py-3 flex items-center gap-3 min-w-[280px] max-w-[90vw]">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              Tecla activa
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {skills.find(s => s.id === activeSkillId)?.name ?? activeSkillId}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
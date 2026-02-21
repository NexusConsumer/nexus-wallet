import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

// ── Constants ──
const PILL_MIN = 86
const PILL_MAX = 480
const TRIGGER = 0.88

const PARTICLE_COLORS = [
  "#635bff", "#00d4ff", "#7dd3a8", "#ff91b8",
  "#ffb74d", "#80deea", "#9c88ff", "#ffffff",
]

const REVEAL_BG = `
  radial-gradient(800px 600px at 20% 70%, rgba(99,91,255,0.9), transparent 60%),
  radial-gradient(700px 600px at 80% 30%, #00d4ff, transparent 60%),
  radial-gradient(700px 600px at 85% 85%, #9c88ff, transparent 60%),
  linear-gradient(135deg, #635bff, #00d4ff)
`

const PILL_TEX_BG = `
  radial-gradient(500px 400px at 30% 70%, rgba(99,91,255,0.9), transparent 60%),
  radial-gradient(500px 400px at 80% 20%, #00d4ff, transparent 60%),
  linear-gradient(135deg, #635bff, #00d4ff)
`

interface Particle {
  id: number
  vx: number
  vy: number
  size: number
  color: string
}

export default function PremiumRevealPage() {
  const { lang = "he" } = useParams()
  const navigate = useNavigate()

  const [pillHeight, setPillHeight] = useState(PILL_MIN)
  const [isDragging, setIsDragging] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [logoOut, setLogoOut] = useState(false)
  const [ripples, setRipples] = useState<number[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [revealClip, setRevealClip] = useState("circle(0px at 50% 100%)")

  const startYRef = useRef(0)
  const screenRef = useRef<HTMLDivElement>(null)

  // ── Drag handlers ──
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (revealed) return
      e.preventDefault()
      setIsDragging(true)
      startYRef.current = e.clientY
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [revealed],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || revealed) return
      const dy = startYRef.current - e.clientY
      if (dy > 0) {
        setPillHeight(Math.min(PILL_MIN + dy, PILL_MAX))
      } else {
        setPillHeight(PILL_MIN)
      }
    },
    [isDragging, revealed],
  )

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const progress = (pillHeight - PILL_MIN) / (PILL_MAX - PILL_MIN)
    if (progress >= TRIGGER && !revealed) {
      triggerReveal()
    } else if (!revealed) {
      setPillHeight(PILL_MIN)
    }
  }, [isDragging, pillHeight, revealed])

  // ── Reveal sequence ──
  const triggerReveal = useCallback(() => {
    setRevealed(true)

    // Expand clip-path
    const r = screenRef.current
    const maxR = r ? Math.hypot(r.clientWidth, r.clientHeight) : 800
    setRevealClip(`circle(${maxR}px at 50% 100%)`)

    // Logo out
    setLogoOut(true)

    // Flash
    setTimeout(() => {
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 120)
    }, 100)

    // Ripple
    setTimeout(() => setRipples([Date.now()]), 80)

    // Particles
    setTimeout(() => {
      setParticles(
        Array.from({ length: 25 }, (_, i) => ({
          id: i,
          vx: (Math.random() - 0.5) * 12,
          vy: -(Math.random() * 8 + 4),
          size: 3 + Math.random() * 5,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        })),
      )
    }, 150)

    // Vibrate
    if (navigator.vibrate) navigator.vibrate([20, 40, 20])

    // Navigate home
    setTimeout(() => navigate(`/${lang}`), 2500)
  }, [lang, navigate])

  // Pill texture opacity
  const pillProgress = (pillHeight - PILL_MIN) / (PILL_MAX - PILL_MIN)
  const pillTexOpacity = Math.min(1, pillProgress * 1.5)

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--color-surface)" }}
      dir="rtl"
    >
      {/* Close button */}
      <button
        onClick={() => navigate(`/${lang}`)}
        className="absolute top-4 left-4 z-50 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)" }}
      >
        <span className="text-white text-lg leading-none">✕</span>
      </button>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-right mb-5 w-full max-w-sm z-10 relative px-6"
      >
        <h2
          className="text-2xl font-semibold leading-relaxed"
          style={{ color: "var(--color-primary)" }}
        >
          גלה את הפרימיום שלך
        </h2>
        <p
          className="text-base font-normal mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          החלק למעלה כדי לגלות
        </p>
      </motion.div>

      {/* Phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="relative z-10"
      >
        {/* Glow behind phone */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[90px] z-0"
          style={{
            width: 280,
            height: 400,
            background: "rgba(99, 91, 255, 0.15)",
            filter: "blur(40px)",
          }}
        />

        {/* Phone frame */}
        <motion.div
          animate={isDragging ? undefined : { y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="relative z-10"
          style={{
            width: 260,
            aspectRatio: "9 / 18.8",
            borderRadius: 36,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04)), #0b0f1a",
            padding: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 30px 80px rgba(7,10,20,0.35)",
          }}
        >
          {/* Inner frame highlight */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: 7,
              borderRadius: 29,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />

          {/* Screen */}
          <div
            ref={screenRef}
            className="w-full h-full relative overflow-hidden"
            style={{
              borderRadius: 28,
              background: "#635bff",
              WebkitMaskImage: "radial-gradient(white, white)",
              maskImage: "radial-gradient(white, white)",
            }}
          >
            {/* Notch */}
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 z-30"
              style={{
                width: 100,
                height: 22,
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0 0 14px 14px",
                backdropFilter: "blur(6px)",
              }}
            />

            {/* Logo */}
            <div
              className="absolute inset-0 flex items-center justify-center z-10 transition-all duration-400"
              style={{
                opacity: logoOut ? 0 : 1,
                transform: logoOut ? "scale(0.95)" : "scale(1)",
              }}
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 90,
                  height: 90,
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 0 60px rgba(255,255,255,0.15)",
                }}
              >
                <img
                  src="/nexus-logo.png"
                  alt="Nexus"
                  style={{ width: 52, height: 52, objectFit: "contain" }}
                />
              </div>
            </div>

            {/* Reveal overlay */}
            <div
              className="absolute inset-0 z-20"
              style={{
                background: REVEAL_BG,
                clipPath: revealClip,
                transition: revealed
                  ? "clip-path 0.7s cubic-bezier(0.2, 0.9, 0.2, 1)"
                  : "none",
              }}
            />

            {/* Flash */}
            <div
              className="absolute inset-0 z-40 pointer-events-none"
              style={{
                background: "white",
                opacity: showFlash ? 1 : 0,
                transition: showFlash ? "none" : "opacity 0.15s",
              }}
            />

            {/* Ripples */}
            {ripples.map((key) => (
              <motion.div
                key={key}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 40, opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
                className="absolute z-30 pointer-events-none"
                style={{
                  bottom: 0,
                  left: "50%",
                  width: 10,
                  height: 10,
                  marginLeft: -5,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.9)",
                }}
              />
            ))}

            {/* Particles */}
            {particles.map((p) => (
              <ParticleDot key={p.id} p={p} />
            ))}

            {/* Pill slider */}
            <div
              className="absolute z-30"
              style={{
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                width: 82,
                height: pillHeight,
                background: "#2a2570",
                borderRadius: 999,
                overflow: "hidden",
                cursor: revealed ? "default" : "grab",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                touchAction: "none",
                transition: isDragging ? "none" : "height 0.3s ease-out",
                opacity: revealed ? 0 : 1,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Pill gradient texture */}
              <div
                className="absolute inset-0"
                style={{
                  background: PILL_TEX_BG,
                  opacity: pillTexOpacity,
                }}
              />

              {/* Cap circle with arrow */}
              <div
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
                style={{
                  top: 8,
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "#635bff",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{ transform: "rotate(0deg)" }}
                >
                  <path
                    d="M10 15V5M10 5L5 10M10 5L15 10"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Instruction text */}
            {!revealed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.8 }}
                className="absolute z-20 text-center w-full"
                style={{
                  bottom: 118,
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: 0.5,
                }}
              >
                ↑ החלק למעלה
              </motion.p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ── Particle component ──
function ParticleDot({ p }: { p: Particle }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    let x = 0
    let y = 0
    let vx = p.vx
    let vy = p.vy
    let life = 60
    let frame: number

    const tick = () => {
      x += vx
      y += vy
      vy += 0.12
      life--
      if (ref.current) {
        ref.current.style.transform = `translate(${x}px, ${y}px)`
        ref.current.style.opacity = `${Math.max(0, life / 60)}`
      }
      if (life > 0) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [p])

  return (
    <div
      ref={ref}
      className="absolute z-50 pointer-events-none"
      style={{
        bottom: 0,
        left: "50%",
        width: p.size,
        height: p.size,
        borderRadius: "50%",
        backgroundColor: p.color,
      }}
    />
  )
}

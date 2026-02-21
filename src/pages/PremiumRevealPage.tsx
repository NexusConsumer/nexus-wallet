import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

// ── Constants ──
const BG_COLOR = "#0A2540"
const TRACK_INSET = "#061B2E"
const CAP_SIZE = 76
const CAP_TOP_PAD = 8
const PILL_MIN = CAP_TOP_PAD + CAP_SIZE + 20
const TRIGGER = 0.88

const PARTICLE_COLORS = [
  "#d881f4", "#80deea", "#ffd54f", "#f48fb1",
  "#b39ddb", "#ff91b8", "#ffb74d", "#ffffff",
]

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
  const [viewH, setViewH] = useState(800)
  const [viewW, setViewW] = useState(400)

  const startYRef = useRef(0)

  useEffect(() => {
    setViewH(window.innerHeight)
    setViewW(window.innerWidth)
  }, [])

  const PILL_MAX = viewH * 0.88
  const sliderWidth = Math.max(Math.round(viewW * 0.25), CAP_SIZE + 16)
  const trackBaseH = Math.round(viewH / 6)
  const trackH = Math.max(trackBaseH, pillHeight + CAP_TOP_PAD)

  // Half-widths for overlay positioning
  const halfTrack = sliderWidth / 2

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
    [isDragging, revealed, PILL_MAX],
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
  }, [isDragging, pillHeight, revealed, PILL_MAX])

  // ── Reveal sequence ──
  const triggerReveal = useCallback(() => {
    setRevealed(true)
    setLogoOut(true)

    setTimeout(() => {
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 120)
    }, 100)

    setTimeout(() => setRipples([Date.now()]), 80)

    setTimeout(() => {
      setParticles(
        Array.from({ length: 25 }, (_, i) => ({
          id: i,
          vx: (Math.random() - 0.5) * 14,
          vy: -(Math.random() * 10 + 4),
          size: 3 + Math.random() * 5,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        })),
      )
    }, 150)

    if (navigator.vibrate) navigator.vibrate([20, 40, 20])
    setTimeout(() => navigate(`/${lang}`), 2500)
  }, [lang, navigate])

  const pillProgress = (pillHeight - PILL_MIN) / (PILL_MAX - PILL_MIN)
  const pillTexOpacity = Math.min(1, pillProgress * 1.5)

  const overlayTransition = isDragging
    ? "opacity 0.4s"
    : "height 0.3s ease-out, opacity 0.4s"

  return (
    <div className="fixed inset-0 overflow-hidden" dir="rtl">
      {/* Layer 0 — Animated gradient background (hidden under overlay) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#ffb74d] via-[#ff91b8] to-[#9c88ff]">
        <div
          className="absolute"
          style={{
            width: "150%",
            height: "150%",
            top: "-25%",
            left: "-25%",
            filter: "blur(70px)",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{ width: "55%", height: "65%", top: "0%", left: "50%", opacity: 0.9, background: "radial-gradient(circle, #d881f4, #c068e0)", animation: "blob1 10s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute rounded-full"
            style={{ width: "60%", height: "60%", top: "20%", left: "20%", opacity: 0.9, background: "radial-gradient(circle, #80deea, #4dd0e1)", animation: "blob2 13s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute rounded-full"
            style={{ width: "45%", height: "45%", top: "12%", left: "-5%", opacity: 0.8, background: "radial-gradient(circle, #ffd54f, #ffb74d)", animation: "blob3 12s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute rounded-full"
            style={{ width: "55%", height: "55%", top: "30%", left: "40%", opacity: 0.85, background: "radial-gradient(circle, #f48fb1, #ec407a)", animation: "blob4 11s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute rounded-full"
            style={{ width: "50%", height: "55%", top: "5%", left: "30%", opacity: 0.85, background: "radial-gradient(circle, #b39ddb, #9575cd)", animation: "blob5 14s ease-in-out infinite alternate" }}
          />
        </div>
      </div>

      {/* Layer 1 — Dark blue overlay (3 pieces around track cutout) */}
      {/* Top section: full width, from top to track top edge */}
      <div
        className="absolute left-0 right-0 top-0 z-10 pointer-events-none"
        style={{
          height: viewH - trackH + 1,
          background: BG_COLOR,
          opacity: revealed ? 0 : 1,
          transition: overlayTransition,
        }}
      />
      {/* Bottom-left: left of track cutout */}
      <div
        className="absolute bottom-0 z-10 pointer-events-none"
        style={{
          left: 0,
          width: `calc(50% - ${halfTrack}px)`,
          height: trackH,
          background: BG_COLOR,
          opacity: revealed ? 0 : 1,
          transition: overlayTransition,
        }}
      />
      {/* Bottom-right: right of track cutout */}
      <div
        className="absolute bottom-0 z-10 pointer-events-none"
        style={{
          right: 0,
          width: `calc(50% - ${halfTrack}px)`,
          height: trackH,
          background: BG_COLOR,
          opacity: revealed ? 0 : 1,
          transition: overlayTransition,
        }}
      />

      {/* Track inset — darker shade inside the cutout for recessed look */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 z-[5] pointer-events-none"
        style={{
          width: sliderWidth,
          height: trackH,
          background: TRACK_INSET,
          boxShadow: "inset 0 4px 12px rgba(0,0,0,0.5)",
          opacity: revealed ? 0 : 1,
          transition: overlayTransition,
        }}
      />

      {/* Logo — centered */}
      <div
        className="absolute inset-0 flex items-center justify-center z-20"
        style={{
          opacity: logoOut ? 0 : 1,
          transform: logoOut ? "scale(0.9)" : "scale(1)",
          transition: "all 0.5s ease-out",
        }}
      >
        <img
          src="/nexus-icon.png"
          alt="Nexus"
          style={{
            width: 72,
            height: 72,
            objectFit: "contain",
            filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.15))",
          }}
        />
      </div>

      {/* Slider track + cap */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-30"
        style={{
          width: sliderWidth,
          height: pillHeight,
          bottom: 0,
          borderRadius: 0,
          overflow: "hidden",
          cursor: revealed ? "default" : "grab",
          touchAction: "none",
          transition: isDragging ? "none" : "height 0.3s ease-out, opacity 0.4s",
          opacity: revealed ? 0 : 1,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Gradient fill visible through track (increases with drag) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(216,129,244,0.5), rgba(128,222,234,0.3), rgba(244,143,177,0.4))",
            opacity: pillTexOpacity,
          }}
        />

        {/* Cap circle */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{
            top: CAP_TOP_PAD,
            width: CAP_SIZE,
            height: CAP_SIZE,
            borderRadius: "50%",
            background: BG_COLOR,
            boxShadow: "0 0 12px 2px rgba(0,0,0,0.3)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
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

      {/* Flash overlay */}
      <div
        className="absolute inset-0 z-50 pointer-events-none"
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
          animate={{ scale: 50, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.9, 0.2, 1] }}
          className="absolute z-40 pointer-events-none"
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

      {/* Close button */}
      <button
        onClick={() => navigate(`/${lang}`)}
        className="absolute top-4 left-4 z-50 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}
      >
        <span className="text-white text-lg leading-none">✕</span>
      </button>

      {/* Blob animation keyframes */}
      <style>{`
        @keyframes blob1 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-25%, 20%) scale(1.25); }
          50% { transform: translate(15%, -20%) scale(0.85); }
          75% { transform: translate(-20%, -10%) scale(1.15); }
          100% { transform: translate(20%, 15%) scale(0.9); }
        }
        @keyframes blob2 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(25%, -20%) scale(1.3); }
          50% { transform: translate(-20%, 25%) scale(0.8); }
          75% { transform: translate(15%, 15%) scale(1.2); }
          100% { transform: translate(-25%, -15%) scale(1.1); }
        }
        @keyframes blob3 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-20%, -25%) scale(1.2); }
          50% { transform: translate(25%, 20%) scale(1.3); }
          75% { transform: translate(20%, -15%) scale(0.85); }
          100% { transform: translate(-15%, 25%) scale(1.15); }
        }
        @keyframes blob4 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20%, 20%) scale(0.85); }
          50% { transform: translate(-25%, -15%) scale(1.25); }
          75% { transform: translate(-10%, 25%) scale(1.1); }
          100% { transform: translate(25%, -20%) scale(0.9); }
        }
        @keyframes blob5 {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(25%, 10%) scale(1.2); }
          50% { transform: translate(-15%, -25%) scale(1.15); }
          75% { transform: translate(20%, 20%) scale(0.85); }
          100% { transform: translate(-20%, 15%) scale(1.3); }
        }
      `}</style>
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
    const vx = p.vx
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

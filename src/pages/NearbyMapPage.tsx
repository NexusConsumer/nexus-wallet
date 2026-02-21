import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"

// ── Brand offer bubbles along the route ──
const routeOffers = [
  { brand: "Golf & Co",      logo: "/brands/golf.png",           discount: "20%", x: 28, y: 62 },
  { brand: "American Eagle", logo: "/brands/american-eagle.png", discount: "15%", x: 38, y: 52 },
  { brand: "Rami Levy",      logo: "/brands/rami-levy.png",      discount: "10%", x: 50, y: 42 },
  { brand: "Mango",          logo: "/brands/mango.png",          discount: "25%", x: 62, y: 34 },
  { brand: "Samsung",        logo: "/brands/samsung.png",        discount: "30%", x: 72, y: 26 },
]

// Preload logos
if (typeof window !== "undefined") {
  routeOffers.forEach(({ logo }) => { const i = new Image(); i.src = logo })
}

// Map tile — CARTO Voyager, Tel Aviv, zoom 15
const MAP_TILE = "https://a.basemaps.cartocdn.com/rastertiles/voyager/15/19837/13514@2x.png"

// User dot position (%)
const USER_POS = { x: 18, y: 72 }
// Destination pin position (%)
const PIN_POS = { x: 78, y: 20 }

export default function NearbyMapPage() {
  const [phase, setPhase] = useState(0) // 0=idle, 1=dot, 2=pin, 3=route, 4=bubbles, 5=hold
  const [visibleBubbles, setVisibleBubbles] = useState(0)
  const [loopKey, setLoopKey] = useState(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const t = timersRef.current
    // Clear previous
    t.forEach(clearTimeout)
    t.length = 0

    // Reset
    setPhase(0)
    setVisibleBubbles(0)

    // Animation sequence
    t.push(setTimeout(() => setPhase(1), 300))    // dot
    t.push(setTimeout(() => setPhase(2), 1200))   // pin
    t.push(setTimeout(() => setPhase(3), 2000))   // route
    t.push(setTimeout(() => setPhase(4), 3200))   // bubbles start

    // Stagger bubbles
    routeOffers.forEach((_, i) => {
      t.push(setTimeout(() => setVisibleBubbles(i + 1), 3200 + i * 400))
    })

    t.push(setTimeout(() => setPhase(5), 5500))   // hold

    // Fade out and restart
    t.push(setTimeout(() => {
      setPhase(0)
      setVisibleBubbles(0)
      // Trigger remount for fresh animation
      setTimeout(() => setLoopKey((k) => k + 1), 500)
    }, 7500))

    return () => { t.forEach(clearTimeout); t.length = 0 }
  }, [loopKey])

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "var(--color-surface)" }}
      dir="rtl"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-right mb-5 w-full max-w-sm z-10 relative"
      >
        <h2
          className="text-2xl font-semibold leading-relaxed"
          style={{ color: "var(--color-primary)" }}
        >
          נציג לך איפה ההטבות הכי שוות מסביבך
        </h2>
        <p
          className="text-base font-normal mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          בכל רגע נתון, בכל מקום
        </p>
      </motion.div>

      {/* Phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        className="relative z-10"
      >
        {/* Subtle glow behind phone */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[90px] z-0"
          style={{
            width: 280,
            height: 420,
            background: "rgba(99, 91, 255, 0.12)",
            filter: "blur(50px)",
          }}
        />

        {/* Phone frame */}
        <div
          className="relative z-10"
          style={{
            width: 260,
            aspectRatio: "9 / 18.8",
            borderRadius: 36,
            background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04)), #0b0f1a",
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
            className="w-full h-full relative overflow-hidden"
            style={{ borderRadius: 28 }}
          >
            {/* Notch */}
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 z-30"
              style={{
                width: 100,
                height: 22,
                background: "rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "0 0 14px 14px",
                backdropFilter: "blur(6px)",
              }}
            />

            {/* Map background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("${MAP_TILE}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "saturate(0.3) brightness(1.05)",
              }}
            />

            {/* Slow zoom animation on map */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url("${MAP_TILE}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "saturate(0.3) brightness(1.05)",
              }}
            />

            {/* ── Animated overlays ── */}
            <div className="absolute inset-0 z-10">
              {/* User location dot */}
              <AnimatePresence>
                {phase >= 1 && (
                  <motion.div
                    key={`dot-${loopKey}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute"
                    style={{ left: `${USER_POS.x}%`, top: `${USER_POS.y}%`, transform: "translate(-50%, -50%)" }}
                  >
                    {/* Ripple rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: 40, height: 40,
                          border: "2px solid rgba(99,91,255,0.4)",
                          animation: "nearbyPulse 2s ease-out infinite",
                          marginLeft: -13, marginTop: -13,
                        }}
                      />
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: 40, height: 40,
                          border: "2px solid rgba(99,91,255,0.3)",
                          animation: "nearbyPulse 2s ease-out infinite 1s",
                          marginLeft: -13, marginTop: -13,
                        }}
                      />
                    </div>
                    {/* Core dot */}
                    <div
                      className="rounded-full"
                      style={{
                        width: 14, height: 14,
                        background: "#635bff",
                        border: "3px solid white",
                        boxShadow: "0 2px 10px rgba(99,91,255,0.5)",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Destination pin */}
              <AnimatePresence>
                {phase >= 2 && (
                  <motion.div
                    key={`pin-${loopKey}`}
                    initial={{ y: -40, scale: 0, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                    className="absolute"
                    style={{ left: `${PIN_POS.x}%`, top: `${PIN_POS.y}%`, transform: "translate(-50%, -100%)" }}
                  >
                    <svg width="24" height="34" viewBox="0 0 24 34">
                      <path
                        d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z"
                        fill="#ef4444"
                      />
                      <circle cx="12" cy="12" r="5" fill="white" />
                    </svg>
                    {/* Pin shadow */}
                    <div
                      className="absolute"
                      style={{
                        width: 12, height: 4, borderRadius: "50%",
                        background: "rgba(0,0,0,0.2)",
                        bottom: -2, left: 6,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Route line */}
              {phase >= 3 && (
                <svg
                  key={`route-${loopKey}`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{ zIndex: 5 }}
                >
                  <path
                    d={`M${USER_POS.x},${USER_POS.y} C${USER_POS.x + 8},${USER_POS.y - 10} ${routeOffers[1].x - 2},${routeOffers[1].y + 5} ${routeOffers[2].x},${routeOffers[2].y} S${routeOffers[4].x - 5},${routeOffers[4].y + 3} ${PIN_POS.x},${PIN_POS.y}`}
                    fill="none"
                    stroke="#635bff"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeDasharray="200"
                    strokeDashoffset="200"
                    style={{ animation: "nearbyRouteDraw 1.2s ease-out forwards" }}
                  />
                </svg>
              )}

              {/* Brand offer bubbles */}
              {routeOffers.slice(0, visibleBubbles).map((offer, i) => (
                <motion.div
                  key={`${offer.brand}-${loopKey}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 14, delay: i * 0.05 }}
                  className="absolute"
                  style={{
                    left: `${offer.x}%`,
                    top: `${offer.y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 15,
                  }}
                >
                  {/* White circle with logo */}
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: 38, height: 38,
                      background: "white",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                      border: "2px solid white",
                    }}
                  >
                    <img
                      src={offer.logo}
                      alt={offer.brand}
                      style={{ width: 22, height: 22, objectFit: "contain" }}
                    />
                  </div>
                  {/* Discount badge */}
                  <div
                    className="absolute font-bold"
                    style={{
                      top: -6, right: -10,
                      background: "#635bff",
                      color: "white",
                      fontSize: 9,
                      padding: "2px 5px",
                      borderRadius: 8,
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 6px rgba(99,91,255,0.4)",
                    }}
                  >
                    {offer.discount}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom caption inside phone */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-0 left-0 right-0 z-20 text-center py-2.5 px-3"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
                fontSize: 12,
                fontWeight: 600,
                color: "#1a1a2e",
              }}
            >
              נציג לך איפה ההטבות הכי שוות מסביבך בכל רגע נתון
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes nearbyPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes nearbyRouteDraw {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}

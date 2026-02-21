import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// ── Real Tel Aviv coordinates ──
// User location: Rothschild Blvd & Allenby
const USER_LATLNG: [number, number] = [32.0636, 34.7721]
// Destination: Dizengoff Center area
const DEST_LATLNG: [number, number] = [32.0753, 34.7748]

// Route that follows real streets: Rothschild → Allenby → King George → Dizengoff
const ROUTE_COORDS: [number, number][] = [
  [32.0636, 34.7721], // Start: Rothschild & Allenby
  [32.0648, 34.7710], // Allenby heading NW
  [32.0659, 34.7700], // Allenby & Bialik
  [32.0671, 34.7693], // Allenby continues
  [32.0682, 34.7688], // Near Magen David Square
  [32.0693, 34.7705], // King George heading north
  [32.0708, 34.7718], // King George continues
  [32.0722, 34.7730], // King George & Ben Zion
  [32.0735, 34.7740], // Approaching Dizengoff
  [32.0753, 34.7748], // Destination: Dizengoff Center
]

// Brand offers with real locations along the route
const routeOffers = [
  { brand: "Golf & Co",      logo: "/brands/golf.png",           discount: "20%", latlng: [32.0655, 34.7703] as [number, number] },
  { brand: "American Eagle", logo: "/brands/american-eagle.png", discount: "15%", latlng: [32.0678, 34.7690] as [number, number] },
  { brand: "Rami Levy",      logo: "/brands/rami-levy.png",      discount: "10%", latlng: [32.0700, 34.7710] as [number, number] },
  { brand: "Mango",          logo: "/brands/mango.png",          discount: "25%", latlng: [32.0725, 34.7733] as [number, number] },
  { brand: "Samsung",        logo: "/brands/samsung.png",        discount: "30%", latlng: [32.0748, 34.7745] as [number, number] },
]

// Preload logos
if (typeof window !== "undefined") {
  routeOffers.forEach(({ logo }) => { const i = new Image(); i.src = logo })
}

// ── Leaflet custom icons ──
const userIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:20px;height:20px;">
    <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(99,91,255,0.4);animation:nearbyPulse 2s ease-out infinite;"></div>
    <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(99,91,255,0.3);animation:nearbyPulse 2s ease-out infinite 1s;"></div>
    <div style="width:20px;height:20px;background:#635bff;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(99,91,255,0.5);position:relative;z-index:2;"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const destIcon = L.divIcon({
  className: "",
  html: `<svg width="28" height="40" viewBox="0 0 24 34" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z" fill="#ef4444"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
})

function createOfferIcon(logo: string, discount: string) {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:44px;height:44px;">
      <div style="width:44px;height:44px;border-radius:50%;background:white;box-shadow:0 4px 16px rgba(0,0,0,0.25);border:2.5px solid white;display:flex;align-items:center;justify-content:center;overflow:hidden;">
        <img src="${logo}" style="width:26px;height:26px;object-fit:contain;" />
      </div>
      <div style="position:absolute;top:-8px;right:-14px;background:#635bff;color:white;font-size:10px;font-weight:800;padding:2px 7px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 8px rgba(99,91,255,0.5);line-height:1.4;">
        ${discount}
      </div>
    </div>`,
    iconSize: [60, 52],
    iconAnchor: [22, 22],
  })
}

// ── Animated route component — draws the polyline segment by segment ──
function AnimatedRoute({ coords, show }: { coords: [number, number][]; show: boolean }) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (!show) { setVisibleCount(0); return }
    setVisibleCount(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    coords.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), i * 120))
    })
    return () => timers.forEach(clearTimeout)
  }, [show, coords])

  if (visibleCount < 2) return null

  return (
    <Polyline
      positions={coords.slice(0, visibleCount)}
      pathOptions={{
        color: "#635bff",
        weight: 4,
        opacity: 0.85,
        dashArray: "8 6",
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  )
}

// ── Disable map interactions ──
function DisableInteractions() {
  const map = useMap()
  useEffect(() => {
    map.dragging.disable()
    map.touchZoom.disable()
    map.doubleClickZoom.disable()
    map.scrollWheelZoom.disable()
    map.boxZoom.disable()
    map.keyboard.disable()
    if ((map as unknown as Record<string, unknown>).tap) (map as unknown as Record<string, { disable: () => void }>).tap.disable()
  }, [map])
  return null
}

export default function NearbyMapPage() {
  const [phase, setPhase] = useState(0)
  const [visibleBubbles, setVisibleBubbles] = useState(0)
  const [loopKey, setLoopKey] = useState(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const t = timersRef.current
    t.forEach(clearTimeout)
    t.length = 0

    setPhase(0)
    setVisibleBubbles(0)

    t.push(setTimeout(() => setPhase(1), 400))    // user dot
    t.push(setTimeout(() => setPhase(2), 1400))   // dest pin
    t.push(setTimeout(() => setPhase(3), 2200))   // route draws
    t.push(setTimeout(() => setPhase(4), 3600))   // bubbles start

    routeOffers.forEach((_, i) => {
      t.push(setTimeout(() => setVisibleBubbles(i + 1), 3600 + i * 500))
    })

    t.push(setTimeout(() => setPhase(5), 6500))

    t.push(setTimeout(() => {
      setPhase(0)
      setVisibleBubbles(0)
      setTimeout(() => setLoopKey((k) => k + 1), 600)
    }, 8500))

    return () => { t.forEach(clearTimeout); t.length = 0 }
  }, [loopKey])

  // Center the map between user and destination
  const centerLat = (USER_LATLNG[0] + DEST_LATLNG[0]) / 2
  const centerLng = (USER_LATLNG[1] + DEST_LATLNG[1]) / 2

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
        {/* Glow behind phone */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[90px] z-0"
          style={{
            width: 280, height: 420,
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
            style={{ inset: 7, borderRadius: 29, border: "1px solid rgba(255,255,255,0.08)" }}
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
                width: 100, height: 22,
                background: "rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "0 0 14px 14px",
                backdropFilter: "blur(6px)",
              }}
            />

            {/* Real Leaflet map */}
            <div className="absolute inset-0 z-0">
              <MapContainer
                key={loopKey}
                center={[centerLat, centerLng]}
                zoom={14}
                className="w-full h-full"
                zoomControl={false}
                attributionControl={false}
              >
                <DisableInteractions />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  subdomains="abcd"
                  maxZoom={20}
                />

                {/* User marker */}
                {phase >= 1 && (
                  <Marker position={USER_LATLNG} icon={userIcon} />
                )}

                {/* Destination pin */}
                {phase >= 2 && (
                  <Marker position={DEST_LATLNG} icon={destIcon} />
                )}

                {/* Animated route */}
                <AnimatedRoute coords={ROUTE_COORDS} show={phase >= 3} />

                {/* Brand offer bubbles */}
                {routeOffers.slice(0, visibleBubbles).map((offer) => (
                  <Marker
                    key={`${offer.brand}-${loopKey}`}
                    position={offer.latlng}
                    icon={createOfferIcon(offer.logo, offer.discount)}
                  />
                ))}
              </MapContainer>
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

      {/* Keyframe animations for Leaflet markers */}
      <style>{`
        @keyframes nearbyPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(3); opacity: 0; }
        }
        /* Hide Leaflet default chrome inside the phone */
        .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  )
}

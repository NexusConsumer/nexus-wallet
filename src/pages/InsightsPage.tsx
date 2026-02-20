import {
  AnimatePresence,
  animate,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

// ── Shape dimensions ──
const D = 320
const R = D / 2
const RECT_H = 90

// ── Card dimensions ──
const CARD_W = 240
const TX_CARD_HEIGHT = 82 // approx height of one tx card + gap

interface Slide {
  title: string
  leftValue: number
  rightValue: number
  shapeColor: string
}

const slides: Slide[] = [
  {
    title: "הוצאות אוכל בחוץ",
    leftValue: 2434,
    rightValue: 2102,
    shapeColor: "#d4d0f6",
  },
  {
    title: "הוצאות ביגוד והנעלה",
    leftValue: 480,
    rightValue: 58,
    shapeColor: "#c7f5d4",
  },
  {
    title: "הוצאות פיננסיות וביטוחים",
    leftValue: 3200,
    rightValue: 2750,
    shapeColor: "#ddd8fc",
  },
  {
    title: "הוצאות בסופר",
    leftValue: 1800,
    rightValue: 1520,
    shapeColor: "#fde68a",
  },
]

type Pose = { x: number; y: number; rotate: number }
type Tx = {
  date: string
  merchant: string
  original: number
  paid: number
  cashback: number
}

const clothingTxs: Tx[] = [
  { date: "15 בינואר 2024", merchant: "Golf", original: 180, paid: 150, cashback: 30 },
  { date: "03 בפברואר 2024", merchant: "FOX", original: 220, paid: 200, cashback: 20 },
  { date: "18 במרץ 2024", merchant: "Laline", original: 260, paid: 210, cashback: 50 },
]

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function NexusSemicircleBaseShape({ color }: { color: string }) {
  return (
    <div className="relative" style={{ width: D, height: R + RECT_H }}>
      <div style={{ width: D, height: RECT_H, backgroundColor: color }} />
      <div
        style={{
          width: D,
          height: R,
          backgroundColor: color,
          borderBottomLeftRadius: R,
          borderBottomRightRadius: R,
        }}
      />
    </div>
  )
}

function RotatingBlob({ color = "#635bff" }: { color?: string }) {
  return (
    <motion.svg
      width={78}
      height={78}
      viewBox="0 0 100 100"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      style={{ display: "block", opacity: 0.3 }}
    >
      <path
        d="M50 6
           C61 6, 70 13, 76 22
           C86 27, 95 37, 92 50
           C95 62, 86 72, 76 78
           C70 87, 61 94, 50 92
           C39 94, 30 87, 24 78
           C14 72, 5 62, 8 50
           C5 37, 14 27, 24 22
           C30 13, 39 6, 50 6 Z"
        fill={color}
      />
    </motion.svg>
  )
}

// ── Card position for each shape pose ──
const cardOffsets = [
  { x: 20, y: 220 },
  { x: -30, y: 300 },
  { x: 40, y: 160 },
  { x: -40, y: 160 },
]

// ── Image overlay per slide ──
const slideOverlays = [
  { src: "/coffee.png",     style: { top: 120, left: 8 } as const,  endRotate: 6 },
  { src: "/shoe.png",       style: { top: 120, right: 8 } as const, endRotate: -8 },
  { src: "/calculator.png", style: { top: 120, left: 8 } as const,  endRotate: 5 },
  { src: "/avocado.png",    style: { top: 120, right: 8 } as const, endRotate: 12 },
]

// Preload overlay images
if (typeof window !== "undefined") {
  slideOverlays.forEach(({ src }) => { const i = new Image(); i.src = src })
}

function SmartInsightsCarousel() {
  const [index, setIndex] = useState(0)
  const [visibleTxCount, setVisibleTxCount] = useState(0)
  const shapeControls = useAnimation()
  const slidesLen = slides.length

  // Running balance — accumulates the cashback (leftValue - rightValue) from each slide
  const balance = useMotionValue(0)
  const formattedBalance = useTransform(balance, (v) => `₪${Math.round(v).toLocaleString()}`)
  const balanceTarget = useRef(0)

  const safeIndex = useMemo(() => {
    if (slidesLen === 0) return 0
    return ((index % slidesLen) + slidesLen) % slidesLen
  }, [index, slidesLen])

  const slide: Slide = slides[safeIndex]

  // Sequential popups only on clothing slide (index 1)
  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = []
    if (safeIndex === 1) {
      setVisibleTxCount(0)
      timers.push(setTimeout(() => setVisibleTxCount(1), 900))
      timers.push(setTimeout(() => setVisibleTxCount(2), 1800))
      timers.push(setTimeout(() => setVisibleTxCount(3), 2700))
    } else {
      setVisibleTxCount(0)
    }
    return () => timers.forEach(clearTimeout)
  }, [safeIndex])

  // Accumulate balance when slide changes
  useEffect(() => {
    const diff = slide.leftValue - slide.rightValue
    balanceTarget.current += diff
    const ctrl = animate(balance, balanceTarget.current, { duration: 1.2, ease: "easeOut" })
    return () => ctrl.stop()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex])

  // ── Counter + slider ──
  const amount = useMotionValue(slide.leftValue)
  const formattedAmount = useTransform(amount, (v) => `₪${Math.round(v).toLocaleString()}`)
  const formattedInitial = `₪${slide.leftValue.toLocaleString()}`

  const percent = useMotionValue(0)
  const percentRemaining = useMemo(() => {
    const d = slide.leftValue
    if (!Number.isFinite(d) || d <= 0) return 100
    return clamp(100 - (slide.rightValue / d) * 100, 0, 100)
  }, [slide.leftValue, slide.rightValue])

  // Cap at 45% so animated number never reaches the static one
  const adjustedPercent = useMemo(() => clamp(percentRemaining, 0, 45), [percentRemaining])

  // Slider fill: starts full width (100%), shrinks from the left
  const fillWidthCss = useTransform(percent, (p) => `${100 - p}%`)

  useEffect(() => {
    percent.set(0)
    amount.set(slide.leftValue)
    const a1 = animate(percent, adjustedPercent, { duration: 1.4, ease: "easeInOut" })
    const a2 = animate(amount, slide.rightValue, { duration: 1.4, ease: "easeInOut" })
    return () => { a1.stop(); a2.stop() }
  }, [amount, percent, adjustedPercent, slide.leftValue, slide.rightValue])

  // ── Shape & card movement ──
  const poses: Pose[] = useMemo(
    () => [
      { x: 0, y: 0, rotate: 0 },
      { x: -190, y: 140, rotate: 135 },
      { x: 150, y: -50, rotate: 45 },
      { x: -150, y: -50, rotate: -45 },
    ],
    []
  )

  const initialOffscreen = useRef<Pose>({ x: 260, y: 260, rotate: 20 })
  const phaseRef = useRef(0)

  useEffect(() => {
    if (slidesLen === 0) return
    let cancelled = false
    const run = async () => {
      try {
        shapeControls.set(initialOffscreen.current)

        await shapeControls.start({ ...poses[0], transition: { duration: 1 } })
        phaseRef.current = 0

        while (!cancelled) {
          // Give clothing slide (phase 1) extra time for tx cards
          const waitTime = phaseRef.current === 1 ? 5000 : 2800
          await sleep(waitTime)
          const nextPhase = (phaseRef.current + 1) % poses.length
          setIndex((prev) => (prev + 1) % slidesLen)

          await shapeControls.start({ ...poses[nextPhase], transition: { duration: 1 } })
          phaseRef.current = nextPhase
        }
      } catch {
        // ignore
      }
    }
    run()
    return () => { cancelled = true }
  }, [poses, shapeControls, slidesLen])

  const blobPos = useMemo(() => {
    if (safeIndex === 0) return { top: 84, left: 18 }
    if (safeIndex === 1) return { top: 360, left: 262 }
    if (safeIndex === 2) return { top: 100, left: 278 }
    return { top: 100, left: 36 }
  }, [safeIndex])

  // How many px to shift the card upward when tx cards appear
  const cardLift = safeIndex === 1 ? visibleTxCount * TX_CARD_HEIGHT : 0

  return (
    <div className="w-full max-w-sm relative" style={{ minHeight: 600 }}>
      {/* Title — z-10 so background shapes never cover it, right-aligned */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-right mb-4 text-2xl font-semibold leading-relaxed"
        style={{ color: "var(--color-primary)" }}
      >
        <div>נהפוך את ההוצאות שלך להכנסות עם עד 60% קאשבק.</div>
        <div>
          צבור בלי הגבלה לנקסוס שלך:{" "}
          <motion.span
            key={balanceTarget.current}
            animate={{ x: [0, -3, 3, -2, 2, 0] }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="inline-block font-bold"
          >
            {formattedBalance}
          </motion.span>
        </div>
      </motion.div>

      {/* Background shape */}
      <motion.div
        animate={shapeControls}
        initial={initialOffscreen.current}
        className="absolute left-1/2 -translate-x-1/2 z-0"
        style={{ top: 170 }}
      >
        <NexusSemicircleBaseShape color={slide.shapeColor} />
      </motion.div>

      {/* Image overlay — crossfade with mode="wait" and fast exit */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`overlay-${safeIndex}`}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1, rotate: slideOverlays[safeIndex].endRotate, transition: { duration: 0.5, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="absolute z-[5]"
          style={slideOverlays[safeIndex].style}
        >
          <img
            src={slideOverlays[safeIndex].src}
            alt=""
            style={{ width: 180, height: "auto", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.2))" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Blob */}
      <motion.div className="absolute z-0" style={blobPos}>
        <RotatingBlob />
      </motion.div>

      {/* ── Card wrapper: shifts upward as tx cards stack below ── */}
      <motion.div
        initial={{ x: cardOffsets[0].x + 260, y: cardOffsets[0].y + 260, opacity: 0 }}
        animate={{
          x: cardOffsets[safeIndex]?.x ?? 0,
          y: (cardOffsets[safeIndex]?.y ?? 220) - cardLift,
          opacity: 1,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute z-30 left-1/2"
        style={{ width: CARD_W, marginLeft: -(CARD_W / 2) }}
      >
        {/* Main expenses card */}
        <div className="bg-white rounded-2xl shadow-xl p-5" style={{ width: CARD_W }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={safeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h2
                className="text-center font-semibold text-sm mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                {slide.title}
              </h2>

              {/* Slider — fills from right to left */}
              <div
                className="w-full h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--color-border)" }}
              >
                <motion.div
                  style={{ width: fillWidthCss, marginLeft: "auto", backgroundColor: "var(--color-primary)" }}
                  className="h-full rounded-full"
                />
              </div>

              {/* Numbers: in RTL first = right. Animated purple on right, static gray on left */}
              <div className="flex justify-between items-center mt-2 px-1">
                <motion.div
                  className="text-[11px] font-bold"
                  style={{ color: "var(--color-primary)" }}
                >
                  {formattedAmount}
                </motion.div>
                <div
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {formattedInitial}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Transaction cards (clothing slide) — stack below, each pushes card up */}
        {safeIndex === 1 && clothingTxs.slice(0, visibleTxCount).map((tx, i) => (
          <motion.div
            key={tx.merchant}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.05 }}
            className="bg-white rounded-xl shadow-lg p-3 mt-2"
            style={{ borderColor: "var(--color-border)", borderWidth: 1 }}
          >
            <div className="text-[10px] mb-1" style={{ color: "var(--color-text-muted)" }}>
              {tx.date}
            </div>
            <div className="flex justify-between items-center text-xs font-medium">
              <span style={{ color: "var(--color-text-primary)" }}>{tx.merchant}</span>
              <span style={{ color: "var(--color-success)" }}>+₪{tx.cashback}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] mt-2" style={{ color: "var(--color-text-muted)" }}>
              <div>
                <div>סכום עסקה</div>
                <div className="font-semibold" style={{ color: "var(--color-text-secondary)" }}>₪{tx.original}</div>
              </div>
              <div>
                <div>שולם בפועל</div>
                <div className="font-semibold" style={{ color: "var(--color-text-secondary)" }}>₪{tx.paid}</div>
              </div>
              <div>
                <div>החזר</div>
                <div className="font-semibold" style={{ color: "var(--color-success)" }}>₪{tx.cashback}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default function InsightsPage() {
  const { lang = "he" } = useParams()
  const navigate = useNavigate()

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "var(--color-surface)" }}
      dir="rtl"
    >
      <button
        onClick={() => navigate(`/${lang}`)}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "var(--color-text-primary)" }}>
          arrow_forward
        </span>
      </button>

      <SmartInsightsCarousel />
    </div>
  )
}

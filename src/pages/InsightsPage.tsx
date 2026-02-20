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
    shapeColor: "#d4d0f6", // light purple (primary family)
  },
  {
    title: "הוצאות ביגוד והנעלה",
    leftValue: 480,
    rightValue: 58,
    shapeColor: "#c7f5d4", // light green (success family)
  },
  {
    title: "הוצאות פיננסיות וביטוחים",
    leftValue: 3200,
    rightValue: 2750,
    shapeColor: "#ddd8fc", // lavender (primary family)
  },
  {
    title: "הוצאות בסופר",
    leftValue: 1800,
    rightValue: 1520,
    shapeColor: "#fde68a", // warm yellow accent
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
  {
    date: "15 בינואר 2024",
    merchant: "Golf",
    original: 180,
    paid: 150,
    cashback: 30,
  },
  {
    date: "03 בפברואר 2024",
    merchant: "FOX",
    original: 220,
    paid: 200,
    cashback: 20,
  },
  {
    date: "18 במרץ 2024",
    merchant: "Laline",
    original: 260,
    paid: 210,
    cashback: 50,
  },
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
// Card must always stay within the visible viewport.
// Container is max-w-sm (384px) and card is 240px wide,
// so x must be in range ~[0 .. 140]. y must stay below title (~60) and above bottom (~500).
const cardOffsets = [
  { x: 70, y: 200 },  // pose 0: shape centered — card at bottom-right area
  { x: 10, y: 310 },  // pose 1: shape moved left+down — card center-left
  { x: 100, y: 140 }, // pose 2: shape moved right+up — card right, higher
  { x: 20, y: 140 },  // pose 3: shape moved left+up — card left, higher
]

function SmartInsightsCarousel() {
  const [index, setIndex] = useState(0)
  const [visibleTxCount, setVisibleTxCount] = useState(0)
  const shapeControls = useAnimation()
  const cardControls = useAnimation()
  const slidesLen = slides.length

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
      timers.push(setTimeout(() => setVisibleTxCount(2), 1600))
      timers.push(setTimeout(() => setVisibleTxCount(3), 2300))
    } else {
      setVisibleTxCount(0)
    }
    return () => timers.forEach(clearTimeout)
  }, [safeIndex])

  // ── Counter + slider (REVERSED direction: right→left) ──
  const amount = useMotionValue(slide.leftValue)
  const formattedAmount = useTransform(amount, (latest) => {
    const v = Math.round(latest)
    return `₪${v.toLocaleString()}`
  })
  const formattedInitial = `₪${slide.leftValue.toLocaleString()}`

  const percent = useMotionValue(0)
  const percentRemaining = useMemo(() => {
    const denom = slide.leftValue
    if (!Number.isFinite(denom) || denom <= 0) return 100
    return clamp(100 - (slide.rightValue / denom) * 100, 0, 100)
  }, [slide.leftValue, slide.rightValue])

  const SAFE_END_OFFSET_PERCENT = 6
  const adjustedPercent = useMemo(() => {
    return clamp(percentRemaining + SAFE_END_OFFSET_PERCENT, 0, 100)
  }, [percentRemaining])

  // The fill goes from right side, so we use "right" percentage
  const fillWidthCss = useTransform(percent, (p) => `${100 - p}%`)
  // The moving number position from the right
  const amountRightCss = useTransform(percent, (p) => `${100 - p}%`)

  useEffect(() => {
    percent.set(0)
    amount.set(slide.leftValue)
    const a1 = animate(percent, adjustedPercent, {
      duration: 1.4,
      ease: "easeInOut",
    })
    const a2 = animate(amount, slide.rightValue, {
      duration: 1.4,
      ease: "easeInOut",
    })
    return () => {
      a1.stop()
      a2.stop()
    }
  }, [amount, percent, adjustedPercent, slide.leftValue, slide.rightValue])

  // ── Shape & card movement ──
  // Shape poses — shapes may go partially off-screen, but must not cover the title.
  // Shape starts at top:150 (centered). Title ends ~60px from top.
  // So y can go down to about -60 before the shape top reaches the title.
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
        cardControls.set({ x: cardOffsets[0].x + 260, y: cardOffsets[0].y + 260, opacity: 0 })

        await Promise.all([
          shapeControls.start({ ...poses[0], transition: { duration: 1 } }),
          cardControls.start({ x: cardOffsets[0].x, y: cardOffsets[0].y, opacity: 1, transition: { duration: 1 } }),
        ])
        phaseRef.current = 0

        while (!cancelled) {
          await sleep(2500)
          const nextPhase = (phaseRef.current + 1) % poses.length
          setIndex((prev) => (prev + 1) % slidesLen)

          await Promise.all([
            shapeControls.start({ ...poses[nextPhase], transition: { duration: 1 } }),
            cardControls.start({
              x: cardOffsets[nextPhase].x,
              y: cardOffsets[nextPhase].y,
              transition: { duration: 1 },
            }),
          ])
          phaseRef.current = nextPhase
        }
      } catch {
        // ignore
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [poses, shapeControls, cardControls, slidesLen])

  const blobPos = useMemo(() => {
    if (safeIndex === 0) return { top: 84, left: 18 }
    if (safeIndex === 1) return { top: 360, left: 262 }
    if (safeIndex === 2) return { top: 100, left: 278 }
    return { top: 100, left: 36 }
  }, [safeIndex])

  return (
    <div className="w-full max-w-sm relative" style={{ minHeight: 600 }}>
      {/* Title — z-10 so background shapes never cover it */}
      <motion.h1
        key={`${safeIndex}-title`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold mb-4 text-center relative z-10"
        style={{ color: "var(--color-primary)" }}
      >
        נהפוך את ההוצאות שלך להכנסות
      </motion.h1>

      {/* Background shape */}
      <motion.div
        animate={shapeControls}
        initial={initialOffscreen.current}
        className="absolute left-1/2 -translate-x-1/2 z-0"
        style={{ top: 150 }}
      >
        <NexusSemicircleBaseShape color={slide.shapeColor} />
      </motion.div>

      {/* Blob */}
      <motion.div className="absolute z-0" style={blobPos}>
        <RotatingBlob />
      </motion.div>

      {/* ── Card: smaller, follows the shape's rounded corner ── */}
      <motion.div
        animate={cardControls}
        className="absolute z-30"
        style={{ width: CARD_W }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-5" style={{ width: CARD_W }}>
          {/* Card inner content animates on each slide */}
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

              {/* Slider — RTL: fills from right to left */}
              <div
                className="w-full h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--color-border)" }}
              >
                <motion.div
                  style={{ width: fillWidthCss, marginLeft: "auto", backgroundColor: "var(--color-primary)" }}
                  className="h-full rounded-full"
                  layout
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Numbers below slider */}
              <div className="relative w-full h-7 mt-1">
                {/* Moving "saved" amount — follows slider edge from the right */}
                <motion.div
                  style={{ right: amountRightCss, color: "var(--color-primary)" }}
                  className="absolute translate-x-full text-[11px] font-bold whitespace-nowrap"
                >
                  {formattedAmount}
                </motion.div>
                {/* Static original value on the left */}
                <div
                  className="absolute left-0 pl-1 text-[11px] font-semibold whitespace-nowrap"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {formattedInitial}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Transaction Stack (clothing slide only) */}
        <AnimatePresence>
          {safeIndex === 1 && visibleTxCount > 0 && (
            <div className="mt-2 space-y-2">
              {clothingTxs.slice(0, visibleTxCount).map((tx) => (
                <motion.div
                  key={tx.merchant}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="bg-white rounded-xl shadow-lg p-3"
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
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function InsightsPage() {
  const { lang = 'he' } = useParams()
  const navigate = useNavigate()

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "var(--color-surface)" }}
      dir="rtl"
    >
      {/* Back button */}
      <button
        onClick={() => navigate(`/${lang}`)}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: "var(--color-text-primary)" }}>
          arrow_forward
        </span>
      </button>

      <SmartInsightsCarousel />
    </div>
  )
}

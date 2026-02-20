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

const D = 320
const R = D / 2
const RECT_H = 90

interface Slide {
  title: string
  leftValue: number
  rightValue: number
  image: string
  imageBg: string
  shapeColor: string
}

const slides: Slide[] = [
  {
    title: "הוצאות אוכל בחוץ",
    leftValue: 2434,
    rightValue: 2102,
    image: "☕",
    imageBg: "#FDE68A",
    shapeColor: "#C9D6DF",
  },
  {
    title: "הוצאות ביגוד והנעלה",
    leftValue: 480,
    rightValue: 58,
    image: "👟",
    imageBg: "#FBCFE8",
    shapeColor: "#D8E3DC",
  },
  {
    title: "הוצאות פיננסיות וביטוחים",
    leftValue: 3200,
    rightValue: 2750,
    image: "📊",
    imageBg: "#C7D2FE",
    shapeColor: "#D6C9F0",
  },
  {
    title: "הוצאות בסופר",
    leftValue: 1800,
    rightValue: 1520,
    image: "🛒",
    imageBg: "#BBF7D0",
    shapeColor: "#F7D046",
  },
]
type Pose = { x: number; y: number; rotate: number }
type BlobPos = { top: number; left: number }
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

function RotatingBlob({ color = "#6BCB77" }: { color?: string }) {
  return (
    <motion.svg
      width={78}
      height={78}
      viewBox="0 0 100 100"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      style={{ display: "block" }}
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

function SmartInsightsCarousel() {
  const [index, setIndex] = useState(0)
  const [visibleTxCount, setVisibleTxCount] = useState(0)
  const shapeControls = useAnimation()
  const slidesLen = slides.length

  const safeIndex = useMemo(() => {
    if (slidesLen === 0) return 0
    return ((index % slidesLen) + slidesLen) % slidesLen
  }, [index, slidesLen])

  const slide: Slide = slides[safeIndex]

  // Sequential popups only on clothing slide
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

  // Counter + slider
  const amount = useMotionValue(slide.leftValue)
  const formattedAmount = useTransform(amount, (latest) => {
    const v = Math.round(latest)
    return `${v.toLocaleString()}₪`
  })
  const formattedInitial = `${slide.leftValue.toLocaleString()}₪`

  const percent = useMotionValue(100)
  const percentRemaining = useMemo(() => {
    const denom = slide.leftValue
    if (!Number.isFinite(denom) || denom <= 0) return 0
    return clamp((slide.rightValue / denom) * 100, 0, 100)
  }, [slide.leftValue, slide.rightValue])

  const SAFE_END_OFFSET_PERCENT = 6
  const adjustedPercentRemaining = useMemo(() => {
    return clamp(percentRemaining - SAFE_END_OFFSET_PERCENT, 0, 100)
  }, [percentRemaining])

  const percentCss = useTransform(percent, (p) => `${p}%`)
  const amountLeftCss = percentCss

  useEffect(() => {
    percent.set(100)
    amount.set(slide.leftValue)
    const a1 = animate(percent, adjustedPercentRemaining, {
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
  }, [amount, percent, adjustedPercentRemaining, slide.leftValue, slide.rightValue])

  // Shape movement
  const poses: Pose[] = useMemo(
    () => [
      { x: 0, y: 0, rotate: 0 },
      { x: -190, y: 170, rotate: 135 },
      { x: 150, y: -110, rotate: 45 },
      { x: -150, y: -110, rotate: -45 },
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
          await sleep(2500)
          setIndex((prev) => (prev + 1) % slidesLen)
          const nextPhase = (phaseRef.current + 1) % poses.length
          await shapeControls.start({ ...poses[nextPhase], transition: { duration: 1 } })
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
  }, [poses, shapeControls, slidesLen])

  const blobPos: BlobPos =
    safeIndex === 0
      ? { top: 84, left: 18 }
      : safeIndex === 1
        ? { top: 420, left: 262 }
        : safeIndex === 2
          ? { top: 118, left: 278 }
          : { top: 456, left: 36 }

  return (
    <div className="w-full max-w-sm relative">
      <motion.h1
        key={`${safeIndex}-title`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-[#245C3B] mb-4 text-center"
      >
        נהפוך את ההוצאות שלך להכנסות
      </motion.h1>

      <motion.div
        animate={shapeControls}
        initial={initialOffscreen.current}
        className="absolute left-1/2 -translate-x-1/2 z-0"
        style={{ top: 150 }}
      >
        <NexusSemicircleBaseShape color={slide.shapeColor} />
      </motion.div>

      <motion.div className="absolute z-0" style={blobPos}>
        <RotatingBlob />
      </motion.div>

      {/* Card + stack move together */}
      <motion.div
        animate={{ y: visibleTxCount > 0 ? -visibleTxCount * 55 : 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative mt-80 z-30"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-center font-semibold text-[#2B2B2B] mb-6">{slide.title}</h2>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div style={{ width: percentCss }} className="h-full bg-green-500 rounded-full" />
          </div>
          <div className="relative w-full h-8 overflow-hidden">
            {/* Moving remaining amount (follows slider edge) */}
            <motion.div
              style={{ left: amountLeftCss }}
              className="absolute -translate-x-full text-[11px] font-semibold text-green-600 whitespace-nowrap"
            >
              {formattedAmount}
            </motion.div>
            {/* Static initial high value at end of scale */}
            <div className="absolute right-0 pr-1 text-xs font-semibold text-gray-400 whitespace-nowrap text-right">
              {formattedInitial}
            </div>
          </div>
        </div>

        {/* Transaction Stack */}
        <AnimatePresence>
          {safeIndex === 1 && visibleTxCount > 0 && (
            <div className="mt-3 space-y-3">
              {clothingTxs.slice(0, visibleTxCount).map((tx) => (
                <motion.div
                  key={tx.merchant}
                  initial={{ y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                >
                  <div className="text-xs text-gray-500 mb-2">{tx.date}</div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{tx.merchant}</span>
                    <span className="text-green-600">+{tx.cashback}₪</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-3">
                    <div>
                      <div>סכום עסקה</div>
                      <div className="font-semibold text-gray-700">{tx.original}₪</div>
                    </div>
                    <div>
                      <div>שולם בפועל</div>
                      <div className="font-semibold text-gray-700">{tx.paid}₪</div>
                    </div>
                    <div>
                      <div>החזר</div>
                      <div className="font-semibold text-green-600">{tx.cashback}₪</div>
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
    <div className="min-h-dvh bg-[#F3F1E8] flex flex-col items-center justify-center px-6 relative" dir="rtl">
      {/* Back button */}
      <button
        onClick={() => navigate(`/${lang}`)}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm"
      >
        <span className="material-symbols-outlined text-[#2B2B2B]" style={{ fontSize: '22px' }}>
          arrow_forward
        </span>
      </button>

      <SmartInsightsCarousel />
    </div>
  )
}

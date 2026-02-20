import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { SmartInsightsCarousel } from "./InsightsPage"
import GiftCardsPage from "./GiftCardsPage"

const STORY_COUNT = 2
const STORY_DURATION = 12000 // ms per story

/** Instagram-style stories with progress bars and tap navigation */
export default function StoriesPage() {
  const { lang = "he" } = useParams()
  const navigate = useNavigate()
  const [currentStory, setCurrentStory] = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef(Date.now())

  const goToStory = useCallback(
    (index: number) => {
      if (index >= STORY_COUNT) {
        // End of stories — go back home
        navigate(`/${lang}`)
        return
      }
      if (index < 0) return
      setCurrentStory(index)
      setProgress(0)
      startTimeRef.current = Date.now()
    },
    [lang, navigate]
  )

  // Auto-advance timer
  useEffect(() => {
    startTimeRef.current = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current
      const p = Math.min(elapsed / STORY_DURATION, 1)
      setProgress(p)

      if (p >= 1) {
        goToStory(currentStory + 1)
      } else {
        timerRef.current = requestAnimationFrame(tick)
      }
    }

    timerRef.current = requestAnimationFrame(tick)
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current)
    }
  }, [currentStory, goToStory])

  // Tap left = next story, right = previous (RTL)
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const isLeftSide = x < rect.width / 2

    if (isLeftSide) {
      // Left side tap = next story (RTL: left = forward)
      goToStory(currentStory + 1)
    } else {
      // Right side tap = previous story
      goToStory(currentStory - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col" dir="rtl">
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3 pb-2 z-50">
        {Array.from({ length: STORY_COUNT }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
          >
            <motion.div
              className="h-full rounded-full bg-white"
              style={{
                width:
                  i < currentStory
                    ? "100%"
                    : i === currentStory
                      ? `${progress * 100}%`
                      : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => navigate(`/${lang}`)}
        className="absolute top-3 left-3 z-50 w-8 h-8 flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-white" style={{ fontSize: "20px" }}>
          close
        </span>
      </button>

      {/* Story content */}
      <div className="flex-1 relative overflow-hidden rounded-t-2xl" onClick={handleTap}>
        <motion.div
          key={currentStory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {currentStory === 0 && (
            <div
              className="w-full h-full flex flex-col items-center justify-center px-6 relative overflow-hidden"
              style={{ backgroundColor: "var(--color-surface)" }}
              dir="rtl"
            >
              <SmartInsightsCarousel />
            </div>
          )}
          {currentStory === 1 && <GiftCardsPage />}
        </motion.div>
      </div>
    </div>
  )
}

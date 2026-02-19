import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

interface Slide {
  icon: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  titleKey: 'heroBannerTitle' | 'heroBannerTitle2' | 'heroBannerTitle3';
}

const slides: Slide[] = [
  {
    icon: 'wallet',
    gradientFrom: 'from-primary',
    gradientVia: 'via-primary-dark',
    gradientTo: 'to-bg-dark',
    titleKey: 'heroBannerTitle',
  },
  {
    icon: 'redeem',
    gradientFrom: 'from-emerald-500',
    gradientVia: 'via-teal-600',
    gradientTo: 'to-cyan-800',
    titleKey: 'heroBannerTitle2',
  },
  {
    icon: 'local_offer',
    gradientFrom: 'from-orange-400',
    gradientVia: 'via-rose-500',
    gradientTo: 'to-pink-700',
    titleKey: 'heroBannerTitle3',
  },
];

const AUTO_PLAY_INTERVAL = 4000;

export default function HeroBanner() {
  const { t } = useLanguage();
  const { lang = 'he' } = useParams();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const resetAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, AUTO_PLAY_INTERVAL);
    }
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    resetAutoPlay();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left → next slide
        goToSlide((current + 1) % slides.length);
      } else {
        // Swiped right → prev slide
        goToSlide((current - 1 + slides.length) % slides.length);
      }
    }
  };

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, AUTO_PLAY_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const getTitle = (key: Slide['titleKey']) => {
    const titles = t.home as Record<string, string>;
    return titles[key] || t.home.heroBannerTitle;
  };

  const slide = slides[current] ?? slides[0];

  return (
    <section className="mb-5 px-4">
      {/* Single banner container */}
      <div
        className="relative w-full rounded-xl overflow-hidden touch-pan-y"
        style={{ height: '220px' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides — stacked, crossfade */}
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-500 ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Gradient background */}
            <div className={`w-full h-full bg-gradient-to-br ${s.gradientFrom} ${s.gradientVia} ${s.gradientTo}`} />

            {/* Decorative blurs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-[10%] right-[8%] w-24 h-24 rounded-full bg-white/10 blur-xl" />
              <div className="absolute bottom-[15%] left-[5%] w-20 h-20 rounded-full bg-white/15 blur-lg" />
            </div>

            {/* Icon */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <span
                className="material-symbols-outlined text-white/15"
                style={{ fontSize: '90px', fontVariationSettings: "'FILL' 1" }}
              >
                {s.icon}
              </span>
            </div>
          </div>
        ))}

        {/* Bottom overlay — always on top */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-5">
          <h2 className="text-white text-xl font-bold leading-snug mb-3 whitespace-pre-line">
            {getTitle(slide.titleKey)}
          </h2>
          <button
            onClick={() => navigate(`/${lang}/store`)}
            className="bg-white text-text-primary px-5 py-2.5 rounded-full font-bold text-xs w-max hover:brightness-105 transition-all"
          >
            {t.home.heroBannerCta}
          </button>
        </div>
      </div>

      {/* Controls: Play/Pause (LEFT) + Dots */}
      <div className="flex items-center justify-center gap-3 mt-3">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-5 h-2 bg-primary'
                  : 'w-2 h-2 bg-border'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Play/Pause button — on the left side */}
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-border transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <span
            className="material-symbols-outlined text-text-muted"
            style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
          >
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>
      </div>
    </section>
  );
}

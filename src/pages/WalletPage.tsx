import { useState, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { useLanguage } from '../i18n/LanguageContext';
import WalletTabs from '../components/wallet/WalletTabs';
import type { UserVoucher } from '../types/voucher.types';

// Logos
import MastercardLogo from '../assets/logos/mastercard-logo-transperant.png';
import MigdalLogo from '../assets/logos/migdal_logo_transparent.png';

// Lottie animations
// @ts-ignore
import ApplePayAnimation from '../assets/animations/Apple Pay Face ID Checkout.lottie';
// @ts-ignore
import UnsuccessfulAnimation from '../assets/animations/Card Payment Unsuccessful.lottie';

export default function WalletPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<UserVoucher['status']>('active');

  // NFC animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [isUnsuccessful, setIsUnsuccessful] = useState(false);
  const animationRef = useRef<DotLottie | null>(null);
  const unsuccessfulRef = useRef<DotLottie | null>(null);

  // Drag to scroll state
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'declined'>('success');
  const [merchantName, setMerchantName] = useState('');

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (isUnsuccessful) {
      setIsUnsuccessful(false);
      unsuccessfulRef.current?.stop();
    }

    if (animationRef.current) {
      setIsAnimating(true);
      animationRef.current.stop();
      animationRef.current.play();

      setTimeout(() => {
        setIsAnimating(false);
        animationRef.current?.stop();

        setNotificationType('success');
        setMerchantName('מרפאת בריאות');
        setShowNotification(true);
      }, 6500);
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAnimating) {
      setIsAnimating(false);
      animationRef.current?.stop();
    }

    if (unsuccessfulRef.current) {
      setIsUnsuccessful(true);
      unsuccessfulRef.current.stop();
      unsuccessfulRef.current.play();

      setTimeout(() => {
        setIsUnsuccessful(false);
        unsuccessfulRef.current?.stop();

        setNotificationType('declined');
        setMerchantName("ג'לטו");
        setShowNotification(true);
      }, 3000);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* ══════ DIGITAL CARDS SECTION ══════ */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-text-primary px-5 mb-3">
          {t.wallet.digitalCards}
        </h2>

        {/* Scrollable Card Gallery */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`w-full overflow-x-auto px-5 no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ userSelect: 'none' }}
        >
          <div className="flex gap-4 pb-2">
            {/* First Card - Black */}
            <div
              onClick={handleCardClick}
              className="flex-shrink-0 w-[300px] aspect-[1.7/1] rounded-2xl shadow-2xl relative p-5 flex flex-col justify-between transform transition-transform active:scale-[0.98] cursor-pointer bg-black"
            >
              <div className="flex justify-between items-start">
                <div className="-ml-2 h-16 flex items-center">
                  <img
                    src={MigdalLogo}
                    alt="Migdal"
                    className="h-16 brightness-0 invert mix-blend-screen"
                    style={{ filter: 'brightness(0) invert(1)', mixBlendMode: 'screen' }}
                  />
                </div>
                <span className="text-white text-lg font-medium tracking-widest opacity-90">
                  822V
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div className="relative ml-12">
                  <img
                    src={MastercardLogo}
                    alt="Mastercard"
                    className="h-24 opacity-90"
                    style={{ transform: 'translate(16px, 16px)' }}
                  />
                </div>
                <span className="material-symbols-outlined text-white/40 text-2xl rotate-90 -mr-1">
                  contactless
                </span>
              </div>
            </div>

            {/* Second Card - Blue */}
            <div
              className="flex-shrink-0 w-[300px] aspect-[1.7/1] rounded-2xl shadow-2xl relative p-5 flex flex-col justify-between transform transition-transform active:scale-[0.98] cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)' }}
            >
              <div className="flex justify-between items-start">
                <div className="-ml-2 h-16 flex items-center">
                  <img src={MigdalLogo} alt="Migdal" className="h-16 brightness-0 invert mix-blend-screen" style={{ filter: 'brightness(0) invert(1)', mixBlendMode: 'screen' }} />
                </div>
                <span className="text-white text-lg font-medium tracking-widest opacity-90">823V</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="relative ml-12">
                  <img src={MastercardLogo} alt="Mastercard" className="h-24 opacity-90" style={{ transform: 'translate(16px, 16px)' }} />
                </div>
                <span className="material-symbols-outlined text-white/40 text-2xl rotate-90 -mr-1">contactless</span>
              </div>
            </div>

            {/* Third Card - White */}
            <div className="flex-shrink-0 w-[300px] aspect-[1.7/1] rounded-2xl shadow-2xl relative p-5 flex flex-col justify-between transform transition-transform active:scale-[0.98] cursor-pointer bg-white">
              <div className="flex justify-between items-start">
                <div className="-ml-2 h-16 flex items-center">
                  <img src={MigdalLogo} alt="Migdal" className="h-16" />
                </div>
                <span className="text-gray-800 text-lg font-medium tracking-widest opacity-90">824V</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="relative ml-12">
                  <img src={MastercardLogo} alt="Mastercard" className="h-24 opacity-90" style={{ transform: 'translate(16px, 16px)' }} />
                </div>
                <span className="material-symbols-outlined text-gray-400 text-2xl rotate-90 -mr-1">contactless</span>
              </div>
            </div>
          </div>
        </div>

        {/* NFC / Payment Animation Section */}
        <div className="flex flex-col items-center justify-center mt-8">
          <div className="relative mx-auto flex items-center justify-center min-h-[180px]">
            {/* Successful Payment Animation */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <DotLottieReact
                src={ApplePayAnimation}
                loop={false}
                autoplay={false}
                speed={1}
                dotLottieRefCallback={(dotLottie) => {
                  animationRef.current = dotLottie;
                }}
              />
            </div>

            {/* Unsuccessful Payment Animation */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${isUnsuccessful ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <DotLottieReact
                src={UnsuccessfulAnimation}
                loop={false}
                autoplay={false}
                speed={1}
                dotLottieRefCallback={(dotLottie) => {
                  unsuccessfulRef.current = dotLottie;
                }}
              />
            </div>

            {/* Initial State - Contactless Icon */}
            <div className={`transition-opacity duration-500 ${isAnimating || isUnsuccessful ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div
                onClick={handleIconClick}
                className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-primary text-2xl">
                  contactless
                </span>
              </div>
            </div>
          </div>

          {/* Text Below Animations/Icon */}
          <div className="mt-1 text-center">
            {isAnimating && (
              <p className="text-text-muted text-sm font-normal tracking-tight">
                {t.wallet.holdNearReader}
              </p>
            )}
            {isUnsuccessful && (
              <p className="text-red-500 text-sm font-semibold tracking-tight">
                {t.wallet.paymentDeclined}
              </p>
            )}
            {!isAnimating && !isUnsuccessful && (
              <p className="text-text-muted text-sm font-normal tracking-tight">
                {t.wallet.tapToPay}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ══════ DIVIDER ══════ */}
      <div className="h-px bg-border mx-5 mb-5" />

      {/* ══════ VOUCHERS SECTION ══════ */}
      <div className="px-5 space-y-4">
        <h2 className="text-lg font-bold text-text-primary">{t.wallet.myVouchers}</h2>
        <WalletTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* ══════ NOTIFICATION OVERLAY ══════ */}
      {showNotification && (
        <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
          <div
            onClick={() => setShowNotification(false)}
            className={`w-full max-w-md mt-14 transition-all duration-300 ease-out pointer-events-auto ${
              notificationType === 'success' ? 'cursor-pointer active:scale-95' : ''
            }`}
            style={{
              animation: 'slide-down 0.3s ease-out forwards',
            }}
          >
            <div
              className="rounded-[28px] p-4 shadow-2xl flex flex-col gap-2 ring-1 ring-white/20"
              style={{
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                background: 'rgba(255, 255, 255, 0.85)',
                boxShadow: '0 0 25px rgba(255, 255, 255, 0.35)',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                    <span className="material-symbols-outlined text-white text-[18px]">domain</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">
                    NEXUS
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                {notificationType === 'success' ? (
                  <>
                    <h3 className="font-bold text-[16px] text-gray-900">{t.wallet.paymentApproved}</h3>
                    <p className="text-[14px] text-gray-800 leading-snug">
                      {t.wallet.paymentApprovedMsg.replace('{merchant}', merchantName)}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-[16px] text-gray-900">{t.wallet.paymentDeclined}</h3>
                    <p className="text-[14px] text-gray-800 leading-snug">
                      {t.wallet.paymentDeclinedMsg.replace('{merchant}', merchantName)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification auto-dismiss */}
      {showNotification && <NotificationAutoDismiss onDismiss={() => setShowNotification(false)} />}
    </div>
  );
}

/** Helper to auto-dismiss notification after 5 seconds */
function NotificationAutoDismiss({ onDismiss }: { onDismiss: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  if (!timerRef.current) {
    timerRef.current = setTimeout(onDismiss, 5000);
  }
  return null;
}

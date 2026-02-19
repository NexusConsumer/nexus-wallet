import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../i18n/LanguageContext';
import { useNearbyDeals } from '../hooks/useNearbyDeals';
import { useGeolocationStore } from '../stores/geolocationStore';
import { formatDistance } from '../utils/haversine';
import { mockBusinesses } from '../mock/data/businesses.mock';
import { mockBranches } from '../mock/data/branches.mock';
import type { NearbyDeal } from '../types/branch.types';
import type { Business } from '../types/search.types';
import { MicButton } from '../components/ui/MicButton';

// ── Category config ──

const categoryConfig: Record<string, { emoji: string; color: string }> = {
  food: { emoji: '🍔', color: '#fff7ed' },
  shopping: { emoji: '👕', color: '#fdf2f8' },
  entertainment: { emoji: '🎬', color: '#faf5ff' },
  tech: { emoji: '💻', color: '#eff6ff' },
  travel: { emoji: '🏨', color: '#f0f9ff' },
  health: { emoji: '💊', color: '#ecfdf5' },
  education: { emoji: '📚', color: '#fffbeb' },
};

const categoryLabels: Record<string, { en: string; he: string }> = {
  food: { en: 'Food', he: 'אוכל' },
  shopping: { en: 'Shopping', he: 'קניות' },
  entertainment: { en: 'Entertainment', he: 'בידור' },
  tech: { en: 'Tech', he: 'טכנולוגיה' },
  travel: { en: 'Travel', he: 'טיולים' },
  health: { en: 'Health', he: 'בריאות' },
  education: { en: 'Education', he: 'לימודים' },
};

const ALL_CATEGORIES = Object.keys(categoryConfig);

const priceRanges = [
  { key: '0-50', en: 'Up to ₪50', he: 'עד ₪50', max: 50 },
  { key: '50-100', en: '₪50 - ₪100', he: '₪50 - ₪100', min: 50, max: 100 },
  { key: '100-200', en: '₪100 - ₪200', he: '₪100 - ₪200', min: 100, max: 200 },
  { key: '200+', en: '₪200+', he: '₪200+', min: 200 },
];

const discountRanges = [
  { key: '10+', label: '10%+', min: 10 },
  { key: '20+', label: '20%+', min: 20 },
  { key: '25+', label: '25%+', min: 25 },
  { key: '30+', label: '30%+', min: 30 },
];

// ── Helper: is branch currently open? ──

function isBranchOpen(branch: { openHour?: number; closeHour?: number }): boolean {
  if (branch.openHour === undefined || branch.closeHour === undefined) return true;
  const now = new Date().getHours();
  const open = branch.openHour;
  const close = branch.closeHour;
  if (open < close) return now >= open && now < close;
  if (open > close) return now >= open || now < close;
  return true;
}

// ── Custom marker icons ──

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 20px; height: 20px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(59,130,246,0.5);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function createDealIcon(emoji: string, color: string, isSelected: boolean) {
  const size = isSelected ? 48 : 36;
  const fontSize = isSelected ? 22 : 18;
  const pulseRing = isSelected
    ? `<div style="
        position: absolute; inset: -6px;
        border-radius: 50%;
        border: 3px solid #635bff;
        animation: marker-pulse 2s ease-out infinite;
      "></div>`
    : '';
  return L.divIcon({
    className: '',
    html: `<div style="
      position: relative;
      width: ${size}px; height: ${size}px;
      background: ${isSelected ? '#ffffff' : color};
      border: ${isSelected ? '3px solid #635bff' : '2px solid white'};
      border-radius: 50%;
      box-shadow: ${isSelected ? '0 4px 16px rgba(99,91,255,0.4)' : '0 2px 8px rgba(0,0,0,0.2)'};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${fontSize}px;
      transition: all 0.2s ease;
    ">${pulseRing}${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// ── Fit map bounds to markers ──

function FitBounds({ deals, userCoords }: { deals: NearbyDeal[]; userCoords: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (deals.length === 0) return;
    const points: [number, number][] = [
      [userCoords.lat, userCoords.lng],
      ...deals.map((d) => [d.branch.lat, d.branch.lng] as [number, number]),
    ];
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }, [map, deals, userCoords]);
  return null;
}

// ── Map Controls (zoom + my location) ──

function MapControls({ isHe, userCoords }: { isHe: boolean; userCoords: { lat: number; lng: number } | null }) {
  const map = useMap();
  return (
    <div
      className="absolute z-[1000] flex flex-col gap-2"
      style={{ top: '50%', transform: 'translateY(-50%)', ...(isHe ? { left: '12px' } : { right: '12px' }) }}
    >
      <button onClick={() => map.zoomIn()} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-90 transition-transform">
        <span className="material-symbols-outlined text-text-primary" style={{ fontSize: '20px' }}>add</span>
      </button>
      <button onClick={() => map.zoomOut()} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-90 transition-transform">
        <span className="material-symbols-outlined text-text-primary" style={{ fontSize: '20px' }}>remove</span>
      </button>
      <div className="h-1" />
      <button onClick={() => userCoords && map.flyTo([userCoords.lat, userCoords.lng], 15, { duration: 0.8 })} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-90 transition-transform">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>my_location</span>
      </button>
    </div>
  );
}

// ── Chips Bar: Open Now + Filter + Categories ──

function ChipsBar({
  activeCategory, onSelectCategory, isHe,
  openNowLabel, openOnly, onToggleOpen, onOpenFilter, activeFilterCount,
}: {
  activeCategory: string | null; onSelectCategory: (cat: string | null) => void;
  isHe: boolean; openNowLabel: string;
  openOnly: boolean; onToggleOpen: () => void; onOpenFilter: () => void; activeFilterCount: number;
}) {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 px-3 py-2 items-center">
      {/* Open Now toggle */}
      <button
        onClick={onToggleOpen}
        className={`flex-none px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
          openOnly
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'bg-white/90 backdrop-blur-sm text-text-secondary border border-border/50'
        }`}
      >
        <span className={`material-symbols-outlined ${openOnly ? 'text-white' : 'text-emerald-500'}`} style={{ fontSize: '14px' }}>schedule</span>
        {openNowLabel}
      </button>

      {/* Filter button — circle icon only */}
      <button
        onClick={onOpenFilter}
        className={`flex-none w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center relative ${
          activeFilterCount > 0
            ? 'bg-primary text-white shadow-sm'
            : 'bg-white/90 backdrop-blur-sm text-text-secondary border border-border/50'
        }`}
      >
        <span className={`material-symbols-outlined ${activeFilterCount > 0 ? 'text-white' : 'text-text-secondary'}`} style={{ fontSize: '16px' }}>tune</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 rtl:-right-auto rtl:-left-1.5 min-w-[18px] h-[18px] bg-white text-primary rounded-full flex items-center justify-center text-[10px] font-bold px-1">
            {activeFilterCount}
          </span>
        )}
      </button>

      {ALL_CATEGORIES.map((cat) => {
        const cfg = categoryConfig[cat];
        const label = categoryLabels[cat];
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(isActive ? null : cat)}
            className={`flex-none px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              isActive ? 'bg-primary text-white shadow-sm' : 'bg-white/90 backdrop-blur-sm text-text-secondary border border-border/50'
            }`}
          >
            <span className="text-sm">{cfg.emoji}</span>
            {isHe ? label.he : label.en}
          </button>
        );
      })}
    </div>
  );
}

// ── FlyTo helper ──

function FlyToPoint({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], zoom, { duration: 0.6 }); }, [map, lat, lng, zoom]);
  return null;
}

// ── Bottom Deal Card Strip ──

function DealCardStrip({
  deals, selectedIndex, onSelect, isHe, onNavigate,
}: {
  deals: NearbyDeal[]; selectedIndex: number | null; onSelect: (index: number) => void;
  isHe: boolean; onNavigate: (deal: NearbyDeal) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedIndex === null || !scrollRef.current) return;
    const cards = scrollRef.current.children;
    if (cards[selectedIndex]) {
      (cards[selectedIndex] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedIndex]);

  if (deals.length === 0) return null;

  return (
    <div ref={scrollRef} className="flex overflow-x-auto hide-scrollbar gap-2.5 px-3 pb-3 snap-x snap-mandatory">
      {deals.map((deal, idx) => {
        const v = deal.voucher;
        const isSelected = selectedIndex === idx;
        const catCfg = categoryConfig[v.category] || { emoji: '🎁', color: '#f9fafb' };
        const isOpen = isBranchOpen(deal.branch);

        return (
          <button
            key={v.id + deal.branch.id}
            onClick={() => onSelect(idx)}
            onDoubleClick={() => onNavigate(deal)}
            className={`flex-none w-[200px] snap-start rounded-xl shadow-md p-2.5 flex gap-2.5 items-center text-start transition-all duration-200 ${
              isSelected ? 'bg-white ring-2 ring-primary shadow-lg' : 'bg-white/95 backdrop-blur-sm'
            }`}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: catCfg.color }}>
              <span className="text-xl">{v.merchantLogo}</span>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isOpen ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-text-primary truncate">{isHe ? v.titleHe : v.title}</div>
              <div className="text-[9px] text-text-muted truncate mt-0.5">{isHe ? deal.branch.addressHe : deal.branch.address}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] text-primary font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>location_on</span>
                  {formatDistance(deal.distanceKm, isHe)}
                </span>
                {v.discountPercent > 0 && (
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-semibold">{v.discountPercent}%−</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Map Filter Sheet (bottom sheet) ──

interface MapFilterState {
  categories: string[];
  priceRange: string | null;
  discount: string | null;
  openOnly: boolean;
  inStockOnly: boolean;
}

function MapFilterSheet({
  isOpen, onClose, filters, onApply, isHe, t,
}: {
  isOpen: boolean; onClose: () => void; filters: MapFilterState;
  onApply: (filters: MapFilterState) => void; isHe: boolean; t: any;
}) {
  const [local, setLocal] = useState<MapFilterState>(filters);
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isOpen) setLocal(filters); }, [isOpen, filters]);

  const dismiss = useCallback(() => {
    if (sheetRef.current) { sheetRef.current.style.transition = 'transform 0.3s ease-out'; sheetRef.current.style.transform = 'translateY(100%)'; }
    if (overlayRef.current) { overlayRef.current.style.transition = 'opacity 0.3s ease-out'; overlayRef.current.style.opacity = '0'; }
    setTimeout(onClose, 300);
  }, [onClose]);

  // Drag to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const el = document.getElementById('map-filter-header');
    if (!el) return;
    let startY = 0, curY = 0, drag = false;

    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; drag = true; curY = 0; if (sheetRef.current) sheetRef.current.style.transition = 'none'; };
    const onMove = (e: TouchEvent) => {
      if (!drag) return;
      const d = e.touches[0].clientY - startY;
      if (d > 0) { e.preventDefault(); curY = d; if (sheetRef.current) sheetRef.current.style.transform = `translateY(${d}px)`; if (overlayRef.current) overlayRef.current.style.opacity = String(Math.max(0, 1 - d / 400)); }
    };
    const onEnd = () => {
      if (!drag) return; drag = false;
      if (curY > 80) { dismiss(); }
      else { if (sheetRef.current) { sheetRef.current.style.transition = 'transform 0.3s ease-out'; sheetRef.current.style.transform = 'translateY(0)'; } if (overlayRef.current) { overlayRef.current.style.transition = 'opacity 0.3s ease-out'; overlayRef.current.style.opacity = '1'; } }
      curY = 0;
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd); };
  }, [isOpen, dismiss]);

  const toggleCat = (cat: string) => setLocal((p) => ({ ...p, categories: p.categories.includes(cat) ? p.categories.filter((c) => c !== cat) : [...p.categories, cat] }));
  const activeCount = local.categories.length + (local.priceRange ? 1 : 0) + (local.discount ? 1 : 0) + (local.openOnly ? 1 : 0) + (local.inStockOnly ? 1 : 0);
  const clearAll = () => setLocal({ categories: [], priceRange: null, discount: null, openOnly: false, inStockOnly: false });

  if (!isOpen) return null;

  return (
    <>
      <div ref={overlayRef} className="fixed inset-0 z-[2000] bg-black/40 animate-fade-in" onClick={dismiss} />
      <div ref={sheetRef} className="fixed bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Drag header */}
        <div id="map-filter-header" className="flex-shrink-0 select-none" style={{ touchAction: 'none' }}>
          <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1.5 bg-border rounded-full" /></div>
          <div className="px-5 pb-3"><h2 className="text-lg font-bold text-text-primary">{t.home.mapFilterTitle}</h2></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3">{t.home.mapFilterCategories}</h3>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const cfg = categoryConfig[cat]; const label = categoryLabels[cat];
                return (
                  <button key={cat} onClick={() => toggleCat(cat)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${local.categories.includes(cat) ? 'bg-bg-dark text-white' : 'bg-surface text-text-secondary border border-border'}`}>
                    <span>{cfg.emoji}</span><span>{isHe ? label.he : label.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price range */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3">{t.home.mapFilterPriceRange}</h3>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map(({ key, en, he }) => (
                <button key={key} onClick={() => setLocal((p) => ({ ...p, priceRange: p.priceRange === key ? null : key }))}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${local.priceRange === key ? 'bg-bg-dark text-white' : 'bg-surface text-text-secondary border border-border'}`}>
                  {isHe ? he : en}
                </button>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3">{t.home.mapFilterDiscount}</h3>
            <div className="flex flex-wrap gap-2">
              {discountRanges.map(({ key, label }) => (
                <button key={key} onClick={() => setLocal((p) => ({ ...p, discount: p.discount === key ? null : key }))}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${local.discount === key ? 'bg-bg-dark text-white' : 'bg-surface text-text-secondary border border-border'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="mb-8 space-y-3">
            <button onClick={() => setLocal((p) => ({ ...p, openOnly: !p.openOnly }))} className="flex items-center justify-between w-full py-2">
              <span className="text-sm font-medium text-text-primary">{t.home.mapFilterOpenOnly}</span>
              <div className={`w-11 h-6 rounded-full transition-colors relative ${local.openOnly ? 'bg-primary' : 'bg-border'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${local.openOnly ? 'left-[22px]' : 'left-0.5'}`} />
              </div>
            </button>
            <button onClick={() => setLocal((p) => ({ ...p, inStockOnly: !p.inStockOnly }))} className="flex items-center justify-between w-full py-2">
              <span className="text-sm font-medium text-text-primary">{t.home.mapFilterInStockOnly}</span>
              <div className={`w-11 h-6 rounded-full transition-colors relative ${local.inStockOnly ? 'bg-primary' : 'bg-border'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${local.inStockOnly ? 'left-[22px]' : 'left-0.5'}`} />
              </div>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={clearAll} className="flex-1 py-3.5 rounded-xl border border-border text-sm font-semibold text-text-primary hover:bg-surface transition-colors">
              {t.home.mapFilterClear}
            </button>
            <button onClick={() => { onApply(local); dismiss(); }} className="flex-1 py-3.5 rounded-xl bg-bg-dark text-white text-sm font-semibold hover:bg-bg-dark/90 transition-colors relative">
              {t.home.mapFilterShowResults}
              {activeCount > 0 && (
                <span className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 min-w-[20px] h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">{activeCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Business Detail Sheet (bottom sheet with snap points) ──

const PEEK_VH = 25;   // quarter screen
const EXPAND_VH = 75;  // expanded

function BusinessDetailSheet({
  isOpen, onClose, deal, business, allDealsForBusiness, isHe, t, onViewStore, onNavigate,
}: {
  isOpen: boolean; onClose: () => void; deal: NearbyDeal | null; business: Business | null;
  allDealsForBusiness: NearbyDeal[]; isHe: boolean; t: any;
  onViewStore: () => void; onNavigate: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [snapState, setSnapState] = useState<'peek' | 'expanded'>('peek');

  // Reset to peek when opening with a new deal
  useEffect(() => { if (isOpen) setSnapState('peek'); }, [isOpen, deal?.voucher.id]);

  const peekPx = () => window.innerHeight * (PEEK_VH / 100);
  const expandPx = () => window.innerHeight * (EXPAND_VH / 100);

  const setSheetHeight = useCallback((h: number, animate = true) => {
    if (!sheetRef.current) return;
    if (animate) { sheetRef.current.style.transition = 'height 0.35s cubic-bezier(.4,0,.2,1)'; }
    else { sheetRef.current.style.transition = 'none'; }
    sheetRef.current.style.height = `${h}px`;
  }, []);

  const dismiss = useCallback(() => {
    if (sheetRef.current) { sheetRef.current.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out'; sheetRef.current.style.height = '0px'; sheetRef.current.style.opacity = '0'; }
    if (overlayRef.current) { overlayRef.current.style.transition = 'opacity 0.3s ease-out'; overlayRef.current.style.opacity = '0'; }
    setTimeout(onClose, 300);
  }, [onClose]);

  // Animate to peek on first render
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;
    // Start at 0 and animate to peek
    sheetRef.current.style.height = '0px';
    sheetRef.current.style.opacity = '1';
    requestAnimationFrame(() => { setSheetHeight(peekPx()); });
  }, [isOpen, setSheetHeight]);

  // Drag gesture — works both on touch and mouse (for desktop)
  useEffect(() => {
    if (!isOpen) return;
    const el = document.getElementById('biz-detail-header');
    if (!el) return;
    let startY = 0, startH = 0, drag = false;

    const getSnap = () => snapState;

    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startH = sheetRef.current?.getBoundingClientRect().height || peekPx();
      drag = true;
      if (sheetRef.current) sheetRef.current.style.transition = 'none';
    };
    const onMove = (e: TouchEvent) => {
      if (!drag || !sheetRef.current) return;
      const delta = startY - e.touches[0].clientY; // positive = dragging up
      const newH = Math.max(0, Math.min(expandPx(), startH + delta));
      sheetRef.current.style.height = `${newH}px`;
      // Update overlay opacity based on sheet size
      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(Math.min(1, newH / peekPx() * 0.4));
      }
      e.preventDefault();
    };
    const onEnd = () => {
      if (!drag || !sheetRef.current) return;
      drag = false;
      const curH = sheetRef.current.getBoundingClientRect().height;
      const peekH = peekPx();
      const expandH = expandPx();
      const snap = getSnap();

      if (curH < peekH * 0.5) {
        // Below half of peek → dismiss
        dismiss();
      } else if (snap === 'peek') {
        // Was in peek mode
        if (curH > peekH * 1.3) {
          // Dragged up past 130% of peek → expand
          setSheetHeight(expandH);
          setSnapState('expanded');
        } else {
          // Snap back to peek
          setSheetHeight(peekH);
        }
      } else {
        // Was in expanded mode
        if (curH < expandH * 0.6) {
          // Dragged down significantly → collapse to peek
          setSheetHeight(peekH);
          setSnapState('peek');
        } else {
          // Snap back to expanded
          setSheetHeight(expandH);
        }
      }
      // Restore overlay
      if (overlayRef.current) { overlayRef.current.style.transition = 'opacity 0.3s ease-out'; overlayRef.current.style.opacity = '0.4'; }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });

    // Mouse support for desktop
    const onMouseDown = (e: MouseEvent) => {
      startY = e.clientY;
      startH = sheetRef.current?.getBoundingClientRect().height || peekPx();
      drag = true;
      if (sheetRef.current) sheetRef.current.style.transition = 'none';
      e.preventDefault();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!drag || !sheetRef.current) return;
      const delta = startY - e.clientY;
      const newH = Math.max(0, Math.min(expandPx(), startH + delta));
      sheetRef.current.style.height = `${newH}px`;
      if (overlayRef.current) overlayRef.current.style.opacity = String(Math.min(1, newH / peekPx() * 0.4));
    };
    const onMouseUp = () => {
      if (!drag) return;
      onEnd();
    };

    el.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isOpen, snapState, dismiss, setSheetHeight]);

  // Also allow clicking the peek area to expand
  const handlePeekTap = useCallback(() => {
    if (snapState === 'peek') {
      setSheetHeight(expandPx());
      setSnapState('expanded');
    }
  }, [snapState, setSheetHeight]);

  if (!isOpen || !deal || !business) return null;

  const branch = deal.branch;
  const isOpen24 = branch.openHour === undefined || branch.closeHour === undefined;
  const branchOpen = isBranchOpen(branch);
  const branchCount = mockBranches.filter((b) => b.businessId === business.id).length;
  const isExpanded = snapState === 'expanded';

  return (
    <>
      <div ref={overlayRef} className="fixed inset-0 z-[2000] bg-black/40 animate-fade-in" style={{ opacity: 0.4 }} onClick={dismiss} />
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-3xl flex flex-col"
        style={{ height: 0, overflow: 'hidden' }}
      >
        {/* Drag header — always visible */}
        <div
          id="biz-detail-header"
          className="flex-shrink-0 select-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1.5 bg-border rounded-full" />
          </div>
          {/* Swipe-up hint chevron */}
          {!isExpanded && (
            <div className="flex justify-center pb-1">
              <span className="material-symbols-outlined text-text-muted/40 animate-bounce" style={{ fontSize: '16px' }}>expand_less</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className={`flex-1 px-5 pb-6 ${isExpanded ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden'}`}
        >
          {/* Business header — always in peek */}
          <div className="flex items-start gap-4 mb-4" onClick={handlePeekTap}>
            <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-3xl shrink-0 shadow-sm">
              {deal.voucher.merchantLogo}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-text-primary truncate">
                {isHe ? business.nameHe : business.name}
              </h2>
              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                {/* Open/Closed badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  branchOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${branchOpen ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  {branchOpen ? t.home.mapDetailOpenNow : t.home.mapDetailClosed}
                </span>
                {/* Rating */}
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                  {business.rating}
                  <span className="text-text-muted/60">({business.reviewCount.toLocaleString()})</span>
                </span>
                {/* Distance pill */}
                <span className="flex items-center gap-0.5 text-xs text-primary font-medium">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>location_on</span>
                  {formatDistance(deal.distanceKm, isHe)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Expanded content below ── */}
          <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-40'}`}>
            {/* Branch info cards */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {/* Hours */}
              <div className="bg-surface rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>schedule</span>
                  <span className="text-xs font-semibold text-text-primary">{t.home.mapDetailHours}</span>
                </div>
                <p className="text-sm font-bold text-text-primary">
                  {isOpen24 ? t.home.mapDetailAlwaysOpen : `${String(branch.openHour).padStart(2, '0')}:00 – ${String(branch.closeHour).padStart(2, '0')}:00`}
                </p>
              </div>
              {/* Distance */}
              <div className="bg-surface rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>location_on</span>
                  <span className="text-xs font-semibold text-text-primary">{t.home.mapDetailDistance}</span>
                </div>
                <p className="text-sm font-bold text-text-primary">{formatDistance(deal.distanceKm, isHe)}</p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-surface rounded-xl p-3 mb-4 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-text-muted mt-0.5" style={{ fontSize: '18px' }}>pin_drop</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium">{isHe ? branch.nameHe : branch.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{isHe ? branch.addressHe : branch.address}</p>
                {branchCount > 1 && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    +{branchCount - 1} {isHe ? 'סניפים נוספים' : 'more branches'}
                  </p>
                )}
              </div>
            </div>

            {/* Available deals */}
            {allDealsForBusiness.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>local_offer</span>
                  {t.home.mapDetailAvailableDeals} ({allDealsForBusiness.length})
                </h3>
                <div className="space-y-2">
                  {allDealsForBusiness.slice(0, 4).map((d) => {
                    const catCfg = categoryConfig[d.voucher.category] || { emoji: '🎁', color: '#f9fafb' };
                    return (
                      <div key={d.voucher.id} className="flex items-center gap-3 bg-surface rounded-xl p-2.5">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: catCfg.color }}>
                          <span className="text-lg">{catCfg.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary truncate">{isHe ? d.voucher.titleHe : d.voucher.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {d.voucher.discountPercent > 0 && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">{d.voucher.discountPercent}%−</span>
                            )}
                            <span className="text-[10px] text-text-muted">₪{d.voucher.discountedPrice}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {allDealsForBusiness.length > 4 && (
                    <p className="text-xs text-primary font-medium text-center pt-1">
                      +{allDealsForBusiness.length - 4} {isHe ? 'הטבות נוספות' : 'more deals'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={onNavigate} className="flex-1 py-3.5 rounded-xl border border-border text-sm font-semibold text-text-primary hover:bg-surface transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>directions</span>
                {t.home.mapDetailNavigate}
              </button>
              <button onClick={onViewStore} className="flex-1 py-3.5 rounded-xl bg-bg-dark text-white text-sm font-semibold hover:bg-bg-dark/90 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
                {t.home.mapDetailViewStore}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════

export default function NearYouMapPage() {
  const { t, language } = useLanguage();
  const { lang = 'he' } = useParams();
  const navigate = useNavigate();
  const isHe = language === 'he';
  const coords = useGeolocationStore((s) => s.coords);
  const { deals } = useNearbyDeals(20);

  const [selectedDealIndex, setSelectedDealIndex] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [sheetFilters, setSheetFilters] = useState<MapFilterState>({ categories: [], priceRange: null, discount: null, openOnly: false, inStockOnly: false });
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [detailDeal, setDetailDeal] = useState<NearbyDeal | null>(null);

  const center = coords || { lat: 32.0853, lng: 34.7818 };

  const sheetFilterCount = sheetFilters.categories.length + (sheetFilters.priceRange ? 1 : 0) + (sheetFilters.discount ? 1 : 0) + (sheetFilters.inStockOnly ? 1 : 0);

  const filteredDeals = useMemo(() => {
    let result = deals;
    if (filterCategory) result = result.filter((d) => d.voucher.category === filterCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((d) =>
        d.voucher.title.toLowerCase().includes(q) || d.voucher.titleHe.includes(searchQuery.trim()) ||
        d.voucher.merchantName.toLowerCase().includes(q) || d.branch.name.toLowerCase().includes(q) || d.branch.nameHe.includes(searchQuery.trim()),
      );
    }
    if (openOnly) result = result.filter((d) => isBranchOpen(d.branch));
    if (sheetFilters.categories.length > 0) result = result.filter((d) => sheetFilters.categories.includes(d.voucher.category));
    if (sheetFilters.priceRange) {
      const range = priceRanges.find((r) => r.key === sheetFilters.priceRange);
      if (range) result = result.filter((d) => { const p = d.voucher.discountedPrice; if (range.min !== undefined && p < range.min) return false; if (range.max !== undefined && p >= range.max) return false; return true; });
    }
    if (sheetFilters.discount) { const disc = discountRanges.find((r) => r.key === sheetFilters.discount); if (disc) result = result.filter((d) => d.voucher.discountPercent >= disc.min); }
    if (sheetFilters.openOnly) result = result.filter((d) => isBranchOpen(d.branch));
    if (sheetFilters.inStockOnly) result = result.filter((d) => d.voucher.inStock);
    return result;
  }, [deals, filterCategory, searchQuery, openOnly, sheetFilters]);

  const handleCardSelect = useCallback((index: number) => {
    setSelectedDealIndex(index);
    const deal = filteredDeals[index];
    if (deal) {
      setFlyTarget({ lat: deal.branch.lat, lng: deal.branch.lng, zoom: 16 });
      setDetailDeal(deal);
      setShowDetailSheet(true);
    }
  }, [filteredDeals]);

  const handleMarkerClick = useCallback((deal: NearbyDeal) => {
    const idx = filteredDeals.findIndex((d) => d.voucher.id === deal.voucher.id && d.branch.id === deal.branch.id);
    if (idx >= 0) {
      setSelectedDealIndex(idx);
      setFlyTarget({ lat: deal.branch.lat, lng: deal.branch.lng, zoom: 16 });
      setDetailDeal(deal);
      setShowDetailSheet(true);
    }
  }, [filteredDeals]);

  // Computed values for detail sheet
  const detailBusiness = useMemo(() => {
    if (!detailDeal) return null;
    return mockBusinesses.find((b) => b.id === detailDeal.branch.businessId) || null;
  }, [detailDeal]);

  const allDealsForBusiness = useMemo(() => {
    if (!detailDeal) return [];
    return filteredDeals.filter((d) => d.branch.businessId === detailDeal.branch.businessId);
  }, [detailDeal, filteredDeals]);

  useEffect(() => { if (flyTarget) { const t = setTimeout(() => setFlyTarget(null), 700); return () => clearTimeout(t); } }, [flyTarget]);
  useEffect(() => { setSelectedDealIndex(null); }, [filterCategory, searchQuery, openOnly, sheetFilters]);

  return (
    <div className="fixed inset-0 z-50">
      {/* MAP */}
      <MapContainer center={[center.lat, center.lng]} zoom={14} className="w-full h-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" subdomains="abcd" maxZoom={20}
        />
        {coords && <Marker position={[coords.lat, coords.lng]} icon={userIcon}><Popup>{isHe ? 'אתה כאן' : 'You are here'}</Popup></Marker>}
        {filteredDeals.map((deal, idx) => {
          const catCfg = categoryConfig[deal.voucher.category] || { emoji: '🎁', color: '#f9fafb' };
          return (
            <Marker key={deal.voucher.id + deal.branch.id} position={[deal.branch.lat, deal.branch.lng]}
              icon={createDealIcon(catCfg.emoji, catCfg.color, selectedDealIndex === idx)}
              zIndexOffset={selectedDealIndex === idx ? 1000 : 0}
              eventHandlers={{ click: () => handleMarkerClick(deal) }} />
          );
        })}
        {coords && filteredDeals.length > 0 && !flyTarget && selectedDealIndex === null && <FitBounds deals={filteredDeals} userCoords={coords} />}
        {flyTarget && <FlyToPoint lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />}
        <MapControls isHe={isHe} userCoords={coords} />
      </MapContainer>

      {/* FLOATING TOP */}
      <div className="absolute top-0 left-0 right-0 z-[1000]" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2 px-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-90 transition-transform shrink-0">
            <span className="material-symbols-outlined text-text-primary" style={{ fontSize: '20px', transform: isHe ? 'scaleX(-1)' : undefined }}>arrow_back</span>
          </button>
          <div className="flex-1 flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-md px-3.5 py-2.5 gap-2">
            <span className="material-symbols-outlined text-text-muted shrink-0" style={{ fontSize: '18px' }}>search</span>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.home.mapSearchPlaceholder}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none" dir={isHe ? 'rtl' : 'ltr'} />
            <button onClick={() => setSearchQuery('')} className={`w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0 ${searchQuery ? '' : 'hidden'}`}>
              <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '14px' }}>close</span>
            </button>
            <div className={searchQuery ? 'hidden' : 'shrink-0'}>
              <MicButton size="sm" onTranscript={setSearchQuery} onInterim={setSearchQuery} />
            </div>
          </div>
        </div>
        <ChipsBar activeCategory={filterCategory} onSelectCategory={setFilterCategory} isHe={isHe}
          openNowLabel={t.home.mapOpenNow} openOnly={openOnly}
          onToggleOpen={() => setOpenOnly((p) => !p)} onOpenFilter={() => setShowFilterSheet(true)} activeFilterCount={sheetFilterCount} />
      </div>

      {/* FLOATING BOTTOM */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000]" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        <div className="flex justify-center mb-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-1.5 shadow-md flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>storefront</span>
            <span className="text-xs font-semibold text-text-primary">{filteredDeals.length} {isHe ? 'הטבות' : 'deals'}</span>
          </div>
        </div>
        <DealCardStrip deals={filteredDeals} selectedIndex={selectedDealIndex} onSelect={handleCardSelect} isHe={isHe} onNavigate={() => navigate(`/${lang}/store`)} />
      </div>

      {/* FILTER SHEET */}
      <MapFilterSheet isOpen={showFilterSheet} onClose={() => setShowFilterSheet(false)} filters={sheetFilters} onApply={setSheetFilters} isHe={isHe} t={t} />

      {/* BUSINESS DETAIL SHEET */}
      <BusinessDetailSheet
        isOpen={showDetailSheet}
        onClose={() => setShowDetailSheet(false)}
        deal={detailDeal}
        business={detailBusiness}
        allDealsForBusiness={allDealsForBusiness}
        isHe={isHe}
        t={t}
        onViewStore={() => { setShowDetailSheet(false); navigate(`/${lang}/store`); }}
        onNavigate={() => {
          if (detailDeal) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${detailDeal.branch.lat},${detailDeal.branch.lng}`, '_blank');
          }
        }}
      />
    </div>
  );
}

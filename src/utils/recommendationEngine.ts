import type {
  UserSignals,
  ScoredVoucher,
  ScoringWeights,
  SpendingFocus,
  DealPreference,
  EnrichmentData,
} from '../types/recommendation.types';
import type { Voucher, VoucherCategory } from '../types/voucher.types';

// ── Default Weights ──
const DEFAULT_WEIGHTS: ScoringWeights = {
  categoryMatch: 0.25,
  dealPreferenceMatch: 0.15,
  purchaseHistoryBoost: 0.20,
  timeOfDayRelevance: 0.10,
  calendarRelevance: 0.05,
  popularitySignal: 0.10,
  enrichmentMatch: 0.05,
  expirationUrgency: 0.10,
};

// ── Mappings ──

const SPENDING_FOCUS_TO_CATEGORIES: Record<SpendingFocus, VoucherCategory[]> = {
  food: ['food'],
  shopping: ['shopping'],
  entertainment: ['entertainment'],
  health: ['health'],
};

const RELATED_CATEGORIES: Record<VoucherCategory, VoucherCategory[]> = {
  food: ['health'],
  shopping: ['tech'],
  entertainment: ['travel'],
  travel: ['entertainment'],
  health: ['food'],
  education: ['tech'],
  tech: ['education', 'shopping'],
};

type TimeSlot = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night';

const TIME_CATEGORY_AFFINITY: Record<TimeSlot, VoucherCategory[]> = {
  morning: ['food', 'health'],
  lunch: ['food'],
  afternoon: ['shopping', 'tech', 'education'],
  evening: ['entertainment', 'food'],
  night: ['entertainment', 'travel'],
};

function getTimeSlot(date: Date): TimeSlot {
  const hour = date.getHours();
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// ── Individual Scoring Functions ──

function scoreCategoryMatch(voucher: Voucher, spendingFocus: SpendingFocus | null): number {
  if (!spendingFocus) return 0.5;

  const primary = SPENDING_FOCUS_TO_CATEGORIES[spendingFocus] || [];
  if (primary.includes(voucher.category)) return 1.0;

  const related = primary.flatMap((c) => RELATED_CATEGORIES[c] || []);
  if (related.includes(voucher.category)) return 0.5;

  return 0.1;
}

function scoreDealPreference(voucher: Voucher, pref: DealPreference | null): number {
  if (!pref) return 0.5;

  switch (pref) {
    case 'big_discount':
      if (voucher.discountPercent >= 30) return 1.0;
      if (voucher.discountPercent >= 20) return 0.7;
      if (voucher.discountPercent >= 10) return 0.4;
      return 0.2;

    case 'new_experiences': {
      const cats: VoucherCategory[] = ['entertainment', 'travel', 'education'];
      return cats.includes(voucher.category) ? 1.0 : 0.3;
    }

    case 'everyday_savings': {
      const cats: VoucherCategory[] = ['food', 'shopping', 'health'];
      if (cats.includes(voucher.category)) {
        return voucher.discountedPrice <= 100 ? 1.0 : 0.7;
      }
      return 0.3;
    }

    case 'premium_brands':
      if (voucher.originalPrice >= 150) return 1.0;
      if (voucher.originalPrice >= 80) return 0.6;
      return 0.3;

    default:
      return 0.5;
  }
}

function scorePurchaseHistory(
  voucher: Voucher,
  purchasedCategories: Map<VoucherCategory, number>,
  purchasedMerchants: Map<string, number>,
): number {
  const totalPurchases = Array.from(purchasedCategories.values()).reduce((s, c) => s + c, 0);
  if (totalPurchases === 0) return 0.5;

  let score = 0;

  // Merchant affinity (strong signal)
  const merchantCount = purchasedMerchants.get(voucher.merchantName) || 0;
  if (merchantCount > 0) {
    score += 0.5 * Math.min(merchantCount / 3, 1);
  }

  // Category affinity
  const categoryCount = purchasedCategories.get(voucher.category) || 0;
  if (categoryCount > 0) {
    score += 0.5 * Math.min(categoryCount / totalPurchases, 1);
  }

  return Math.min(score, 1.0);
}

function scoreTimeOfDay(voucher: Voucher, currentTime: Date): number {
  const slot = getTimeSlot(currentTime);
  const affinityCategories = TIME_CATEGORY_AFFINITY[slot] || [];
  return affinityCategories.includes(voucher.category) ? 1.0 : 0.3;
}

function scoreCalendar(voucher: Voucher, currentTime: Date): number {
  const month = currentTime.getMonth();
  const dayOfWeek = currentTime.getDay();
  let score = 0.5;

  // Weekend boost (Fri/Sat in Israel)
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
  if (isWeekend && ['entertainment', 'food', 'travel'].includes(voucher.category)) {
    score += 0.3;
  }

  // Summer boost for travel
  if (month >= 5 && month <= 7 && voucher.category === 'travel') {
    score += 0.3;
  }

  // Holiday seasons (Rosh Hashana Sep/Oct, Pesach Mar/Apr)
  if ((month === 8 || month === 9) && ['food', 'shopping'].includes(voucher.category)) {
    score += 0.2;
  }
  if ((month === 2 || month === 3) && ['food', 'shopping'].includes(voucher.category)) {
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

function scorePopularity(voucher: Voucher): number {
  return voucher.popular ? 1.0 : 0.3;
}

function scoreEnrichment(voucher: Voucher, enrichment: EnrichmentData | null): number {
  if (!enrichment) return 0.5;

  let score = 0.5;

  // Interest matching
  if (enrichment.interests) {
    const interestMap: Record<string, VoucherCategory[]> = {
      fitness: ['health'],
      tech: ['tech', 'education'],
      travel: ['travel'],
      foodie: ['food'],
      fashion: ['shopping'],
      movies: ['entertainment'],
    };
    for (const interest of enrichment.interests) {
      const matched = interestMap[interest] || [];
      if (matched.includes(voucher.category)) {
        score += 0.2;
      }
    }
  }

  // Income-based
  if (enrichment.incomeLevel === 'high' && voucher.originalPrice >= 150) {
    score += 0.1;
  } else if (enrichment.incomeLevel === 'low' && voucher.discountPercent >= 25) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

function scoreExpirationUrgency(voucher: Voucher, currentTime: Date): number {
  const validUntil = new Date(voucher.validUntil);
  const daysLeft = (validUntil.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24);

  if (daysLeft <= 0) return 0;
  if (daysLeft <= 7) return 1.0;
  if (daysLeft <= 30) return 0.7;
  if (daysLeft <= 90) return 0.4;
  return 0.2;
}

// ── Reason Generation ──

function generateReason(
  voucher: Voucher,
  signals: UserSignals,
  breakdown: ScoredVoucher['scoreBreakdown'],
): { reason: string; reasonHe: string } {
  const factors = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
  const top = factors[0]?.[0];

  const focusLabels: Record<string, string> = {
    food: 'אוכל',
    shopping: 'קניות',
    entertainment: 'בידור',
    health: 'בריאות',
  };

  switch (top) {
    case 'categoryScore':
      return {
        reason: `Matches your ${signals.spendingFocus} preference`,
        reasonHe: `מתאים להעדפת ה${focusLabels[signals.spendingFocus || ''] || ''} שלך`,
      };
    case 'dealPreferenceScore':
      return {
        reason: `Great deal — ${voucher.discountPercent}% off`,
        reasonHe: `מבצע מעולה — ${voucher.discountPercent}% הנחה`,
      };
    case 'purchaseHistoryScore':
      return {
        reason: `You've enjoyed ${voucher.merchantName} before`,
        reasonHe: `כבר נהנית מ${voucher.merchantName} בעבר`,
      };
    case 'timeOfDayScore':
      return {
        reason: 'Perfect for this time of day',
        reasonHe: 'מושלם לשעה הזו ביום',
      };
    case 'expirationUrgencyScore':
      return {
        reason: "Expiring soon — don't miss out!",
        reasonHe: 'עומד לפוג בקרוב — אל תפספס!',
      };
    default:
      return {
        reason: 'Recommended for you',
        reasonHe: 'מומלץ עבורך',
      };
  }
}

// ═══════════════════════════════════════
//  MAIN ENGINE
// ═══════════════════════════════════════

export function rankVouchers(
  vouchers: Voucher[],
  signals: UserSignals,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  maxResults = 10,
): ScoredVoucher[] {
  const now = signals.currentTime;

  // Only in-stock and not expired
  const eligible = vouchers.filter((v) => {
    if (!v.inStock) return false;
    return new Date(v.validUntil).getTime() > now.getTime();
  });

  const scored: ScoredVoucher[] = eligible.map((voucher) => {
    const breakdown = {
      categoryScore: scoreCategoryMatch(voucher, signals.spendingFocus),
      dealPreferenceScore: scoreDealPreference(voucher, signals.dealPreference),
      purchaseHistoryScore: scorePurchaseHistory(
        voucher,
        signals.purchasedCategories,
        signals.purchasedMerchants,
      ),
      timeOfDayScore: scoreTimeOfDay(voucher, now),
      calendarScore: scoreCalendar(voucher, now),
      popularityScore: scorePopularity(voucher),
      enrichmentScore: scoreEnrichment(voucher, signals.enrichment),
      expirationUrgencyScore: scoreExpirationUrgency(voucher, now),
    };

    const relevanceScore =
      (breakdown.categoryScore * weights.categoryMatch +
        breakdown.dealPreferenceScore * weights.dealPreferenceMatch +
        breakdown.purchaseHistoryScore * weights.purchaseHistoryBoost +
        breakdown.timeOfDayScore * weights.timeOfDayRelevance +
        breakdown.calendarScore * weights.calendarRelevance +
        breakdown.popularityScore * weights.popularitySignal +
        breakdown.enrichmentScore * weights.enrichmentMatch +
        breakdown.expirationUrgencyScore * weights.expirationUrgency) *
      100;

    const { reason, reasonHe } = generateReason(voucher, signals, breakdown);

    return { voucher, relevanceScore, scoreBreakdown: breakdown, reason, reasonHe };
  });

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scored.slice(0, maxResults);
}

export { DEFAULT_WEIGHTS };

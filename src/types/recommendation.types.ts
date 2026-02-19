import type { Voucher, VoucherCategory, UserVoucher } from './voucher.types';

// ── Preference Unions (from questionnaire) ──
export type SpendingFocus = 'food' | 'shopping' | 'entertainment' | 'health';
export type DealPreference = 'big_discount' | 'new_experiences' | 'everyday_savings' | 'premium_brands';
export type NotificationFrequency = 'daily' | 'weekly' | 'only_relevant';

// ── External Enrichment Data (purchased / third-party) ──
export interface EnrichmentData {
  ageGroup?: '18-25' | '26-35' | '36-45' | '46-55' | '56+';
  gender?: 'male' | 'female' | 'other';
  incomeLevel?: 'low' | 'medium' | 'high';
  interests?: string[];
  locationCity?: string;
  hasChildren?: boolean;
}

// ── Aggregated User Signals ──
export interface UserSignals {
  // From registration questionnaire / user profile
  spendingFocus: SpendingFocus | null;
  dealPreference: DealPreference | null;
  notificationFrequency: NotificationFrequency | null;

  // From user profile
  birthday: string | null;
  memberSince: string | null;
  organizationId: string | null;

  // From purchase history
  purchaseHistory: UserVoucher[];
  purchasedCategories: Map<VoucherCategory, number>;
  purchasedMerchants: Map<string, number>;

  // External enrichment
  enrichment: EnrichmentData | null;

  // Contextual / timing
  currentTime: Date;
}

// ── Scoring Configuration ──
export interface ScoringWeights {
  categoryMatch: number;
  dealPreferenceMatch: number;
  purchaseHistoryBoost: number;
  timeOfDayRelevance: number;
  calendarRelevance: number;
  popularitySignal: number;
  enrichmentMatch: number;
  expirationUrgency: number;
}

// ── Scored Voucher Result ──
export interface ScoredVoucher {
  voucher: Voucher;
  relevanceScore: number;
  scoreBreakdown: {
    categoryScore: number;
    dealPreferenceScore: number;
    purchaseHistoryScore: number;
    timeOfDayScore: number;
    calendarScore: number;
    popularityScore: number;
    enrichmentScore: number;
    expirationUrgencyScore: number;
  };
  reason: string;
  reasonHe: string;
}

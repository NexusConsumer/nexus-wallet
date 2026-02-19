import type {
  UserSignals,
  SpendingFocus,
  DealPreference,
  NotificationFrequency,
} from '../types/recommendation.types';
import type { User } from '../types/user.types';
import type { UserVoucher, VoucherCategory } from '../types/voucher.types';
import { mockEnrichmentProfiles } from '../mock/data/enrichment.mock';

export function buildUserSignals(
  user: User | null | undefined,
  userVouchers: UserVoucher[] | null | undefined,
  questionnairePrefs: Record<string, string> | null | undefined,
): UserSignals {
  const purchases = userVouchers ?? [];

  // Build frequency maps from purchase history
  const purchasedCategories = new Map<VoucherCategory, number>();
  const purchasedMerchants = new Map<string, number>();

  for (const uv of purchases) {
    const cat = uv.voucher.category;
    purchasedCategories.set(cat, (purchasedCategories.get(cat) || 0) + 1);

    const merchant = uv.voucher.merchantName;
    purchasedMerchants.set(merchant, (purchasedMerchants.get(merchant) || 0) + 1);
  }

  // Resolve preferences: questionnaire answers take priority over stored profile
  const prefs = questionnairePrefs ?? user?.preferences ?? {};

  // Look up enrichment data
  const enrichment = user?.id ? (mockEnrichmentProfiles[user.id] ?? null) : null;

  return {
    spendingFocus: (prefs.spendingFocus ?? prefs.spending_focus ?? null) as SpendingFocus | null,
    dealPreference: (prefs.dealPreference ?? prefs.deal_preference ?? null) as DealPreference | null,
    notificationFrequency: (prefs.notificationFrequency ?? prefs.notification_frequency ?? null) as NotificationFrequency | null,
    birthday: null,
    memberSince: user?.createdAt ?? null,
    organizationId: user?.organizationId ?? null,
    purchaseHistory: purchases,
    purchasedCategories,
    purchasedMerchants,
    enrichment,
    currentTime: new Date(),
  };
}

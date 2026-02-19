import type { EnrichmentData } from '../../types/recommendation.types';

/** Mock external enrichment profiles (simulates purchased third-party data) */
export const mockEnrichmentProfiles: Record<string, EnrichmentData> = {
  usr_001: {
    ageGroup: '26-35',
    gender: 'male',
    incomeLevel: 'medium',
    interests: ['foodie', 'tech', 'fitness'],
    locationCity: 'Tel Aviv',
    hasChildren: false,
  },
};

import { mockOffers } from '../data/offers.mock';
import type { Offer } from '../../types/offer.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetOffers(): Promise<Offer[]> {
  await delay(300);
  return [...mockOffers];
}

export async function mockGetActiveOffers(): Promise<Offer[]> {
  await delay(200);
  return mockOffers.filter(o => !o.claimed && new Date(o.validUntil) > new Date());
}

export async function mockClaimOffer(offerId: string): Promise<Offer> {
  await delay(400);
  const offer = mockOffers.find(o => o.id === offerId);
  if (!offer) throw new Error('Offer not found');
  return { ...offer, claimed: true };
}

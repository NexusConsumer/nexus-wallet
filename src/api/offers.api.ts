import { mockGetOffers, mockGetActiveOffers, mockClaimOffer } from '../mock/handlers/offers.handler';

export const offersApi = {
  getAll: () => mockGetOffers(),
  getActive: () => mockGetActiveOffers(),
  claim: (offerId: string) => mockClaimOffer(offerId),
};

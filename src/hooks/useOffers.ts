import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersApi } from '../api/offers.api';

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: offersApi.getAll,
  });
}

export function useActiveOffers() {
  return useQuery({
    queryKey: ['offers', 'active'],
    queryFn: offersApi.getActive,
  });
}

export function useClaimOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) => offersApi.claim(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

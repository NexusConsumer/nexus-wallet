import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';

interface UseWalletOptions {
  enabled?: boolean;
}

export function useWallet(options?: UseWalletOptions) {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
    enabled: options?.enabled ?? true,
  });
}

import { useQuery } from '@tanstack/react-query';
import { vouchersApi } from '../api/vouchers.api';
import type { UserVoucher } from '../types/voucher.types';

interface UseMyVouchersOptions {
  enabled?: boolean;
}

export function useMyVouchers(status?: UserVoucher['status'], options?: UseMyVouchersOptions) {
  return useQuery({
    queryKey: ['userVouchers', status],
    queryFn: () => vouchersApi.getUserVouchers(status),
    enabled: options?.enabled ?? true,
  });
}

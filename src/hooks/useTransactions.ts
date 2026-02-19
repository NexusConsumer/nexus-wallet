import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactions.api';
import type { Transaction } from '../types/transaction.types';

export function useTransactions(type?: Transaction['type']) {
  return useQuery({
    queryKey: ['transactions', type],
    queryFn: () => transactionsApi.getAll(type),
  });
}

export function useRecentTransactions(limit: number = 5) {
  return useQuery({
    queryKey: ['transactions', 'recent', limit],
    queryFn: () => transactionsApi.getRecent(limit),
  });
}

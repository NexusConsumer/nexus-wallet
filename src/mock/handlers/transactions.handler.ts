import { mockTransactions } from '../data/transactions.mock';
import type { Transaction } from '../../types/transaction.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetTransactions(type?: Transaction['type']): Promise<Transaction[]> {
  await delay(300);
  let transactions = [...mockTransactions];
  if (type) transactions = transactions.filter(t => t.type === type);
  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function mockGetRecentTransactions(limit: number = 5): Promise<Transaction[]> {
  await delay(200);
  return mockTransactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

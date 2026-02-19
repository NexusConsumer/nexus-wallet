import { mockWallet } from '../data/wallet.mock';
import type { Wallet } from '../../types/wallet.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetWallet(): Promise<Wallet> {
  await delay(300);
  return { ...mockWallet };
}

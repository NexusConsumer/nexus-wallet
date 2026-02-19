export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  totalEarned: number;
  totalSpent: number;
  totalSaved: number;
  lastUpdated: string;
}

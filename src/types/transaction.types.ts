export interface Transaction {
  id: string;
  type: 'purchase' | 'redemption' | 'refund' | 'bonus' | 'cashback';
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  merchantName?: string;
  merchantLogo?: string;
  voucherId?: string;
  createdAt: string;
}

import { mockVouchers, mockUserVouchers } from '../data/vouchers.mock';
import type { Voucher, UserVoucher, VoucherCategory } from '../../types/voucher.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetVouchers(category?: VoucherCategory): Promise<Voucher[]> {
  await delay(300);
  if (category) return mockVouchers.filter(v => v.category === category);
  return [...mockVouchers];
}

export async function mockGetVoucherById(id: string): Promise<Voucher | undefined> {
  await delay(200);
  return mockVouchers.find(v => v.id === id);
}

export async function mockGetUserVouchers(status?: UserVoucher['status']): Promise<UserVoucher[]> {
  await delay(300);
  if (status) return mockUserVouchers.filter(v => v.status === status);
  return [...mockUserVouchers];
}

export async function mockPurchaseVoucher(voucherId: string): Promise<UserVoucher> {
  await delay(500);
  const voucher = mockVouchers.find(v => v.id === voucherId);
  if (!voucher) throw new Error('Voucher not found');
  return {
    id: `uv_${Date.now()}`, voucherId, voucher,
    purchasedAt: new Date().toISOString(), expiresAt: voucher.validUntil + 'T23:59:59Z',
    status: 'active', redemptionCode: `NXS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=NXS-${Date.now()}`,
  };
}

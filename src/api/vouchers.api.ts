import { mockGetVouchers, mockGetVoucherById, mockGetUserVouchers, mockPurchaseVoucher } from '../mock/handlers/vouchers.handler';
import type { VoucherCategory, UserVoucher } from '../types/voucher.types';

export const vouchersApi = {
  getAll: (category?: VoucherCategory) => mockGetVouchers(category),
  getById: (id: string) => mockGetVoucherById(id),
  getUserVouchers: (status?: UserVoucher['status']) => mockGetUserVouchers(status),
  purchase: (voucherId: string) => mockPurchaseVoucher(voucherId),
};

import { mockGetWallet } from '../mock/handlers/wallet.handler';

export const walletApi = {
  getWallet: () => mockGetWallet(),
};

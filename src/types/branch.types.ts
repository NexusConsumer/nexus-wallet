import type { Voucher } from './voucher.types';

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  nameHe: string;
  address: string;
  addressHe: string;
  lat: number;
  lng: number;
  /** Opening hour (0-23). Undefined = always open */
  openHour?: number;
  /** Closing hour (0-23). Undefined = always open */
  closeHour?: number;
}

export interface NearbyDeal {
  voucher: Voucher;
  branch: Branch;
  distanceKm: number;
}

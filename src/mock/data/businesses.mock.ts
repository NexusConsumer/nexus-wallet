import type { Business } from '../../types/search.types';

export const mockBusinesses: Business[] = [
  {
    id: 'biz_001', name: "McDonald's", nameHe: 'מקדונלדס',
    category: 'Fast Food', categoryHe: 'מזון מהיר',
    logo: '🍔', rating: 4.2, reviewCount: 1240,
    location: 'Nationwide', locationHe: 'ארצי',
    hasVouchers: true,
  },
  {
    id: 'biz_002', name: 'Castro', nameHe: 'קסטרו',
    category: 'Fashion', categoryHe: 'אופנה',
    logo: '👕', rating: 4.0, reviewCount: 890,
    location: 'Nationwide', locationHe: 'ארצי',
    hasVouchers: true,
  },
  {
    id: 'biz_003', name: 'Cinema City', nameHe: 'סינמה סיטי',
    category: 'Entertainment', categoryHe: 'בילויים',
    logo: '🎬', rating: 4.5, reviewCount: 2100,
    location: 'Major cities', locationHe: 'ערים מרכזיות',
    hasVouchers: true,
  },
  {
    id: 'biz_004', name: 'Aroma Espresso Bar', nameHe: 'ארומה',
    category: 'Cafe', categoryHe: 'בית קפה',
    logo: '☕', rating: 4.3, reviewCount: 3200,
    location: 'Nationwide', locationHe: 'ארצי',
    hasVouchers: true,
  },
  {
    id: 'biz_005', name: 'Isrotel', nameHe: 'ישרוטל',
    category: 'Hotels', categoryHe: 'מלונות',
    logo: '🏨', rating: 4.6, reviewCount: 560,
    location: 'Nationwide', locationHe: 'ארצי',
    hasVouchers: true,
  },
  {
    id: 'biz_006', name: 'Superpharm', nameHe: 'סופרפארם',
    category: 'Health & Beauty', categoryHe: 'בריאות ויופי',
    logo: '💊', rating: 4.1, reviewCount: 1800,
    location: 'Nationwide', locationHe: 'ארצי',
    hasVouchers: true,
  },
  {
    id: 'biz_007', name: 'KSP', nameHe: 'KSP',
    category: 'Electronics', categoryHe: 'אלקטרוניקה',
    logo: '💻', rating: 3.9, reviewCount: 4500,
    location: 'Nationwide', locationHe: 'ארצי',
    hasVouchers: true,
  },
  {
    id: 'biz_008', name: 'Holmes Place', nameHe: 'הולמס פלייס',
    category: 'Fitness', categoryHe: 'כושר',
    logo: '💪', rating: 4.4, reviewCount: 720,
    location: 'Major cities', locationHe: 'ערים מרכזיות',
    hasVouchers: true,
  },
  {
    id: 'biz_009', name: 'Shufersal', nameHe: 'שופרסל',
    category: 'Supermarket', categoryHe: 'סופרמרקט',
    logo: '🛒', rating: 3.8, reviewCount: 5600,
    location: 'Nationwide', locationHe: 'ארצי',
    hasVouchers: true,
  },
  {
    id: 'biz_010', name: 'H&M', nameHe: 'H&M',
    category: 'Fashion', categoryHe: 'אופנה',
    logo: '👗', rating: 4.1, reviewCount: 1350,
    location: 'Major malls', locationHe: 'קניונים מרכזיים',
    hasVouchers: true,
  },
];

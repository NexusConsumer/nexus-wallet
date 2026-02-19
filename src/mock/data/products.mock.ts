import type { Product } from '../../types/search.types';

export const mockProducts: Product[] = [
  {
    id: 'prod_001', name: 'Wireless Earbuds Pro', nameHe: 'אוזניות אלחוטיות פרו',
    description: 'Premium noise-canceling earbuds', descriptionHe: 'אוזניות מבטלות רעש פרימיום',
    merchantName: 'KSP', image: '🎧',
    price: 299, originalPrice: 399, currency: 'ILS', inStock: true,
  },
  {
    id: 'prod_002', name: 'Smart Watch Band', nameHe: 'רצועת שעון חכם',
    description: 'Silicone band for smartwatches', descriptionHe: 'רצועת סיליקון לשעונים חכמים',
    merchantName: 'KSP', image: '⌚',
    price: 79, originalPrice: 120, currency: 'ILS', inStock: true,
  },
  {
    id: 'prod_003', name: 'Organic Coffee Blend', nameHe: 'תערובת קפה אורגני',
    description: '500g premium coffee beans', descriptionHe: '500 גרם פולי קפה פרימיום',
    merchantName: 'Aroma', image: '☕',
    price: 65, currency: 'ILS', inStock: true,
  },
  {
    id: 'prod_004', name: 'Vitamin D3 Supplement', nameHe: 'תוסף ויטמין D3',
    description: '60 capsules, 1000 IU', descriptionHe: '60 כמוסות, 1000 יחידות',
    merchantName: 'Superpharm', image: '💊',
    price: 45, originalPrice: 59, currency: 'ILS', inStock: true,
  },
  {
    id: 'prod_005', name: 'Cotton T-Shirt', nameHe: 'חולצת כותנה',
    description: 'Premium 100% cotton tee', descriptionHe: 'חולצה 100% כותנה פרימיום',
    merchantName: 'Castro', image: '👕',
    price: 89, originalPrice: 129, currency: 'ILS', inStock: true,
  },
  {
    id: 'prod_006', name: 'Power Bank 20000mAh', nameHe: 'סוללת גיבוי 20000mAh',
    description: 'Fast charging portable battery', descriptionHe: 'סוללה ניידת טעינה מהירה',
    merchantName: 'KSP', image: '🔋',
    price: 149, originalPrice: 199, currency: 'ILS', inStock: true,
  },
  {
    id: 'prod_007', name: 'Yoga Mat Premium', nameHe: 'מזרן יוגה פרימיום',
    description: 'Anti-slip exercise mat', descriptionHe: 'מזרן אימון נגד החלקה',
    merchantName: 'Holmes Place', image: '🧘',
    price: 120, currency: 'ILS', inStock: true,
  },
  {
    id: 'prod_008', name: 'Travel Neck Pillow', nameHe: 'כרית צוואר לנסיעות',
    description: 'Memory foam travel pillow', descriptionHe: 'כרית נסיעות מוקצף זכרון',
    merchantName: 'Isrotel', image: '🛫',
    price: 69, originalPrice: 99, currency: 'ILS', inStock: false,
  },
];

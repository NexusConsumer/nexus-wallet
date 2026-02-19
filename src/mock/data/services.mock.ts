import type { Service } from '../../types/search.types';

export const mockServices: Service[] = [
  {
    id: 'svc_001', name: 'Personal Training Session', nameHe: 'אימון אישי',
    description: '1-on-1 personal training', descriptionHe: 'אימון אישי אחד על אחד',
    providerName: 'Holmes Place', icon: '💪',
    priceRange: '₪150 - ₪250', priceRangeHe: '₪150 - ₪250',
    rating: 4.8,
  },
  {
    id: 'svc_002', name: 'Hotel Spa Treatment', nameHe: 'טיפול ספא במלון',
    description: 'Relaxing spa day package', descriptionHe: 'חבילת ספא מפנקת',
    providerName: 'Isrotel', icon: '🧖',
    priceRange: '₪300 - ₪600', priceRangeHe: '₪300 - ₪600',
    rating: 4.7,
  },
  {
    id: 'svc_003', name: 'Tech Support', nameHe: 'תמיכה טכנית',
    description: 'Computer setup & repair', descriptionHe: 'התקנה ותיקון מחשבים',
    providerName: 'KSP', icon: '🔧',
    priceRange: '₪100 - ₪300', priceRangeHe: '₪100 - ₪300',
    rating: 3.9,
  },
  {
    id: 'svc_004', name: 'Catering Service', nameHe: 'שירותי קייטרינג',
    description: 'Event & party catering', descriptionHe: 'קייטרינג לאירועים ומסיבות',
    providerName: "McDonald's", icon: '🍽️',
    priceRange: '₪500 - ₪2000', priceRangeHe: '₪500 - ₪2000',
    rating: 4.0,
  },
  {
    id: 'svc_005', name: 'Online Course', nameHe: 'קורס אונליין',
    description: 'Professional development course', descriptionHe: 'קורס פיתוח מקצועי',
    providerName: 'Coursera', icon: '📚',
    priceRange: '₪90 - ₪350', priceRangeHe: '₪90 - ₪350',
    rating: 4.5,
  },
  {
    id: 'svc_006', name: 'Style Consultation', nameHe: 'ייעוץ סטייל',
    description: 'Personal styling session', descriptionHe: 'פגישת סטיילינג אישית',
    providerName: 'Castro', icon: '👗',
    priceRange: '₪200 - ₪400', priceRangeHe: '₪200 - ₪400',
    rating: 4.3,
  },
  {
    id: 'svc_007', name: 'Nutrition Consultation', nameHe: 'ייעוץ תזונה',
    description: 'Professional diet planning', descriptionHe: 'תכנון תזונה מקצועי',
    providerName: 'Superpharm', icon: '🥗',
    priceRange: '₪180 - ₪350', priceRangeHe: '₪180 - ₪350',
    rating: 4.4,
  },
  {
    id: 'svc_008', name: 'Private Movie Screening', nameHe: 'הקרנה פרטית',
    description: 'Private screening for groups', descriptionHe: 'הקרנה פרטית לקבוצות',
    providerName: 'Cinema City', icon: '🎥',
    priceRange: '₪800 - ₪1500', priceRangeHe: '₪800 - ₪1500',
    rating: 4.6,
  },
];

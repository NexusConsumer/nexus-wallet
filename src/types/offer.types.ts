export interface Offer {
  id: string;
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  type: 'cashback' | 'discount' | 'bonus' | 'freebie';
  value: number;
  merchantName: string;
  merchantLogo: string;
  image: string;
  validFrom: string;
  validUntil: string;
  conditions: string;
  conditionsHe: string;
  isNew: boolean;
  claimed: boolean;
}

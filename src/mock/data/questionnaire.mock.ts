import type { QuestionnaireQuestion } from '../../types/registration.types';

export const questionnaireQuestions: QuestionnaireQuestion[] = [
  {
    id: 'spending_focus',
    titleEn: 'What do you spend on most?',
    titleHe: 'על מה אתה מוציא הכי הרבה?',
    type: 'single-select-cards',
    options: [
      { value: 'food', labelEn: 'Food & Dining', labelHe: 'אוכל ומסעדות', icon: 'restaurant', emoji: '🍔' },
      { value: 'shopping', labelEn: 'Shopping', labelHe: 'קניות', icon: 'shopping_bag', emoji: '🛍️' },
      { value: 'entertainment', labelEn: 'Entertainment', labelHe: 'בידור', icon: 'movie', emoji: '🎬' },
      { value: 'health', labelEn: 'Health & Wellness', labelHe: 'בריאות ואיכות חיים', icon: 'spa', emoji: '💆' },
    ],
  },
  {
    id: 'deal_preference',
    titleEn: 'What kind of deals do you prefer?',
    titleHe: 'איזה סוג הטבות אתה מעדיף?',
    type: 'single-select-cards',
    options: [
      { value: 'big_discount', labelEn: 'Biggest discounts', labelHe: 'הנחות הכי גדולות', icon: 'percent', emoji: '💰' },
      { value: 'new_experiences', labelEn: 'New experiences', labelHe: 'חוויות חדשות', icon: 'explore', emoji: '✨' },
      { value: 'everyday_savings', labelEn: 'Everyday savings', labelHe: 'חיסכון יומיומי', icon: 'savings', emoji: '🏷️' },
      { value: 'premium_brands', labelEn: 'Premium brands', labelHe: 'מותגים פרימיום', icon: 'diamond', emoji: '💎' },
    ],
  },
  {
    id: 'notification_frequency',
    titleEn: 'How often should we update you?',
    titleHe: 'באיזו תדירות לעדכן אותך?',
    type: 'single-select-cards',
    options: [
      { value: 'daily', labelEn: 'Daily deals', labelHe: 'מבצעים יומיים', icon: 'today', emoji: '📅' },
      { value: 'weekly', labelEn: 'Weekly digest', labelHe: 'סיכום שבועי', icon: 'date_range', emoji: '📬' },
      { value: 'only_relevant', labelEn: 'Only relevant to me', labelHe: 'רק מה שרלוונטי לי', icon: 'tune', emoji: '🎯' },
    ],
  },
];

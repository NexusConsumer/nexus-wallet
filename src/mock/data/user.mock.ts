import type { User } from '../../types/user.types';

export const mockUser: User = {
  id: 'usr_001',
  firstName: 'דניאל',
  lastName: 'כהן',
  email: 'daniel@example.com',
  phone: '050-1234567',
  avatar: 'https://ui-avatars.com/api/?name=Daniel+Cohen&background=635bff&color=fff&size=128&bold=true',
  organizationId: 'org_001',
  organizationName: 'חברת הייטק בע"מ',
  language: 'he',
  createdAt: '2024-01-15T10:00:00Z',
  preferences: {
    spendingFocus: 'food',
    dealPreference: 'big_discount',
    notificationFrequency: 'only_relevant',
  },
};

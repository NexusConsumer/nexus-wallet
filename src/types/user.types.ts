export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  organizationId: string;
  organizationName: string;
  language: 'en' | 'he';
  createdAt: string;
  registrationCompleted?: boolean;
  tenantId?: string;
  preferences?: {
    spendingFocus?: string;
    dealPreference?: string;
    notificationFrequency?: string;
  };
}

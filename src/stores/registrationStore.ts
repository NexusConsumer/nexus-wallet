import { create } from 'zustand';
import type { RegistrationPath } from '../types/registration.types';

interface OrgMemberInfo {
  organizationId: string;
  organizationName: string;
  firstName?: string;
  lastName?: string;
}

interface RegistrationState {
  // Flow tracking
  isRegistering: boolean;
  registrationPath: RegistrationPath | null;
  returnTo: string | null;

  // Pre-filled data from OTP step
  phone: string | null;
  orgMember: OrgMemberInfo | null;
  missingFields: string[];

  // Profile form data (accumulated across steps)
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    birthday: string;
  };

  // Questionnaire responses
  preferences: Record<string, string> | null;

  // Membership fee
  membershipFeePaid: boolean;

  // Actions
  startRegistration: (params: {
    path: RegistrationPath;
    phone: string;
    orgMember?: OrgMemberInfo | null;
    missingFields?: string[];
    returnTo?: string;
  }) => void;
  setProfileData: (data: Partial<RegistrationState['profileData']>) => void;
  setPreferences: (prefs: Record<string, string>) => void;
  setMembershipFeePaid: (paid: boolean) => void;
  completeRegistration: () => void;
  resetRegistration: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  isRegistering: false,
  registrationPath: null,
  returnTo: null,
  phone: null,
  orgMember: null,
  missingFields: [],
  profileData: { firstName: '', lastName: '', email: '', birthday: '' },
  preferences: null,
  membershipFeePaid: false,

  startRegistration: ({ path, phone, orgMember, missingFields, returnTo }) =>
    set({
      isRegistering: true,
      registrationPath: path,
      phone,
      orgMember: orgMember ?? null,
      missingFields: missingFields ?? [],
      returnTo: returnTo ?? null,
      // Pre-fill profile data from org member if available
      profileData: {
        firstName: orgMember?.firstName ?? '',
        lastName: orgMember?.lastName ?? '',
        email: '',
        birthday: '',
      },
    }),

  setProfileData: (data) =>
    set((state) => ({
      profileData: { ...state.profileData, ...data },
    })),

  setPreferences: (prefs) => set({ preferences: prefs }),

  setMembershipFeePaid: (paid) => set({ membershipFeePaid: paid }),

  completeRegistration: () =>
    set({
      isRegistering: false,
      registrationPath: null,
      returnTo: null,
      phone: null,
      orgMember: null,
      missingFields: [],
      profileData: { firstName: '', lastName: '', email: '', birthday: '' },
      preferences: null,
      membershipFeePaid: false,
    }),

  resetRegistration: () =>
    set({
      isRegistering: false,
      registrationPath: null,
      returnTo: null,
      phone: null,
      orgMember: null,
      missingFields: [],
      profileData: { firstName: '', lastName: '', email: '', birthday: '' },
      preferences: null,
      membershipFeePaid: false,
    }),
}));

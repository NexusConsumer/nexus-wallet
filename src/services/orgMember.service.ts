import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { OrgMember } from '../types/auth.types';

const ORG_MEMBERS = 'orgMembers';

/** Normalize Israeli phone to E.164: 050-1234567 → +972501234567 */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('972')) return `+${digits}`;
  if (digits.startsWith('0')) return `+972${digits.slice(1)}`;
  return `+${digits}`;
}

/** Look up an org member by phone (E.164 format) */
async function lookupByPhone(phone: string): Promise<OrgMember | null> {
  const e164 = toE164(phone);
  const q = query(collection(db, ORG_MEMBERS), where('phone', '==', e164), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : (snap.docs[0].data() as OrgMember);
}

/** Look up an org member by email */
async function lookupByEmail(email: string): Promise<OrgMember | null> {
  const normalized = email.toLowerCase().trim();
  const q = query(collection(db, ORG_MEMBERS), where('email', '==', normalized), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : (snap.docs[0].data() as OrgMember);
}

/**
 * Look up an org member by phone and/or email.
 * Tries phone first, then email.
 */
export async function lookupOrgMember(
  identifier: { phone?: string; email?: string }
): Promise<OrgMember | null> {
  if (identifier.phone) {
    const result = await lookupByPhone(identifier.phone);
    if (result) return result;
  }
  if (identifier.email) {
    const result = await lookupByEmail(identifier.email);
    if (result) return result;
  }
  return null;
}

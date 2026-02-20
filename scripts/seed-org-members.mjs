/**
 * Seed script: Populate Firestore `orgMembers` collection with test data.
 *
 * Usage:
 *   1. Place your Firebase service account key at ./serviceAccountKey.json
 *      (download from Firebase Console → Project settings → Service accounts → Generate key)
 *   2. Run: node scripts/seed-org-members.mjs
 *
 * This script is idempotent — it overwrites documents with the same phone-based ID.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load service account key
const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
} catch {
  console.error('❌ Could not find serviceAccountKey.json in scripts/');
  console.error('   Download it from Firebase Console → Project settings → Service accounts');
  process.exit(1);
}

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const COLLECTION = 'orgMembers';

// ── Seed data (matches mock data in auth.handler.ts + added emails for Google lookup) ──
const orgMembers = [
  {
    phone: '+972501234567',
    email: 'israel@hitech.co.il',
    organizationId: 'org_001',
    organizationName: 'חברת הייטק בע"מ',
    firstName: 'ישראל',
    lastName: 'כהן',
  },
  {
    phone: '+972529876543',
    email: 'sarah@hitech.co.il',
    organizationId: 'org_001',
    organizationName: 'חברת הייטק בע"מ',
    firstName: 'שרה',
    lastName: 'לוי',
  },
  {
    phone: '+972545551234',
    email: 'david@startup.co.il',
    organizationId: 'org_002',
    organizationName: 'סטארטאפ ישראלי',
    firstName: 'דוד',
    lastName: 'אברהם',
  },
  {
    phone: '+972531112222',
    email: '',
    organizationId: 'org_001',
    organizationName: 'חברת הייטק בע"מ',
    firstName: 'משה',
    lastName: '',
    // Incomplete profile — for testing missing fields flow
  },
];

async function seed() {
  console.log(`🌱 Seeding ${orgMembers.length} org members to Firestore...`);

  const batch = db.batch();

  for (const member of orgMembers) {
    // Use phone as document ID (without the + prefix for a clean doc ID)
    const docId = member.phone.replace('+', '');
    const docRef = db.collection(COLLECTION).doc(docId);
    batch.set(docRef, member);
    console.log(`  ✅ ${member.firstName || '(no name)'} ${member.lastName || ''} — ${member.phone}`);
  }

  await batch.commit();
  console.log(`\n🎉 Done! ${orgMembers.length} documents written to "${COLLECTION}" collection.`);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

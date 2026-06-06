import { onSchedule } from 'firebase-functions/v2/scheduler';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from './admin';

const BATCH_LIMIT = 500;

export const expireReports = onSchedule(
  { schedule: 'every 30 minutes', region: 'asia-southeast1' },
  async () => {
    const now = Timestamp.now();

    // Scope to active statuses so we don't scan the entire historical collection.
    // Uses the composite index: status ASCENDING + expiresAt ASCENDING.
    const snap = await db.collection('reports')
      .where('status', 'in', ['pending', 'confirmed', 'disputed'])
      .where('expiresAt', '<', now)
      .get();

    if (snap.empty) return;

    // Firestore batches are capped at 500 writes — chunk if needed.
    for (let i = 0; i < snap.docs.length; i += BATCH_LIMIT) {
      const chunk = snap.docs.slice(i, i + BATCH_LIMIT);
      const batch = db.batch();
      chunk.forEach(doc => batch.update(doc.ref, { status: 'expired' }));
      await batch.commit();
    }

    console.log(`Expired ${snap.docs.length} reports`);
  }
);

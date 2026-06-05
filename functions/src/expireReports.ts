import { onSchedule } from 'firebase-functions/v2/scheduler';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from './admin';

export const expireReports = onSchedule(
  { schedule: 'every 30 minutes', region: 'asia-southeast1' },
  async () => {
    const now = Timestamp.now();

    const snap = await db.collection('reports')
      .where('expiresAt', '<', now)
      .get();

    const toExpire = snap.docs.filter(d => d.data()['status'] !== 'expired');
    if (toExpire.length === 0) return;

    const batch = db.batch();
    toExpire.forEach(doc => batch.update(doc.ref, { status: 'expired' }));
    await batch.commit();

    console.log(`Expired ${toExpire.length} reports`);
  }
);

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { db, messaging, FieldValue } from './admin';
import { getUsersNearby } from './geo';
import type { Depth, FloodReport } from './types';

export async function sendNearbyNotifications(
  reportId: string,
  lat: number,
  lng: number,
  depth: Depth,
  options: { preliminary: boolean }
): Promise<void> {
  const users = await getUsersNearby([lat, lng], 2);
  if (users.length === 0) return;

  const title = options.preliminary
    ? 'Unverified flood report nearby'
    : 'Flood confirmed nearby';
  const body = `${depth.charAt(0).toUpperCase() + depth.slice(1)}-deep flooding reported in your area`;

  await Promise.all(
    users.map(async user => {
      const tokens = user.fcmTokens ?? [];
      if (tokens.length === 0) return;

      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: { reportId, depth, preliminary: String(options.preliminary) },
      });

      const staleTokens = tokens.filter(
        (_, i) =>
          response.responses[i].error?.code ===
          'messaging/registration-token-not-registered'
      );

      if (staleTokens.length > 0) {
        await db.collection('users').doc(user.uid).update({
          fcmTokens: FieldValue.arrayRemove(...staleTokens),
        });
      }
    })
  );
}

// Handles upvote/downvote disputes and routes confirmed-status notifications.
// Note: confirmed FCM is sent from onReportCreate to avoid duplicates when batch-updating clusters.
export const onReportUpdate = onDocumentUpdated(
  { document: 'reports/{reportId}', region: 'asia-southeast1' },
  async event => {
    if (!event.data) return;

    const before = event.data.before.data() as FloodReport;
    const after = event.data.after.data() as FloodReport;
    const reportId = event.params.reportId;

    // Dispute check: downvotes > upvotes + 5 and at least 3 downvotes
    if (
      after.status !== 'disputed' &&
      after.downvotes >= 3 &&
      after.downvotes > after.upvotes + 5
    ) {
      await db.collection('reports').doc(reportId).update({ status: 'disputed' });
      return;
    }

    // Clear disputed status if votes swing back
    if (
      before.status === 'disputed' &&
      !(after.downvotes >= 3 && after.downvotes > after.upvotes + 5)
    ) {
      await db.collection('reports').doc(reportId).update({ status: 'pending' });
    }
  }
);

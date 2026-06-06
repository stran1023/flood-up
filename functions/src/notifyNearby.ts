import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { db, FieldValue } from './admin';
import { getUsersNearby } from './geo';
import type { Depth, FloodReport } from './types';

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
  sound: 'default';
};

type ExpoTicket = {
  status: 'ok' | 'error';
  details?: { error?: string };
};

async function sendExpo(messages: ExpoMessage[]): Promise<ExpoTicket[]> {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  const json = (await res.json()) as { data: ExpoTicket[] };
  return json.data;
}

export async function sendNearbyNotifications(
  reportId: string,
  lat: number,
  lng: number,
  depth: Depth,
  options: { preliminary: boolean; street?: string; reportedAt: string }
): Promise<void> {
  const users = await getUsersNearby([lat, lng], 2);
  if (users.length === 0) return;

  const { preliminary, street, reportedAt } = options;
  const title = preliminary ? 'Unverified flood report nearby' : 'Flood confirmed nearby';
  const depthLabel = depth.charAt(0).toUpperCase() + depth.slice(1);
  const body = street
    ? `${depthLabel}-deep flooding on ${street}`
    : `${depthLabel}-deep flooding reported in your area`;

  await Promise.all(
    users.map(async user => {
      const tokens = (user.fcmTokens ?? []).filter(t => t.startsWith('ExponentPushToken'));
      if (tokens.length === 0) return;

      const messages: ExpoMessage[] = tokens.map(to => ({
        to, title, body, sound: 'default',
        data: {
          reportId,
          depth,
          reportedAt,
          street: street ?? '',
          lat: String(lat),
          lng: String(lng),
          preliminary: String(preliminary),
        },
      }));

      const tickets = await sendExpo(messages);

      const staleTokens = tokens.filter(
        (_, i) => tickets[i]?.status === 'error' && tickets[i]?.details?.error === 'DeviceNotRegistered'
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

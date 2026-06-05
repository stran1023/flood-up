import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from './admin';
import type { FloodReport } from './types';

export function encodeGeohash(lat: number, lng: number): string {
  return geohashForLocation([lat, lng], 7);
}

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  return distanceBetween([lat1, lng1], [lat2, lng2]);
}

export async function getNearbyReports(
  center: [number, number],
  radiusKm: number,
  withinMinutes: number,
  excludeId?: string
): Promise<FloodReport[]> {
  const bounds = geohashQueryBounds(center, radiusKm * 1000);
  const sinceMs = Date.now() - withinMinutes * 60 * 1000;

  const snapshots = await Promise.all(
    bounds.map(([start, end]) =>
      db.collection('reports')
        .where('geohash', '>=', start)
        .where('geohash', '<=', end)
        .where('status', 'in', ['pending', 'confirmed'])
        .where('expiresAt', '>', Timestamp.now())
        .get()
    )
  );

  return snapshots
    .flatMap(s => s.docs)
    .filter(d => d.id !== excludeId)
    .map(d => ({ id: d.id, ...(d.data() as Omit<FloodReport, 'id'>) }))
    .filter(r =>
      r.reportedAt.toMillis() >= sinceMs &&
      distanceBetween([r.lat, r.lng], center) <= radiusKm
    );
}

export async function getLastReport(
  userId: string,
  excludeId: string
): Promise<FloodReport | null> {
  const snap = await db.collection('reports')
    .where('userId', '==', userId)
    .orderBy('reportedAt', 'desc')
    .limit(2)
    .get();

  const prev = snap.docs.find(d => d.id !== excludeId);
  if (!prev) return null;
  return { id: prev.id, ...(prev.data() as Omit<FloodReport, 'id'>) };
}

export async function getUsersNearby(
  center: [number, number],
  radiusKm: number
) {
  const bounds = geohashQueryBounds(center, radiusKm * 1000);

  const snapshots = await Promise.all(
    bounds.map(([start, end]) =>
      db.collection('users')
        .where('homeGeohash', '>=', start)
        .where('homeGeohash', '<=', end)
        .get()
    )
  );

  return snapshots
    .flatMap(s => s.docs)
    .map(d => ({ uid: d.id, ...(d.data() as { fcmTokens?: string[]; homeLat?: number; homeLng?: number; homeGeohash?: string }) }))
    .filter(u =>
      u.homeGeohash &&
      u.homeLat !== undefined &&
      u.homeLng !== undefined &&
      distanceBetween([u.homeLat as number, u.homeLng as number], center) <= radiusKm
    );
}

import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { FloodReport } from '../types';

export function encodeGeohash(lat: number, lng: number): string {
  return geohashForLocation([lat, lng], 7);
}

export async function getNearbyReports(
  center: [number, number],
  radiusKm: number
): Promise<FloodReport[]> {
  const bounds = geohashQueryBounds(center, radiusKm * 1000);

  const queries = bounds.map(([start, end]) =>
    query(
      collection(db, 'reports'),
      where('geohash', '>=', start),
      where('geohash', '<=', end),
      where('status', 'in', ['pending', 'confirmed']),
      where('expiresAt', '>', Timestamp.now())
    )
  );

  const snapshots = await Promise.all(queries.map(q => getDocs(q)));
  const docs = snapshots.flatMap(s => s.docs);

  return docs
    .map(d => ({ id: d.id, ...d.data() } as FloodReport))
    .filter(r => distanceBetween([r.lat, r.lng], center) <= radiusKm);
}

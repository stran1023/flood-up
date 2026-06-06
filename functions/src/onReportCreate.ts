import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db, FieldValue } from './admin';
import { encodeGeohash, getNearbyReports, getLastReport, haversineKm } from './geo';
import { getOpenMeteoRainfall } from './weatherCheck';
import { sendNearbyNotifications } from './notifyNearby';
import { verifyImage } from './verifyImage';
import type { Depth, FloodReport } from './types';

async function snapToRoad(lat: number, lng: number): Promise<boolean> {
  const apiKey = process.env.GOOGLE_ROADS_API_KEY;
  if (!apiKey) return true;
  try {
    const url = `https://roads.googleapis.com/v1/snapToRoads?path=${lat},${lng}&key=${apiKey}`;
    const res = await fetch(url);
    const json = (await res.json()) as { snappedPoints?: unknown[] };
    return Array.isArray(json.snappedPoints) && json.snappedPoints.length > 0;
  } catch {
    return true; // fail open — SE Asian road data is incomplete
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'FloodUp/1.0' } });
    const json = (await res.json()) as { address?: { road?: string; suburb?: string; city?: string } };
    return json.address?.road ?? json.address?.suburb ?? json.address?.city;
  } catch {
    return undefined; // fail open — notification still sent without street name
  }
}

export const onReportCreate = onDocumentCreated(
  { document: 'reports/{reportId}', region: 'asia-southeast1' },
  async event => {
    const snapshot = event.data;
    if (!snapshot) return;

    const reportId = event.params.reportId;
    const data = snapshot.data() as Omit<FloodReport, 'id'>;
    const { lat, lng, depth, userId, photoUrl } = data;
    const reportedAt = data.reportedAt.toDate().toISOString();

    const now = Date.now();

    const [onRoad, rainfall, lastReport, street] = await Promise.all([
      snapToRoad(lat, lng),
      getOpenMeteoRainfall(lat, lng),
      getLastReport(userId, reportId),
      reverseGeocode(lat, lng),
    ]);

    let trustScore = 70;

    // GPS plausibility — soft penalty
    if (!onRoad) trustScore -= 25;

    // Velocity check — only hard rejection
    if (lastReport) {
      const distKm = haversineKm(lat, lng, lastReport.lat, lastReport.lng);
      const minutesAgo = (now - lastReport.reportedAt.toMillis()) / 60000;
      const speedKph = minutesAgo > 0 ? distKm / (minutesAgo / 60) : Infinity;
      if (speedKph > 80) {
        await db.collection('reports').doc(reportId).delete();
        console.warn(`Velocity reject: ${speedKph.toFixed(0)} km/h for user ${userId}`);
        return;
      }
    }

    // Weather correlation — soft penalty
    if (rainfall < 1.0) trustScore -= 15;

    // Corroboration — self-inclusive count
    const nearby = await getNearbyReports([lat, lng], 0.5, 30, reportId);
    const corroborationCount = nearby.length + 1;
    const isConfirmed = corroborationCount >= 3;
    const newStatus = isConfirmed ? 'confirmed' : 'pending';

    // Recompute geohash in case client sent wrong precision
    const geohash = encodeGeohash(lat, lng);

    // Batch-update this report and increment corroboration on nearby reports
    const batch = db.batch();
    batch.update(db.collection('reports').doc(reportId), {
      trustScore,
      corroborationCount,
      status: newStatus,
      geohash,
      weatherRainfallMm: rainfall,
    });

    for (const r of nearby) {
      const neighborRef = db.collection('reports').doc(r.id);
      const update: Record<string, unknown> = {
        corroborationCount: FieldValue.increment(1),
      };
      if (isConfirmed && r.status !== 'confirmed') {
        update['status'] = 'confirmed';
      }
      batch.update(neighborRef, update);
    }

    await batch.commit();

    // Severity fast-path — preliminary alert for serious single reports
    if (['waist', 'chest'].includes(depth) && trustScore >= 65) {
      await sendNearbyNotifications(reportId, lat, lng, depth as Depth, { preliminary: true, street, reportedAt });
    }

    // Standard FCM when cluster is confirmed
    if (isConfirmed) {
      await sendNearbyNotifications(reportId, lat, lng, depth as Depth, { preliminary: false, street, reportedAt });
    }

    // Image check — fire and forget, non-blocking
    if (photoUrl) {
      verifyImage(photoUrl, reportId).catch(err =>
        console.error('verifyImage async error:', err)
      );
    }
  }
);

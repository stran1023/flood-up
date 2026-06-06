import { distanceBetween } from 'geofire-common';
import type { FloodReport } from '../types';

export interface LatLng {
  latitude: number;
  longitude: number;
}

// Decodes a Google Maps encoded polyline string into coordinate pairs.
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let idx = 0, lat = 0, lng = 0;
  while (idx < encoded.length) {
    let shift = 0, result = 0, byte: number;
    do {
      byte = encoded.charCodeAt(idx++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(idx++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

// Minimum distance in km from point P to line segment AB using projection.
function distToSegmentKm(p: LatLng, a: LatLng, b: LatLng): number {
  const dx = b.latitude - a.latitude;
  const dy = b.longitude - a.longitude;
  const lenSq = dx * dx + dy * dy;
  let t = 0;
  if (lenSq > 0) {
    t = ((p.latitude - a.latitude) * dx + (p.longitude - a.longitude) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
  }
  const closest: [number, number] = [a.latitude + t * dx, a.longitude + t * dy];
  return distanceBetween([p.latitude, p.longitude], closest);
}

function isPointNearFlood(point: LatLng, reports: FloodReport[], thresholdKm: number): boolean {
  return reports.some(r =>
    distanceBetween([point.latitude, point.longitude], [r.lat, r.lng]) <= thresholdKm
  );
}

// Splits a polyline into consecutive clear/flooded segments for colour rendering.
export function splitRouteByFloodZones(
  points: LatLng[],
  floods: FloodReport[],
  thresholdKm = 0.2,
): Array<{ points: LatLng[]; flooded: boolean }> {
  if (points.length === 0) return [];
  if (floods.length === 0) return [{ points, flooded: false }];

  const segments: Array<{ points: LatLng[]; flooded: boolean }> = [];
  let current: LatLng[] = [points[0]];
  let flooded = isPointNearFlood(points[0], floods, thresholdKm);

  for (let i = 1; i < points.length; i++) {
    const f = isPointNearFlood(points[i], floods, thresholdKm);
    if (f !== flooded) {
      current.push(points[i]); // overlap point keeps segments connected
      segments.push({ points: current, flooded });
      current = [points[i]];
      flooded = f;
    } else {
      current.push(points[i]);
    }
  }
  segments.push({ points: current, flooded });
  return segments;
}

export function findFloodsOnRoute(
  polyline: LatLng[],
  reports: FloodReport[],
  thresholdKm = 0.2,
): FloodReport[] {
  if (polyline.length < 2) return [];
  return reports.filter(report => {
    for (let i = 0; i < polyline.length - 1; i++) {
      if (distToSegmentKm(
        { latitude: report.lat, longitude: report.lng },
        polyline[i],
        polyline[i + 1],
      ) <= thresholdKm) return true;
    }
    return false;
  });
}

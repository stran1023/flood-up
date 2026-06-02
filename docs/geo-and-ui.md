# Geo Query Pattern and UI Reference

## Geohash radius query (`geofire-common`)

Used in `functions/src/notifyNearby.ts` and `mobile/lib/geo.ts`.

```typescript
import { geohashQueryBounds, distanceBetween } from 'geofire-common';

async function getNearbyReports(
  center: [number, number], // [lat, lng]
  radiusKm: number
): Promise<FloodReport[]> {
  const bounds = geohashQueryBounds(center, radiusKm * 1000);

  const queries = bounds.map(b =>
    db.collection('reports')
      .where('geohash', '>=', b[0])
      .where('geohash', '<=', b[1])
      .where('status', 'in', ['pending', 'confirmed'])
      .where('expiresAt', '>', Timestamp.now())
  );

  const docs = (await Promise.all(queries.map(q => q.get())))
    .flatMap(s => s.docs);

  // Geohash bounds are approximate squares — filter to exact circle
  return docs
    .map(d => ({ id: d.id, ...d.data() } as FloodReport))
    .filter(r => distanceBetween([r.lat, r.lng], center) <= radiusKm);
}
```

Geohash precision 7 (~76m × 152m cells) is used on all `reports` documents and on `users.homeGeohash`.

---

## Depth color system (`mobile/constants/depth.ts`)

Used consistently across map pins, the DepthPicker component, and the city authority dashboard.

```typescript
export const DEPTH_CONFIG = {
  ankle: { label: 'Ankle deep', color: '#EF9F27' }, // amber
  knee:  { label: 'Knee deep',  color: '#D85A30' }, // coral
  waist: { label: 'Waist deep', color: '#E24B4A' }, // red
  chest: { label: 'Chest deep', color: '#791F1F' }, // dark red
} as const;

export type Depth = keyof typeof DEPTH_CONFIG;
```

Always import from this file — never hardcode depth colors inline.

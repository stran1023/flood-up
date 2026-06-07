# Trust Pipeline

All verification runs inside `onReportCreate`. Independent API calls are parallelized. The only hard rejection is the velocity check — everything else is a soft trust-score penalty that keeps the report alive but reduces its credibility.

## Pipeline (`functions/src/onReportCreate.ts`)

```typescript
// Base trust score before any adjustments
report.trustScore = 70;

// Parallel API calls
const [rainfall, lastReport, street] = await Promise.all([
  getOpenMeteoRainfall(lat, lng), // Open-Meteo
  getLastReport(userId, reportId), // Firestore lookup
  reverseGeocode(lat, lng),       // Nominatim (OSM)
]);

// 1. Velocity check — only hard rejection
// Physically unforgeable: a user cannot move faster than 80 km/h between reports.
if (lastReport) {
  const distanceKm = haversine(lat, lng, lastReport.lat, lastReport.lng);
  const minutesAgo = (now - lastReport.reportedAt) / 60000;
  if (distanceKm / (minutesAgo / 60) > 80) return reject('velocity');
}

// 2. Weather correlation — soft penalty
// Open-Meteo is ~1km resolution. Hyperlocal SE Asian flash floods can appear dry
// at the grid level, so the penalty is intentionally small.
if (rainfall < 1.0) report.trustScore -= 15;

// 3. Corroboration — self-inclusive count
const nearby = await getNearbyReports(geohash, radiusKm = 0.5, withinMinutes = 30);
report.corroborationCount = nearby.length + 1;
if (report.corroborationCount >= 3) report.status = 'confirmed';

// 4. Severity fast-path
// Fires a preliminary FCM alert for high-risk single reports without waiting
// for 3 corroborations.
if (['waist', 'chest'].includes(depth) && report.trustScore >= 65) {
  notifyNearby(reportId, { preliminary: true });
}
```

### Trust score summary

| Check | Effect |
|---|---|
| Base | +70 (starting value) |
| Dry weather (<1mm) | −15 |
| Velocity violation | Hard reject (report deleted) |

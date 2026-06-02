# Trust Pipeline

All verification runs inside `onReportCreate`. Independent API calls are parallelized. The only hard rejection is the velocity check — everything else is a soft trust-score penalty that keeps the report alive but reduces its credibility.

## Pipeline (`functions/src/onReportCreate.ts`)

```typescript
// Base trust score before any adjustments
report.trustScore = 60;

// Parallel API calls to stay within the ~15s end-to-end latency target
const [onRoad, rainfall, lastReport] = await Promise.all([
  snapToRoad(lat, lng),           // Google Roads API
  getOpenMeteoRainfall(lat, lng), // Open-Meteo
  getLastReport(userId),          // Firestore lookup
]);

// 1. GPS plausibility — soft penalty
// Hard reject is avoided: SE Asian road data is incomplete and an API outage
// would block all demo submissions.
if (!onRoad) report.trustScore -= 25;

// 2. Velocity check — only hard rejection
// Physically unforgeable: a user cannot move faster than 80 km/h between reports.
if (lastReport) {
  const distanceKm = haversine(lat, lng, lastReport.lat, lastReport.lng);
  const minutesAgo = (now - lastReport.reportedAt) / 60000;
  if (distanceKm / (minutesAgo / 60) > 80) return reject('velocity');
}

// 3. Weather correlation — soft penalty
// Open-Meteo is ~1km resolution. Hyperlocal SE Asian flash floods can appear dry
// at the grid level, so the penalty is intentionally small.
if (rainfall < 1.0) report.trustScore -= 15;

// 4. Corroboration — self-inclusive count
const nearby = await getNearbyReports(geohash, radiusKm = 0.5, withinMinutes = 30);
report.corroborationCount = nearby.length + 1;
if (report.corroborationCount >= 3) report.status = 'confirmed';

// 5. Severity fast-path
// Fires a preliminary FCM alert for high-risk single reports without waiting
// for 3 corroborations. This is what makes the "5-second notification" demo metric achievable.
if (['waist', 'chest'].includes(depth) && report.trustScore >= 65) {
  notifyNearby(reportId, { preliminary: true });
}

// 6. Image check — async, non-blocking
// verifyImage updates the report document independently when Claude responds.
if (photoUrl) verifyImage(photoUrl, reportId);
```

### Trust score summary

| Check | Effect |
|---|---|
| Base | +60 (starting value) |
| Off-road GPS | −25 |
| Dry weather (<1mm) | −15 |
| Photo answer = NO | −40 (applied async by verifyImage) |
| Velocity violation | Hard reject (report not written) |

A report at base score (60) with no penalties passes the severity fast-path threshold (≥ 65) only if no penalties apply. In dry-weather demo conditions (−15), the score drops to 45, which is below the threshold. Adjust the base score or threshold if demo conditions are consistently dry.

---

## Claude Vision image check (`functions/src/verifyImage.ts`)

```typescript
try {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: photoUrl } },
          {
            type: 'text',
            text: 'Does this photo show a flooded road or street with standing water? Answer only: YES, NO, or UNCERTAIN.',
          },
        ],
      }],
    }),
  });
  const answer = (await response.json()).content[0].text.trim().toUpperCase();
  const update: Partial<FloodReport> = { photoVerified: answer === 'YES' };
  if (answer === 'NO') update.trustScore = FieldValue.increment(-40);
  await db.collection('reports').doc(reportId).update(update);
} catch (err) {
  console.error('verifyImage failed:', err);
  // null = check was attempted but failed
  // undefined = check was never attempted
  await db.collection('reports').doc(reportId).update({ photoVerified: null });
}
```

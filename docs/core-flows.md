# Core Flows

## 1. Submit a flood report (resident)

```
User taps report button
  → auto-fill GPS location
  → DepthPicker (ankle / knee / waist / chest)
  → optional photo (camera or gallery)
  → tap Submit
  → client writes document to Firestore `reports` collection
  → onReportCreate Cloud Function fires:
      ├── [parallel] GPS plausibility + weather check + last report lookup
      ├── velocity check (hard reject if >80 km/h since last report)
      ├── corroboration count (nearby.length + 1, self-inclusive)
      ├── severity fast-path if waist/chest + trustScore >= 65
      └── async: Claude Vision image check (non-blocking)
  → report appears on map as `pending` pin within ~15 seconds
  → if corroborationCount >= 3 → status = `confirmed` → standard FCM alerts sent
```

See `docs/trust-pipeline.md` for the full verification logic.

---

## 2. Receive a flood alert (resident)

```
notifyNearby fires (triggered by confirmed status or severity fast-path)
  → query `users` collection where homeGeohash falls within 2km radius
  → send FCM push to all tokens in each user's fcmTokens array
  → notification payload: { street, depth, reportedAt, reportId, preliminary? }
  → tapping notification opens FloodMap centered on the report location
```

Preliminary alerts (from the severity fast-path) include `preliminary: true` in the payload and are labelled "Unverified report nearby" in the UI.

---

## 3. Driver quick-report

```
Driver sees persistent large Report button on the map screen
  → one tap → auto-fills GPS location + timestamp
  → large depth buttons optimised for stationary tapping
  → no photo required in driver mode
  → submit → same onReportCreate function as resident flow
```

Driver reports go through the same trust pipeline. The only difference is the UI — no photo step, larger tap targets.

---

## 4. Report auto-expiry

```
Scheduled Cloud Function (expireReports) runs every 30 minutes
  → queries reports where expiresAt < now() and status != 'expired'
  → sets status = 'expired' on matching documents
  → expired reports are excluded from live map queries (filter: expiresAt > Timestamp.now())
```

Reports expire 6 hours after `reportedAt`. `expiresAt` is written by the client at submit time as `reportedAt + 6h` and validated server-side.

---

## 5. Disputed status (community moderation)

```
Any authenticated user taps 'Looks clear' on a pin detail sheet
  → Firestore document's downvotes field increments by 1
  → onUpdate Cloud Function checks: downvotes > upvotes + 5 && downvotes >= 3
  → if true: status set to 'disputed'
  → disputed reports show a distinct visual state on the map
```

# Firestore Data Model

## Collection: `reports`

```typescript
interface FloodReport {
  id: string;                      // auto-generated doc ID
  lat: number;
  lng: number;
  geohash: string;                 // precision 7, used for radius queries
  depth: 'ankle' | 'knee' | 'waist' | 'chest';
  photoUrl?: string;               // Firebase Storage URL
  photoVerified?: boolean | null;  // true=yes, false=no, null=check failed, undefined=never attempted
  reportedAt: Timestamp;
  expiresAt: Timestamp;            // reportedAt + 6 hours
  userId: string;
  accountAgeDays: number;          // for trust throttle
  upvotes: number;                 // "still flooded" votes
  downvotes: number;               // "looks clear" votes
  status: 'pending' | 'confirmed' | 'disputed' | 'expired';
  corroborationCount: number;      // self-inclusive: this report + independent nearby reports
  weatherRainfallMm?: number;      // Open-Meteo reading at submit time
  trustScore: number;              // starts at 60, adjusted by trust pipeline
}
```

### Status transitions

| From | To | Condition |
|---|---|---|
| `pending` | `confirmed` | `corroborationCount >= 3` (2 prior nearby reports + this one) |
| `pending` / `confirmed` | `disputed` | `downvotes > upvotes + 5 && downvotes >= 3` |
| any | `expired` | `expiresAt < now()` — set by scheduled `expireReports` function |

Only `confirmed` reports trigger standard FCM push notifications.
High-severity single reports (`waist`/`chest` + `trustScore >= 65`) trigger a preliminary unverified alert immediately — see `docs/trust-pipeline.md`.

---

## Collection: `users`

```typescript
interface AppUser {
  uid: string;
  fcmTokens: string[];      // array supports multi-device and token refresh
  homeLat?: number;
  homeLng?: number;
  homeGeohash?: string;     // pre-computed at precision 7 — required for alert targeting
  reportCount: number;
  trustScore: number;       // increases when this user's reports get corroborated
  createdAt: Timestamp;
  role: 'resident' | 'driver' | 'authority';
}
```

### Notes

- `homeGeohash` must be set for a user to receive push notifications. Auto-set from GPS on first login, editable in profile.
- `fcmTokens` is an array. Remove tokens that return `UNREGISTERED` from the FCM API (stale token cleanup).
- `role = 'authority'` grants read access to all user documents for the city dashboard (see `docs/firebase-config.md` security rules).

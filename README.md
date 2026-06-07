# Flood Up

**Real-time urban flood intelligence for Southeast Asian cities.**

When heavy rain hits Ho Chi Minh City, Bangkok, or Jakarta, colonial-era drainage fails in minutes. Residents leave home not knowing which streets are underwater. Drivers get dispatched into impassable routes. City crews respond only after the damage is done.

**The problem isn't the flood — it's that nobody knows where the water is.**

---

<!-- video: 30-second overview clip -->

---

## How it works

Residents and drivers submit a one-tap flood report — location auto-filled by GPS, depth selected from four options (ankle / knee / waist / chest). The report hits a verification pipeline, appears on the live map within seconds, and pushes alerts to nearby users.

Three independent reports in the same area within 30 minutes → **confirmed**. Six hours without corroboration → **auto-expired**.

---

## The three views

### Resident app — know before you go

<!-- screenshot: live map with colored flood pins -->

A live map shows every active flood report in the city, color-coded by depth. Before leaving home, open the app and see if your route is clear.

<!-- screenshot: route search with flood warning banner -->

Search a destination and the app highlights any flooded segments along your route.

### Driver app — report while you wait

<!-- screenshot: one-tap report button in driver mode -->

A persistent report button lets drivers submit a flood in one tap while stationary at a light. Every driver report strengthens the map for everyone else.

### City authority dashboard — act before it escalates

<!-- screenshot: authority dashboard heatmap -->

Authorities see a live heatmap and a real-time report table. Twelve reports in the same district within 10 minutes signals a drainage emergency — dispatch a crew now, not after the hotline rings.

---

## Trust pipeline

Every report is scored before it can trigger alerts:

| Check | Method |
|---|---|
| Velocity check | Hard rejects physically impossible movement between reports |
| Weather correlation | Open-Meteo API — soft penalty during dry conditions |
| Corroboration | 3 independent nearby reports within 30 min → `confirmed` |

Reports start at trust score 70. Only confirmed reports (or high-severity single reports above the trust threshold) trigger push notifications.

---

## Tech stack

| Layer | Choice |
|---|---|
| Mobile | React Native (Expo) |
| Backend | Firebase — Firestore, Auth, Cloud Functions, Storage |
| Push notifications | Expo Notifications + FCM |
| AI image check | Anthropic Claude (`claude-sonnet-4-6`) |
| Weather | Open-Meteo (free, no key required) |
| City dashboard | React + Vite |
| Geo queries | geofire-common (geohash radius) |

---

## Getting started

**Prerequisites:** Node.js 18+, Firebase CLI, Expo CLI, a Firebase project with Firestore / Auth / Storage / Functions enabled.

```bash
git clone <repo-url> flood-up
cd flood-up
./init.sh

cp mobile/.env.example mobile/.env        # Firebase keys + Maps API key

firebase deploy --only firestore:rules,firestore:indexes

# Three terminals:
cd mobile && npx expo start
cd dashboard && npx vite
cd functions && npm run serve
```

**`mobile/.env`**
```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## Repository structure

```
flood-up/
├── mobile/       # Expo React Native app (residents + drivers)
├── functions/    # Firebase Cloud Functions (trust pipeline, alerts, expiry)
├── dashboard/    # City authority web dashboard (React + Vite)
└── docs/         # Architecture, data model, core flows
```

---

## License

MIT

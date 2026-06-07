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

## The two views

### Resident app — know before you go

<!-- screenshot: live map with colored flood pins -->

A live map shows every active flood report in the city, color-coded by depth. Before leaving home, open the app and see if your route is clear.

<!-- screenshot: route search with flood warning banner -->

Search a destination and the app highlights any flooded segments along your route.

### Driver app — report while you wait

<!-- screenshot: one-tap report button in driver mode -->

A persistent report button lets drivers submit a flood in one tap while stationary at a light. Every driver report strengthens the map for everyone else.

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
| Weather | Open-Meteo (free, no key required) |
| Geo queries | geofire-common (geohash radius) |

---

## Getting started

**Prerequisites:** Node.js 18+, Firebase CLI, a Firebase project with Firestore / Auth / Storage / Functions enabled.

```bash
git clone <repo-url> flood-up
cd flood-up
cp mobile/.env.example mobile/.env   # fill in Firebase + Maps API keys
./init.sh                            # installs deps, type-checks, deploys Firebase, starts Expo
```

Scan the QR code in Expo Go to open the app on your phone.

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

**`init.sh` flags**
```
./init.sh --verify     # type-check only, no deploy, no start
./init.sh --no-deploy  # skip Firebase deploy, just start Expo
./init.sh --no-start   # deploy only, do not launch Expo
```

---

## Repository structure

```
flood-up/
├── mobile/       # Expo React Native app (residents + drivers)
├── functions/    # Firebase Cloud Functions (trust pipeline, alerts, expiry)
└── docs/         # Architecture, data model, core flows
```

---

## License

MIT

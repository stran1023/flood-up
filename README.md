# Flood Up — Real-Time Urban Flood Intelligence for Southeast Asia

> "We turn Grab's driver network into Southeast Asia's first real-time urban flood sensor grid."

Built for the Grab Hackathon. Three user personas: **Resident**, **Grab Driver**, **City Authority**.

---

## The problem

Southeast Asian megacities — Ho Chi Minh City, Bangkok, Jakarta, Manila — sit on river deltas and low-lying coastal plains. They flood regularly, and climate change is making it worse. HCMC alone has over 1,000 flood-prone streets. When heavy rain hits, colonial-era drainage infrastructure gets overwhelmed in minutes.

The problem isn't just the flood. **It's that nobody knows where the water is in real time.**

When a street floods, information travels by word of mouth — a WhatsApp message, a Facebook post, a U-turn after driving into knee-deep water. There is no unified, real-time picture of where flooding is happening, how deep it is, or how fast it's spreading.

This creates three compounding failures:

**For residents** — they leave home with no warning, get stuck in flooded streets, miss work, or get stranded. The damage is often avoidable if they'd left 20 minutes earlier or taken a different route.

**For city authorities** — flood response teams are dispatched reactively. By the time they receive reports, map the situation, and mobilize, the peak has often passed or worsened.

**For logistics networks** — drivers are dispatched into routes that become impassable mid-journey. This wastes fuel, delays deliveries, and puts drivers at physical risk.

---

## The key insight: Grab drivers are already the sensor network

Grab operates over 10 million active drivers across Southeast Asia. On any given rainy afternoon in Ho Chi Minh City, thousands of Grab drivers are moving through every corner of the city — including streets that are flooding right now.

That makes them the most comprehensive real-time ground sensor network that already exists. **They just don't know they're one.**

This app creates the shared data layer that connects all three groups.

---

## How it works

### For residents
A live map shows flood conditions across the city before they leave home. Push notifications warn them if their usual commute route is underwater. They go from "discovered the problem at 7:45am stuck in knee-deep water" to "knew at 7:15am and took a different route."

### For Grab drivers
Right now, a driver dispatched to a pickup in a flooded street wastes 15–20 minutes, earns nothing, and risks their bike. With the app, they see flood zones before committing to a route. One tap to report a new flood while waiting at a light — contributing data that makes the whole network smarter, including for themselves.

### For city authorities
Instead of waiting for hotline calls, authorities get a live crowd-verified heatmap. Twelve reports in the same district within 10 minutes signals a drainage emergency — dispatch a crew now, before it escalates. Reactive crisis response becomes proactive infrastructure management.

---

## The value loop

More drivers reporting → higher map accuracy → more residents trusting and using the app → more resident reports → even more accurate map.

Every new user strengthens the product for everyone else. This is the network effect that makes it more than a feature demo — it's a platform argument.

---

## Key features

### Must-ship (hackathon MVP)
- One-tap flood reporting with GPS auto-fill and depth picker (ankle / knee / waist / chest)
- Live map with real-time colored pins via Firestore listener
- Trust pipeline: GPS plausibility + velocity check + weather correlation + photo verification
- Corroboration system: 3 independent nearby reports → confirmed status
- Severity fast-path: chest/waist-deep single reports trigger immediate preliminary alerts
- FCM push notifications to users within 2km of their home location
- Report auto-expiry after 6 hours
- Community upvote ("Still flooded") and downvote ("Looks clear") on every pin
- Disputed status when downvotes significantly outweigh upvotes

### Demo polish
- Optional photo with Claude Vision AI verification (YES / NO / UNCERTAIN badge)
- Open-Meteo weather correlation (flags reports submitted in dry conditions)
- Driver mode: persistent one-tap report button optimised for stationary tapping
- City authority web dashboard with heatmap, report table, and cluster alerts
- Historical flood zone GeoJSON overlay

---

## Trust and fake report prevention

Every report passes through a multi-layer verification pipeline before it can trigger alerts:

| Check | Method | Effect |
|---|---|---|
| GPS plausibility | Google Roads API snap-to-road | `-25` trust score if off-road |
| Velocity check | Haversine distance vs time since last report | Hard reject if physically impossible movement |
| Weather correlation | Open-Meteo API (free) | `-15` trust score if rainfall < 1mm |
| Corroboration | 3 independent reports within 500m / 30 min | Promotes to `confirmed` status |
| Photo verification | Claude Vision (`claude-sonnet-4-6`) | `-40` trust score if photo shows no flooding |

Reports start at trust score 60. Only confirmed reports (or high-severity preliminary alerts) trigger push notifications to nearby users.

---

## Tech stack

| Layer | Choice |
|---|---|
| Mobile app | React Native (Expo) |
| Backend | Firebase (Firestore, Auth, Cloud Functions, Storage) |
| Maps | Google Maps SDK or Mapbox |
| Push notifications | Expo Notifications + Firebase Cloud Messaging |
| AI image check | Anthropic Claude API (`claude-sonnet-4-6`) |
| Weather correlation | Open-Meteo API (free, no key required) |
| City dashboard | React + Vite |
| Geo queries | geofire-common (geohash radius queries) |

---

## Repository structure

```
flood-up/
├── mobile/          # Expo React Native app (residents + drivers)
├── functions/       # Firebase Cloud Functions (trust pipeline, notifications, expiry)
├── dashboard/       # City authority web dashboard (React + Vite)
├── CLAUDE.md        # Architecture reference + agent operating rules
├── feature_list.json
├── claude-progress.md
├── init.sh
└── README.md
```

---

## Getting started

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project with Firestore, Auth, Storage, and Functions enabled

### Setup

```bash
# Clone and initialise all packages
git clone <repo-url> flood-up
cd flood-up
./init.sh

# Configure environment variables
cp mobile/.env.example mobile/.env       # fill in Firebase + Maps API keys
cp functions/.env.example functions/.env # fill in ANTHROPIC_API_KEY, GOOGLE_ROADS_API_KEY

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Start the mobile app
cd mobile && npx expo start

# Start the dashboard (separate terminal)
cd dashboard && npx vite

# Emulate Cloud Functions locally (separate terminal)
cd functions && npm run serve
```

### Environment variables

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

**`functions/.env`**
```
ANTHROPIC_API_KEY=
GOOGLE_ROADS_API_KEY=
```

---

## Demo script (hackathon)

**Target metrics to hit on stage:**
- Time from flood event to first map pin: ~15 seconds
- Time from confirmed report to push notification: ~5 seconds

**Recommended demo flow:**
1. Open the app on two devices
2. Device A submits a chest-deep report → preliminary FCM alert fires on Device B within ~10s (severity fast-path)
3. Submit 2 more corroborating reports (can use Firestore console to seed) → status becomes `confirmed`
4. Show the city authority dashboard with the cluster appearing on the heatmap
5. Submit a report with a dry-road photo → Claude Vision returns NO → trust score drops, `photoVerified: false` badge appears

**Judges will ask:**
- *"How do you prevent fake reports?"* → GPS plausibility + velocity check + weather correlation + corroboration threshold + Claude Vision
- *"Why is this better than Facebook?"* → structured data, geolocation, proactive alerts, city dashboard, auto-expiry
- *"How does Grab benefit?"* → driver safety (avoid impassable routes), brand association with civic good, proprietary data asset for city partnerships

---

## Out of scope (hackathon)

- Payment / GrabPay integration
- Real-time navigation rerouting
- Multi-language support
- Offline mode

---

## License

MIT

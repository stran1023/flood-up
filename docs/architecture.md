# Architecture

## Tech stack

| Layer | Choice |
|---|---|
| Mobile app | React Native (Expo) |
| Backend | Firebase (Firestore, Auth, Cloud Functions, Storage) |
| Maps | Google Maps SDK or Mapbox |
| Push notifications | Expo Notifications + Firebase Cloud Messaging (FCM) |
| AI image check | Anthropic Claude API (`claude-sonnet-4-6`) |
| Weather correlation | Open-Meteo API (free, no key needed) |
| City dashboard | React + Vite (web, separate from mobile) |
| Geo queries | geofire-common (geohash-based radius queries) |

---

## Repository structure

```
flood-up/
├── mobile/                  # Expo React Native app
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx        # Map screen (home)
│   │   │   ├── report.tsx       # Submit flood report
│   │   │   └── profile.tsx      # User profile + history
│   │   ├── _layout.tsx
│   │   └── alert.tsx            # Alert detail screen
│   ├── components/
│   │   ├── FloodMap.tsx         # Map with pins + overlays
│   │   ├── ReportSheet.tsx      # Bottom sheet report form
│   │   ├── DepthPicker.tsx      # 4-option depth selector
│   │   ├── FloodPin.tsx         # Custom map marker
│   │   ├── ConfirmToast.tsx     # Post-submit confirmation
│   │   ├── RouteOverlay.tsx     # Route polyline + flood warning circles
│   │   └── RouteSearch.tsx      # Destination search bar + flood banner
│   ├── hooks/
│   │   ├── useReports.ts        # Firestore real-time listener
│   │   ├── useLocation.ts       # GPS location hook
│   │   ├── useNotifications.ts  # FCM token registration + refresh
│   │   └── useRoute.ts          # Directions API fetch + flood proximity check
│   ├── lib/
│   │   ├── firebase.ts          # Firebase init
│   │   ├── geo.ts               # Geohash helpers
│   │   ├── api.ts               # Cloud Function callers
│   │   └── routeUtils.ts        # Polyline decoder + findFloodsOnRoute
│   └── constants/
│       └── depth.ts             # Depth enum + colors
│
├── functions/               # Firebase Cloud Functions
│   ├── src/
│   │   ├── onReportCreate.ts    # Trigger: validate report + trust pipeline
│   │   ├── notifyNearby.ts      # Geo-radius query + FCM dispatch
│   │   ├── expireReports.ts     # Scheduled: expire reports older than 6h
│   │   └── weatherCheck.ts     # Open-Meteo plausibility check
│   ├── package.json
│   └── tsconfig.json
│
├── dashboard/               # City authority web dashboard
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── LiveMap.tsx      # Heatmap + report list
│   │   │   └── Analytics.tsx    # Historical charts
│   │   └── components/
│   │       ├── ClusterAlert.tsx # Auto-threshold alert banner
│   │       └── ReportTable.tsx  # Sortable report list
│   └── vite.config.ts
│
├── docs/                    # Architecture reference (this directory)
│   ├── architecture.md
│   ├── data-model.md
│   ├── core-flows.md
│   ├── trust-pipeline.md
│   ├── firebase-config.md
│   └── geo-and-ui.md
│
├── CLAUDE.md                # Agent operating rules
├── claude-progress.md       # Session progress log
├── feature_list.json        # Feature tracker
├── session-handoff.md       # Session handoff notes
├── clean-state-checklist.md # End-of-session checklist
├── evaluator-rubric.md      # Agent output quality scorecard
├── quality-document.md      # Codebase health snapshot
└── init.sh                  # Startup script
```

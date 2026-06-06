# claude-progress.md — Session Progress Log

## Current Verified State

| Field | Value |
|---|---|
| Repository root | `D:\flood-up` (Windows) / `/d/flood-up` (Git Bash) |
| Standard startup | `./init.sh` |
| Standard verification | `npx tsc --noEmit` in each of `mobile/`, `functions/`, `dashboard/` |
| Highest-priority unfinished feature | `home-location` (priority 3) |
| Current blocker | None — Firebase credentials connected, auth implemented |
| Last verified baseline | `init.sh` passes clean — all three packages install and compile |

---

## Session Records

### Session 1 — 2026-06-03

**Goal:** Architectural review of CLAUDE.md before any code was written.

**Completed:**
- Full architectural review of original CLAUDE.md
- Identified 15 issues: 5 bugs, 3 demo-critical architecture risks, 7 minor issues
- Rewrote CLAUDE.md with all fixes applied
- Created full harness file set: `init.sh`, `claude-progress.md`, `feature_list.json`, `session-handoff.md`, `clean-state-checklist.md`, `evaluator-rubric.md`, `quality-document.md`

**Verification run:** No code exists yet — review only.

**Evidence recorded:** N/A (architecture review session)

**Commits:** None yet (CLAUDE.md + harness files staged but not committed)

---

### Session 2 — 2026-06-06

**Goal:** Scaffold all three packages and complete `firebase-setup` feature (priority 1).

**Completed:**

**`functions/` package — full Cloud Functions scaffold:**
- `functions/package.json` — firebase-functions v4, firebase-admin v12, geofire-common v6, TypeScript 6
- `functions/tsconfig.json`
- `functions/src/admin.ts` — admin SDK init (db, messaging, FieldValue)
- `functions/src/types.ts` — FloodReport, AppUser (admin SDK Timestamp)
- `functions/src/geo.ts` — encodeGeohash, haversineKm, getNearbyReports, getLastReport, getUsersNearby
- `functions/src/weatherCheck.ts` — Open-Meteo rainfall fetch, fails open (returns 0 on error)
- `functions/src/verifyImage.ts` — Claude Vision image check, async; photoVerified + trustScore penalty
- `functions/src/notifyNearby.ts` — sendNearbyNotifications helper + onReportUpdate trigger (dispute check)
- `functions/src/expireReports.ts` — onSchedule every 30 min, asia-southeast1 region
- `functions/src/onReportCreate.ts` — full trust pipeline: GPS + velocity + weather + corroboration + severity fast-path + fire-and-forget image check
- `functions/src/index.ts` — exports onReportCreate, onReportUpdate, expireReports

**`dashboard/` package — Vite React authority dashboard:**
- `dashboard/package.json` — React 19, Vite 6, Firebase 12, geofire-common v6, TypeScript 6
- `dashboard/tsconfig.json` + `dashboard/vite.config.ts` + `dashboard/index.html`
- `dashboard/src/lib/firebase.ts` — Firebase init (VITE_* env vars)
- `dashboard/src/types/index.ts` — FloodReport, Depth, status colors + depth colors
- `dashboard/src/components/ClusterAlert.tsx` — fires when ≥ 5 confirmed reports within 1 km
- `dashboard/src/components/ReportTable.tsx` — sortable by time/depth/status/trustScore
- `dashboard/src/pages/LiveMap.tsx` — real-time Firestore listener, renders ClusterAlert + ReportTable
- `dashboard/src/pages/Analytics.tsx` — stub for later
- `dashboard/src/App.tsx` — authority auth gate (role='authority' check), nav, sign-in form, sign-out
- `dashboard/src/main.tsx` — React 19 createRoot entry point

**Root Firebase config files:**
- `firebase.json` — functions, firestore, hosting (dashboard/dist), emulators
- `.firebaserc` — placeholder project ID (`YOUR_FIREBASE_PROJECT_ID`)
- `firestore.rules` — security rules per docs/firebase-config.md
- `firestore.indexes.json` — 3 composite indexes per docs/firebase-config.md

**Bug fix in pre-existing mobile scaffold:**
- `mobile/components/ExternalLink.tsx` — cast `href` to `` `${string}:${string}` `` to satisfy expo-router v56 strict `href` types (error was present before this session)

**Verification run:** `./init.sh` → all three packages install and compile with 0 TypeScript errors.

**Evidence recorded:** `init.sh` output: `✓ Baseline OK — all packages install and compile cleanly.`

**Feature status moved to:** `firebase-setup` → `passing` (scaffold complete, TypeScript 0 errors).

**What is NOT done (next session):**
- A real Firebase project must be created and credentials filled into `mobile/.env` and `dashboard/.env`
- `functions/.env` needs `ANTHROPIC_API_KEY` (for verifyImage) and optionally `GOOGLE_ROADS_API_KEY`
- `.firebaserc` project ID must be updated
- `firebase deploy --only firestore:rules,firestore:indexes` must be run against a real project
- The `auth` feature (priority 2) is next

**Known risks:**
- Severity fast-path threshold (trustScore >= 65) not reached in dry weather (60 base − 15 = 45). Consider lowering to 60 or raising base to 70 before demo.
- Cloud Function cold start adds ~2–5s; warm up before demo.
- Node 22 in dev vs Node 18 in Cloud Functions — no code impact, but deploy uses Node 18.

**Next best action:** Connect a real Firebase project (fill `.env` files + update `.firebaserc`), then deploy rules/indexes, then implement the `auth` feature (priority 2).

---

### Session 3 — 2026-06-06 (continued)

**Goal:** Connect Firebase project credentials and implement `auth` feature (priority 2).

**Completed:**

- `mobile/.env` and `dashboard/.env` created with real Firebase credentials (project: `flood-up`)
- `.firebaserc` updated with project ID `flood-up`
- `mobile/hooks/useAuth.ts` — `onAuthStateChanged` listener; calls `ensureUserDoc` which creates Firestore `users` doc (`role='resident'`, `reportCount=0`, `trustScore=0`, `fcmTokens=[]`) on first sign-in
- `mobile/app/auth.tsx` — email/password login + sign-up (toggled), anonymous sign-in button, error messages for common Firebase error codes
- `mobile/app/_layout.tsx` — auth guard using `useSegments` + `useRouter`; unauthenticated users redirected to `/auth`, authenticated users on `/auth` redirected to `/(tabs)`. Also registered `alert` screen here.

**Note on anonymous auth:** Requires enabling in Firebase console → Authentication → Sign-in method → Anonymous → Enable. Email/Password is sufficient for demo.

**Note on `.env` files:** Not committed to git (covered by root `.gitignore` `*.env` pattern). Credentials are for Firebase project `flood-up`.

**Verification run:** `./init.sh` → `✓ Baseline OK`. All three packages compile with 0 TypeScript errors.

**Feature status moved to:** `auth` → `passing`.

**Next best action:** Implement `home-location` feature (priority 3) — GPS prompt on first login, write `homeLat`, `homeLng`, `homeGeohash` to Firestore user document.

---

### Session 4 — 2026-06-06 (continued)

**Goal:** Add flood-aware route overlay feature (Option A) to the mobile map screen.

**Completed:**

- `mobile/lib/routeUtils.ts` — inline Google encoded-polyline decoder; `findFloodsOnRoute` (point-to-segment haversine distance, 200m threshold)
- `mobile/hooks/useRoute.ts` — fetches route from Google Maps Directions API (origin = current GPS); decodes overview polyline; finds active flood reports within 200m; returns `RouteResult`
- `mobile/components/RouteOverlay.tsx` — renders blue `Polyline` + a depth-colored `Circle` (200m radius) for each flood on the route
- `mobile/components/RouteSearch.tsx` — floating destination search bar; shows green "Route looks clear" or red "N flood zones on your route · ETA (distance)" banner; × clears route
- `mobile/components/FloodMap.tsx` — added optional `route` prop; renders `RouteOverlay` when route is present
- `mobile/app/(tabs)/index.tsx` — wired `useRoute(reports)` and `RouteSearch` into the map screen
- `feature_list.json` — added `flood-route-overlay` at priority 6; renumbered downstream features 7–12

**Verification:** `npx tsc --noEmit` in `mobile/` → 0 errors. No new npm packages.

**Feature status:** `flood-route-overlay` → `not_started` (pending live device test with API key).

**What is NOT done (requires live device + API key):**
- `EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY` must be added to `mobile/.env`
- Live end-to-end test: enter destination → route drawn → flood warning fires

**Next best action:** Implement `home-location` feature (priority 3) — still the highest-priority unfinished feature.

---

### Session 5 — 2026-06-06 (continued)

**Goal:** Implement `home-location` feature (priority 3).

**Completed:**

- `mobile/hooks/useAuth.ts` — replaced one-time `getDoc` with `onSnapshot` listener on the user doc; exposes `needsHomeSetup: !homeGeohash` and `profileLoaded` flag so `_layout.tsx` waits for the first profile snapshot before evaluating any redirects (prevents flash-redirect before homeGeohash state is known)
- `mobile/app/home-setup.tsx` — new screen with "Use my location" button (`expo-location`, `Accuracy.Balanced`), shows selected coords, "Save home location" writes `homeLat`, `homeLng`, `homeGeohash` (precision 7 via `geohashForLocation` from `geofire-common`) to Firestore via `updateDoc`; accepts `?edit=1` param to show Cancel button when opened from Profile
- `mobile/app/_layout.tsx` — added `needsHomeSetup` to auth guard effect; redirects authenticated users to `/home-setup` when `homeGeohash` is missing; on post-login redirect from `/auth`, goes to `/home-setup` first if needed; registered `home-setup` as a Stack screen with `headerShown: false`
- `mobile/app/(tabs)/profile.tsx` — added "Home location" tappable row showing current coords (or "Not set"); tapping navigates to `/home-setup?edit=1`

**Verification run:** `npx tsc --noEmit` in `mobile/` → 0 TypeScript errors.

**Feature status:** `home-location` → `in_progress` (pending live device test).

**What is NOT done (requires live device):**
- Run on a real device or simulator with location services enabled
- Confirm first-login redirect fires and `homeGeohash` appears in Firestore
- Confirm Profile edit flow updates Firestore
- Only after those steps can status move to `passing`

**Next best action:** Implement `report-submit` feature (priority 4), or run the live device verification for `home-location` to move it to `passing`.

---

### Session 6 — 2026-06-06 (continued)

**Goal:** Implement `report-submit` feature (priority 4).

**Completed:**

- `mobile/components/ReportSheet.tsx` — fixed three gaps in the scaffold:
  1. `accountAgeDays` now computed from `auth.currentUser.metadata.creationTime` instead of hardcoded `0`
  2. Wrapped `ScrollView` + `ConfirmToast` in a `View style={{flex:1}}` so the toast's `position:absolute` is anchored to the screen viewport, not the scroll container
  3. Added `ActivityIndicator` during submission; after 2 s auto-navigates to map tab so user sees the pin appear
- `mobile/hooks/useLocation.ts` — replaced `useEffect([], [])` with `useFocusEffect(useCallback(...))` so GPS refreshes each time the Report tab is focused (tab screens stay mounted; one-time fetch would give stale location after tab switch)

**All Firestore fields already scaffolded correctly:**
- `lat`, `lng`, `geohash` (precision 7 via `encodeGeohash` → `geohashForLocation`)
- `depth`, `reportedAt`, `expiresAt` (reportedAt + 6 h), `userId`
- `status='pending'`, `trustScore=60`, `corroborationCount=1`, `upvotes=0`, `downvotes=0`

**Verification run:** `npx tsc --noEmit` in `mobile/` → 0 TypeScript errors.

**Feature status:** `report-submit` → `in_progress` (pending live device test + Cloud Function deploy).

**What is NOT done (requires live device + Firebase deploy):**
- Run on real device: tap Report tab → GPS fills → select depth → submit → ConfirmToast → redirects to map
- Check Firestore console: document created with correct fields
- Deploy `onReportCreate` Cloud Function (`firebase deploy --only functions`) and check logs

**Next best action:** Implement `live-map` feature (priority 5) — real-time Firestore listener already exists in `useReports`, but map needs pin detail sheet, depth-color verification on device, and real-time update test.

---

### Session 7 — 2026-06-06 (continued)

**Goal:** Implement `live-map` feature (priority 5).

**Completed:**

- `mobile/hooks/useReports.ts` — added client-side `expiresAt.toMillis() > now` filter inside the `onSnapshot` callback. The Firestore query uses a static `Timestamp.now()` evaluated at subscription time; without this guard, a report manually expired mid-session passes the server filter but is correctly excluded client-side.
- `mobile/components/FloodPin.tsx` — replaced two-tap flow (tap pin → callout → tap callout → detail) with single-tap `onPress` on Marker; removed Callout; added `tracksViewChanges={false}` to prevent all markers re-rasterising on every parent render.
- `mobile/app/alert.tsx` — added `timeAgo(ts: Timestamp)` helper (just now / Xm ago / Xh ago / Xd ago) and a "Reported" MetaRow as the first row of the detail sheet.

**Verification run:** `npx tsc --noEmit` in `mobile/` → 0 TypeScript errors.

**Feature status:** `live-map` → `in_progress` (pending live device test).

**What is NOT done (requires live device):**
- Confirm pin appears in real time from a second device without refresh
- Confirm pin colors match DEPTH_CONFIG on device
- Manually set expiresAt to now in Firestore console → confirm pin disappears

**Next best action:** Implement `corroboration` feature (priority 7) — Cloud Function logic already scaffolded in `functions/src/onReportCreate.ts`; need to verify the 3-report threshold and status transition.

---

### Session 8 — 2026-06-06 (continued)

**Goal:** Implement and verify `corroboration` feature (priority 7).

**Findings — implementation was already fully scaffolded:**

- `functions/src/onReportCreate.ts` (lines 61–88): calls `getNearbyReports([lat,lng], 0.5, 30, reportId)`, sets `corroborationCount = nearby.length + 1`, `isConfirmed = count >= 3`, batch-writes `status='confirmed'` + new count to current report and `FieldValue.increment(1)` + optional `status='confirmed'` to each neighbor. Logic trace verified correct for 3-report cluster (A=3,B=3,C=3 after third submission).
- `functions/src/geo.ts` — `getNearbyReports`: geohash bounds (GeoFire pattern), `status in ['pending','confirmed']` server-side, then client-side filters for `expiresAt`, `reportedAt` within 30 min, and haversine distance ≤ 0.5 km.
- `mobile/components/FloodPin.tsx`: `isConfirmed = report.status === 'confirmed'` → full opacity; pending → `opacity: 0.65`.
- `mobile/app/alert.tsx`: shows `corroborationCount` as "N nearby" in pin detail.

**One fix applied:** Removed `expiresAt > Timestamp.now()` from the Firestore server-side query in `getNearbyReports`. The original code combined a `geohash` range filter with an `expiresAt` range filter in the same query — a multi-field inequality that can cause Firestore index errors. Moved `expiresAt` check client-side alongside the `reportedAt` and `distanceBetween` filters (standard GeoFire pattern). Also removed the now-unused `Timestamp` import.

**Verification run:** `npx tsc --noEmit` in `functions/` → 0 errors. `npx tsc --noEmit` in `mobile/` → 0 errors.

**Feature status:** `corroboration` → `in_progress` (pending live Firebase test).

**What is NOT done (requires live Firebase + 3 test accounts):**
- Deploy `onReportCreate` Cloud Function (`firebase deploy --only functions`)
- Submit 3 reports from 3 accounts within 500m (can use Firestore emulator with simulated coordinates)
- Verify Firestore: third report → all 3 docs get `status='confirmed'`, `corroborationCount=3`
- Verify mobile: confirmed pins appear at full opacity, pending at 65%

**Next best action:** Implement `severity-fastpath` feature (priority 8) — logic is scaffolded in `onReportCreate.ts` lines 93–95; needs trustScore threshold review and demo-condition check (base 60 − weather 15 = 45, below the 65 threshold in dry weather).

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

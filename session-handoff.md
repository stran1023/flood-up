# session-handoff.md — Session Handoff Notes

_Updated: 2026-06-06 (Session 19)_

---

## Currently verified

| Item | Status | Verification run |
|---|---|---|
| TypeScript compiles (mobile/) | ✓ 0 errors | Session 19 |
| TypeScript compiles (functions/) | ✓ 0 errors | Session 18 |
| `./init.sh` baseline | ✓ passes | Session 19 |
| Firebase project connected | ✓ credentials in mobile/.env | Session 3 |

**Last passing baseline:** `./init.sh` → `✓ Baseline OK — all packages install and compile cleanly.`

---

## Implementation status

All features implemented (see `feature_list.json` for full details):

| Feature | Status | Blocker |
|---|---|---|
| firebase-setup | passing | — |
| auth | passing | — |
| home-location | in_progress | live device test |
| report-submit | in_progress | live device + CF deploy |
| live-map | in_progress | live device test |
| flood-route-overlay | in_progress | live device + API key |
| corroboration | in_progress | live Firebase + 3-report test |
| severity-fastpath | in_progress | live deploy + EAS projectId |
| push-notifications | in_progress | live 3-report + 2-device test |
| auto-expiry | in_progress | `firebase deploy --only functions` |
| upvote-downvote | in_progress | live 2-device test |
| disputed-status | in_progress | live deploy + Firestore console test |
| photo-upload | in_progress | `firebase deploy --only storage` + live device |
| claude-vision | in_progress | `ANTHROPIC_API_KEY` in functions/.env + deploy |
| weather-check | in_progress | live device + CF deploy |
| geojson-overlay | in_progress | live device test |
| driver-mode | in_progress | role='driver' in Firestore + live device |

No `not_started` features remain. All blockers require live deployment or a physical device.

---

## What still needs doing before demo

**One-time setup (human steps):**

1. **EAS project ID** — run `cd mobile && eas init` and replace `REPLACE_WITH_EAS_PROJECT_ID` in `mobile/app.json` with the real ID. Required for push notifications.
2. **Firebase deploy** — run:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   firebase deploy --only functions
   firebase deploy --only storage
   ```
3. **`functions/.env`** — add `ANTHROPIC_API_KEY=sk-ant-...` for Claude Vision.
4. **GCP Console** — enable "Directions API" and "Roads API" for the Maps API key.
5. **Firebase Console** — enable Anonymous auth (Auth → Sign-in method → Anonymous → Enable).
6. **Firestore Console** — set `users/{driverUid} → role: 'driver'` for the demo driver account.

**Demo shortcut for auto-expiry:** Firebase Console → Functions → expireReports → Actions → Trigger (no need to wait 30 min).

---

## Still broken or unverified

- No live device test has been run — all `in_progress` features need on-device confirmation.
- Severity fast-path trustScore threshold (base 70, threshold 65): on-road + rainy = 70 ✓ fires; on-road + dry = 55, no fast-path (intended).
- `EAS projectId` is a placeholder in `app.json` (`REPLACE_WITH_EAS_PROJECT_ID`) — must be replaced before push notifications work.
- `functions/.env` must have `ANTHROPIC_API_KEY` before deploying (Claude Vision will silently fail without it — report is still created, `photoVerified` stays undefined).

---

## Next best action

Run the one-time setup steps above, deploy Firebase, and verify each feature on a real device. Start with `report-submit` (priority 4) as it exercises the core Firestore path that most other features depend on.

---

## Key commands

```bash
# Baseline check
./init.sh

# TypeScript verify
cd mobile && ./node_modules/.bin/tsc --noEmit
cd functions && ./node_modules/.bin/tsc --noEmit

# Dev server (Expo)
cd mobile && npx expo start

# Firebase deploy (all at once)
firebase deploy --only firestore:rules,firestore:indexes,functions,storage

# EAS build (after eas init)
cd mobile && eas build --profile development --platform android
```

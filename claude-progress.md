# claude-progress.md — Session Progress Log

## Current Verified State

| Field | Value |
|---|---|
| Repository root | `D:\flood-up` (Windows) / `/d/flood-up` (Git Bash) |
| Standard startup | `./init.sh` |
| Standard verification | `npx tsc --noEmit` in each of `mobile/`, `functions/`, `dashboard/` |
| Highest-priority unfinished feature | `firebase-setup` (priority 1) |
| Current blocker | None — project not yet scaffolded |
| Last verified baseline | No code written yet |

---

## Session Records

### Session 1 — 2026-06-03

**Goal:** Architectural review of CLAUDE.md before any code was written. Identify bugs, inconsistencies, and demo-critical risks.

**Completed:**
- Full architectural review of original CLAUDE.md
- Identified 15 issues: 5 bugs, 3 demo-critical architecture risks, 7 minor issues
- Rewrote CLAUDE.md with all fixes applied
- Created full harness file set: `init.sh`, `claude-progress.md`, `feature_list.json`, `session-handoff.md`, `clean-state-checklist.md`, `evaluator-rubric.md`, `quality-document.md`

**Key fixes applied to CLAUDE.md:**
- Renamed duplicate `onReportCreate.ts` → `notifyNearby.ts`
- Fixed corroboration count inconsistency (now self-inclusive, threshold >= 3)
- Added trust score base value (60)
- Parallelized trust pipeline API calls with `Promise.all`
- Downgraded GPS hard-reject to soft penalty (-25)
- Reduced weather penalty from -30 to -15
- Added severity fast-path for waist/chest single reports
- Added `photoVerified: null` error state and `-40` penalty for NO answer
- Updated Claude model to `claude-sonnet-4-6`
- Added Firestore index for `users.homeGeohash`
- Changed `fcmToken: string` → `fcmTokens: string[]`
- Added home location setup to must-ship MVP checklist
- Added disputed status trigger logic
- Added city authority auth rule to Firestore security rules

**Verification run:** No code exists yet — review only.

**Evidence recorded:** N/A (architecture review session)

**Commits:** None yet (CLAUDE.md + harness files staged but not committed)

**Known risks:**
- Severity fast-path threshold (trustScore >= 65) may not be reached in dry-weather demo conditions; base score is 60, so only one check needs to be penalty-free. May need threshold lowered to 60 or base raised.
- Cloud Function cold start adds ~2–5s on top of the parallelized pipeline. Should warm up functions before demo.

**Next best action:** Scaffold all three packages (`mobile/`, `functions/`, `dashboard/`) and complete the `firebase-setup` feature (priority 1).

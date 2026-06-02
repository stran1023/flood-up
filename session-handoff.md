# session-handoff.md — Session Handoff Notes

_Fill this out at the end of every session. The next session reads this before doing anything._

---

## Currently verified

| Item | Status | Verification run |
|---|---|---|
| TypeScript compiles (mobile/) | Not applicable — not scaffolded yet | — |
| TypeScript compiles (functions/) | Not applicable — not scaffolded yet | — |
| TypeScript compiles (dashboard/) | Not applicable — not scaffolded yet | — |
| Firebase project connected | Not started | — |

**Last passing baseline:** No code exists yet.

---

## Changes this session (2026-06-03)

- Completed architectural review of CLAUDE.md
- Rewrote CLAUDE.md with 15 bug fixes and architecture improvements (see `claude-progress.md` for full list)
- Created harness file set: `init.sh`, `claude-progress.md`, `feature_list.json`, `session-handoff.md`, `clean-state-checklist.md`, `evaluator-rubric.md`, `quality-document.md`
- No code written — pre-implementation architecture phase only

---

## Still broken or unverified

- Everything — no implementation files exist yet
- Severity fast-path threshold (trustScore >= 65) may be unreachable in dry-weather demo without adjustment

---

## Next best action

1. Run `firebase login` and `firebase projects:create flood-up-[id]`
2. Scaffold mobile: `npx create-expo-app mobile --template blank-typescript`
3. Scaffold functions: `firebase init functions` (TypeScript)
4. Scaffold dashboard: `npm create vite@latest dashboard -- --template react-ts`
5. Deploy Firestore indexes and security rules from CLAUDE.md
6. Mark `firebase-setup` as `passing` in `feature_list.json` once verified

**Do not touch:** Nothing is implemented yet — start from `firebase-setup` (priority 1).

---

## Commands

```bash
# Startup
./init.sh

# Verification
cd mobile && npx tsc --noEmit
cd functions && npx tsc --noEmit
cd dashboard && npx tsc --noEmit

# Dev servers
cd mobile && npx expo start
cd dashboard && npx vite
cd functions && npm run serve

# Firebase deploy
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only functions
```

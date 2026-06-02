# clean-state-checklist.md — End-of-Session Checklist

Run through this before ending every session. All items must pass before closing.

---

## Baseline integrity

- [ ] `./init.sh` runs to completion with no errors
- [ ] `cd mobile && npx tsc --noEmit` exits 0
- [ ] `cd functions && npx tsc --noEmit` exits 0
- [ ] `cd dashboard && npx tsc --noEmit` exits 0
- [ ] No unresolved merge conflicts in any file
- [ ] No `console.error` outputs during `init.sh` run

## Feature state accuracy

- [ ] `feature_list.json` — no feature marked `passing` without recorded evidence
- [ ] `feature_list.json` — at most one feature marked `in_progress`
- [ ] `feature_list.json` — every `blocked` feature has a note explaining the blocker
- [ ] Features completed this session have evidence filled in (not empty string)

## Progress log

- [ ] `claude-progress.md` — "Current Verified State" table is up to date
- [ ] `claude-progress.md` — a new session record has been added for this session
- [ ] `claude-progress.md` — "Highest-priority unfinished feature" reflects current state
- [ ] `claude-progress.md` — "Next best action" is specific enough for a cold-start session to act on

## Handoff

- [ ] `session-handoff.md` — "Currently verified" table updated
- [ ] `session-handoff.md` — "Changes this session" filled in
- [ ] `session-handoff.md` — "Still broken or unverified" is accurate
- [ ] `session-handoff.md` — "Next best action" steps are numbered and actionable

## Repository state

- [ ] All intended changes are committed (no unintended staged files)
- [ ] No `.env` files or API keys accidentally staged
- [ ] No half-finished files left uncommitted (partially implemented functions, empty stubs)
- [ ] Commit message clearly describes what feature was completed

## Verification evidence

- [ ] Any feature marked `passing` this session has a concrete evidence entry in `feature_list.json`
- [ ] Evidence is specific: includes what was observed, not just "it worked"
- [ ] No feature was verified only by "TypeScript compiles" — functional behaviour must be confirmed

---

_If any item fails, fix it before the session ends. A clean handoff is more valuable than one extra line of code._

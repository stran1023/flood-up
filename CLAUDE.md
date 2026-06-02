# Flood Up

Crowdsourced real-time urban flood reporting for Southeast Asian cities.
Repo root: `D:\flood-up` — three packages: `mobile/`, `functions/`, `dashboard/`.

You are working in a repository designed for long-running implementation work. Prioritize reliable completion, continuity across sessions, and explicit verification over speed.

---

## Operating Loop

At the start of every session:

1. Run `pwd` and confirm you are in the expected repository root.
2. Read `claude-progress.md`.
3. Read `feature_list.json`.
4. Review recent commits with `git log --oneline -5`.
5. Run `./init.sh`.
6. Check whether the baseline compile or end-to-end path is already broken.

Then select exactly one unfinished feature and work only on that feature until you either verify it or document why it is blocked.

---

## Rules

- One active feature at a time.
- Do not claim completion without runnable evidence.
- Do not rewrite the feature list to hide unfinished work.
- Do not remove or weaken tests just to make the task look complete.
- Use repository artifacts as the system of record.
- Do not refactor code outside the current feature's scope.

---

## Required Files

- `feature_list.json` — feature tracker with verification steps and evidence
- `claude-progress.md` — session log and current verified state
- `init.sh` — dependency install and baseline verification
- `session-handoff.md` — compact handoff when ending a session mid-feature

---

## Completion Gate

A feature can move to `passing` only after the required verification steps succeed and the result is recorded in `feature_list.json`.

---

## Before You Stop

- Update `claude-progress.md`.
- Update the feature state in `feature_list.json`.
- Record what is still broken or unverified.
- Commit once the repository is safe to resume.
- Leave a clean restart path for the next session.

---

## Architecture reference

All technical detail lives in `docs/`. Read the relevant file before implementing a feature.

| File | Contents |
|---|---|
| `docs/architecture.md` | Tech stack, repository structure |
| `docs/data-model.md` | Firestore `reports` + `users` schemas, status transitions |
| `docs/core-flows.md` | Submit report, receive alert, driver report, auto-expiry |
| `docs/trust-pipeline.md` | Verification logic in `onReportCreate`, Claude Vision image check |
| `docs/firebase-config.md` | Firestore indexes, security rules, environment variables |
| `docs/geo-and-ui.md` | Geohash query pattern, depth color system |

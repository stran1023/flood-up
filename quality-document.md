# quality-document.md — Codebase Health Snapshot

Grades each product domain and architectural layer. Updated after significant sessions to track whether the codebase is getting stronger or weaker over time.

**Grading scale:** A (solid) → B (minor gaps) → C (known issues) → D (broken or unverified)

**Evaluator rubric scores individual sessions. This document scores the codebase itself.**

---

## Snapshot: 2026-06-03

_Pre-implementation. No code written yet. Architecture reviewed and corrected._

---

## Product domains

### Reporting flow (submit + trust pipeline)

| Criterion | Grade | Notes |
|---|---|---|
| Verification status | D | Not implemented |
| Agent legibility | B | Trust pipeline well-documented in CLAUDE.md; parallelization pattern clear |
| Test stability | D | No tests |
| Key gaps | — | `onReportCreate.ts` + `notifyNearby.ts` not written; severity fast-path threshold needs demo validation |

**Overall: D** (not started)

---

### Live map

| Criterion | Grade | Notes |
|---|---|---|
| Verification status | D | Not implemented |
| Agent legibility | B | `useReports` hook + `FloodPin` pattern clear; DEPTH_CONFIG defined |
| Test stability | D | No tests |
| Key gaps | — | `FloodMap.tsx`, `FloodPin.tsx`, `useReports.ts` not written |

**Overall: D** (not started)

---

### Push notifications

| Criterion | Grade | Notes |
|---|---|---|
| Verification status | D | Not implemented |
| Agent legibility | B | FCM token array design documented; homeGeohash query pattern clear |
| Test stability | D | No tests |
| Key gaps | — | `useNotifications.ts` token refresh not yet implemented; FCM stale token cleanup not yet implemented |

**Overall: D** (not started)

---

### Claude Vision image verification

| Criterion | Grade | Notes |
|---|---|---|
| Verification status | D | Not implemented |
| Agent legibility | A | `verifyImage.ts` pattern fully specified in CLAUDE.md including error handling and trust penalty |
| Test stability | D | No tests |
| Key gaps | — | Depends on photo-upload feature (priority 20) |

**Overall: D** (not started, but well-specified)

---

### City authority dashboard

| Criterion | Grade | Notes |
|---|---|---|
| Verification status | D | Not implemented |
| Agent legibility | C | Dashboard structure exists in repo tree; auth mechanism documented but not detailed |
| Test stability | D | No tests |
| Key gaps | — | Auth enforcement needs implementation; heatmap library not chosen |

**Overall: D** (not started)

---

## Architectural layers

### Mobile app (`mobile/`)

| Criterion | Grade | Notes |
|---|---|---|
| Boundary enforcement | B | Tab structure clear; hooks/lib/components separation well-defined |
| Agent legibility | B | File responsibilities documented in CLAUDE.md repo structure |

**Overall: B** (well-designed, not implemented)

---

### Cloud Functions (`functions/`)

| Criterion | Grade | Notes |
|---|---|---|
| Boundary enforcement | A | Each function has a single responsibility; trust pipeline is self-contained |
| Agent legibility | A | All functions documented with pseudocode or full implementation patterns |

**Overall: A** (well-designed, not implemented)

---

### Firestore data layer

| Criterion | Grade | Notes |
|---|---|---|
| Boundary enforcement | A | Security rules, indexes, and data model all defined and reviewed |
| Agent legibility | A | Data model TypeScript interfaces complete; all status transitions documented |

**Overall: A** (fully specified)

---

### Dashboard (`dashboard/`)

| Criterion | Grade | Notes |
|---|---|---|
| Boundary enforcement | C | Auth boundary between dashboard and mobile Firestore not fully specified |
| Agent legibility | C | Component responsibilities listed but no data flow documented |

**Overall: C** (needs more specification before implementation)

---

## Harness health

| Component | Status | Notes |
|---|---|---|
| `CLAUDE.md` | Current | Reviewed and corrected 2026-06-03 |
| `init.sh` | Stub | Written; will fail until packages are scaffolded |
| `claude-progress.md` | Current | Session 1 recorded |
| `feature_list.json` | Current | All 17 features defined with verification steps |
| `session-handoff.md` | Current | Filled for session 1 |
| `clean-state-checklist.md` | Current | Ready to use |
| `evaluator-rubric.md` | Current | Baseline version — needs tuning after first real implementation session |
| `quality-document.md` | Current | This file |

---

## Update history

| Date | What changed | Grade impact |
|---|---|---|
| 2026-06-03 | Initial snapshot — architecture review complete, no code | Baseline |

---

_To check whether a harness component is still needed: take a snapshot, remove the component, run a benchmark task, take another snapshot, compare. If grades didn't drop, the component was overhead._

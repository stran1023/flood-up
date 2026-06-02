# evaluator-rubric.md — Agent Output Quality Scorecard

Use this after a session or at project milestones to score agent output quality. Each dimension is scored 0–2. Maximum total: 12.

**Important:** Agents are poor self-judges — they identify issues then talk themselves into approving. Tune the rubric by comparing agent scores against human review scores. Plan for 3–5 tuning rounds.

---

## Scoring guide

| Score | Meaning |
|---|---|
| 2 | Fully meets the criterion — no gaps |
| 1 | Partially meets it — issues present but not blocking |
| 0 | Does not meet it — must be addressed before accepting |

---

## Dimension 1: Correctness

_Does the implementation match the target feature's `user_visible_behavior` in `feature_list.json`?_

**Score: ___**

Pass criteria:
- Every bullet in `user_visible_behavior` is demonstrable
- No obvious wrong behaviour in the happy path
- Edge cases specified in `notes` are handled

Fail signals:
- Feature "works" only in the exact scenario written during development
- Untested code paths that crash on first use
- Data written to Firestore with wrong field names or types

---

## Dimension 2: Verification

_Were the required verification steps actually run, with recorded evidence?_

**Score: ___**

Pass criteria:
- All steps in the feature's `verification` list were executed
- Evidence field in `feature_list.json` is non-empty and specific
- Evidence describes what was observed, not just "passed"

Fail signals:
- Evidence field is empty or contains only "it worked"
- Verification steps skipped because "TypeScript compiles"
- Feature marked `passing` before verification was run

---

## Dimension 3: Scope discipline

_Did the agent stay within the selected feature's boundaries?_

**Score: ___**

Pass criteria:
- Only files relevant to the current feature were modified
- No refactoring of adjacent code
- No features from the `not_started` list were partially implemented

Fail signals:
- Unrelated files modified without explanation
- Feature list has two items `in_progress` simultaneously
- Code written for a feature not yet prioritised

---

## Dimension 4: Reliability

_Does the result survive a restart, re-run, or fresh install?_

**Score: ___**

Pass criteria:
- `./init.sh` runs cleanly after the session's changes
- Feature still works after killing and restarting the dev server
- No hardcoded paths or environment-specific values left in code

Fail signals:
- Feature only works in the exact shell session it was built in
- Depends on manual state (e.g. a Firestore document that must exist)
- `init.sh` fails after session changes

---

## Dimension 5: Maintainability

_Is the code and documentation clear enough for the next session to continue?_

**Score: ___**

Pass criteria:
- Code follows the patterns in CLAUDE.md (geohash queries, trust pipeline structure, DEPTH_CONFIG usage)
- Non-obvious logic has a short inline comment explaining WHY (not WHAT)
- `session-handoff.md` gives a cold-start session enough context to proceed

Fail signals:
- Unexplained magic numbers or undocumented edge-case handling
- `session-handoff.md` "Next best action" is vague ("continue implementing")
- New file added without being referenced in CLAUDE.md repo structure

---

## Dimension 6: Handoff readiness

_Can a new session continue using only repo artifacts — without relying on conversation history?_

**Score: ___**

Pass criteria:
- `claude-progress.md` "Current Verified State" is accurate
- `feature_list.json` accurately reflects what's done and what's next
- `session-handoff.md` is filled in and the "Next best action" is numbered steps
- All changes are committed

Fail signals:
- Progress or handoff files not updated
- Knowledge exists only in conversation context, not in repo files
- Next session would need to re-discover the current state from scratch

---

## Total score: ___ / 12

## Conclusion

| Score | Decision |
|---|---|
| 10–12 | **Accept** — meets the bar |
| 7–9 | **Revise** — fix the gaps before accepting; document what changed |
| 0–6 | **Block** — fundamental issues; do not build on this output |

---

## Tuning log

_Record each rubric revision here so you can track what improved human–agent score alignment._

| Date | Change made | Reason |
|---|---|---|
| 2026-06-03 | Initial version | Baseline rubric from harness pattern |

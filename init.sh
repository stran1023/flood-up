#!/bin/bash
# init.sh — install dependencies and verify TypeScript compilation

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"
echo "Working directory: $REPO_ROOT"
echo ""

# ── 1. Install dependencies ───────────────────────────────────────────────────

echo "==> Installing mobile dependencies..."
(cd mobile && npm install --legacy-peer-deps 2>&1 | grep -E "^(added|removed|changed|npm error)" || true)

echo "==> Installing functions dependencies..."
(cd functions && npm install 2>&1 | grep -E "^(added|removed|changed|npm error)" || true)

echo ""

# ── 2. TypeScript verification ────────────────────────────────────────────────

echo "==> Verifying mobile/..."
(cd mobile && ./node_modules/.bin/tsc --noEmit)

echo "==> Verifying functions/..."
(cd functions && ./node_modules/.bin/tsc --noEmit)

echo ""
echo "✓ TypeScript OK — 0 errors in mobile/ and functions/"
echo ""
echo "Next steps:"
echo "  Deploy:  firebase deploy --only firestore:rules,firestore:indexes,functions"
echo "  Start:   cd mobile && npx expo start --clear"
echo ""

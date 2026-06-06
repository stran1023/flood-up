#!/bin/bash
# init.sh — Flood Up: verify → deploy → start
#
# Usage:
#   ./init.sh              verify + deploy Firebase + start Expo
#   ./init.sh --verify     TypeScript check only, no deploy, no start
#   ./init.sh --no-deploy  verify + start Expo, skip Firebase deploy
#   ./init.sh --no-start   verify + deploy, do not launch Expo

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"
echo "Working directory: $REPO_ROOT"
echo ""

# ── Parse flags ───────────────────────────────────────────────────────────────

VERIFY_ONLY=0
SKIP_DEPLOY=0
SKIP_START=0
for arg in "$@"; do
  case $arg in
    --verify)    VERIFY_ONLY=1 ;;
    --no-deploy) SKIP_DEPLOY=1 ;;
    --no-start)  SKIP_START=1 ;;
  esac
done

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

# ── Verify-only exit ──────────────────────────────────────────────────────────

if [ "$VERIFY_ONLY" = "1" ]; then
  echo "✓ Baseline OK — all packages install and compile cleanly."
  echo ""
  echo "Start command:  cd mobile && npx expo start"
  echo "Deploy:         firebase deploy --only firestore:rules,firestore:indexes,functions"
  exit 0
fi

# ── 3. Firebase deploy ────────────────────────────────────────────────────────

if [ "$SKIP_DEPLOY" = "0" ]; then
  echo "==> Deploying Firestore rules and indexes..."
  firebase deploy --only firestore:rules,firestore:indexes

  echo ""
  echo "==> Deploying Cloud Functions (Node 22)..."
  firebase deploy --only functions --force

  echo ""
  echo "✓ Firebase backend deployed."
  echo ""
fi

# ── 4. Start Expo dev server ──────────────────────────────────────────────────

if [ "$SKIP_START" = "0" ]; then
  echo "==> Starting Expo dev server (SDK 54)..."
  echo "    Open Expo Go on your phone and scan the QR code."
  echo ""
  cd mobile && npx expo start
fi

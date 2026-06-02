#!/bin/bash
# init.sh — Flood Up startup script
# Usage: ./init.sh
# Set RUN_START_COMMAND=1 to also launch the Expo dev server after verification.

set -e

INSTALL_CMD="npm install"
VERIFY_CMD="npx tsc --noEmit"
START_CMD="npx expo start"

echo "Working directory: $(pwd)"
echo ""

# ── Install dependencies ──────────────────────────────────────────────────────

echo "==> Installing mobile dependencies..."
(cd mobile && $INSTALL_CMD)

echo "==> Installing functions dependencies..."
(cd functions && $INSTALL_CMD)

echo "==> Installing dashboard dependencies..."
(cd dashboard && $INSTALL_CMD)

echo ""

# ── Verify TypeScript in all packages ─────────────────────────────────────────

echo "==> Verifying mobile/..."
(cd mobile && $VERIFY_CMD)

echo "==> Verifying functions/..."
(cd functions && $VERIFY_CMD)

echo "==> Verifying dashboard/..."
(cd dashboard && $VERIFY_CMD)

echo ""
echo "✓ Baseline OK — all packages install and compile cleanly."
echo ""
echo "Start command:  cd mobile && $START_CMD"
echo "Dashboard:      cd dashboard && npx vite"
echo "Functions:      cd functions && npm run serve"
echo ""

# ── Optional: launch dev server ───────────────────────────────────────────────

if [ "${RUN_START_COMMAND}" = "1" ]; then
  echo "==> Starting Expo dev server..."
  cd mobile && $START_CMD
fi

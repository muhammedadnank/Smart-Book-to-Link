#!/usr/bin/env bash
set -euo pipefail

echo "▶ Running update script..."
if python3 update.py; then
    echo "✓ Update successful."
else
    echo "⚠ Update failed or skipped — starting with current version."
fi

echo "▶ Starting PageStream bot..."
exec python3 -m PageStream
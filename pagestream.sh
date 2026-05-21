#!/usr/bin/env bash
set -euo pipefail

if [ "${RENDER:-}" = "true" ]; then
    echo "▶ Running on Render — skipping git auto-update."
else
    echo "▶ Running update script..."
    if python3 update.py; then
        echo "✓ Update successful."
    else
        echo "⚠ Update failed or skipped — starting with current version."
    fi
fi

echo "▶ Starting PageStream bot..."
exec python3 -u -m PageStream
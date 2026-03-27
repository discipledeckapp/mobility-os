#!/usr/bin/env bash
set -euo pipefail

echo "Pushing latest code..."
git push origin main

echo "Triggering Render deploy..."
curl -X POST https://api.render.com/deploy/srv-d6vt2guuk2gs738vf30g?key=g2Nl_UMUZ5g

echo "Done. Check Render dashboard for build progress."

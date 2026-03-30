#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
open -a Xcode "$ROOT_DIR/ios/MobirisMobileOps.xcworkspace"

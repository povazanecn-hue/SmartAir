#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/dist"
OUT_FILE="$OUT_DIR/dream-air-bolt-package.zip"

mkdir -p "$OUT_DIR"

cd "$ROOT_DIR"
zip -j "$OUT_FILE" \
  docs/lovable-unified-master-prompt.md \
  docs/bolt-master-prompt.md \
  docs/podrobna-specifikacia-konfiguratora-sk.md \
  docs/mockupy-12-krokov-na-odsuhlasenie.md \
  data/dreamair-product-import.csv \
  README.md >/dev/null

echo "Package created: $OUT_FILE"

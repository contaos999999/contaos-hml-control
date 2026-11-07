#!/usr/bin/env bash
set -euo pipefail
expected=8ea7750b75fd9d76b29c36ce7613392e3ab65e19
file=src/integrations/supabase/types.ts
actual=$(git hash-object "$file")
if [[ "$actual" == "$expected" ]]; then
  echo "LOCK-TYPES-01 PASS $actual"
  exit 0
fi
echo "LOCK-TYPES-01 DRIFT $actual != $expected"
if ! git cat-file -e "${expected}^{blob}"; then
  echo "Canonical object unavailable locally; stopping without overwrite." >&2
  exit 2
fi
git cat-file blob "$expected" > "$file"
actual=$(git hash-object "$file")
if [[ "$actual" != "$expected" ]]; then
  echo "Restoration failed; stop." >&2
  exit 3
fi
echo "LOCK-TYPES-01 RESTORED $actual; rerun tests before commit."

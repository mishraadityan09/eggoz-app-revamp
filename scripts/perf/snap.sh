#!/bin/zsh
# Screenshot the device: full-res <name>.png and a 540px-wide <name>_sm.png preview.
# Usage: snap.sh <name> [outdir=docs/prototype-screens]
source "${0:A:h}/common.sh"
NAME=${1:?usage: snap.sh <name> [outdir]}
OUT=${2:-docs/prototype-screens}
mkdir -p "$OUT"
"$ADB" exec-out screencap -p > "$OUT/$NAME.png"
if command -v sips >/dev/null; then sips --resampleWidth 540 "$OUT/$NAME.png" --out "$OUT/${NAME}_sm.png" >/dev/null; fi
echo "$OUT/$NAME.png"

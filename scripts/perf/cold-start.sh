#!/bin/zsh
# Cold start -> wait until <wait-text> is on screen -> immediately run the scroll pattern.
# Reports launch-to-content time (±1 s, UI polling) and first-scroll frame stats per run.
# Usage: cold-start.sh <package> ["Best Selling"] [runs]
source "${0:A:h}/common.sh"
PKG=${1:?usage: cold-start.sh <package> [wait-text] [runs]}
WAIT_TEXT=${2:-Best Selling}
RUNS=${3:-3}

for run in $(seq 1 "$RUNS"); do
  echo "===== COLD RUN $run / $RUNS ($PKG) ====="
  "$ADB" shell am force-stop "$PKG"; sleep 2
  T0=$(now)
  "$ADB" shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
  if ! wait_for_text "$WAIT_TEXT" 40; then echo "'$WAIT_TEXT' never appeared - skipping run"; continue; fi
  echo "launch -> '$WAIT_TEXT' visible: ~$(perl -e "printf '%.1f', $(now)-$T0")s"
  require_fg "$PKG"
  gfx_reset "$PKG"
  scroll_pattern
  echo "-- first scroll after launch:"; gfx_stats "$PKG"
done

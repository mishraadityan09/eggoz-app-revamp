#!/bin/zsh
# Feed scroll once content has loaded (warm). App must be on the home screen.
# Usage: scroll-warm.sh <package> [runs=2]
source "${0:A:h}/common.sh"
PKG=${1:?usage: scroll-warm.sh <package> [runs]}
RUNS=${2:-2}

require_fg "$PKG"
for run in $(seq 1 "$RUNS"); do
  echo "===== WARM SCROLL RUN $run / $RUNS ====="
  scroll_to_top; sleep 2
  gfx_reset "$PKG"
  scroll_pattern
  gfx_stats "$PKG"
  require_fg "$PKG"
done

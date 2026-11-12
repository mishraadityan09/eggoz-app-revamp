#!/bin/zsh
# Hero carousel smoothness. App must be on the home screen; it is scrolled to the top first.
#  A) 15 s untouched (auto-play only)   B) 6 manual horizontal swipes on the carousel
# Usage: carousel.sh <package> [carousel-center-y=680] [blocking-text-to-check="Login to continue"]
source "${0:A:h}/common.sh"
PKG=${1:?usage: carousel.sh <package> [carousel-y] [blocking-text]}
Y=${2:-680}
BLOCKER=${3:-Login to continue}

require_fg "$PKG"
scroll_to_top; sleep 2
if screen_has "$BLOCKER"; then echo "ABORT: '$BLOCKER' sheet is open - close it first"; exit 1; fi

echo "===== A) carousel auto-play, untouched, 15 s ====="
gfx_reset "$PKG"; sleep 15; gfx_stats "$PKG"

echo "===== B) 6 manual swipes at y=$Y ====="
gfx_reset "$PKG"
for _ in 1 2 3 4 5 6; do "$ADB" shell input swipe 900 "$Y" 200 "$Y" 200; sleep 1.2; done
gfx_stats "$PKG"

if screen_has "$BLOCKER"; then echo "WARNING: '$BLOCKER' appeared during the test - discard these numbers"; fi
require_fg "$PKG"

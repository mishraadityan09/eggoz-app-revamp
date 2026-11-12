#!/bin/zsh
# Shared helpers for the perf scripts. Source it: `source "${0:A:h}/common.sh"`
# Assumes a single connected emulator/device with a 1080x2400 screen.

ADB=${ADB:-$(command -v adb || echo "$HOME/Library/Android/sdk/platform-tools/adb")}
[ -x "$ADB" ] || { echo "adb not found (set ADB=/path/to/adb)"; exit 1; }

STATS_RE='Total frames rendered|^Janky frames:|50th percentile|90th percentile|99th percentile|Slow UI thread|Slow bitmap|Slow issue draw'

now() { perl -MTime::HiRes=time -e 'printf "%.1f", time'; }

# is_fg <pkg> -> exit 0 if the package's activity is resumed on top
is_fg() { "$ADB" shell dumpsys activity activities | grep -q "topResumedActivity.*$1"; }

require_fg() { is_fg "$1" || { echo "ABORT: $1 is not in the foreground"; exit 1; }; }

# screen_has <text> -> exit 0 if the text is in the current UI hierarchy
screen_has() {
  "$ADB" shell uiautomator dump /sdcard/perf_ui.xml >/dev/null 2>&1
  "$ADB" shell "grep -q '$1' /sdcard/perf_ui.xml"
}

# wait_for_text <text> [tries] -> exit 0 when visible
wait_for_text() {
  local tries=${2:-30}
  for _ in $(seq 1 "$tries"); do screen_has "$1" && return 0; sleep 0.3; done
  return 1
}

gfx_reset() { "$ADB" shell dumpsys gfxinfo "$1" reset >/dev/null; }
gfx_stats() { "$ADB" shell dumpsys gfxinfo "$1" | grep -E "$STATS_RE" | head -8; }

# Standard vertical scroll pattern used in the review: 5 swipes down, 5 back up
scroll_pattern() {
  for _ in 1 2 3 4 5; do "$ADB" shell input swipe 540 1900 540 500 250; sleep 0.8; done
  for _ in 1 2 3 4 5; do "$ADB" shell input swipe 540 500 540 1900 250; sleep 0.8; done
}

scroll_to_top() {
  for _ in 1 2 3; do "$ADB" shell input swipe 540 600 540 1900 150; sleep 0.6; done
}

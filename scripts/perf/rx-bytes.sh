#!/bin/zsh
# Total bytes the app's UID has received over the network, per Android netstats (all sets, tag 0x0).
# Take a reading before and after a scenario and subtract.
# Usage: rx-bytes.sh <package>    -> prints a byte count
source "${0:A:h}/common.sh"
PKG=${1:?usage: rx-bytes.sh <package>}
U=$("$ADB" shell cmd package list packages -U | grep "package:$PKG " | grep -oE "uid:[0-9]+" | cut -d: -f2)
[ -n "$U" ] || { echo "package not installed: $PKG" >&2; exit 1; }
"$ADB" shell dumpsys netstats --poll >/dev/null 2>&1
"$ADB" shell dumpsys netstats detail 2>/dev/null | awk -v u="uid=$U" '
  /ident=/ { inside = (index($0, u" set=") > 0 && $0 ~ /tag=0x0$/); next }
  inside && /rb=/ { for (i = 1; i <= NF; i++) if ($i ~ /^rb=/) { split($i, a, "="); s += a[2] } }
  END { print s + 0 }'

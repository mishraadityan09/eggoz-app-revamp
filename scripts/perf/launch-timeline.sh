#!/bin/zsh
# Cold launch filmstrip + network use. Force-stops both apps, launches <package>, saves one
# screenshot per second for 12 s (<out-dir>/<label>-1.png … -12.png, 200 px wide) and prints the
# KB the app received in its first 20 s.
#   mode warm    : returning user, caches intact
#   mode nocache : `pm trim-caches` first (clears every app's cache dir, e.g. image caches)
# Note: screencap costs CPU on a 1-vCPU emulator — compare apps only when captured the same way.
# Usage: launch-timeline.sh <package> <label> <warm|nocache> <out-dir>
source "${0:A:h}/common.sh"
PKG=${1:?usage: launch-timeline.sh <package> <label> <warm|nocache> <out-dir>}
LABEL=${2:?label}; MODE=${3:?warm|nocache}; OUT=${4:?out-dir}
mkdir -p "$OUT"
for p in com.adityan.eggozconcept com.eggozconsumerapp; do "$ADB" shell am force-stop $p; done
"$ADB" shell input keyevent 3
[ "$MODE" = nocache ] && "$ADB" shell pm trim-caches 99G >/dev/null
sleep 5
RX0=$("${0:A:h}/rx-bytes.sh" "$PKG")
T0=$(now); "$ADB" shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 &
for s in $(seq 1 12); do
  while (( $(perl -MTime::HiRes=time -e "print time-$T0 < $s ? 1 : 0") )); do sleep 0.05; done
  "$ADB" exec-out screencap -p > "$OUT/$LABEL-$s.png"
done; wait
for s in $(seq 1 12); do sips --resampleWidth 200 "$OUT/$LABEL-$s.png" --out "$OUT/$LABEL-$s.png" >/dev/null; done
while (( $(perl -MTime::HiRes=time -e "print time-$T0 < 20 ? 1 : 0") )); do sleep 0.2; done
RX1=$("${0:A:h}/rx-bytes.sh" "$PKG")
echo "$LABEL: received $(( (RX1 - RX0) / 1024 )) KB in first 20 s"

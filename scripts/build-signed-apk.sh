#!/bin/zsh
# Builds a release APK (arm64) and signs it with the key in app/credentials/.
# Usage: scripts/build-signed-apk.sh        -> app/dist/eggoz-concept-v<version>-arm64.apk
set -e
ROOT=${0:A:h:h}
APP=$ROOT/app
CREDS=$APP/credentials/keystore.properties
[ -f "$CREDS" ] || { echo "Missing $CREDS (release key). See CLAUDE.md → Signed APK."; exit 1; }

export ANDROID_HOME=${ANDROID_HOME:-$HOME/Library/Android/sdk}
BT=$(ls -d $ANDROID_HOME/build-tools/* | sort -V | tail -1)
VERSION=$(node -p "require('$APP/app.json').expo.version")
OUT=$APP/dist/eggoz-concept-v$VERSION-arm64.apk

[ -d "$APP/android" ] || (cd "$APP" && npx expo prebuild --platform android --no-install)
(cd "$APP/android" && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a -q)

prop() { grep "^$1=" "$CREDS" | cut -d= -f2-; }
mkdir -p "$APP/dist"
KS_PW=$(prop storePassword) KEY_PW=$(prop keyPassword) "$BT/apksigner" sign \
  --ks "$APP/credentials/$(prop storeFile)" --ks-key-alias "$(prop keyAlias)" \
  --ks-pass env:KS_PW --key-pass env:KEY_PW \
  --out "$OUT" "$APP/android/app/build/outputs/apk/release/app-release.apk"
rm -f "$OUT.idsig"
"$BT/apksigner" verify "$OUT" && echo "Signed: $OUT ($(du -h "$OUT" | cut -f1))"

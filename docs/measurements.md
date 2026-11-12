# Measurements

## Setup

| | |
|---|---|
| App | `com.eggozconsumerapp` v1.0.7 (versionCode 19), targetSdk 36 |
| Stack (from APK) | React Native with Hermes (`libhermesvm.so`), `libreactnative.so`, Reanimated, react-native-screens, react-native-svg, safe-area-context |
| Device | Android 16 emulator `sdk_gphone64_arm64`, **1 vCPU**, 1080×2400, 420 dpi, on an Apple-silicon Mac |
| Session | Guest ("Skip"), GPS `adb emu geo fix 77.0266 28.4595` (Gurugram), Google Location Accuracy on |
| Date | 12 Nov 2026 |

Emulator numbers are directional; confirm on a real mid-range Android phone. Only clean runs are
listed — runs where a login sheet might have been open were discarded.

**Caveats discovered after the review:**
- The emulator has a **single CPU core** (real phones typically have 8). Relative comparisons on the
  same emulator are fair; absolute jank numbers will be worse than on a real device. Do **not** change
  the emulator's core count before measuring the prototype — the before/after must use the same setup.
- **Run-to-run variance is high.** A later sanity run of `scroll-warm.sh` gave 28.8% janky frames
  (vs 3.3–3.9% earlier) and `carousel.sh` gave 100% janky on only 35 frames, during a phase when the
  app was using 60–96% of the core while untouched. Measure the Eggoz app and the prototype
  back-to-back in the same session, ≥ 3 runs each, and report medians.

## Observations to investigate (not findings)

- **Intermittent idle CPU.** At times the app used 59–96% of the core for 10+ s with no input (mostly
  the Android main/UI thread; `ps -T` after ~40 min: main thread 25 min CPU, image decoding (Fresco)
  2 min, GC 2.7 min, JS thread 1.3 min). At other times idle CPU was 0–4%. Not reproducible on
  demand, so not reported. Worth checking with Android Studio's CPU profiler on a real device.

## Eggoz app — results

| Scenario | Runs | Janky frames | Median frame | p99 | Script |
|---|---|---|---|---|---|
| Cold launch → "Best Selling" visible | 3 | — | 8.6 s · 9.6 s · 9.6 s (±1 s) | — | `cold-start.sh` |
| First home scroll right after cold launch | 3 | 50.7% · 29.8% · 54.3% | 32 · 27 · 32 ms | 150 · 300 · 101 ms | `cold-start.sh` |
| First 10 s after cold launch, no touch | 2 | 31.1% · 34.5% | 32 · 38 ms | 150 · 117 ms | (manual, see below) |
| Hero carousel auto-play, untouched, after load (15 s) | 1 | 47.2% | 32 ms | 150 ms | `carousel.sh` |
| Hero carousel, 6 manual swipes, after load | 1 | 47.0% | 32 ms | 150 ms | `carousel.sh` |
| Home feed scroll once loaded | 2 | 3.3% · 3.9% | 16 · 20 ms | 44 · 32 ms | `scroll-warm.sh` |

Extra counters: carousel auto-play had 85 "slow UI thread" frames of 303; slow bitmap uploads
appeared in 6 of the 9 measured runs above (up to 17 in one cold run).

Other measurements:
- **Contrast** (`contrast.py`, pixels sampled from screenshots): see U15 in `findings.md`.
- **Accessibility labels**: `uiautomator dump` of home → 18 clickable nodes, 5 with no text and no
  content-desc (3 carousel banners, 2 calendar buttons).

## Prototype — results (fill in at Milestone 6)

| Scenario | Eggoz today | Prototype | Target |
|---|---|---|---|
| Cold launch → home content | 8.6–9.6 s | _tbd_ | < 3 s (cached) |
| Hero carousel janky frames (auto-play) | 47.2% | _tbd_ | < 5% |
| Hero carousel janky frames (swipes) | 47.0% | _tbd_ | < 5% |
| First scroll after launch janky frames | 29.8–54.3% | _tbd_ | < 5% |
| Worst frame (p99) carousel / first scroll | 150–300 ms | _tbd_ | < 100 ms |
| Blank white screen on open | seen | _tbd_ | never |
| Text pairs failing WCAG AA (sampled) | 5 of 6 | _tbd_ | 0 |
| Unlabelled clickable nodes on home | 5 of 18 | _tbd_ | 0 |

Measure the prototype as a **release** build (`npx expo run:android --variant release`), same
emulator, same scripts, at least 3 runs per scenario. Record every run, not just the best.

## How to reproduce

All scripts are in `scripts/perf/`, take the package name as the first argument, use `adb` from
PATH or `~/Library/Android/sdk/platform-tools/adb`, and assume a 1080×2400 screen.

```bash
scripts/perf/cold-start.sh  com.eggozconsumerapp "Best Selling" 3
scripts/perf/carousel.sh    com.eggozconsumerapp            # app on home, scrolled to top
scripts/perf/scroll-warm.sh com.eggozconsumerapp 2
scripts/perf/snap.sh home-today docs/prototype-screens
python3 scripts/perf/contrast.py docs/prototype-screens/home.png 120 2100 220 2160
```

"First 10 s, no touch": force-stop, launch, wait for "Best Selling", `dumpsys gfxinfo <pkg> reset`,
wait 10 s, read `dumpsys gfxinfo <pkg>`.

Janky frames = Android's count of frames that missed their display deadline (16.7 ms at 60 Hz),
from `adb shell dumpsys gfxinfo <pkg>` after a `reset`.

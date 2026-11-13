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
Interim numbers so far are in the Milestone 1 and Milestone 2 sections below.

## Prototype — Milestone 1 interim (13 Nov 2026)

Release build of `com.adityan.eggozconcept`, same 1-vCPU emulator, measured back-to-back with
Eggoz v1.0.7 in the same session. Both apps were in their "returning user" state (Eggoz: guest +
Gurugram; prototype: logged in + saved address + cached home).

| Scenario | Prototype M1 | Eggoz v1.0.7 (same session) |
|---|---|---|
| Cold launch, 1 frame/s capture, other app force-stopped first ([image](prototype-screens/m1-launch-timeline-vs-eggoz.png)) | Home fully drawn in the **1 s** frame (an 8-frame capture shows splash 0.9–1.1 s, home 1.3–1.4 s) | Blank white 1 s · branded splash 2–3 s · **blank white 4–6 s** · shifting layout 7–8 s · product images ~11 s |
| Cold launch → "Best Selling" detected (`cold-start.sh`, includes polling overhead) | 5.4 · 5.7 · 5.2 s | 18.0 · 12.9 · 12.4 s |
| First scroll after launch, standard pattern | 32.3 · 33.2 · 40.1% janky | 21.1 · 27.5 · 34.6% janky |
| Warm scroll, standard pattern | 33.3 · 30.0% janky | 33.6 · 16.8% janky (p99 550 · 350 ms) |
| Warm scroll, swipes kept inside the list | **2.3%** janky, median 16 ms, p99 17 ms | not measured |
| Horizontal product-rail swipes | **2.2%** janky, p99 16 ms | not measured |
| Idle CPU, untouched home | 0–3.7% | intermittent 59–96% seen on 12 Nov |
| Clickable nodes without a label | 0 (welcome, location, home) | 5 of 18 (home) |

How to read this honestly:
- **Launch is the M1 win**: cached home + held splash means no blank frame and content within ~1.5 s
  on this emulator, versus ~11 s with two blank white phases for Eggoz.
- **The standard scroll pattern is not a fair comparison yet.** It swipes 1,400 px; the M1 home is
  only about one screen taller than the viewport, so most swipes hit the end and trigger Android's
  stretch-overscroll effect (high "slow issue draw commands"). Swipes that stay inside the list are
  smooth (2.3%). Re-run the standard pattern once Milestone 2 makes home full length.
- `cold-start.sh` launch times include `uiautomator dump` polling (~1.5–2 s per poll on this
  emulator) — use them only to compare apps measured the same way.
- Eggoz's warm-scroll numbers vary a lot between sessions (3.3–3.9% on 12 Nov, 16.8–33.6% today).
- A first timeline capture was **discarded**: Eggoz was still running in the background and
  slowed the prototype's launch on the single core.

## Prototype — Milestone 2 interim (13 Nov 2026, afternoon)

Signed release build v0.1.0 (`scripts/build-signed-apk.sh`) with the Milestone 2 home: 5-slide
carousel on the UI thread, real product photos and prices from our Vercel CDN (WebP + blurhash),
"Schedule · save 5%" on every card. Same 1-vCPU emulator; both apps measured back-to-back in one
session, and both apps were force-stopped before every launch.

### Launch filmstrips and data used

One screenshot per second for 12 s, plus the bytes the app received in its first 20 s
(`launch-timeline.sh`). "Caches cleared" = `pm trim-caches` (empties every app's cache folder, e.g.
downloaded images; saved data such as login and the prototype's cached home JSON stays).
Images: [returning user](prototype-screens/m2-launch-timeline-warm.png),
[caches cleared](prototype-screens/m2-launch-timeline-nocache.png),
[load test](prototype-screens/m2-launch-timeline-loadtest.png). Eggoz's celebrity ad splash is blurred in them.

| Run | Eggoz v1.0.7 | Prototype |
|---|---|---|
| Returning user, run 1 | logo 1–2 s · **blank white 3–6 s** · ad splash 7 s · empty layout 8 s · "Best Selling" 9 s · product photos still blank at 12 s | launcher still showing at 1 s · home drawn at 2 s (photo placeholders) · blurhash 3 s · photos 4 s |
| Returning user, run 2 | logo 1 s · **blank white 2–4 s** · ad splash 5 s · **blank white 6–8 s** · header 9 s · "Best Selling" 10 s · photos still blank at 12 s | splash 1–2 s · home with photos 3 s |
| Caches cleared, run 1 | logo 1 s · **blank white 2–5 s** · ad splash 6 s · "Best Selling" 7 s · first photo 11 s | splash 1–3 s · home 4 s · blurhash 6 s · photos 7 s |
| Caches cleared, run 2 | logo 1–2 s · **blank white 3–9 s** · header 10 s · no products by 12 s | splash 1–2 s · plain splash colour 3 s · home 4 s · blurhash 5 s · photos 6 s |
| Load test, first load (480 synthetic products, cached data cleared in-app first) | — | splash 1–3 s · exact-size skeleton 4–5 s · content 6 s · photos 7 s |

| Data received in first 20 s | Eggoz v1.0.7 | Prototype |
|---|---|---|
| Returning user | 24,831 · 24,163 KB | **0 · 0 KB** |
| Caches cleared | 27,483 · 27,698 KB | **199 · 191 KB** |
| Load test, first load | — | **212 KB** (28 KB JSON + photos for the visible cards) |

### Smoothness (`dumpsys gfxinfo`)

| Scenario | Eggoz v1.0.7 | Prototype | Target |
|---|---|---|---|
| Carousel auto-play, 15 s untouched (`carousel.sh`) | 59.4% janky of 32 frames · median 57 ms · p90 1,150 ms · **p99 2,300 ms** | 43.1% janky of 51 frames · median 46 ms · p99 105 ms | < 5% |
| Carousel, 6 swipes (`carousel.sh`) | 34.0% of 212 · median 42 ms · p99 350 ms | 33.8% of 148 · median 34 ms · p99 133 ms | < 5% |
| Carousel with the load-test feed (auto-play · swipes) | — | 53.3% of 30 (p99 121 ms) · 35.2% of 125 (p99 125 ms) | < 5% |
| Feed scroll, standard pattern (`scroll-warm.sh`) | 44.5% of 164 · median 40 ms · p99 350 ms (1 valid run of 3, see below) | not re-run on the real catalog this round | < 5% |
| Feed scroll, load test: 480 products in 24 rows (`scroll-warm.sh`, 3 runs) | — | 20.3 · 11.2 · 11.6% of 528–609 frames · median 26–32 ms · p99 81–129 ms | < 5% |

How to read this honestly:
- **Clear wins:** the prototype shows home in 2–4 s with no blank white frame; Eggoz shows 3–7 s of
  blank white and still has empty photo boxes at 11–12 s. At launch it downloads about **140× less**
  (0.2 MB vs 27.5 MB with caches cleared; nothing at all for a returning user vs ~24 MB). Its
  carousel's worst frame is 105–133 ms; Eggoz's carousel froze for 1.1–2.3 s.
- **Targets not met:** carousel jank is **34–53%** — no better than Eggoz during swipes — against a
  < 5% target. Slow frames are split between "slow UI thread" (18 of 51 auto-play, 32 of 148 swipe
  frames) and "slow issue draw commands" (19 · 37), so the cost is on the native UI/render side,
  not in JavaScript. Next step: a Perfetto trace of a slide change, then confirm on a real phone.
- Feed scroll with 480 products is 11–20% janky — better than Eggoz's 44.5% with 8 products, but
  above target. (In the Milestone 1 round, swipes kept inside the real-catalog feed were 2.3%.)
- Home now appears at 2–4 s instead of ~1–1.5 s in the Milestone 1 round. The M2 home has photos
  and a carousel, and these runs also took a screenshot every second, which competes for the single
  CPU core (both apps were captured the same way). Not yet investigated.
- **Discarded:** Eggoz scroll runs 2 and 3 rendered 0 frames (the app was not drawing — most likely
  not on screen), so only run 1 is reported.
- Byte counts are totals per app from Android's network stats; what Eggoz downloads was not
  inspected.
- Not re-measured this round: `cold-start.sh` (launch → "Best Selling" + first scroll), contrast and
  the unlabelled-control check on the M2 home. Those are part of Milestone 6.

## How to reproduce

All scripts are in `scripts/perf/`, take the package name as the first argument, use `adb` from
PATH or `~/Library/Android/sdk/platform-tools/adb`, and assume a 1080×2400 screen.

```bash
scripts/perf/cold-start.sh  com.eggozconsumerapp "Best Selling" 3
scripts/perf/carousel.sh    com.eggozconsumerapp            # app on home, scrolled to top
scripts/perf/scroll-warm.sh com.eggozconsumerapp 2
scripts/perf/snap.sh home-today docs/prototype-screens
python3 scripts/perf/contrast.py docs/prototype-screens/home.png 120 2100 220 2160

# Launch filmstrip + KB received in first 20 s (warm | nocache), then lay runs out side by side
scripts/perf/launch-timeline.sh com.eggozconsumerapp eggoz-warm-r1 warm /tmp/frames
scripts/perf/launch-timeline.sh com.adityan.eggozconcept proto-warm-r1 warm /tmp/frames
python3 scripts/perf/timeline-sheet.py /tmp/frames out.png "eggoz-warm-r1=Eggoz|returning user" \
  "proto-warm-r1=Prototype|returning user" blur=eggoz-warm-r1-7   # blur= hides ad frames
```

"First 10 s, no touch": force-stop, launch, wait for "Best Selling", `dumpsys gfxinfo <pkg> reset`,
wait 10 s, read `dumpsys gfxinfo <pkg>`.

Janky frames = Android's count of frames that missed their display deadline (16.7 ms at 60 Hz),
from `adb shell dumpsys gfxinfo <pkg>` after a `reset`.

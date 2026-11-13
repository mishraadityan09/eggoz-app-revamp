# Eggoz App Revamp — review + concept prototype

An independent UX & performance review of the **Eggoz consumer Android app (v1.0.7)**, and a working
React Native prototype that fixes what the review found — measured with the same scripts, on the same
device, as the original app.

> **Unofficial concept.** Not affiliated with or endorsed by Eggoz. Eggoz's product photos, prices
> and app screenshots are used only to illustrate this concept; they belong to Eggoz and will be
> removed on request. **The Eggoz team is welcome to use, copy or adapt any part of this repo.**

## What's here

| Path | What it is |
|---|---|
| [`docs/Eggoz-App-Review.pdf`](docs/Eggoz-App-Review.pdf) | The 10-page app review |
| [`docs/findings.md`](docs/findings.md) | All 20 findings (P1–P4 performance, U1–U16 UX) with evidence, fix and acceptance criteria |
| [`docs/measurements.md`](docs/measurements.md) | Every measured run (good and bad), test setup and how to reproduce |
| [`docs/prototype-spec.md`](docs/prototype-spec.md) | What the prototype covers: screens, components, tokens, milestones |
| [`docs/prototype-screens/`](docs/prototype-screens/) | Screenshots and side-by-side launch filmstrips |
| [`docs/eggoz-review/`](docs/eggoz-review/) | PDF source (`report.html`) and reference screenshots (`screens/`) |
| [`mock-data/catalog.json`](mock-data/catalog.json) | Products, prices, banners and copy observed in the live app |
| [`app/`](app/) | The prototype (Expo SDK 58, React Native 0.88, JavaScript) |
| [`backend/`](backend/) | Static API + image CDN, deployed to **https://eggoz-concept-cdn.vercel.app** |
| [`scripts/perf/`](scripts/perf/) | adb scripts used to measure both apps |
| [`scripts/build-signed-apk.sh`](scripts/build-signed-apk.sh) | Builds a signed arm64 release APK |
| [`CLAUDE.md`](CLAUDE.md) | Instructions for the AI coding agent (also linked as `AGENTS.md`) |

## Results so far

Same Android emulator (1 vCPU, 1080×2400), both apps measured back-to-back on 13 Nov 2026. Emulator
numbers are directional — confirm on a real phone. Raw runs: [`docs/measurements.md`](docs/measurements.md).

| | Eggoz v1.0.7 | Prototype (interim) | Target |
|---|---|---|---|
| Launch → products on screen | 7 s to more than 12 s, with blank white phases | 2–4 s, no blank screen | < 3 s |
| Data downloaded in first 20 s (caches cleared) | ~27 MB | ~0.2 MB | — |
| Data downloaded in first 20 s (returning user) | ~24 MB | 0 KB | — |
| Hero carousel janky frames (auto-play · swipes) | 59% · 34% | 43% · 34% — **not met yet** | < 5% |
| Hero carousel worst frame (p99) | up to 2.3 s | 105–133 ms | < 100 ms |
| Feed scroll janky frames | 44.5% (8 products) | 11–20% with 480 products — **not met yet** | < 5% |
| Guest can browse and add to cart | No (login wall) | Yes | Yes |
| Location failure has a manual path | No (dead end) | Yes (pincode) | Yes |

The 480-product load test uses **synthetic** products generated from Eggoz's 8 real ones
(Profile → "Load test" in the app).

**Done:** launch, welcome/login (mock OTP auto-read) or explore as guest, location with pincode
fallback, home with hero carousel, real product photos and prices from the CDN, "Schedule · save 5%"
on every card. **Open:** category chips, product page, cart & checkout, carousel smoothness, final
measurement round. See the milestones in [`docs/prototype-spec.md`](docs/prototype-spec.md).

## Run it

```bash
cd app
npm install
npx expo start                             # dev, Expo Go / emulator
npx expo run:android --variant release     # release build (use this for any performance measurement)
```

Product data and photos load from the CDN; OTP, serviceability and payments are local mocks (no real
SMS, no real orders). A signed Android APK is available on request.

## Rebuild the PDF

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
  --allow-file-access-from-files --print-to-pdf="$PWD/docs/Eggoz-App-Review.pdf" \
  "file://$PWD/docs/eggoz-review/report.html"
```

---
Adityan · React Native & Flutter Developer · [adityan-phi.vercel.app/en](https://adityan-phi.vercel.app/en) ·
built with the help of AI tools (Claude); every number comes from scripts in this repo.

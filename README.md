# Eggoz App Revamp — review + prototype brief

Independent UX & performance review of the **Eggoz consumer Android app (v1.0.7)** and the brief for a
React Native prototype that fixes what the review found. Built to pitch for a React Native / Flutter
developer role at Eggoz.

> **Private repo.** Contains screenshots of the Eggoz app for review purposes. Unofficial and not
> affiliated with Eggoz. Do not make this repository public.

## What's here

| Path | What it is |
|---|---|
| [`docs/Eggoz-App-Review.pdf`](docs/Eggoz-App-Review.pdf) | The 10-page review sent with the proposal email |
| [`docs/findings.md`](docs/findings.md) | All 20 findings (P1–P4 performance, U1–U16 UX) with evidence, fix and acceptance criteria |
| [`docs/measurements.md`](docs/measurements.md) | Raw performance numbers, test setup and how to reproduce them |
| [`docs/prototype-spec.md`](docs/prototype-spec.md) | What to build: screens, components, tokens, milestones, definition of done |
| [`docs/eggoz-review/`](docs/eggoz-review/) | PDF source (`report.html`) and reference screenshots (`screens/`) |
| [`mock-data/catalog.json`](mock-data/catalog.json) | Products, prices, banners and copy observed in the real app |
| [`scripts/perf/`](scripts/perf/) | adb scripts used to measure the app — rerun them on the prototype for before/after |
| [`app/`](app/) | The prototype (Expo SDK 58, React Native 0.88) |
| [`backend/`](backend/) | Static API + image CDN, deployed to **https://eggoz-concept-cdn.vercel.app** (`npm run deploy`) |
| [`CLAUDE.md`](CLAUDE.md) | Instructions for the AI coding agent (also linked as `AGENTS.md`) |

## Headline findings

| | Today (measured) | Prototype target |
|---|---|---|
| Cold launch → home content | 8.6–9.6 s | < 3 s |
| Janky frames while hero carousel plays | 47% | < 5% |
| Janky frames on first scroll after launch | 30–54% | < 5% |
| Guest can add to cart | No (login wall) | Yes |
| Location failure has a manual path | No (dead end) | Yes |

Full list: [`docs/findings.md`](docs/findings.md).

**Prototype so far (13 Nov, interim, same emulator):** home drawn in 2–4 s with no blank screen
(Eggoz: products listed after 7 s to more than 12 s, with blank white phases); ~0.2 MB downloaded
at launch with caches cleared vs ~27 MB; carousel worst frame ~0.1 s vs 2.3 s — but carousel jank is still 34–53%, so that target is **not met yet**.
Details: [`docs/measurements.md`](docs/measurements.md).

## Start here (prototype day)

1. Start the Android emulator (1080×2400 Pixel-class image, the one used for the review).
2. Open this folder in Claude Code (or any coding agent) and give it this prompt:

   > Read CLAUDE.md, docs/prototype-spec.md and docs/findings.md. Then build Milestone 1 and stop for review.

3. Work milestone by milestone (M1–M6 in the spec). After each one: run it on the emulator, check
   the screenshots against the findings, commit.
4. At M6, build a release APK and run `scripts/perf/*` against it. Put the results next to the
   "today" numbers in `docs/measurements.md` — that before/after table is the core of the pitch.

## Rebuild the PDF

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
  --allow-file-access-from-files --print-to-pdf="$PWD/docs/Eggoz-App-Review.pdf" \
  "file://$PWD/docs/eggoz-review/report.html"
```

---
Adityan · React Native & Flutter Developer · [adityan-phi.vercel.app/en](https://adityan-phi.vercel.app/en)

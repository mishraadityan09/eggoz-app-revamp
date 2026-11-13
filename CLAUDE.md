# Agent instructions — Eggoz prototype

These instructions are for the AI coding agent working in this repo. They take precedence over any
generic or global agent configuration (e.g. swarm/orchestration templates): **this is a single-agent
project — do not initialise swarms, hive-minds or claude-flow tooling.**

## Context

- Adityan (React Native & Flutter developer) reviewed the Eggoz consumer Android app and sent the
  company a review (`docs/Eggoz-App-Review.pdf`) as part of a job proposal.
- The next step is a **working prototype** that demonstrates the fixes, measured with the same scripts
  as the original app so the improvement shows up in numbers.
- Read before writing any code: `docs/prototype-spec.md` (what to build), `docs/findings.md`
  (why), `mock-data/catalog.json` (content). Reference screenshots: `docs/eggoz-review/screens/`.

## Ground rules

1. **Honesty over polish.** Never invent measurements. Numbers in docs come only from running
   `scripts/perf/*`. If a target is missed, record the real number and say so.
2. **Concept, not a clone.** Label the app "Eggoz — concept redesign" (splash + profile/about).
   - Do **not** use the Eggoz logo artwork or the ambassador/celebrity banner photos, and never
     hotlink Eggoz's CDN or call Eggoz's APIs.
   - **Product photos (decided by Adityan, 13 Nov):** Eggoz's own pack shots, captured from their
     app's product pages/cards, live in `backend/source-images/` and are served — resized — from
     **our** CDN. Private pitch use only. Banners are designed in-app (text + product photo).
   - Product names, prices and copy come from `mock-data/catalog.json` (refreshed from the live app).
3. **Data = our own CDN, everything else mocked.** Products, banners and photos load over the real
   network from `https://eggoz-concept-cdn.vercel.app` (built by `backend/build.mjs`, deployed with
   `cd backend && npm run deploy`). OTP/SMS, serviceability and payments stay local mocks.
   - The **load-test catalog** (`/v1/home-xl.json`, ~480 synthetic products, Profile → "Load test")
     must always be labelled as synthetic in the app and in any pitch material.
   - `vercel link` writes `.env.local` (a token) into `backend/public/`; the build deletes it and
     `.vercelignore` blocks `.env*`. Never deploy or commit it.
4. **Scope = the spec.** Build milestones in order and stop after each for review. Don't add screens
   that aren't in the spec.
5. **Git.** Small commits per milestone, imperative messages. Commits are authored by Adityan only —
   do not add `Co-Authored-By` or "Generated with" trailers. Never commit `.env`, keystores or APKs.

## Stack (keep it Expo Go compatible)

- Expo (latest stable SDK at time of setup) + **JavaScript** (`.js`, JSX allowed — converted from TypeScript at Adityan’s request, 13 Nov) + Expo Router. App lives in `app/`.
  Create it with `npx create-expo-app@latest app` and add packages with `npx expo install <pkg>` so
  versions match the SDK — do not hand-pick versions.
- `react-native-reanimated` + `react-native-gesture-handler` — all animation on the UI thread.
- `react-native-reanimated-carousel` for the hero; if it is incompatible with the installed Reanimated
  version, build the carousel with Reanimated directly (paged scroll + shared value). Either way the
  slide index must **not** live in React state of the home screen.
- `@shopify/flash-list` for every list (home sections, rails, cart).
- `expo-image` for every image (memory-disk cache, placeholder, fixed dimensions).
- `@tanstack/react-query` with `@tanstack/react-query-persist-client` +
  `@tanstack/query-async-storage-persister` + `@react-native-async-storage/async-storage` for
  cache-first data. (Avoid MMKV — not available in Expo Go.)
- `zustand` (persisted to AsyncStorage) for the guest cart and selected address.
- `expo-location`, `expo-splash-screen`, `react-native-safe-area-context`.
- Set `android.package` to `com.adityan.eggozconcept` in `app.json` (the perf scripts need it).

## Code conventions

- Feature folders: `app/src/features/{home,product,cart,location,auth}/`, shared UI in
  `app/src/ui/`, tokens in `app/src/theme/`, mock API in `app/src/api/`.
- Files under ~300 lines; components small and `React.memo`'d when rendered in lists; stable
  callbacks (`useCallback`) and `keyExtractor`s; no inline object/array literals in list item props.
- Colours, spacing, radii and type only from `app/src/theme/tokens.js` (values in the spec). Every
  text/background pair must meet WCAG AA 4.5:1 (3:1 for icons and large text).
- Every touchable: `accessibilityRole`, `accessibilityLabel` when there's no visible text, min 48 dp
  hit area. Banners get a label describing the offer.
- Plain JavaScript: document data shapes with JSDoc (`app/src/api/types.js`), validate all network data at the boundary (`parseHome.js`). Do not reintroduce TypeScript files.

## Commands

```bash
cd app
npx expo start                      # dev, Expo Go / emulator
npx expo lint                       # lint — must pass before every commit
npx expo run:android --variant release   # release build for performance measurement
scripts/build-signed-apk.sh            # (from repo root) signed arm64 APK → app/dist/ — needs app/credentials/ (back it up!)
```

Performance is only meaningful on a **release** build — never measure in dev mode or Expo Go.

## Measuring (Milestone 6)

Scripts assume one emulator at 1080×2400 (same as the review). See `docs/measurements.md`.

```bash
PKG=com.adityan.eggozconcept
scripts/perf/cold-start.sh  $PKG "Best Selling" 3   # launch → home + first-scroll jank
scripts/perf/carousel.sh    $PKG                    # hero carousel idle + swipes (app on home, at top)
scripts/perf/scroll-warm.sh $PKG 2                  # warm feed scroll
scripts/perf/snap.sh  <name> docs/prototype-screens # screenshots for before/after
scripts/perf/launch-timeline.sh $PKG <label> warm <dir>  # 1 frame/s for 12 s + KB received (warm|nocache)
```

Keep a visible **"Best Selling"** heading on the home screen — `cold-start.sh` waits for that text.

## Definition of done (every milestone)

- Lint passes; app runs on the emulator without red/yellow boxes.
- Screens checked against the relevant findings' acceptance criteria in `docs/findings.md`.
- Screenshot of each new screen saved to `docs/prototype-screens/` and eyeballed.
- Committed. Report what was done, what wasn't, and any deviation from the spec.

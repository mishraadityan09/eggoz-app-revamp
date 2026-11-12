# Findings — Eggoz consumer app v1.0.7 (Android)

Reviewed 12 Nov 2026 on an Android 16 emulator (arm64, 1 vCPU, 1080×2400, 420 dpi), guest mode, GPS set to
Gurugram (28.4595, 77.0266). No source code was accessed — causes are inferred and marked
"likely". Raw numbers: [`measurements.md`](measurements.md). Screenshots: `eggoz-review/screens/`.

Severity: **High** blocks orders or shapes the first impression · **Medium** clear friction ·
**Low** polish. Each finding ends with **acceptance criteria** for the prototype.

| ID | Sev | Finding | Screen |
|---|---|---|---|
| P1 | High | Hero carousel is janky (47% janky frames) | Home |
| P2 | High | ~9 s from launch to home content | Launch |
| P3 | High | Blank white screen, then layout shifts while loading | Launch / Home |
| P4 | Medium | First scroll after launch stutters (30–54% janky) | Home |
| U1 | High | Location failure is a dead end | Onboarding |
| U2 | Medium | Location permission asked without context; two system dialogs | Onboarding |
| U3 | High | Login required before Add / Subscribe / Cart / Profile | All |
| U4 | Medium | No delivery address in header | Home |
| U5 | High | Subscribe is an unlabelled calendar icon | Home / Product |
| U6 | Medium | Product cards are very tall (~2 per screen) | Home |
| U7 | Low | Repeated products across sections; half-empty single-card rows | Home |
| U8 | Low | Floating tab bar covers content | Home |
| U9 | Low | Unlabelled "0" (coins) and "₹0" (wallet) badges; coin icon pops in late | Home |
| U10 | High | No sticky price / Add bar on product page | Product |
| U11 | Medium | Subscription offer is passive text, not an action | Product |
| U12 | Low | Duplicated title "(10 pieces) (10 pieces)" | Product |
| U13 | Low | Category screen mostly empty (1 product per category) | Category |
| U14 | Low | Search chips show empty grey circles; empty state unused | Search |
| U15 | Medium | Text contrast below WCAG AA in 5 of 6 samples | Global |
| U16 | Medium | 5 of 18 tappable home elements have no accessibility label | Home |

---

## Performance

### P1 · High — Hero carousel is janky
- **Evidence:** auto-playing untouched (after load): 47.2% janky frames, median 32 ms, p99 150 ms,
  85 of 303 frames "slow UI thread". Manual swipes: 47.0% janky. Feed scroll after load is only
  3.3–3.9% janky, so the problem is concentrated in the carousel. Screenshot: `home.png`.
- **Why it matters:** it's the first and most prominent element, and it carries the offers.
- **Likely causes:** slide/dot index in React state high in the home tree (every auto-advance
  re-renders home); banner images larger than display size; looping/peek slides rendering extra
  full-size images; auto-play starting while home is still mounting.
- **Fix:** Reanimated-driven carousel, dots from a shared value, isolated memoised component,
  display-sized images via expo-image with placeholder + prefetch, autoplay after first render and
  paused off-screen/backgrounded, fixed aspect-ratio container.
- **Acceptance:** `carousel.sh` on the release build → < 5% janky, no frame > 100 ms. React DevTools
  profiler shows zero home re-renders per slide change.

### P2 · High — ~9 s from launch to home content
- **Evidence:** 8.6 s, 9.6 s, 9.6 s across three cold launches (polling until "Best Selling" is on
  screen, ±1 s, includes branded splash). Android vitals treat cold start ≥ 5 s as excessive.
- **Fix:** cache-first home (persisted query → render instantly, refresh in background); keep native
  splash only until first render; lazy-load non-home routes; defer non-critical init.
- **Acceptance:** `cold-start.sh` → home content < 3 s on the second and later launches (cached),
  < 5 s on a first-ever launch with the 1.2 s mock latency.

### P3 · High — Blank white screen, then layout shifts
- **Evidence:** on re-opening from the launcher: fully blank white screen (~4 s), then grey boxes with
  no banner and Add/calendar buttons changing width, then final layout. Screenshots:
  `load-1-blank.png`, `load-2-partial.png`, `load-3-done.png`.
- **Fix:** splash held until first render; skeletons with exact final dimensions for banner, cards,
  badges; images in fixed-size containers.
- **Acceptance:** no frame of the launch is blank white; no element moves when data/images arrive
  (compare consecutive screenshots during load).

### P4 · Medium — First scroll after launch stutters
- **Evidence:** 29.8% / 50.7% / 54.3% janky (median 27–32 ms, p99 101–300 ms) on the first scroll
  after cold launch vs 3.3–3.9% once loaded.
- **Likely cause:** work at mount time — data arriving, images decoding, non-virtualised sections.
- **Fix:** home as one FlashList with section item types; horizontal FlashLists for rails; memoised
  cards; display-sized images.
- **Acceptance:** `cold-start.sh` first-scroll jank < 5%.

## UX — onboarding & location

### U1 · High — Location failure is a dead end
- **Evidence:** declining Google Location Accuracy → "Location unavailable" with only "Try Again".
  Screenshot: `location-unavailable.png`.
- **Fix:** offer "Enter pincode / search address", "Browse products"; fall back to approximate
  location; remember chosen address.
- **Acceptance:** with location denied, user can enter a pincode, see serviceability, and reach home.

### U2 · Medium — Permission without context, two dialogs
- **Evidence:** system permission dialog immediately after "Skip", followed by Google Location
  Accuracy dialog. Screenshots: `permission.png`, `accuracy.png`.
- **Fix:** in-app pre-permission sheet ("We use your location to check delivery to your area") with
  "Use current location" / "Enter pincode"; request accuracy only if a precise fix fails.
- **Acceptance:** no system dialog appears before the user taps "Use current location".

## UX — ordering

### U3 · High — Login required before any purchase action
- **Evidence:** as guest, Add, the calendar (subscribe) icon, Cart tab and Profile tab all open
  "Login to continue". Screenshot: `cart-wall.png`.
- **Fix:** persisted guest cart; login at checkout; OTP screen with auto-read (Android SMS Retriever)
  and Phone Number Hint (mocked in prototype).
- **Acceptance:** guest can add items, change quantities, subscribe, and see a cart total; login is
  asked only on "Checkout".

## UX — home

### U4 · Medium — No delivery address in header
- **Evidence:** header shows "Order before Midnight / Delivery Before Sunrise…" only. `home.png`.
- **Fix:** address chip "Delivering to Sector 29, Gurugram ▾" opening the address/pincode sheet.
- **Acceptance:** address visible on home at all times; tapping it changes the address.

### U5 · High — Subscribe is an unlabelled calendar icon
- **Evidence:** icon-only calendar button next to "Add" on every card and on the product page; no
  text, no accessibility label. (Inferred to be subscribe: the login screen uses the same icon for
  "Daily Subscription"; for guests it opens the login sheet.)
- **Fix:** text button "Subscribe · save 5%".
- **Acceptance:** no icon-only purchase actions anywhere.

### U6 · Medium — Product cards are very tall
- **Evidence:** ~2 cards per screen; large gap between "Earn" badge and buttons. `home.png`.
- **Fix:** compact card — image, name, price per egg, price + MRP, +/− stepper, subscribe link.
- **Acceptance:** ≥ 2.5 cards visible per rail on a 1080-wide screen; no dead vertical space.

### U7 · Low — Repeated products, half-empty rows
- **Evidence:** same SKUs in Best Selling, Protein Plus and White; one-card "Protein Plus" row.
  `home-sections.png`.
- **Fix:** de-duplicate; render single-item sections as a full-width card or merge them.
- **Acceptance:** no SKU appears twice on home; no row is more than half empty.

### U8 · Low — Floating tab bar covers content
- **Fix:** list `contentContainerStyle.paddingBottom` = tab bar height + safe-area inset.
- **Acceptance:** last item fully visible when scrolled to the end.

### U9 · Low — Unlabelled coin/wallet badges
- **Fix:** "0 coins" and "₹0 wallet" labels (or icons + accessible labels); reserve space so the coin
  icon doesn't pop in.
- **Acceptance:** badges understandable without tapping; no layout shift.

## UX — product, category, search

### U10 · High — No sticky price / Add bar
- **Evidence:** after one scroll, price, Add and subscribe are gone. `product-scrolled.png`.
- **Fix:** sticky bottom bar: price, quantity stepper, "Add", "Subscribe & save 5%".
- **Acceptance:** buy actions visible at every scroll position.

### U11 · Medium — Subscription offer is passive text
- **Evidence:** "Subscribe now and get an extra 5% off on this product!" does nothing. `product.png`.
- **Fix:** make it the subscribe action; bottom sheet with frequency (daily / alternate days /
  weekly / custom days), quantity and start date, showing the 5% saving.
- **Acceptance:** subscription can be configured from the product page in ≤ 3 taps.

### U12 · Low — Duplicated title
- **Evidence:** "Eggoz Nutrition Protein Plus Eggs (10 pieces) (10 pieces)".
- **Acceptance:** title built from name + pack size exactly once.

### U13 · Low — Category screen mostly empty
- **Evidence:** one product per category, ~2/3 of screen blank. `category.png`.
- **Fix:** category chips on home + pack-size selector (6 / 10 / 25 / 30) on product page.
- **Acceptance:** prototype has no separate empty category screen.

### U14 · Low — Search empty state
- **Evidence:** popular-search chips show empty grey circles; rest of screen unused. `search.png`.
- **Fix:** recent searches, popular chips with icons, best sellers; instant results while typing.
- **Acceptance (optional screen):** no empty placeholders; results update per keystroke.

## Accessibility

### U15 · Medium — Contrast below WCAG AA (4.5:1)
| Element | Measured | Fix | New |
|---|---|---|---|
| White on orange buttons `#FF8C66` | 2.28:1 | `#C2410C` fill, or `#1C1917` text on `#FF8C66` | 5.18 / 7.66 |
| Orange "Add" label on white | 2.28:1 | `#C2410C` | 5.18 |
| "Earn" badge text `#D6AA4C` on `#FCF8E1` | 2.02:1 | `#8A6512` | 4.97 |
| Search placeholder `#B3B3B3` | 2.10:1 | `#767676` | 4.54 |
| Price-per-piece grey `#808080` | 3.95:1 | `#6B6B6B` | 5.33 |
- **Acceptance:** every text/background token pair ≥ 4.5:1 (icons ≥ 3:1); verify with
  `scripts/perf/contrast.py` on prototype screenshots.

### U16 · Medium — Missing accessibility labels
- **Evidence:** UI dump of home: 5 of 18 clickable nodes have no text or content-desc — the three
  carousel banners and both calendar buttons.
- **Acceptance:** UI dump (`adb shell uiautomator dump`) of each prototype screen has zero clickable
  nodes without text or content-desc.

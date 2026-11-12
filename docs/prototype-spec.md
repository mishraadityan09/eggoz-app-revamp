# Prototype spec — "Eggoz, concept redesign"

A focused React Native prototype that shows Eggoz what their app could feel like. It is a **pitch
artefact**: three core screens done very well, fast and measurable — not a full app.

Every item below references a finding ID from [`findings.md`](findings.md). Content comes from
[`../mock-data/catalog.json`](../mock-data/catalog.json). Stack and conventions: [`../CLAUDE.md`](../CLAUDE.md).

## Success = the before/after table

The prototype succeeds when `docs/measurements.md` → "Prototype — results" is filled with real numbers
that hit the targets (carousel and first-scroll jank < 5%, home < 3 s cached, no blank screen,
0 contrast failures, 0 unlabelled controls) and the screens visibly fix U1–U16.

## Screens & navigation

Bottom tabs (floating style allowed, but content must never sit under it — U8): **Home · Search · Cart · Profile**.
No separate Category tab (U13). Product is a stack screen. Location and Subscribe are bottom sheets.

### 0. Launch & location (P2, P3, U1, U2)
- Native splash (cream `#FDF8E9`, text wordmark "Eggoz" + small "concept redesign") held until the
  first home render — then cross-fade. Never a blank white frame.
- First launch only: **pre-permission sheet** over home skeleton —
  "Check delivery to your area" · [Use current location] · [Enter pincode] · "Browse without location".
- Use current location → `expo-location` permission → reverse-geocode (mock: any coords → "Sector 29, Gurugram").
- Denied / failed / timed out (5 s) → pincode sheet, never a dead end.
- Pincode sheet: 6-digit input, mock serviceability: `122xxx`, `110xxx`, `201xxx` serviceable; else
  "We don't deliver here yet — browse anyway / notify me".
- Selected address persisted (zustand + AsyncStorage).

### 1. Home (P1, P3, P4, U4, U5, U6, U7, U8, U9, U15, U16)
One vertical **FlashList** with item types, in this order:
1. **Header** (orange `#F7B045` background):
   - Address chip "Delivering to **Sector 29, Gurugram** ▾" → location sheet (U4).
   - "Order by midnight · delivered before sunrise" as secondary line.
   - Right: "**0** coins" and "**₹0** wallet" pills with labels; fixed size, no pop-in (U9).
   - Search bar (placeholder "Search for brown eggs", `#767676`) → Search tab.
2. **Hero carousel** (P1): 3 banners from catalog, fixed 16:9-ish aspect ratio, 16 px side
   margins, peek optional. Auto-play every 4 s, starts only after first render, pauses when scrolled
   off-screen or app backgrounded, pauses while user touches. Dots driven by a shared value.
   Banners are designed in-app (text + royalty-free egg image) — no celebrity photos. Each banner has
   `accessibilityLabel` = the offer text (U16).
3. **Category chips**: Protein Plus · White · Brown · Subscribe & Save (filter the rails below) (U13).
4. **"Best Selling"** rail — keep this exact heading text (perf scripts wait for it).
5. **"Protein Plus"** and **"White"** rails — no SKU repeated across rails (U7); a section with a
   single product renders as one full-width card, not a half-empty row.
6. Bottom spacer = tab bar height + safe-area inset (U8).

**Product card (compact, U6):** fixed width ~42% of screen so 2.3–2.5 cards show; image 1:1 in fixed
box (expo-image, placeholder colour); size badge (M/L/XL); name (2 lines max); "₹13.8 / egg";
price **₹138** + struck MRP ₹189 + "27% off"; "Earn 5 coins" (`#8A6512` on `#FCF8E1`);
**+/− stepper** (shows "Add" at 0); text link **"Subscribe · save 5%"** (U5). Memoised.

**Loading (P3):** skeletons with exact final dimensions for header pills, banner, chips, cards.
Data is cache-first: persisted react-query cache renders instantly on later launches; mock API latency
800–1200 ms on cold cache.

### 2. Product (U5, U10, U11, U12, U13, U15)
- Image gallery (paged, max 5 dots), size badge.
- Title = `name` + " (" + packSize + " pieces)" — exactly once (U12).
- **Pack-size selector**: segmented control of available pack sizes for that line (U13).
- Price block: ₹138 · ~~₹189~~ · "₹51 off" · ₹13.8/egg · "Earn 5 coins with this pack".
- Subscription card is an action: "Subscribe & save 5% — ₹131/delivery" → opens subscribe sheet (U11).
- Nutrition facts (4 tiles), trust cards (Local farms · 13 g protein / 100 g · 11 safety checks),
  "Product information" accordion — copy from catalog.
- **Sticky bottom bar** (U10): price + stepper + [Add to cart] + [Subscribe]; respects safe-area.
- **Subscribe sheet:** frequency (Daily · Alternate days · Weekly · Pick days), quantity, start date
  (tomorrow default), per-delivery price with 5% off, monthly estimate; [Subscribe] adds a
  subscription line to the cart.

### 3. Cart (U3)
- Works for guests (persisted). Empty state with best sellers.
- Lines: image, name, pack, stepper, price; subscription lines show frequency + "5% off" tag.
- Delivery: "Tomorrow, before 7 AM" + address chip (changeable).
- Coins toggle ("Use 0 coins" disabled state), bill summary (item total, discount, delivery, to pay).
- Sticky [Login to checkout] → **mock OTP flow**: phone number (with "Use number from this device"
  hint button, mocked), 6-box OTP with "Auto-reading OTP…" (mock fills after 2 s), success →
  "Order placed (demo)". No real SMS.

### 4. Search (optional, U14) & Profile (minimal)
- Search: recent searches, popular chips (with real icons), best sellers; filter as you type.
- Profile: guest state with "Log in" + "About this concept" (states it's an unofficial redesign by
  Adityan, links portfolio).

## Design tokens (`app/src/theme/tokens.ts`)

Observed brand colours, with accessible variants where the originals fail contrast (U15):

| Token | Value | Use |
|---|---|---|
| `brand.header` | `#F7B045` | Header background (text on it: `ink.primary`) |
| `brand.orange` | `#FF8C66` | Fills/illustration only — **never** with white text |
| `brand.orangeStrong` | `#C2410C` | Primary buttons (white text 5.18:1), "Add" labels, links |
| `brand.cream` | `#FDF8E9` | Splash, onboarding sheets |
| `surface.page` | `#F5F7FA` | Screen background |
| `surface.card` | `#FFFFFF` | Cards; border `#EBEBEB` |
| `ink.primary` | `#1A1A1A` | Primary text |
| `ink.secondary` | `#6B6B6B` | Secondary text (5.33:1) |
| `ink.placeholder` | `#767676` | Placeholders (4.54:1) |
| `accent.subscribe` | `#2B7387` | Subscribe text/links (≈5.4:1); icons ≥ 3:1 |
| `reward.bg` / `reward.ink` | `#FCF8E1` / `#8A6512` | Coins badges (4.97:1) |
| `state.discount` | `#C2410C` | "₹51 off" |

Spacing 4/8/12/16/24/32; radii 8 (chips), 12 (cards), 20 (sheets); type: system font, 12/14/16/20/28,
weights 400/600/700. Touch targets ≥ 48 dp.

## Milestones (stop for review after each)

| # | Deliverable | Findings |
|---|---|---|
| M1 | Expo app in `app/`, tabs + product stack, tokens, mock API (latency), react-query persist, zustand stores, splash | P2, P3 |
| M2 | Home: header, hero carousel, chips, rails, compact cards, skeletons | P1, P3, P4, U4–U9, U16 |
| M3 | Product page: gallery, pack sizes, sticky bar, subscribe sheet | U5, U10–U13 |
| M4 | Guest cart + mock login-at-checkout with OTP auto-fill | U3 |
| M5 | Launch/location flow: pre-permission, pincode, browse anyway | U1, U2 |
| M6 | Release build; run all perf scripts (≥ 3 runs); contrast + UI-dump checks; screenshots; fill measurements table | all |
| M7 (optional) | Search, profile/about, 60–90 s screen recording of the demo flow | U14 |

## Out of scope
Real backend, payments, real OTP/SMS, push notifications, wallet top-up, order history, iOS
polish (must run, but measure on Android only), Flutter version.

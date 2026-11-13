import { Dimensions } from 'react-native';

import { space } from '@/theme/tokens';

/**
 * Fixed geometry shared by real content and skeletons, so nothing moves when data
 * arrives (finding P3). Portrait-only app, so window width is read once.
 */
const { width: SCREEN_W } = Dimensions.get('window');

export const SIDE = space.lg;
export const BANNER_W = SCREEN_W - SIDE * 2;
export const BANNER_H = Math.round(BANNER_W * 0.42);
export const BANNER_GAP = space.md;
export const DOTS_H = 20;
/** Full height of the hero carousel row in the feed (and its skeleton). */
export const CAROUSEL_H = space.lg + BANNER_H + DOTS_H + space.sm;

export const CARD_W = Math.round(SCREEN_W * 0.42); // ~2.3 cards visible (finding U6)
export const CARD_PAD = space.md;
export const CARD_IMAGE = CARD_W - CARD_PAD * 2;
export const CARD_GAP = space.md;

// Fixed text-row heights inside the card.
export const ROW = { name: 40, perEgg: 18, price: 24, earn: 22, stepper: 40, schedule: 32 };

/** One gap between every row of the card — consistent rhythm, exact height. */
export const CARD_ROW_GAP = space.sm;
const CARD_ROWS = [CARD_IMAGE, ROW.name, ROW.perEgg, ROW.price, ROW.earn, ROW.stepper, ROW.schedule];

export const CARD_H = CARD_PAD * 2 + CARD_ROWS.reduce((sum, h) => sum + h, 0) + CARD_ROW_GAP * (CARD_ROWS.length - 1);

export const SECTION_TITLE_H = 48;

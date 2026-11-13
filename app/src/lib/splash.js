import * as SplashScreen from 'expo-splash-screen';

let hidden = false;

/**
 * Keep the native splash up until a real screen has content (finding P3: never a
 * blank white frame). Must run at module scope, before the first render.
 */
export function holdSplash() {
  SplashScreen.preventAutoHideAsync().catch(() => undefined);
  SplashScreen.setOptions({ duration: 250 });
}

/** Called by the first screen that renders meaningful content. Idempotent. */
export function hideSplash() {
  if (hidden) return;
  hidden = true;
  SplashScreen.hide();
}

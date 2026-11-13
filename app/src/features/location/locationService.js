import * as Location from 'expo-location';
import { Linking } from 'react-native';

const POSITION_TIMEOUT_MS = 8000;
// A delivery-area check doesn't need a fresh fix: a recent last-known position is enough.
const LAST_KNOWN_MAX_AGE_MS = 30 * 60 * 1000;

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve('timeout'), ms))]);
}

const toCoords = (c) => ({
  latitude: c.latitude,
  longitude: c.longitude,
});

/**
 * Asks for permission only when the user has tapped "Use my current location"
 * (finding U2). Never triggers Google's "Location Accuracy" dialog on its own
 * (`mayShowUserSettingsDialog: false`) and never hangs: every outcome maps to a
 * result the UI can act on (finding U1).
 */
export async function getDeviceLocation() {
  try {
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
      if (!permission.canAskAgain) return { kind: 'blocked' };
      permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) return { kind: permission.canAskAgain ? 'denied' : 'blocked' };
    }

    if (!(await Location.hasServicesEnabledAsync())) return { kind: 'servicesOff' };

    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: LAST_KNOWN_MAX_AGE_MS,
      requiredAccuracy: 2000,
    });
    if (lastKnown) return { kind: 'ok', coords: toCoords(lastKnown.coords) };

    // One-shot request: High lets the fused provider use GPS as well as Wi-Fi/cell,
    // so it also works where network location is unavailable.
    const current = await withTimeout(
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: false,
      }),
      POSITION_TIMEOUT_MS,
    );
    if (current === 'timeout') return { kind: 'timeout' };
    return { kind: 'ok', coords: toCoords(current.coords) };
  } catch {
    return { kind: 'failed' };
  }
}

/** User-initiated only: shows the system dialog to turn location services on. */
export async function turnOnLocationServices() {
  try {
    await Location.enableNetworkProviderAsync();
    return true;
  } catch {
    return false;
  }
}

export function openAppSettings() {
  void Linking.openSettings();
}

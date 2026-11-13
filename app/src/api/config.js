import Constants from 'expo-constants';

/**
 * Base URL of the prototype CDN (static API + images).
 * Dev override: EXPO_PUBLIC_API_BASE=http://localhost:8787 npx expo start
 * Release: `extra.apiBaseUrl` in app.json.
 */
const fromEnv = process.env.EXPO_PUBLIC_API_BASE;
const fromConfig = Constants.expoConfig?.extra?.apiBaseUrl;

export const API_BASE = (fromEnv ?? (typeof fromConfig === 'string' ? fromConfig : '')).replace(/\/$/, '');

export const REQUEST_TIMEOUT_MS = 10_000;

import { API_BASE, REQUEST_TIMEOUT_MS } from './config';
import { parseHome } from './parseHome';

export class NetworkError extends Error {}

async function getJson(path) {
  if (!API_BASE) throw new NetworkError('API base URL is not configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!res.ok) throw new NetworkError(`${path} responded ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err instanceof NetworkError) throw err;
    throw new NetworkError(controller.signal.aborted ? `${path} timed out` : `${path} failed`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Real network request to the prototype CDN. Photos are not prefetched here: FlashList
 * already renders nearby rows, and a parallel prefetch of the same URL was measured to
 * download those photos twice.
 */
export async function fetchHome(dataset = 'real') {
  const path = dataset === 'xl' ? '/v1/home-xl.json' : '/v1/home.json';
  return parseHome(await getJson(path), API_BASE);
}

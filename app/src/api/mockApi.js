/**
 * Local mocks for the parts that would need a real backend we don't have: OTP and
 * delivery serviceability. Products and images come from the real CDN (remoteApi.ts).
 * Calls have artificial latency so loading states are visible. Nothing leaves the device.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const networkLatency = () => 600 + Math.round(Math.random() * 600);

/** Demo OTP — the OTP screen "auto-reads" this to simulate the SMS Retriever API. */
export const DEMO_OTP = '482913';

export async function requestOtp(phone) {
  await sleep(networkLatency());
  return { requestId: `otp-${phone.slice(-4)}-${Date.now()}` };
}

export async function verifyOtp(_requestId, code) {
  await sleep(700);
  return code === DEMO_OTP;
}

// --- Serviceability ---------------------------------------------------------

const ZONES = [
  {
    prefix: '122',
    city: 'Gurugram',
    center: { latitude: 28.4595, longitude: 77.0266 },
    gpsAddress: { label: 'Sector 29, Gurugram', city: 'Gurugram', pincode: '122001' },
  },
  {
    prefix: '110',
    city: 'New Delhi',
    center: { latitude: 28.6139, longitude: 77.209 },
    gpsAddress: { label: 'Connaught Place, New Delhi', city: 'New Delhi', pincode: '110001' },
  },
  {
    prefix: '201',
    city: 'Noida',
    center: { latitude: 28.5355, longitude: 77.391 },
    gpsAddress: { label: 'Sector 18, Noida', city: 'Noida', pincode: '201301' },
  },
];

const SERVICE_RADIUS_KM = 25;

function distanceKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function isValidPincode(pin) {
  return /^[1-9]\d{5}$/.test(pin);
}

export async function checkPincode(pin) {
  await sleep(700);
  const zone = ZONES.find((z) => pin.startsWith(z.prefix));
  if (!zone) return { serviceable: false, pincode: pin, place: `pincode ${pin}` };
  return {
    serviceable: true,
    address: { label: `${zone.city} ${pin}`, city: zone.city, pincode: pin, source: 'pincode' },
  };
}

export async function reverseGeocode(coords) {
  await sleep(500);
  const nearest = ZONES.map((z) => ({ z, d: distanceKm(coords, z.center) })).sort((a, b) => a.d - b.d)[0];
  if (!nearest || nearest.d > SERVICE_RADIUS_KM) {
    return { serviceable: false, pincode: null, place: 'your current location' };
  }
  return { serviceable: true, address: { ...nearest.z.gpsAddress, source: 'gps' } };
}

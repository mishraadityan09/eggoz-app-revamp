/** Indian mobile numbers: 10 digits starting with 6–9. */
export function isValidIndianMobile(digits) {
  return /^[6-9]\d{9}$/.test(digits);
}

export function formatIndianMobile(digits) {
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : `+91 ${digits}`;
}

/** Stands in for Android's Phone Number Hint API in the prototype. */
export const DEMO_DEVICE_NUMBER = '9876543210';

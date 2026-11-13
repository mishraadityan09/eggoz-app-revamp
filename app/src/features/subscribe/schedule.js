/** Delivery schedules (Eggoz's calendar / subscription feature). */

export const FREQUENCIES = [
  { id: 'daily', label: 'Daily', short: 'Daily', perMonth: 30 },
  { id: 'alternate', label: 'Alternate days', short: 'Alt. days', perMonth: 15 },
  { id: 'weekdays', label: 'Mon–Fri', short: 'Mon–Fri', perMonth: 22 },
  { id: 'weekends', label: 'Sat & Sun', short: 'Sat & Sun', perMonth: 8 },
];

export function frequencyShort(f) {
  return FREQUENCIES.find((x) => x.id === f)?.short ?? f;
}

export const SUBSCRIPTION_DISCOUNT = 0.05;

export function frequencyLabel(f) {
  return FREQUENCIES.find((x) => x.id === f)?.label ?? f;
}

export function pricing(unitPrice, packs, frequency) {
  const full = unitPrice * packs;
  const perDelivery = Math.round(full * (1 - SUBSCRIPTION_DISCOUNT));
  const perMonth = FREQUENCIES.find((x) => x.id === frequency)?.perMonth ?? 0;
  return { perDelivery, savedPerDelivery: full - perDelivery, monthly: perDelivery * perMonth, deliveries: perMonth };
}

/** Next `days` start dates, beginning tomorrow (orders before midnight arrive next morning). */
export function startDates(days = 7, from = new Date()) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() + i + 1);
    const label = i === 0 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    return { iso: d.toISOString().slice(0, 10), label };
  });
}

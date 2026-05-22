// All timestamps across the app are shown in Nigerian time — West Africa Time
// (Africa/Lagos, UTC+1, no DST) — and in 12-hour format, regardless of the
// viewer's own timezone.
const TIME_ZONE = 'Africa/Lagos';
const LOCALE = 'en-GB'; // day-first dates (e.g. 21 May 2026)

function toDate(input?: string | number | Date | null): Date | null {
  if (input === undefined || input === null || input === '') return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** e.g. "21 May 2026" (Lagos time). */
export function formatDate(input?: string | number | Date | null): string {
  const d = toDate(input);
  if (!d) return '—';
  return d.toLocaleDateString(LOCALE, {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** e.g. "21 May 2026, 8:20 pm" (Lagos time, 12-hour). */
export function formatDateTime(input?: string | number | Date | null): string {
  const d = toDate(input);
  if (!d) return '—';
  return d.toLocaleString(LOCALE, {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** e.g. "8:20 pm" (Lagos time, 12-hour). */
export function formatTime(input?: string | number | Date | null): string {
  const d = toDate(input);
  if (!d) return '—';
  return d.toLocaleTimeString(LOCALE, {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Current hour (0–23) in Nigerian time — for time-of-day greetings. */
export function currentHourInLagos(): number {
  const h = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    hour12: false,
  }).format(new Date());
  return parseInt(h, 10) % 24;
}

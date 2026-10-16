export const TIMEZONE_WIB = "Asia/Jakarta";
export const LOCALE_ID = "id-ID";

function toValidDate(date: Date | string | number | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === "object" ? date : new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format tanggal dalam bahasa Indonesia
 * Contoh: "16 Oktober 2026"
 */
export function formatTanggal(date: Date | string | number | null | undefined): string {
  const d = toValidDate(date);
  if (!d) return "-";

  return new Intl.DateTimeFormat(LOCALE_ID, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE_WIB,
  }).format(d);
}

/**
 * Format tanggal dan jam dalam bahasa Indonesia dengan penanda WIB
 * Contoh: "16 Oktober 2026, 14:30 WIB"
 */
export function formatTanggalDanJam(date: Date | string | number | null | undefined): string {
  const d = toValidDate(date);
  if (!d) return "-";

  const datePart = formatTanggal(d);
  const timePart = new Intl.DateTimeFormat(LOCALE_ID, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIMEZONE_WIB,
  })
    .format(d)
    .replace(".", ":");

  return `${datePart}, ${timePart} WIB`;
}

/**
 * Format jam saja dengan penanda WIB
 * Contoh: "14:30 WIB"
 */
export function formatJam(date: Date | string | number | null | undefined): string {
  const d = toValidDate(date);
  if (!d) return "-";

  const timePart = new Intl.DateTimeFormat(LOCALE_ID, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIMEZONE_WIB,
  })
    .format(d)
    .replace(".", ":");

  return `${timePart} WIB`;
}
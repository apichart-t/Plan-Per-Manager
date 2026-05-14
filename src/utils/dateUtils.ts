/**
 * dateUtils.ts — จัดการรูปแบบวันที่ภาษาไทย (ปฏิทินพุทธศักราช)
 *
 * หมายเหตุ: Intl.DateTimeFormat('th-TH', { calendar: 'buddhist' })
 * แปลงปีให้เป็น พ.ศ. อัตโนมัติ (ค.ศ. + 543)
 * Input ควรเป็น ISO string (ค.ศ.) เช่น "2026-05-11" หรือ "2026-05-11T00:00:00Z"
 */

// ── Internal helper ───────────────────────────────────────────

function parseDate(input: string | Date | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  // "YYYY-MM" → first day of month
  if (/^\d{4}-\d{2}$/.test(input)) {
    const [year, month] = input.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  // ISO strings & standard date strings
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

// ── Shared formatter options ──────────────────────────────────

const BASE_OPTIONS: Intl.DateTimeFormatOptions = {
  calendar: "buddhist",
};

// ── Exports ───────────────────────────────────────────────────

/**
 * รูปแบบเต็ม: วันจันทร์ที่ 11 พฤษภาคม 2569
 */
export function formatDateThai(input: string | Date | undefined): string {
  const date = parseDate(input);
  if (!date) return typeof input === "string" ? input : "";

  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    ...BASE_OPTIONS,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * รูปแบบย่อ: 11 พ.ค. 2569
 */
export function formatShortDateThai(input: string | Date | undefined): string {
  const date = parseDate(input);
  if (!date) return typeof input === "string" ? input : "";

  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    ...BASE_OPTIONS,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * รูปแบบเดือนและปี: พฤษภาคม 2569
 */
export function formatMonthYearThai(input: string | Date | undefined): string {
  const date = parseDate(input);
  if (!date) return typeof input === "string" ? input : "";

  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    ...BASE_OPTIONS,
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * แปลง Date → "YYYY-MM" (ค.ศ.) สำหรับใช้เป็น key ใน DB
 */
export function toMonthYearKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * แปลง "YYYY-MM" → Date (วันที่ 1 ของเดือนนั้น ค.ศ.)
 */
export function fromMonthYearKey(key: string): Date | null {
  return parseDate(key);
}

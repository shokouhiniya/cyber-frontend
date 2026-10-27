import dayjs from 'dayjs';
import jalaliday from 'jalaliday';

// ----------------------------------------------------------------------
// Jalali ⇄ Gregorian for date inputs. Stored dates are Gregorian calendar
// days (YYYY-MM-DD); admins type and read them as Jalali (۱۴۰۵/۰۸/۰۵).
// The app sets dayjs' default calendar to Jalali (format-time.js), so every
// conversion here names its calendar explicitly.
// ----------------------------------------------------------------------

dayjs.extend(jalaliday);

const FA = '۰۱۲۳۴۵۶۷۸۹';
const AR = '٠١٢٣٤٥٦٧٨٩';

/** Persian / Arabic digits → Latin, and common separators → «/». */
export function normaliseDateText(text) {
  return String(text ?? '')
    .replace(/[۰-۹]/g, (d) => FA.indexOf(d))
    .replace(/[٠-٩]/g, (d) => AR.indexOf(d))
    .replace(/[-.\s]+/g, '/')
    .trim();
}

/** '2026-10-27' → '1405/08/05' ('' for empty / invalid). */
export function gregorianToJalali(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}/.test(ymd)) return '';
  const d = dayjs(`${ymd.slice(0, 10)}T12:00:00`);
  return d.isValid() ? d.calendar('jalali').format('YYYY/MM/DD') : '';
}

/**
 * '1405/8/5' (any digits) → '2026-10-27'; null when it isn't a real Jalali day
 * (month 1–12, day within that month).
 */
export function jalaliToGregorian(text) {
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(normaliseDateText(text));
  if (!m) return null;
  const [, y, mo, da] = m.map(Number);
  const d = dayjs(`${y}/${mo}/${da}`, { jalali: true });
  if (!d.isValid()) return null;
  // Reject overflow (e.g. 1405/07/31 rolls into the next month)
  if (d.calendar('jalali').format('YYYY/M/D') !== `${y}/${mo}/${da}`) return null;
  return d.calendar('gregory').format('YYYY-MM-DD');
}

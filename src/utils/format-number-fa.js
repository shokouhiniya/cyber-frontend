// ----------------------------------------------------------------------
// Persian number formatting — use these everywhere a number is shown to the
// user so digits, separators and units are consistent across the dashboard.
// ----------------------------------------------------------------------

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

const intFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 });

function toNumber(value) {
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
}

/** Replace Latin digits in any string with Persian digits. */
export function toFaDigits(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[d]);
}

/** 12345 → ۱۲٬۳۴۵ */
export function fNum(value) {
  const n = toNumber(value);
  return n === null ? '—' : intFormatter.format(n);
}

/** 1234 → ۱٫۲ هزار · 3400000 → ۳٫۴ میلیون · 950 → ۹۵۰ */
export function fShort(value) {
  const n = toNumber(value);
  if (n === null) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${decimalFormatter.format(n / 1_000_000_000)} میلیارد`;
  if (abs >= 1_000_000) return `${decimalFormatter.format(n / 1_000_000)} میلیون`;
  if (abs >= 10_000) return `${intFormatter.format(n / 1_000)} هزار`;
  if (abs >= 1_000) return `${decimalFormatter.format(n / 1_000)} هزار`;
  return intFormatter.format(n);
}

/** 45 → ۴۵٪ (value is already a percentage, not a ratio) */
export function fPercent(value, { decimals = 0 } = {}) {
  const n = toNumber(value);
  if (n === null) return '—';
  const formatter = decimals
    ? new Intl.NumberFormat('fa-IR', { maximumFractionDigits: decimals })
    : intFormatter;
  return `${formatter.format(n)}٪`;
}

/** Signed change: 12 → +۱۲٪ · -3 → −۳٪ */
export function fDelta(value) {
  const n = toNumber(value);
  if (n === null) return '—';
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}${intFormatter.format(Math.abs(n))}٪`;
}

/** Date → ۱۴۰۵/۰۸/۰۴ (Jalali) */
export function fDateFa(value, options = { year: 'numeric', month: '2-digit', day: '2-digit' }) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fa-IR', options);
}

/** Date → «۳ ساعت پیش» */
export function fRelativeFa(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMin = Math.round((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return 'همین الان';
  if (diffMin < 60) return `${intFormatter.format(diffMin)} دقیقه پیش`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${intFormatter.format(diffH)} ساعت پیش`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `${intFormatter.format(diffD)} روز پیش`;
  return fDateFa(d);
}

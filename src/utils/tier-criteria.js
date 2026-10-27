import { fNum } from './format-number-fa';

// ----------------------------------------------------------------------
// Ingest tier (set by an admin) and its volume criterion. The backend
// suggests a tier from the 8tag mention volume (platform_totals, week ÷ 7 or
// month ÷ 30): heavy > 10,000 / day, medium 500–10,000, light < 500.
// ----------------------------------------------------------------------

export const TIER_META = {
  heavy: { label: 'سنگین', color: 'error', criterion: 'بیش از ۱۰ هزار پست در روز' },
  medium: { label: 'متوسط', color: 'warning', criterion: 'بین ۵۰۰ تا ۱۰ هزار پست در روز' },
  light: { label: 'سبک', color: 'success', criterion: 'کمتر از ۵۰۰ پست در روز' },
};

const BASIS_LABEL = { week: 'هفته اخیر', month: 'ماه اخیر' };

/**
 * `suggestion` = { suggested, avgDailyMentions, basis } from the API.
 * → «پیشنهاد سامانه: متوسط — میانگین ۲٬۴۰۰ پست در روز»
 */
export function tierSuggestionText(suggestion) {
  if (!suggestion?.suggested) return 'پیشنهاد سامانه: هنوز آمار حجم انتشار از ۸تگ دریافت نشده است';
  const meta = TIER_META[suggestion.suggested];
  return `پیشنهاد سامانه: ${meta?.label ?? suggestion.suggested} — میانگین ${fNum(suggestion.avgDailyMentions)} پست در روز`;
}

/** «بر اساس آمار ۸تگ در هفته اخیر» */
export function tierSuggestionBasis(suggestion) {
  return suggestion?.basis ? `بر اساس شمار کل پست‌های ۸تگ در ${BASIS_LABEL[suggestion.basis] ?? suggestion.basis}` : '';
}

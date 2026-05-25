import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const SEVERITY = {
  high:   { color: '#FF6B6B', label: 'بحرانی',   icon: 'solar:danger-triangle-bold-duotone' },
  medium: { color: '#FFA94D', label: 'مهم',       icon: 'solar:shield-warning-bold-duotone' },
  low:    { color: '#51CF66', label: 'قابل توجه', icon: 'solar:info-circle-bold-duotone' },
};

export function SectionLabel({ icon, label, color }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
      <Iconify icon={icon} width={14} sx={{ color: color || theme.palette.text.secondary }} />
      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10, color: color || 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
    </Stack>
  );
}

/**
 * Parses a raw macro-context value which may be:
 *   1. A plain JSON string → returns [{ date: null, parsed }]
 *   2. A multi-day log separated by "--- YYYY/MM/DD ---" headers, where each
 *      segment is either JSON or plain text → returns array of { date, parsed, raw }
 *      ordered newest-first.
 */
export function parseMacroValue(raw) {
  if (!raw) return [];

  // Split on date headers like "--- ۱۴۰۵/۰۳/۳۱ ---"
  const segments = raw.split(/---\s*[\d۰-۹/]+\s*---/).map((s) => s.trim()).filter(Boolean);

  // Extract date headers in order
  const dateMatches = [...raw.matchAll(/---\s*([\d۰-۹/]+)\s*---/g)].map((m) => m[1]);

  if (segments.length === 0) return [];

  // If no date headers found, treat the whole thing as a single entry
  if (dateMatches.length === 0) {
    try {
      return [{ date: null, parsed: JSON.parse(raw), raw }];
    } catch {
      return [{ date: null, parsed: null, raw }];
    }
  }

  // Pair each segment with its date header (segments may outnumber dates by 1 if
  // there's content before the first header — we skip that)
  const result = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const date = dateMatches[i] || null;
    let parsed = null;
    try { parsed = JSON.parse(seg); } catch { /* plain text */ }
    result.push({ date, parsed, raw: seg });
  }

  // Return newest-first (last date header = most recent)
  return result.reverse();
}

/**
 * Renders a parsed macro-politics JSON object in a structured, readable layout.
 * Used by both the analytics MacroContext widget and the admin global-context view.
 */
export function MacroParsedContent({ parsed }) {
  const theme = useTheme();

  if (!parsed) return null;

  return (
    <Stack spacing={2}>
      {/* Events */}
      {parsed.events?.length > 0 && (
        <Box>
          <SectionLabel icon="solar:calendar-bold-duotone" label="رویدادها" />
          <Stack spacing={0.75}>
            {parsed.events.map((ev, i) => {
              const sev = SEVERITY[ev.severity] || SEVERITY.medium;
              return (
                <Stack key={i} direction="row" alignItems="flex-start" spacing={1}
                  sx={{ p: 1.25, borderRadius: 1.5, bgcolor: alpha(sev.color, 0.05), borderRight: `3px solid ${sev.color}` }}>
                  <Iconify icon={sev.icon} width={16} sx={{ color: sev.color, mt: 0.2, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, display: 'block' }}>{ev.title}</Typography>
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.5 }}>{ev.summary}</Typography>
                    {ev.actor && (
                      <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled', display: 'block', mt: 0.25 }}>
                        {ev.actor}
                      </Typography>
                    )}
                  </Box>
                  <Chip label={sev.label} size="small" sx={{ height: 18, fontSize: 8, fontWeight: 700, flexShrink: 0, bgcolor: alpha(sev.color, 0.12), color: sev.color }} />
                </Stack>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Tensions */}
      {parsed.tensions && (
        <>
          <Divider sx={{ opacity: 0.4 }} />
          <Box>
            <SectionLabel icon="solar:danger-bold-duotone" label="تنش‌ها" color={theme.palette.error.main} />
            <Stack spacing={0.5}>
              {[
                { key: 'domestic', label: 'داخلی',   icon: 'solar:home-bold',  color: '#868E96' },
                { key: 'foreign',  label: 'خارجی',   icon: 'solar:global-bold', color: '#4DABF7' },
                { key: 'economic', label: 'اقتصادی', icon: 'solar:chart-bold',  color: '#FFA94D' },
              ].map(({ key, label, icon, color }) => parsed.tensions[key] ? (
                <Stack key={key} direction="row" alignItems="flex-start" spacing={1} sx={{ py: 0.5 }}>
                  <Iconify icon={icon} width={13} sx={{ color, mt: 0.3, flexShrink: 0 }} />
                  <Box>
                    <Typography component="span" variant="caption" sx={{ fontWeight: 700, fontSize: 10, color }}>{label}: </Typography>
                    <Typography component="span" variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>{parsed.tensions[key]}</Typography>
                  </Box>
                </Stack>
              ) : null)}
            </Stack>
          </Box>
        </>
      )}

      {/* Media atmosphere */}
      {parsed.media_atmosphere && (
        <>
          <Divider sx={{ opacity: 0.4 }} />
          <Box>
            <SectionLabel icon="solar:tv-bold-duotone" label="فضای رسانه" />
            <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.6 }}>
              {parsed.media_atmosphere}
            </Typography>
          </Box>
        </>
      )}

      {/* Forecast */}
      {parsed.forecast && (
        <>
          <Divider sx={{ opacity: 0.4 }} />
          <Box>
            <SectionLabel icon="solar:clock-circle-bold-duotone" label="پیش‌بینی ۴۸ ساعت" color={theme.palette.warning.main} />
            <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.6 }}>
              {parsed.forecast}
            </Typography>
          </Box>
        </>
      )}
    </Stack>
  );
}

/**
 * Renders a raw macro value (single JSON or multi-day log) using the best
 * available format. Shows the most recent day's structured content.
 * Falls back to plain text for segments that aren't JSON.
 */
export function MacroRawContent({ raw }) {
  const segments = parseMacroValue(raw);
  if (segments.length === 0) return null;

  // Show only the most recent segment (already sorted newest-first)
  const latest = segments[0];

  if (latest.parsed) {
    return <MacroParsedContent parsed={latest.parsed} />;
  }

  // Plain text fallback — strip citation brackets like [1], [8]
  const cleaned = (latest.raw || raw)
    .replace(/\[\d+\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return (
    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 2, fontSize: 11, color: 'text.primary', direction: 'rtl' }}>
      {cleaned}
    </Typography>
  );
}

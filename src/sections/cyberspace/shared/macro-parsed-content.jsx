import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { toFaDigits } from 'src/utils/format-number-fa';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/** Event severity → theme palette key, label and icon. */
export const SEVERITY = {
  high: { color: 'error', label: 'بحرانی', icon: 'solar:danger-triangle-bold-duotone' },
  medium: { color: 'warning', label: 'مهم', icon: 'solar:shield-warning-bold-duotone' },
  low: { color: 'success', label: 'قابل توجه', icon: 'solar:info-circle-bold-duotone' },
};

const TENSIONS = [
  { key: 'domestic', label: 'داخلی', icon: 'solar:home-2-bold-duotone', color: 'secondary' },
  { key: 'foreign', label: 'خارجی', icon: 'solar:global-bold-duotone', color: 'info' },
  { key: 'economic', label: 'اقتصادی', icon: 'solar:chart-bold-duotone', color: 'warning' },
];

export function SectionLabel({ icon, label, color }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.25 }}>
      <Iconify icon={icon} width={18} sx={{ color: color || theme.palette.text.secondary }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, color: color || 'text.secondary' }}>
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

function TextBlock({ children }) {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.9 }}>
      {toFaDigits(children)}
    </Typography>
  );
}

/**
 * Renders a parsed macro-politics JSON object in a structured, readable layout.
 * Events on one side, tensions / media / forecast on the other from md up.
 * Used by both the analytics MacroContext widget and the admin global-context view.
 */
export function MacroParsedContent({ parsed }) {
  const theme = useTheme();

  if (!parsed) return null;

  const hasEvents = parsed.events?.length > 0;
  const tensions = parsed.tensions ? TENSIONS.filter((t) => parsed.tensions[t.key]) : [];
  const hasSide = tensions.length > 0 || parsed.media_atmosphere || parsed.forecast;

  const panelSx = {
    p: 2,
    borderRadius: 1.5,
    bgcolor: alpha(theme.palette.grey[500], 0.04),
    border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', md: hasEvents && hasSide ? '7fr 5fr' : '1fr' },
        alignItems: 'start',
      }}
    >
      {hasEvents && (
        <Box>
          <SectionLabel icon="solar:calendar-bold-duotone" label="رویدادها" />
          <Stack spacing={1}>
            {parsed.events.map((ev, i) => {
              const sev = SEVERITY[ev.severity] || SEVERITY.medium;
              const tone = theme.palette[sev.color].main;
              return (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="flex-start"
                  spacing={1.25}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(tone, 0.06),
                    borderInlineStart: `3px solid ${tone}`,
                  }}
                >
                  <Iconify icon={sev.icon} width={18} sx={{ color: tone, mt: 0.25, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.6 }}>
                      {toFaDigits(ev.title)}
                    </Typography>
                    {ev.summary && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mt: 0.25 }}>
                        {toFaDigits(ev.summary)}
                      </Typography>
                    )}
                    {ev.actor && (
                      <Typography variant="caption" component="div" sx={{ color: 'text.disabled', mt: 0.5 }}>
                        {ev.actor}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={sev.label}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                      bgcolor: alpha(tone, 0.14),
                      color: theme.palette[sev.color][theme.palette.mode === 'dark' ? 'light' : 'dark'],
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Box>
      )}

      {hasSide && (
        <Stack spacing={2}>
          {tensions.length > 0 && (
            <Box sx={panelSx}>
              <SectionLabel icon="solar:danger-bold-duotone" label="تنش‌ها" color={theme.palette.error.main} />
              <Stack spacing={1.25}>
                {tensions.map(({ key, label, icon, color }) => {
                  const tone = theme.palette[color].main;
                  return (
                    <Stack key={key} direction="row" alignItems="flex-start" spacing={1}>
                      <Iconify icon={icon} width={16} sx={{ color: tone, mt: 0.4, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                        <Box component="span" sx={{ fontWeight: 700, color: tone }}>
                          {label}:{' '}
                        </Box>
                        {toFaDigits(parsed.tensions[key])}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}

          {parsed.media_atmosphere && (
            <Box sx={panelSx}>
              <SectionLabel icon="solar:tv-bold-duotone" label="فضای رسانه" />
              <TextBlock>{parsed.media_atmosphere}</TextBlock>
            </Box>
          )}

          {parsed.forecast && (
            <Box sx={panelSx}>
              <SectionLabel
                icon="solar:clock-circle-bold-duotone"
                label="پیش‌بینی ۴۸ ساعت آینده"
                color={theme.palette.warning.main}
              />
              <TextBlock>{parsed.forecast}</TextBlock>
            </Box>
          )}
        </Stack>
      )}
    </Box>
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
    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 2, color: 'text.primary' }}>
      {toFaDigits(cleaned)}
    </Typography>
  );
}

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { fPercent, toFaDigits } from 'src/utils/format-number-fa';

import { useAiContent } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart, SENTIMENT_COLORS } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';

// ----------------------------------------------------------------------

const GAP_LEVELS = {
  high: { color: 'error', label: 'شکاف بالا', icon: 'solar:danger-triangle-bold' },
  medium: { color: 'warning', label: 'شکاف متوسط', icon: 'solar:info-circle-bold' },
  low: { color: 'success', label: 'هم‌راستا', icon: 'solar:check-circle-bold' },
};

const SENTIMENT_LABELS = { positive: 'مثبت', neutral: 'خنثی', negative: 'منفی' };

const OTHER_LABEL = 'سایر موضوعات';

/** LLM output may give numbers as strings, with Persian digits or a % sign. */
function parsePercent(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const latin = value.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٪%]/g, '');
  const n = parseFloat(latin);
  return Number.isFinite(n) ? n : 0;
}

/**
 * The LLM's topic shares don't reliably add up to 100. Scale them down when
 * they overshoot, and show any shortfall as «سایر موضوعات» so the bars always
 * describe the whole public conversation.
 */
function normalizeTopics(list) {
  const topics = list
    .map((p) => ({
      topic: String(p.topic || '').trim(),
      value: Math.max(0, parsePercent(p.percent)),
      sentiment: SENTIMENT_LABELS[p.sentiment] ? p.sentiment : 'neutral',
    }))
    .filter((p) => p.topic && p.value > 0);

  const sum = topics.reduce((acc, p) => acc + p.value, 0);
  if (!sum) return [];

  const scale = sum > 100 ? 100 / sum : 1;
  const result = topics.map((p) => ({ ...p, share: p.value * scale, isOther: false }));
  const remainder = 100 - result.reduce((acc, p) => acc + p.share, 0);
  if (remainder >= 0.5) {
    result.push({ topic: OTHER_LABEL, share: remainder, sentiment: null, isOther: true });
  }
  return result;
}

export function NarrativeGap({ loading }) {
  const theme = useTheme();
  const { data: aiData, isLoading } = useAiContent('narrative_gap');

  const parsed = aiData?.llm_parsed;
  const hasData = !!(parsed && typeof parsed === 'object' && parsed.official);

  const official = hasData ? String(parsed.official) : '';
  const officialPercent = hasData ? Math.min(100, Math.max(0, parsePercent(parsed.officialPercent))) : 0;
  const gap = GAP_LEVELS[parsed?.gapLevel] || GAP_LEVELS.medium;
  const gapTone = theme.palette[gap.color].main;
  const topics = hasData && Array.isArray(parsed.public) ? normalizeTopics(parsed.public) : [];

  const otherColor = theme.palette.grey[theme.palette.mode === 'dark' ? 600 : 400];
  const topicColors = topics.map((t) => (t.isOther ? otherColor : SENTIMENT_COLORS[t.sentiment]));

  const options = useChart({
    colors: topicColors,
    plotOptions: { bar: { horizontal: true, distributed: true, barHeight: '58%', borderRadius: 3 } },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 6,
      formatter: (v) => fPercent(v),
      style: { fontSize: '12px', fontWeight: 700, colors: [theme.palette.text.primary] },
      background: { enabled: false },
      dropShadow: { enabled: false },
    },
    xaxis: {
      categories: topics.map((t) => t.topic),
      max: 100,
      tickAmount: 4,
      labels: { formatter: (v) => fPercent(v) },
    },
    yaxis: { labels: { formatter: (v) => v, maxWidth: 170, style: { fontSize: '12px', fontWeight: 600 } } },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } }, padding: { right: 36 } },
    tooltip: {
      y: {
        title: { formatter: () => '' },
        formatter: (v, { dataPointIndex }) => {
          const t = topics[dataPointIndex];
          const sentiment = t?.sentiment ? ` · احساس ${SENTIMENT_LABELS[t.sentiment]}` : '';
          return `${fPercent(v, { decimals: 1 })} از بحث مردم${sentiment}`;
        },
      },
    },
  });

  return (
    <WidgetCard
      title="تحلیل شکاف روایت"
      icon="solar:soundwave-bold-duotone"
      color="error"
      tooltip={WIDGET_TOOLTIPS.narrativeGap}
      subheader="«پیام رسمی»: سهم پیام اصلی از پست‌های صفحات رسمی. «بحث مردم»: سهم هر موضوع از پست‌های کاربران (جمع ۱۰۰٪)."
      loading={loading || isLoading}
      empty={!hasData}
      emptyIcon="solar:soundwave-bold-duotone"
      emptyText="تحلیل شکاف روایت در دسترس نیست."
    >
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            alignSelf: 'flex-start',
            bgcolor: alpha(gapTone, 0.1),
            color: theme.palette[gap.color][theme.palette.mode === 'dark' ? 'light' : 'dark'],
          }}
        >
          <Iconify icon={gap.icon} width={18} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {gap.label}
          </Typography>
        </Stack>

        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify icon="solar:microphone-bold" width={18} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              پیام رسمی
            </Typography>
          </Stack>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            }}
          >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.8 }}>
                {toFaDigits(official)}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 800, flexShrink: 0 }}>
                {fPercent(officialPercent)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={officialPercent}
              sx={{
                mt: 1,
                height: 6,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.grey[500], 0.12),
                '& .MuiLinearProgress-bar': { borderRadius: 1 },
              }}
            />
            <Typography variant="caption" component="div" sx={{ mt: 0.75, color: 'text.secondary', fontSize: 12 }}>
              {fPercent(officialPercent)} از پست‌های صفحات رسمی به این پیام اختصاص دارد.
            </Typography>
          </Box>
        </Box>

        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            rowGap={1}
            sx={{ mb: 0.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:users-group-rounded-bold" width={18} sx={{ color: 'info.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                بحث مردم
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              {Object.entries(SENTIMENT_LABELS).map(([key, label]) => (
                <Stack key={key} direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: SENTIMENT_COLORS[key] }} />
                  <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>

          {topics.length ? (
            <Chart
              type="bar"
              series={[{ name: 'سهم از بحث مردم', data: topics.map((t) => Number(t.share.toFixed(1))) }]}
              options={options}
              height={topics.length * 44 + 50}
            />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
              موضوعی برای بحث مردم استخراج نشده است.
            </Typography>
          )}
        </Box>
      </Stack>
    </WidgetCard>
  );
}

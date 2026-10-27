'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, fDateFa, fPercent } from 'src/utils/format-number-fa';

import { useProfile, usePromisePerception } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { SENTIMENT_COLORS } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';

// ----------------------------------------------------------------------

// Score thresholds for perception label (score: positive=100, neutral=50, negative=0)
function getPerception(score, theme) {
  if (score === null || score === undefined) {
    return { label: 'داده کافی نیست', color: theme.palette.text.disabled, tone: theme.palette.grey[500] };
  }
  if (score >= 65) return { label: 'دیدگاه مثبت', color: SENTIMENT_COLORS.positive, tone: SENTIMENT_COLORS.positive };
  if (score >= 40) return { label: 'دیدگاه خنثی', color: theme.palette.warning.main, tone: theme.palette.warning.main };
  return { label: 'دیدگاه منفی', color: SENTIMENT_COLORS.negative, tone: SENTIMENT_COLORS.negative };
}

// Date the promise was recorded — the profile data uses `addedAt`; accept a
// few other spellings in case the admin import used them.
function getPromiseDate(promise) {
  return promise?.addedAt || promise?.date || promise?.createdAt || null;
}

const STATUS_LABELS = {
  pending: { label: 'در انتظار تحقق', color: 'default' },
  fulfilled: { label: 'محقق‌شده', color: 'success' },
  broken: { label: 'محقق‌نشده', color: 'error' },
};

// validFrom / validUntil are Tehran calendar days (YYYY-MM-DD); read them at
// noon UTC so the browser's time zone can't shift the day.
const dayOf = (ymd) => new Date(`${ymd}T12:00:00Z`);
const tehranToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date()
  );

/** «از … تا …» / «از … تاکنون» / «تا …»; null when the promise has no window. */
function formatPeriod({ validFrom, validUntil }) {
  if (validFrom && validUntil) return `از ${fDateFa(dayOf(validFrom))} تا ${fDateFa(dayOf(validUntil))}`;
  if (validFrom) return `از ${fDateFa(dayOf(validFrom))} تاکنون`;
  if (validUntil) return `تا ${fDateFa(dayOf(validUntil))}`;
  return null;
}

export function PromiseTracker() {
  const theme = useTheme();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: perceptions = [], isLoading: perceptionLoading } = usePromisePerception();

  // Keep each promise's stored index: perception rows are keyed by it.
  // Promises whose term has ended («خارج از دوره مسئولیت») go after the active ones.
  const today = tehranToday();
  const promises = (profile?.promises || [])
    .map((p, index) => ({ ...p, index, expired: Boolean(p?.validUntil && p.validUntil < today) }))
    .filter((p) => p?.text?.trim())
    .sort((a, b) => Number(a.expired) - Number(b.expired) || a.index - b.index);

  // Perception per promise index (older API responses without `index` match by text)
  const perceptionMap = {};
  for (const p of perceptions) {
    perceptionMap[p.index ?? p.text] = p;
  }

  // Overall perception across promises that have data
  const withData = perceptions.filter((p) => p.score !== null && p.score !== undefined);
  const avgScore = withData.length
    ? Math.round(withData.reduce((s, p) => s + p.score, 0) / withData.length)
    : null;
  const overall = getPerception(avgScore, theme);

  const dates = promises.map(getPromiseDate).filter(Boolean);
  const hasDates = dates.length > 0;

  let subheader;
  if (hasDates) {
    const sorted = dates.map((d) => new Date(d)).sort((a, b) => a - b);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const span =
      fDateFa(first) === fDateFa(last) ? `ثبت‌شده در ${fDateFa(first)}` : `ثبت‌شده از ${fDateFa(first)} تا ${fDateFa(last)}`;
    subheader = `${fNum(promises.length)} وعده عمومی · ${span}`;
  } else {
    subheader = `${fNum(promises.length)} وعده عمومی · تاریخ ثبت وعده‌ها مشخص نشده است`;
  }

  return (
    <WidgetCard
      title="رصد وعده‌ها"
      icon="solar:checklist-bold-duotone"
      color="warning"
      tooltip={WIDGET_TOOLTIPS.promiseTracker}
      subheader={promises.length ? subheader : undefined}
      loading={profileLoading}
      empty={!promises.length}
      emptyIcon="solar:checklist-bold-duotone"
      emptyText="وعده عمومی ثبت‌شده‌ای برای این پروفایل وجود ندارد."
      action={
        avgScore !== null && (
          <Box
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: 1,
              bgcolor: alpha(overall.tone, 0.14),
              color: overall.color,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit', whiteSpace: 'nowrap' }}>
              {overall.label}
            </Typography>
          </Box>
        )
      }
    >
      <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mb: 2, mt: -0.5 }}>
        واکنش‌ها فقط از پست‌هایی محاسبه می‌شود که در دوره مسئولیتِ مربوط به هر وعده منتشر شده‌اند؛ وعده‌های بدون دوره همه پست‌های مرتبط را در نظر می‌گیرند.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {promises.map((promise) => {
          const perc = perceptionMap[promise.index] ?? perceptionMap[promise.text];
          const { expired } = promise;
          const perception = getPerception(perc?.score, theme);
          // Expired promises keep their (in-term) perception but get a muted card
          const tone = expired ? theme.palette.grey[500] : perception.tone;
          const hasData = perc && perc.postCount > 0 && perc.breakdown;
          const addedAt = getPromiseDate(promise);
          const period = formatPeriod(promise);
          const status = STATUS_LABELS[promise.status] || STATUS_LABELS.pending;

          let perceptionBody;
          if (perceptionLoading) {
            perceptionBody = <Skeleton variant="rounded" height={8} />;
          } else if (hasData) {
            perceptionBody = (
              <>
                <Tooltip
                  title={`مثبت ${fPercent(perc.breakdown.positive)} · خنثی ${fPercent(perc.breakdown.neutral)} · منفی ${fPercent(perc.breakdown.negative)}`}
                  placement="top"
                  arrow
                >
                  <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', cursor: 'default' }}>
                    <Box sx={{ width: `${perc.breakdown.positive}%`, bgcolor: SENTIMENT_COLORS.positive }} />
                    <Box sx={{ width: `${perc.breakdown.neutral}%`, bgcolor: alpha(SENTIMENT_COLORS.neutral, 0.6) }} />
                    <Box sx={{ width: `${perc.breakdown.negative}%`, bgcolor: SENTIMENT_COLORS.negative }} />
                  </Box>
                </Tooltip>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.75 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fNum(perc.postCount)} پست مرتبط{period ? ' در دوره' : ''}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: perception.color }}>
                    {perception.label}
                  </Typography>
                </Stack>
              </>
            );
          } else {
            perceptionBody = (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {period ? 'در دوره این وعده پست مرتبطی جمع‌آوری نشده است.' : 'هنوز پست مرتبطی برای تحلیل جمع‌آوری نشده است.'}
              </Typography>
            );
          }

          return (
            <Box
              key={`${promise.index}-${promise.text}`}
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(tone, 0.05),
                border: `1px ${expired ? 'dashed' : 'solid'} ${alpha(tone, expired ? 0.4 : 0.18)}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1.25} sx={{ mb: 1.5 }}>
                <Iconify
                  icon="solar:checklist-minimalistic-bold"
                  width={18}
                  sx={{ color: expired ? 'text.disabled' : perception.color, flexShrink: 0, mt: 0.25 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ lineHeight: 1.8, wordBreak: 'break-word', color: expired ? 'text.secondary' : 'text.primary' }}
                  >
                    {promise.text}
                  </Typography>
                  <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
                    {expired && (
                      <Chip label="خارج از دوره مسئولیت" size="small" variant="soft" sx={{ fontSize: 11, height: 22 }} />
                    )}
                    {promise.position && (
                      <Chip
                        icon={<Iconify icon="solar:case-minimalistic-bold" width={14} />}
                        label={promise.position}
                        size="small"
                        variant="soft"
                        color="info"
                        sx={{ fontSize: 11, height: 22 }}
                      />
                    )}
                    <Chip label={status.label} size="small" variant="soft" color={status.color} sx={{ fontSize: 11, height: 22 }} />
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" columnGap={1.5} rowGap={0.25} sx={{ mt: 0.75, color: 'text.secondary' }}>
                    {period && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:calendar-linear" width={14} />
                        <Typography variant="caption" sx={{ color: 'inherit' }}>
                          دوره: {period}
                        </Typography>
                      </Stack>
                    )}
                    {addedAt && (
                      <Typography variant="caption" sx={{ color: 'inherit' }}>
                        ثبت: {fDateFa(addedAt)}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
              <Box sx={{ mt: 'auto' }}>{perceptionBody}</Box>
            </Box>
          );
        })}
      </Box>
    </WidgetCard>
  );
}

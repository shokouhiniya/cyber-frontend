'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { fNum, fDateFa, toFaDigits } from 'src/utils/format-number-fa';

import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';
import {
  useUsageDaily,
  useUsageSummary,
  useUsageFeaturesRanking,
  useUsageProfilesRanking,
} from 'src/api/admin';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

import { useProfileScope } from 'src/auth/hooks';

import { ProfileUsageDialog } from '../profiles/view';
import { AdminPageHeader } from '../shared/page-header';
import { WidgetCard, WidgetToggle } from '../../cyberspace/shared/widget-card';

// ----------------------------------------------------------------------

const RANGE_OPTIONS = [
  { value: 7, label: '۷ روز' },
  { value: 30, label: '۳۰ روز' },
  { value: 90, label: '۹۰ روز' },
];

/** Page slugs recorded by use-page-view → the nav titles users know them by. */
const FEATURE_LABELS = {
  'dashboard.root': 'داشبورد',
  'dashboard.mypages': 'رسانه',
  'dashboard.posts': 'پست‌ها',
  'dashboard.analytics': 'تحلیل',
  'dashboard.recommendations': 'پیشنهادها',
  'dashboard.reports': 'گزارش‌ها',
  'dashboard.profile': 'پروفایل',
  'dashboard.guide': 'راهنما',
  'admin.users': 'مدیریت · کاربران',
  'admin.usage': 'مدیریت · آمار استفاده',
  'admin.profiles': 'مدیریت · پروفایل‌ها',
  'admin.data-sources': 'مدیریت · منابع داده',
  'admin.global-context': 'مدیریت · تنظیمات',
  'admin.audit-log': 'مدیریت · لاگ مدیریتی',
  'admin.docs': 'مدیریت · مستندات فنی',
};

function featureLabel(eventName) {
  const key = (eventName || '').replace(/\.+$/, '');
  return FEATURE_LABELS[key] || key;
}

/** YYYY-MM-DD in the browser's timezone, so chart buckets line up with local days. */
const dayKey = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${day}`;
};

// ----------------------------------------------------------------------

export function AdminUsageView() {
  const theme = useTheme();
  const { desktopMode } = useAdminDesktopMode();
  const { profiles } = useProfileScope();

  const [range, setRange] = useState(30);
  const [usageFor, setUsageFor] = useState(null);

  // Day-aligned so the query key stays stable between renders
  const filters = useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - (range - 1));
    return { from: from.toISOString() };
  }, [range]);

  const summary = useUsageSummary(filters);
  const daily = useUsageDaily(filters);
  const profilesRanking = useUsageProfilesRanking(filters);
  const features = useUsageFeaturesRanking(filters);

  const profileById = useMemo(
    () => Object.fromEntries((profiles || []).map((p) => [p.id, p])),
    [profiles]
  );

  // Fill missing days with 0 so the chart has one point per day
  const series = useMemo(() => {
    const counts = {};
    (daily.data || []).forEach((r) => {
      const k = dayKey(r.day);
      counts[k] = (counts[k] || 0) + r.count;
    });
    const days = [];
    for (let i = range - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ key: dayKey(d), date: d, count: counts[dayKey(d)] || 0 });
    }
    return days;
  }, [daily.data, range]);

  const chartOptions = useChart({
    xaxis: {
      categories: series.map((d) => fDateFa(d.date, { month: 'short', day: 'numeric' })),
      tickAmount: Math.min(range, 10),
      labels: { rotate: 0, hideOverlappingLabels: true },
    },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
  });

  const total = summary.data?.total ?? 0;
  const profileRows = profilesRanking.data || [];
  const featureRows = features.data || [];
  const activeDays = series.filter((d) => d.count > 0).length;

  const tiles = [
    { label: 'کل رویدادها', value: fNum(total), icon: 'solar:chart-2-bold-duotone', color: 'primary' },
    { label: 'میانگین روزانه', value: fNum(Math.round(total / range)), icon: 'solar:graph-up-bold-duotone', color: 'info' },
    { label: 'روزهای فعال', value: `${toFaDigits(activeDays)} از ${toFaDigits(range)}`, icon: 'solar:calendar-bold-duotone', color: 'success' },
    { label: 'پروفایل‌های فعال', value: fNum(profileRows.length), icon: 'solar:users-group-rounded-bold-duotone', color: 'warning' },
  ];

  const maxProfile = Math.max(...profileRows.map((r) => r.count), 1);
  const maxFeature = Math.max(...featureRows.map((r) => r.count), 1);

  return (
    <Container maxWidth={desktopMode ? 'xl' : 'lg'} sx={{ py: { xs: 3, md: 4 } }}>
      <AdminPageHeader
        title="آمار استفاده"
        subtitle="میزان استفاده کاربران از داشبورد در پروفایل‌های قابل دسترس شما"
        action={<WidgetToggle value={range} onChange={setRange} options={RANGE_OPTIONS} size="medium" />}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {tiles.map((t) => (
          <Grid key={t.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  color: `${t.color}.main`,
                  bgcolor: alpha(theme.palette[t.color].main, 0.12),
                }}
              >
                <Iconify icon={t.icon} width={24} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.3 }} noWrap>
                  {summary.isLoading ? '…' : t.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
                  {t.label}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <WidgetCard
        title="فعالیت روزانه"
        icon="solar:graph-up-bold-duotone"
        subheader={`تعداد رویدادهای ثبت‌شده در ${toFaDigits(range)} روز گذشته`}
        loading={daily.isLoading}
        empty={!total}
        sx={{ mb: 2 }}
      >
        <Chart
          type="area"
          series={[{ name: 'رویداد', data: series.map((d) => d.count) }]}
          options={chartOptions}
          height={280}
        />
      </WidgetCard>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <WidgetCard
            title="رتبه‌بندی پروفایل‌ها"
            icon="solar:users-group-rounded-bold-duotone"
            color="warning"
            subheader="برای دیدن جزئیات هر کاربر روی پروفایل بزنید"
            loading={profilesRanking.isLoading}
            empty={!profileRows.length}
            sx={{ height: 1 }}
          >
            <Stack spacing={0.5}>
              {profileRows.map((r, i) => {
                const p = profileById[r.profileId];
                return (
                  <ButtonBase
                    key={r.profileId}
                    onClick={() => setUsageFor({ id: r.profileId, name: p?.name || 'پروفایل' })}
                    sx={{ borderRadius: 1.25, p: 1, justifyContent: 'stretch', textAlign: 'start', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: 1 }}>
                      <Typography variant="caption" sx={{ width: 18, color: 'text.disabled', fontWeight: 700 }}>
                        {toFaDigits(i + 1)}
                      </Typography>
                      <Avatar src={p?.avatar || undefined} sx={{ width: 32, height: 32, fontSize: 13 }}>
                        {(p?.name || '?').charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Typography variant="subtitle2" noWrap>{p?.name || r.profileId.slice(0, 8)}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                            {fNum(r.count)} رویداد · {fNum(r.uniqueUsers)} کاربر
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          color="warning"
                          value={(r.count / maxProfile) * 100}
                          sx={{ mt: 0.75, height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    </Stack>
                  </ButtonBase>
                );
              })}
            </Stack>
          </WidgetCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <WidgetCard
            title="پرکاربردترین بخش‌ها"
            icon="solar:star-bold-duotone"
            color="info"
            subheader="بر اساس تعداد بازدید"
            loading={features.isLoading}
            empty={!featureRows.length}
            sx={{ height: 1 }}
          >
            <Stack spacing={1.5}>
              {featureRows.slice(0, 12).map((r) => (
                <Box key={r.eventName}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {featureLabel(r.eventName)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {fNum(r.count)} · {fNum(r.uniqueUsers)} کاربر
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    color="info"
                    value={(r.count / maxFeature) * 100}
                    sx={{ mt: 0.75, height: 6, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
          </WidgetCard>
        </Grid>
      </Grid>

      <ProfileUsageDialog
        profileId={usageFor?.id}
        profileName={usageFor?.name}
        open={!!usageFor}
        onClose={() => setUsageFor(null)}
      />
    </Container>
  );
}
